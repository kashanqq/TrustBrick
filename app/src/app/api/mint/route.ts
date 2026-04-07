import crypto from "crypto";
import path from "path";
import { mkdir, unlink, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import {
  Connection,
  Keypair,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { getBoundWallet } from "@/lib/server/walletBinding";
import { getAdminSessionByToken, getSessionTokenFromRequest } from "@/lib/server/adminAuth";
import { apiErrorMessage } from "@/lib/server/apiError";

export const runtime = "nodejs";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);
const IMAGE_EXT_BY_MIME: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

// Magic-byte signatures for each allowed image type.
// We verify the actual file header instead of trusting the client-supplied MIME type.
type MagicEntry = { mime: string; bytes: number[]; offset?: number };
const MAGIC_SIGNATURES: MagicEntry[] = [
  { mime: "image/png",  bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/gif",  bytes: [0x47, 0x49, 0x46, 0x38] }, // GIF8
  { mime: "image/webp", bytes: [0x57, 0x45, 0x42, 0x50], offset: 8 }, // "WEBP" at byte 8
];

function detectMimeFromBytes(header: Uint8Array): string | null {
  for (const sig of MAGIC_SIGNATURES) {
    const off = sig.offset ?? 0;
    const match = sig.bytes.every((b, i) => header[off + i] === b);
    if (match) return sig.mime;
  }
  return null;
}
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const DEFAULT_NFT_NAME = "TrustBrick Contributor Pass";
const DEFAULT_SYMBOL = "TBPASS";
const DEFAULT_RPC_URL = "https://api.devnet.solana.com";
const MINT_SIZE = 82;
const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);
const ZERO_PUBLIC_KEY = new PublicKey(new Uint8Array(32));
const TOKEN_INITIALIZE_MINT2_INSTRUCTION = 20;
const TOKEN_MINT_TO_INSTRUCTION = 7;
const ATA_CREATE_IDEMPOTENT_INSTRUCTION = 1;
const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);
const CREATE_METADATA_ACCOUNT_V3_DISCRIMINATOR = 33;
const CREATE_MASTER_EDITION_V3_DISCRIMINATOR = 17;

type CreateMetadataAccountV3InstructionAccounts = {
  metadata: PublicKey;
  mint: PublicKey;
  mintAuthority: PublicKey;
  payer: PublicKey;
  updateAuthority: PublicKey;
};

type CreateMetadataAccountV3InstructionArgs = {
  createMetadataAccountArgsV3: {
    data: {
      name: string;
      symbol: string;
      uri: string;
      sellerFeeBasisPoints: number;
      creators: null;
      collection: null;
      uses: null;
    };
    isMutable: boolean;
    collectionDetails: null;
  };
};

type CreateMasterEditionV3InstructionAccounts = {
  edition: PublicKey;
  mint: PublicKey;
  updateAuthority: PublicKey;
  mintAuthority: PublicKey;
  payer: PublicKey;
  metadata: PublicKey;
};

type CreateMasterEditionV3InstructionArgs = {
  createMasterEditionArgs: {
    maxSupply: number | null;
  };
};

function encodeU16LE(value: number) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value, 0);
  return buffer;
}

function encodeU32LE(value: number) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value, 0);
  return buffer;
}

function encodeU64LE(value: bigint) {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64LE(value, 0);
  return buffer;
}

function encodeBorshString(value: string) {
  const utf8 = Buffer.from(value, "utf8");
  return Buffer.concat([encodeU32LE(utf8.length), utf8]);
}

function getAssociatedTokenAddressSync(
  mint: PublicKey,
  owner: PublicKey,
  allowOwnerOffCurve = false,
  tokenProgramId = TOKEN_PROGRAM_ID,
  associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID
) {
  if (!allowOwnerOffCurve && !PublicKey.isOnCurve(owner.toBuffer())) {
    throw new Error("Owner is off-curve. Set allowOwnerOffCurve=true if needed.");
  }

  return PublicKey.findProgramAddressSync(
    [owner.toBuffer(), tokenProgramId.toBuffer(), mint.toBuffer()],
    associatedTokenProgramId
  )[0];
}

