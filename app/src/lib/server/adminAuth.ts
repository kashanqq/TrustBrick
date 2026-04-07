import crypto from "crypto";
import path from "path";
import { mkdir, readFile, rename, unlink, writeFile } from "fs/promises";
import bs58 from "bs58";
import { ed25519 } from "@noble/curves/ed25519";
import { PublicKey } from "@solana/web3.js";

type BindChallengeRecord = {
  wallet: string;
  nonce: string;
  message: string;
  expiresAt: string;
};

type AdminSessionRecord = {
  token: string;
  wallet: string;
  expiresAt: string;
};

type ConsumeChallengeResult =
  | { ok: true; challenge: BindChallengeRecord }
  | { ok: false; reason: string };

const DATA_DIR = path.join(process.cwd(), ".data");
const CHALLENGE_FILE = path.join(DATA_DIR, "admin-bind-challenge.json");
const SESSION_FILE = path.join(DATA_DIR, "admin-session.json");
const CHALLENGE_TTL_MS = 5 * 60 * 1000;
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export const SESSION_COOKIE_NAME = "tb_admin_session";

function normalizeWallet(wallet: string) {
  return new PublicKey(wallet).toBase58();
}

function parseErrno(error: unknown) {
  return (error as NodeJS.ErrnoException).code ?? "";
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch (error: unknown) {
    if (parseErrno(error) === "ENOENT") return null;
    throw error;
  }
}

async function writeJsonFile(filePath: string, payload: unknown) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");
}

function buildBindMessage(wallet: string, nonce: string, expiresAtIso: string) {
  return [
    "TrustBrick Admin Wallet Bind",
    `Wallet: ${wallet}`,
    `Nonce: ${nonce}`,
    `Expires At: ${expiresAtIso}`,
  ].join("\n");
}

export async function createBindChallenge(wallet: string): Promise<BindChallengeRecord> {
  const normalizedWallet = normalizeWallet(wallet);
  const nonce = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MS).toISOString();
  const message = buildBindMessage(normalizedWallet, nonce, expiresAt);

  const challenge: BindChallengeRecord = {
    wallet: normalizedWallet,
    nonce,
    message,
    expiresAt,
  };

  await writeJsonFile(CHALLENGE_FILE, challenge);
  return challenge;
}

export async function consumeBindChallenge(wallet: string, nonce: string): Promise<ConsumeChallengeResult> {
  const normalizedWallet = normalizeWallet(wallet);

  // Atomically claim the challenge file by renaming it to a per-request temp path.
  // Only one concurrent caller can win the rename; others get ENOENT and are rejected.
  const tmpFile = `${CHALLENGE_FILE}.${crypto.randomUUID()}.tmp`;
  try {
    await rename(CHALLENGE_FILE, tmpFile);
  } catch (error: unknown) {
    if (parseErrno(error) === "ENOENT") {
      return { ok: false, reason: "Challenge not found. Request a new one." };
    }
    throw error;
  }

  let challenge: BindChallengeRecord | null = null;
  try {
    challenge = await readJsonFile<BindChallengeRecord>(tmpFile);
  } finally {
    await unlink(tmpFile).catch(() => undefined);
  }

  if (!challenge) return { ok: false, reason: "Challenge not found. Request a new one." };
  if (challenge.wallet !== normalizedWallet) {
    return { ok: false, reason: "Challenge wallet mismatch." };
  }
  if (challenge.nonce !== nonce) {
    return { ok: false, reason: "Challenge nonce mismatch." };
  }
  if (new Date(challenge.expiresAt).getTime() < Date.now()) {
    return { ok: false, reason: "Challenge expired. Request a new one." };
  }

  return { ok: true, challenge };
}

export function verifyWalletSignature(wallet: string, message: string, signatureBase58: string) {
  const normalizedWallet = normalizeWallet(wallet);
  const messageBytes = new TextEncoder().encode(message);

  let signatureBytes: Uint8Array;
  try {
    signatureBytes = bs58.decode(signatureBase58);
  } catch {
    return false;
  }

  const publicKeyBytes = new PublicKey(normalizedWallet).toBytes();
  try {
    return ed25519.verify(signatureBytes, messageBytes, publicKeyBytes);
  } catch {
    return false;
  }
}

export async function createAdminSession(wallet: string): Promise<AdminSessionRecord> {
  const normalizedWallet = normalizeWallet(wallet);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  const session: AdminSessionRecord = {
    // 32 random bytes → 256-bit token (stronger than UUID's 122 bits).
    token: crypto.randomBytes(32).toString("hex"),
    wallet: normalizedWallet,
    expiresAt,
  };

  await writeJsonFile(SESSION_FILE, session);
  return session;
}

export async function clearAdminSession() {
  try {
    await unlink(SESSION_FILE);
  } catch (error: unknown) {
    if (parseErrno(error) !== "ENOENT") throw error;
  }
}

export async function getAdminSessionByToken(token: string): Promise<AdminSessionRecord | null> {
  if (!token.trim()) return null;
  const session = await readJsonFile<AdminSessionRecord>(SESSION_FILE);
  if (!session) return null;
  if (session.token !== token) return null;
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    await clearAdminSession();
    return null;
  }
  return session;
}

export function getSessionTokenFromRequest(request: Request): string | null {
  const rawCookie = request.headers.get("cookie");
  if (!rawCookie) return null;

  const pairs = rawCookie.split(";").map((item) => item.trim());
  for (const pair of pairs) {
    if (!pair) continue;
    const [key, ...rest] = pair.split("=");
    if (key !== SESSION_COOKIE_NAME) continue;
    const value = rest.join("=");
    return value ? decodeURIComponent(value) : null;
  }

  return null;
}
