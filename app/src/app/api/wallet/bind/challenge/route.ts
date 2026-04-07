import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { createBindChallenge } from "@/lib/server/adminAuth";
import { checkRateLimit } from "@/lib/server/rateLimit";
import { apiErrorMessage } from "@/lib/server/apiError";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawWallet = String(body?.wallet ?? "");

    if (!rawWallet.trim()) {
      return NextResponse.json(
        { success: false, error: "Field `wallet` is required." },
        { status: 400 }
      );
    }

    // Rate limit: 5 challenge requests per wallet per minute.
    if (!checkRateLimit(`challenge:${rawWallet}`, { max: 5, windowMs: 60_000 })) {
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

    const challenge = await createBindChallenge(rawWallet);
    return NextResponse.json({
      success: true,
      wallet: challenge.wallet,
      nonce: challenge.nonce,
      message: challenge.message,
      expiresAt: challenge.expiresAt,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: apiErrorMessage(error, "POST /api/wallet/bind/challenge") },
      { status: 500 }
    );
  }
}