function createInitializeMint2Instruction(
  mint: PublicKey,
  decimals: number,
  mintAuthority: PublicKey,
  freezeAuthority: PublicKey | null,
  programId = TOKEN_PROGRAM_ID
) {
  const data = Buffer.concat([
    Buffer.from([TOKEN_INITIALIZE_MINT2_INSTRUCTION, decimals]),
    mintAuthority.toBuffer(),
    Buffer.from([freezeAuthority ? 1 : 0]),
    (freezeAuthority ?? ZERO_PUBLIC_KEY).toBuffer(),
  ]);

  return new TransactionInstruction({
    programId,
    keys: [{ pubkey: mint, isWritable: true, isSigner: false }],
    data,
  });
}

function createAssociatedTokenAccountIdempotentInstruction(
  payer: PublicKey,
  associatedToken: PublicKey,
  owner: PublicKey,
  mint: PublicKey,
  tokenProgramId = TOKEN_PROGRAM_ID,
  associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID
) {
  return new TransactionInstruction({
    programId: associatedTokenProgramId,
    keys: [
      { pubkey: payer, isWritable: true, isSigner: true },
      { pubkey: associatedToken, isWritable: true, isSigner: false },
      { pubkey: owner, isWritable: false, isSigner: false },
      { pubkey: mint, isWritable: false, isSigner: false },
      { pubkey: SystemProgram.programId, isWritable: false, isSigner: false },
      { pubkey: tokenProgramId, isWritable: false, isSigner: false },
    ],
    data: Buffer.from([ATA_CREATE_IDEMPOTENT_INSTRUCTION]),
  });
}

function createMintToInstruction(
  mint: PublicKey,
  destination: PublicKey,
  authority: PublicKey,
  amount: number | bigint,
  multiSigners: PublicKey[] = [],
  programId = TOKEN_PROGRAM_ID
) {
  const signerKeys = multiSigners.map((signer) => ({
    pubkey: signer,
    isWritable: false,
    isSigner: true,
  }));

  return new TransactionInstruction({
    programId,
    keys: [
      { pubkey: mint, isWritable: true, isSigner: false },
      { pubkey: destination, isWritable: true, isSigner: false },
      { pubkey: authority, isWritable: false, isSigner: multiSigners.length === 0 },
      ...signerKeys,
    ],
    data: Buffer.concat([
      Buffer.from([TOKEN_MINT_TO_INSTRUCTION]),
      encodeU64LE(BigInt(amount)),
    ]),
  });
}

function createCreateMetadataAccountV3Instruction(
  accounts: CreateMetadataAccountV3InstructionAccounts,
  args: CreateMetadataAccountV3InstructionArgs
) {
  const { data, isMutable } = args.createMetadataAccountArgsV3;
  const serialized = Buffer.concat([
    Buffer.from([CREATE_METADATA_ACCOUNT_V3_DISCRIMINATOR]),
    encodeBorshString(data.name),
    encodeBorshString(data.symbol),
    encodeBorshString(data.uri),
    encodeU16LE(data.sellerFeeBasisPoints),
    Buffer.from([data.creators === null ? 0 : 1]),
    Buffer.from([data.collection === null ? 0 : 1]),
    Buffer.from([data.uses === null ? 0 : 1]),
    Buffer.from([isMutable ? 1 : 0]),
    Buffer.from([args.createMetadataAccountArgsV3.collectionDetails === null ? 0 : 1]),
  ]);

  return new TransactionInstruction({
    programId: TOKEN_METADATA_PROGRAM_ID,
    keys: [
      { pubkey: accounts.metadata, isWritable: true, isSigner: false },
      { pubkey: accounts.mint, isWritable: false, isSigner: false },
      { pubkey: accounts.mintAuthority, isWritable: false, isSigner: true },
      { pubkey: accounts.payer, isWritable: true, isSigner: true },
      { pubkey: accounts.updateAuthority, isWritable: false, isSigner: false },
      { pubkey: SystemProgram.programId, isWritable: false, isSigner: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isWritable: false, isSigner: false },
    ],
    data: serialized,
  });
}

