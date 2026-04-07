import path from "path";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import { PublicKey } from "@solana/web3.js";

type WalletBindingRecord = {
  wallet: string;
  updatedAt: string;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const BINDING_FILE = path.join(DATA_DIR, "wallet-binding.json");

function normalizeWallet(wallet: string) {
  return new PublicKey(wallet).toBase58();
}

export async function getBoundWallet(): Promise<string | null> {
  try {
    const raw = await readFile(BINDING_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<WalletBindingRecord>;
    if (typeof parsed.wallet !== "string") return null;
    return normalizeWallet(parsed.wallet);
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

export async function setBoundWallet(wallet: string): Promise<string> {
  const normalizedWallet = normalizeWallet(wallet);
  const payload: WalletBindingRecord = {
    wallet: normalizedWallet,
    updatedAt: new Date().toISOString(),
  };

  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(BINDING_FILE, JSON.stringify(payload, null, 2), "utf8");

  return normalizedWallet;
}

export async function clearBoundWallet(): Promise<void> {
  try {
    await unlink(BINDING_FILE);
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}
