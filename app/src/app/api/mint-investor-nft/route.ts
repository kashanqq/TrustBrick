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

// Мы теперь не загружаем статичный JSON на Arweave.
// Вместо этого мы будем использовать динамический URI (наш API).

// ── Основной обработчик ──────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { investorWallet, amountSol, txSignature, slug } = body;

    // Валидация входных данных
    if (!investorWallet || !amountSol || !txSignature || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields: investorWallet, amountSol, txSignature, slug' },
        { status: 400 }
      );
    }
    
    // Временно импортируем локально, т.к. не хотим ломать верхние импорты
    const { getProjectBySlug } = require('@/lib/projects');
    const project = getProjectBySlug(slug);
    if(!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
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

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';

    // Раньше: Dynamic NFT Minting. Теперь: Mint Fungible SPL Tokens!
    const { getOrCreateAssociatedTokenAccount, mintTo } = require('@solana/spl-token');
    const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
    
    const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8899';
    const connection = new Connection(rpcUrl, 'confirmed');
    // Using Backend Admin Keypair
    const adminSecret = new Uint8Array([178,192,7,5,18,136,74,58,87,141,163,6,32,15,163,163,162,84,17,28,105,153,1,140,210,76,47,57,233,22,188,202,159,149,78,232,244,182,40,69,239,66,144,238,56,242,39,228,34,56,33,132,148,124,190,6,102,104,105,84,226,152,247,62]);
    const adminKeypair = Keypair.fromSecretKey(adminSecret);
    const investorPublicKey = new PublicKey(investorWallet);
    const mintPubkey = new PublicKey(project.mintAddress);

    console.log(`[MINT] Sending ${amountSol} ${project.symbol || 'TBRICK'} to ${investorWallet}...`);

    // 1. Get/Create ATA for investor
    const ata = await getOrCreateAssociatedTokenAccount(
      connection,
      adminKeypair,
      mintPubkey,
      investorPublicKey
    );

    // 2. Mint tokens (1 token = 100$, let's mint amountSol * 10 or just amountSol directly (scale to decimals))
    // Assuming 2 decimals, amountSol = 1 => 100 units = 1.00 tokens
    const tokensToMint = Math.floor(amountSol * 100);

    await mintTo(
      connection,
      adminKeypair,
      mintPubkey,
      ata.address,
      adminKeypair,
      tokensToMint
    );

    const mintAddress = project.mintAddress;
    console.log(`[MINT] Success! Minted ${amountSol} tokens to ${investorWallet}`);

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
        name: `TrustBrick Share`,
        stage: 'dynamic',
        amountSol,
      },
    });

  } catch (err: any) {
    console.error('[MINT] Error:', err);
    
    // Если это ошибка транзакции Solana, выводим логи для отладки
    if (err.getLogs) {
      console.log('--- TRANSACTION LOGS ---');
      console.log(err.getLogs());
      console.log('-------------------------');
    }

    return NextResponse.json(
      { 
        error: `Mint failed: ${err.message}`, 
        logs: err.getLogs ? err.getLogs() : undefined 
      },
      { status: 500 }
    );
  }
}