function createCreateMasterEditionV3Instruction(
  accounts: CreateMasterEditionV3InstructionAccounts,
  args: CreateMasterEditionV3InstructionArgs
) {
  const maxSupply = args.createMasterEditionArgs.maxSupply;
  const serialized = maxSupply === null
    ? Buffer.from([CREATE_MASTER_EDITION_V3_DISCRIMINATOR, 0])
    : Buffer.concat([
        Buffer.from([CREATE_MASTER_EDITION_V3_DISCRIMINATOR, 1]),
        encodeU64LE(BigInt(maxSupply)),
      ]);

  return new TransactionInstruction({
    programId: TOKEN_METADATA_PROGRAM_ID,
    keys: [
      { pubkey: accounts.edition, isWritable: true, isSigner: false },
      { pubkey: accounts.mint, isWritable: true, isSigner: false },
      { pubkey: accounts.updateAuthority, isWritable: false, isSigner: true },
      { pubkey: accounts.mintAuthority, isWritable: false, isSigner: true },
      { pubkey: accounts.payer, isWritable: true, isSigner: true },
      { pubkey: accounts.metadata, isWritable: true, isSigner: false },
      { pubkey: TOKEN_PROGRAM_ID, isWritable: false, isSigner: false },
      { pubkey: SystemProgram.programId, isWritable: false, isSigner: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isWritable: false, isSigner: false },
    ],
    data: serialized,
  });
}

function getUploadsDir() {
  return path.join(process.cwd(), "public", "uploads");
}

function getBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_APP_URL;
  if (!raw) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "NEXT_PUBLIC_APP_URL is not set. NFT metadata URLs will be broken. " +
        "Add NEXT_PUBLIC_APP_URL=https://your-domain.com to your environment."
      );
    }
    // In development fall back to localhost so the server can start without .env.local.
    return "http://localhost:3000";
  }
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

function sanitizeString(input: string, fallback: string, maxLength: number) {
  const value = input.trim();
  if (!value) return fallback;
  return value.slice(0, maxLength);
}


function getRpcUrl() {
  return process.env.SOLANA_RPC_URL ?? process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? DEFAULT_RPC_URL;
}

function getCluster() {
  // Prefer explicit env variable to avoid false positives from custom RPC domains.
  const explicit = process.env.SOLANA_CLUSTER ?? process.env.NEXT_PUBLIC_SOLANA_CLUSTER;
  if (explicit) return explicit;

  const url = getRpcUrl();
  if (url.includes("devnet")) return "devnet";
  if (url.includes("testnet")) return "testnet";
  if (url.includes("mainnet-beta") || url.includes("mainnet")) return "mainnet-beta";
  return "custom";
}

function toExplorerTxUrl(signature: string, cluster: string) {
  if (cluster === "custom") return null;
  return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
}

/** Delete files silently — used for cleanup on mint failure. */
async function tryUnlink(...paths: string[]) {
  await Promise.all(paths.map((p) => unlink(p).catch(() => undefined)));
}

