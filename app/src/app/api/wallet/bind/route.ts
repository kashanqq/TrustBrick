import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { clearBoundWallet, getBoundWallet, setBoundWallet } from "@/lib/server/walletBinding";
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
  clearAdminSession,
  consumeBindChallenge,
  createAdminSession,
  getAdminSessionByToken,
  getSessionTokenFromRequest,
  verifyWalletSignature,
} from "@/lib/server/adminAuth";
import { checkRateLimit } from "@/lib/server/rateLimit";
import { apiErrorMessage } from "@/lib/server/apiError";

type BindRequestBody = {
  wallet?: string;
  nonce?: string;
  signature?: string;
};

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const boundWallet = await getBoundWallet();
    const sessionToken = getSessionTokenFromRequest(request);
    const session = sessionToken ? await getAdminSessionByToken(sessionToken) : null;
    const isAuthorized = Boolean(boundWallet && session && session.wallet === boundWallet);

    return NextResponse.json({ success: true, boundWallet, isAuthorized });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: apiErrorMessage(error, "GET /api/wallet/bind") },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BindRequestBody;
    const rawWallet = String(body.wallet ?? "");
    const rawNonce = String(body.nonce ?? "");
    const rawSignature = String(body.signature ?? "");

    if (!rawWallet.trim() || !rawNonce.trim() || !rawSignature.trim()) {
      return NextResponse.json(
        { success: false, error: "Fields `wallet`, `nonce`, `signature` are required." },
        { status: 400 }
      );
    }

    // Signature length guard — ed25519 signatures are exactly 64 bytes (88 base58 chars).
    if (rawSignature.length > 128) {
      return NextResponse.json(
        { success: false, error: "Invalid signature." },
        { status: 400 }
      );
    }

    // Rate limit per wallet address: 10 bind attempts per minute.
    if (!checkRateLimit(`bind:${rawWallet}`, { max: 10, windowMs: 60_000 })) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Try again in a minute." },
        { status: 429 }
      );
    }

    const allowedWallet = process.env.ADMIN_ALLOWED_WALLET?.trim();
    if (allowedWallet) {
      const normalizedWallet = new PublicKey(rawWallet).toBase58();
      const normalizedAllowedWallet = new PublicKey(allowedWallet).toBase58();
      if (normalizedWallet !== normalizedAllowedWallet) {
        return NextResponse.json(
          { success: false, error: "This wallet is not allowed for admin bind." },
          { status: 403 }
        );
      }
    }

    const challengeResult = await consumeBindChallenge(rawWallet, rawNonce);
    if (!challengeResult.ok) {
      return NextResponse.json({ success: false, error: challengeResult.reason }, { status: 401 });
    }

    const isValidSignature = verifyWalletSignature(
      rawWallet,
      challengeResult.challenge.message,
      rawSignature
    );
    if (!isValidSignature) {
      return NextResponse.json(
        { success: false, error: "Invalid wallet signature." },
        { status: 401 }
      );
    }

    const boundWallet = await setBoundWallet(rawWallet);
    const session = await createAdminSession(boundWallet);

    const response = NextResponse.json({ success: true, boundWallet, isAuthorized: true });
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: session.token,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      // Both expires (absolute) and maxAge (relative, takes precedence in modern browsers).
      expires: new Date(session.expiresAt),
      maxAge: SESSION_TTL_MS / 1000,
    });
    return response;
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: apiErrorMessage(error, "POST /api/wallet/bind") },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const boundWallet = await getBoundWallet();
    const sessionToken = getSessionTokenFromRequest(request);
    const session = sessionToken ? await getAdminSessionByToken(sessionToken) : null;

    if (!boundWallet || !session || session.wallet !== boundWallet) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    await clearBoundWallet();
    await clearAdminSession();

    const response = NextResponse.json({
      success: true,
      boundWallet: null,
      isAuthorized: false,
    });
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: apiErrorMessage(error, "DELETE /api/wallet/bind") },
      { status: 500 }
    );
  }
}
