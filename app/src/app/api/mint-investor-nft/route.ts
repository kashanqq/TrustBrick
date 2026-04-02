/**
 * POST /api/mint-investor-nft
 * 
 * Минт NFT инвестору после верификации транзакции инвестирования.
 * 
 * Body: {
 *   investorWallet: string,   — публичный ключ инвестора
 *   amountSol: number,        — сумма инвестиции в SOL
 *   txSignature: string       — подпись транзакции invest()
 * }
 * 
 * Response: {
 *   success: boolean,
 *   mintAddress: string,
 *   explorerUrl: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getUmi } from '@/lib/umi';
import { addInvestor } from '@/lib/db';
import { STAGES } from '@/lib/constants';
import {
  createNft,
  fetchDigitalAsset,
} from '@metaplex-foundation/mpl-token-metadata';
import {
  generateSigner,
  publicKey,
  percentAmount,
  type Umi,
} from '@metaplex-foundation/umi';

// ── Верификация транзакции ────────────────────────────────────────

async function verifyInvestTransaction(
  txSignature: string,
  investorWallet: string,
  expectedLamports: number
): Promise<{ verified: boolean; error?: string }> {
  const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8899';
  const connection = new Connection(rpcUrl, 'confirmed');

  try {
    const tx = await connection.getTransaction(txSignature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) {
      return { verified: false, error: 'Transaction not found or not confirmed yet' };
    }

    if (tx.meta?.err) {
      return { verified: false, error: 'Transaction failed on-chain' };
    }

    // Проверяем, что транзакция подписана кошельком инвестора
    const signers = tx.transaction.message.getAccountKeys().get(0)?.toBase58();
    if (signers !== investorWallet) {
      return { verified: false, error: 'Transaction signer does not match investor wallet' };
    }

    console.log(`[VERIFY] Tx ${txSignature} verified for ${investorWallet}`);
    return { verified: true };
  } catch (err: any) {
    console.error('[VERIFY] Error:', err.message);
    return { verified: false, error: `Verification error: ${err.message}` };
  }
}

// ── Формирование метаданных NFT ──────────────────────────────────

function buildNftMetadata(investorWallet: string, amountSol: number) {
  const stage = STAGES.foundation;
  return {
    name: `TrustBrick Доля #${Date.now().toString(36).toUpperCase()}`,
    symbol: 'TBRICK',
    description: `Инвестиционная доля в ЖК Хакатон-Тауэр. ${amountSol} SOL. Этап: ${stage.name}`,
    image: stage.image,
    external_url: 'https://trustbrick.io',
    attributes: [
      { trait_type: 'stage', value: 'foundation' },
      { trait_type: 'stage_name', value: stage.name },
      { trait_type: 'amount_sol', value: amountSol.toString() },
      { trait_type: 'investor', value: investorWallet },
      { trait_type: 'project', value: 'ЖК Хакатон-Тауэр' },
    ],
    properties: {
      category: 'image',
      creators: [
        {
          address: investorWallet,
          share: 100,
        },
      ],
    },
  };
}

// ── Загрузка метаданных (локальная заглушка для devnet) ───────────

async function uploadMetadata(umi: Umi, metadata: ReturnType<typeof buildNftMetadata>): Promise<string> {
  try {
    // Пытаемся загрузить на Arweave через Irys
    const uri = await umi.uploader.uploadJson(metadata);
    console.log(`[UPLOAD] Metadata uploaded to: ${uri}`);
    return uri;
  } catch (err: any) {
    // Фоллбэк: для локальной разработки создаём data URI
    console.warn(`[UPLOAD] Arweave upload failed (${err.message}), using data URI fallback`);
    const json = JSON.stringify(metadata);
    const base64 = Buffer.from(json).toString('base64');
    return `data:application/json;base64,${base64}`;
  }
}

// ── Основной обработчик ──────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { investorWallet, amountSol, txSignature } = body;

    // Валидация входных данных
    if (!investorWallet || !amountSol || !txSignature) {
      return NextResponse.json(
        { error: 'Missing required fields: investorWallet, amountSol, txSignature' },
        { status: 400 }
      );
    }

    if (typeof amountSol !== 'number' || amountSol <= 0) {
      return NextResponse.json(
        { error: 'amountSol must be a positive number' },
        { status: 400 }
      );
    }

    console.log(`[MINT] Request received:`);
    console.log(`  Investor: ${investorWallet}`);
    console.log(`  Amount: ${amountSol} SOL`);
    console.log(`  Tx: ${txSignature}`);

    // Шаг 1: Верификация транзакции
    const verification = await verifyInvestTransaction(
      txSignature,
      investorWallet,
      amountSol * LAMPORTS_PER_SOL
    );

    if (!verification.verified) {
      return NextResponse.json(
        { error: `Transaction verification failed: ${verification.error}` },
        { status: 400 }
      );
    }

    // Шаг 2: Инициализация UMI
    const umi = getUmi();

    // Шаг 3: Формирование и загрузка метаданных
    const metadata = buildNftMetadata(investorWallet, amountSol);
    const metadataUri = await uploadMetadata(umi, metadata);

    // Шаг 4: Минт NFT
    const mintSigner = generateSigner(umi);
    const investorPubkey = publicKey(investorWallet);

    console.log(`[MINT] Minting NFT...`);
    console.log(`  Mint address: ${mintSigner.publicKey}`);
    console.log(`  Token owner: ${investorWallet}`);
    console.log(`  URI: ${metadataUri}`);

    const txBuilder = createNft(umi, {
      mint: mintSigner,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadataUri,
      sellerFeeBasisPoints: percentAmount(0),
      tokenOwner: investorPubkey,
      isMutable: true, // важно: чтобы потом обновлять метаданные при смене этапа
    });

    const result = await txBuilder.sendAndConfirm(umi);

    const mintAddress = mintSigner.publicKey.toString();
    console.log(`[MINT] Success! Mint: ${mintAddress}`);

    // Шаг 5: Сохранение в БД
    addInvestor({
      wallet: investorWallet,
      mintAddress,
      amountSol,
      stage: 'foundation',
      txSignature,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Формируем URL эксплорера
    const cluster = process.env.RPC_URL?.includes('devnet') ? '?cluster=devnet' : '?cluster=custom&customUrl=' + encodeURIComponent(process.env.RPC_URL || '');
    const explorerUrl = `https://explorer.solana.com/address/${mintAddress}${cluster}`;

    return NextResponse.json({
      success: true,
      mintAddress,
      explorerUrl,
      metadata: {
        name: metadata.name,
        stage: 'foundation',
        amountSol,
      },
    });

  } catch (err: any) {
    console.error('[MINT] Error:', err);
    return NextResponse.json(
      { error: `Mint failed: ${err.message}` },
      { status: 500 }
    );
  }
}