export async function POST(request: Request) {
  // Track written files so we can clean them up if the on-chain transaction fails.
  let imageFilePath: string | null = null;
  let metadataFilePath: string | null = null;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const rawRecipient = String(formData.get("recipient") ?? "");
    const rawName = String(formData.get("name") ?? DEFAULT_NFT_NAME);

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Field `file` is required." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File is too large (max 10 MB)." },
        { status: 400 }
      );
    }

    // Verify actual file content via magic bytes (client-supplied MIME type is untrusted).
    const headerBytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    const detectedMime = detectMimeFromBytes(headerBytes);
    if (!detectedMime || !ALLOWED_IMAGE_TYPES.has(detectedMime)) {
      return NextResponse.json(
        { success: false, error: "Invalid file content. Only png/jpg/webp/gif are allowed." },
        { status: 400 }
      );
    }
    // Use the server-detected MIME so the extension is always correct.
    const trustedMime = detectedMime;

    let recipient: PublicKey;
    try {
      recipient = new PublicKey(rawRecipient);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid recipient wallet address." },
        { status: 400 }
      );
    }

    const boundWallet = await getBoundWallet();
    if (!boundWallet) {
      return NextResponse.json(
        { success: false, error: "Wallet is not bound yet. Bind wallet first." },
        { status: 403 }
      );
    }

    const sessionToken = getSessionTokenFromRequest(request);
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Bind wallet again." },
        { status: 401 }
      );
    }

    const session = await getAdminSessionByToken(sessionToken);
    if (!session || session.wallet !== boundWallet) {
      return NextResponse.json(
        { success: false, error: "Unauthorized admin session." },
        { status: 401 }
      );
    }

    if (recipient.toBase58() !== boundWallet) {
      return NextResponse.json(
        { success: false, error: "Only the bound wallet can mint from admin panel." },
        { status: 403 }
      );
    }

    const nftName = sanitizeString(rawName, DEFAULT_NFT_NAME, 32);
    const symbol = DEFAULT_SYMBOL;

    const uploadsDir = getUploadsDir();
    await mkdir(uploadsDir, { recursive: true });

    const fileExt = IMAGE_EXT_BY_MIME[trustedMime] ?? ".png";
    const assetId = `${Date.now()}-${crypto.randomUUID()}`;
    const imageFileName = `${assetId}${fileExt}`;
    const metadataFileName = `${assetId}.json`;
    imageFilePath = path.join(uploadsDir, imageFileName);
    metadataFilePath = path.join(uploadsDir, metadataFileName);

    const bytes = await file.arrayBuffer();
    await writeFile(imageFilePath, Buffer.from(bytes));

    const baseUrl = getBaseUrl();
    const imageUrl = `${baseUrl}/uploads/${imageFileName}`;
    const metadataUrl = `${baseUrl}/uploads/${metadataFileName}`;

    const metadataPayload = {
      name: nftName,
      symbol,
      description: "TrustBrick hackathon NFT minted from admin panel attachment.",
      image: imageUrl,
      properties: {
        category: "image",
        files: [{ type: trustedMime, uri: imageUrl }],
        recipient: recipient.toBase58(),
      },
      attributes: [
        { trait_type: "project", value: "TrustBrick" },
        { trait_type: "stage", value: "hackathon-mvp" },
      ],
    };

    await writeFile(metadataFilePath, JSON.stringify(metadataPayload, null, 2), "utf-8");

    // Build the transaction — recipient's wallet is the fee-payer so no funded
    // server keypair is required. The mint keypair only needs to sign for
    // account creation (it holds no lamports itself).
    const connection = new Connection(getRpcUrl(), "confirmed");
    const mint = Keypair.generate();

    const metadataPda = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )[0];

    const masterEditionPda = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
        Buffer.from("edition"),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )[0];

    const recipientAta = getAssociatedTokenAddressSync(
      mint.publicKey,
      recipient,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("confirmed");
    const mintRent = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

    const tx = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: recipient,       // admin's Phantom wallet pays
        newAccountPubkey: mint.publicKey,
        lamports: mintRent,
        space: MINT_SIZE,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMint2Instruction(
        mint.publicKey,
        0,
        recipient,                   // mintAuthority = admin wallet
        recipient,                   // freezeAuthority = admin wallet
        TOKEN_PROGRAM_ID
      ),
      createAssociatedTokenAccountIdempotentInstruction(
        recipient,
        recipientAta,
        recipient,
        mint.publicKey,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      ),
      createMintToInstruction(
        mint.publicKey,
        recipientAta,
        recipient,
        1,
        [],
        TOKEN_PROGRAM_ID
      ),
      createCreateMetadataAccountV3Instruction(
        {
          metadata: metadataPda,
          mint: mint.publicKey,
          mintAuthority: recipient,
          payer: recipient,
          updateAuthority: recipient,
        },
        {
          createMetadataAccountArgsV3: {
            data: {
              name: nftName,
              symbol,
              uri: metadataUrl,
              sellerFeeBasisPoints: 0,
              creators: null,
              collection: null,
              uses: null,
            },
            isMutable: false,
            collectionDetails: null,
          },
        }
      ),
      createCreateMasterEditionV3Instruction(
        {
          edition: masterEditionPda,
          mint: mint.publicKey,
          updateAuthority: recipient,
          mintAuthority: recipient,
          payer: recipient,
          metadata: metadataPda,
        },
        {
          createMasterEditionArgs: { maxSupply: 0 },
        }
      )
    );

    tx.feePayer = recipient;
    tx.recentBlockhash = blockhash;

    // Partial-sign with the freshly generated mint keypair.
    // The admin's Phantom wallet will add the second signature client-side.
    tx.partialSign(mint);

    const cluster = getCluster();

    return NextResponse.json({
      success: true,
      // Base64-encoded partially-signed transaction for the client to sign + send.
      transaction: tx.serialize({ requireAllSignatures: false }).toString("base64"),
      lastValidBlockHeight,
      mintAddress: mint.publicKey.toBase58(),
      metadataUrl,
      imageUrl,
      recipient: recipient.toBase58(),
      cluster,
      explorerTxUrl: null, // filled in by the client after broadcast
    });
  } catch (error: unknown) {
    // Clean up any files written before the on-chain transaction failed.
    if (imageFilePath || metadataFilePath) {
      await tryUnlink(...[imageFilePath, metadataFilePath].filter(Boolean) as string[]);
    }
    return NextResponse.json(
      { success: false, error: apiErrorMessage(error, "POST /api/mint") },
      { status: 500 }
    );
  }
}
