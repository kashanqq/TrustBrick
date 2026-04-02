/**
 * POST /api/oracle/confirm-stage
 * 
 * Оракул: подтверждение этапа строительства.
 * Выполняет два параллельных потока:
 *   А) Вызов release_funds в смарт-контракте
 *   Б) Обновление метаданных всех NFT инвесторов
 * 
 * Body: {
 *   targetStage: BuildStage,    — целевой этап (floor_1, floor_2, complete)
 *   releaseAmountSol: number,   — сумма транша в SOL
 * }
 * 
 * Headers: Authorization: Bearer <ADMIN_SECRET>
 */

import { NextRequest, NextResponse } from 'next/server';
import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { AnchorProvider, Program, BN, Wallet } from '@coral-xyz/anchor';
import { getUmi, getAdminSigner } from '@/lib/umi';
import { verifyAdmin } from '@/lib/auth';
import {
  getInvestorsByStage,
  updateInvestorStage,
  getAllInvestors,
} from '@/lib/db';
import {
  STAGES,
  STAGE_ORDER,
  getNextStage,
  getStageByIndex,
  type BuildStage,
} from '@/lib/constants';
import {
  updateV1,
  fetchDigitalAsset,
} from '@metaplex-foundation/mpl-token-metadata';
import { publicKey } from '@metaplex-foundation/umi';
import idl from '@/idl/solana_counter.json';

// ── Типы ──────────────────────────────────────────────────────────

interface ConfirmStageRequest {
  targetStage: BuildStage;
  releaseAmountSol: number;
}

// ── Поток А: вызов смарт-контракта release_funds ─────────────────

async function releaseFundsOnChain(
  releaseAmountSol: number
): Promise<{ txSignature: string }> {
  const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8899';
  const programId = process.env.PROGRAM_ID || idl.address;
  const projectId = parseInt(process.env.PROJECT_ID || '1');

  // Парсим приватный ключ админа
  const adminKeypairRaw = JSON.parse(process.env.ADMIN_KEYPAIR || '[]');
  const adminKeypair = Keypair.fromSecretKey(Uint8Array.from(adminKeypairRaw));

  const connection = new Connection(rpcUrl, 'confirmed');
  
  // Создаём AnchorProvider с adminKeypair
  const wallet: Wallet = {
    publicKey: adminKeypair.publicKey,
    signTransaction: async (tx: any) => {
      tx.partialSign(adminKeypair);
      return tx;
    },
    signAllTransactions: async (txs: any[]) => {
      txs.forEach(tx => tx.partialSign(adminKeypair));
      return txs;
    },
    payer: adminKeypair,
  } as any;

  const provider = new AnchorProvider(connection, wallet, {
    preflightCommitment: 'confirmed',
  });

  const program = new Program(idl as any, provider);

  // Находим PDA эскроу
  const projectIdBN = new BN(projectId);
  const projectIdBuffer = projectIdBN.toArrayLike(Buffer, 'le', 8);
  const [buildingProjectPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('escrow'), projectIdBuffer],
    new PublicKey(programId)
  );

  // Получаем данные проекта для нахождения builder
  // Используем getAccountInfo + ручной парсинг, т.к. program.account не типизирован
  const accountInfo = await connection.getAccountInfo(buildingProjectPda);
  if (!accountInfo) {
    throw new Error('Building project PDA not found. Was the contract initialized?');
  }
  // Структура BuildingProject: 8 (discriminator) + 32 (admin) + 32 (builder) + 8 (total_invested) + 1 (stage) + 8 (project_id)
  const builderBytes = accountInfo.data.subarray(8 + 32, 8 + 32 + 32);
  const builderPubkey = new PublicKey(builderBytes);

  const releaseAmount = new BN(releaseAmountSol * LAMPORTS_PER_SOL);

  console.log(`[ORACLE:A] Calling release_funds...`);
  console.log(`  PDA: ${buildingProjectPda.toBase58()}`);
  console.log(`  Builder: ${builderPubkey.toBase58()}`);
  console.log(`  Amount: ${releaseAmountSol} SOL`);

  const tx = await program.methods
    .releaseFunds(projectIdBN, releaseAmount)
    .accounts({
      admin: adminKeypair.publicKey,
      builder: builderPubkey,
    })
    .signers([adminKeypair])
    .rpc();

  console.log(`[ORACLE:A] release_funds OK: ${tx}`);
  return { txSignature: tx };
}

// ── Поток Б: обновление метаданных NFT ───────────────────────────

async function updateAllNftMetadata(
  fromStage: BuildStage,
  toStage: BuildStage
): Promise<{ updated: number; errors: string[] }> {
  const investors = getInvestorsByStage(fromStage);
  const umi = getUmi();
  const stageConfig = STAGES[toStage];
  const errors: string[] = [];
  let updated = 0;

  console.log(`[ORACLE:B] Updating ${investors.length} NFTs: ${fromStage} → ${toStage}`);

  // Обновляем последовательно, чтобы не задушить RPC
  for (const investor of investors) {
    try {
      const mintPubkey = publicKey(investor.mintAddress);

      // Формируем новые метаданные
      const newMetadata = {
        name: `TrustBrick Доля`,
        symbol: 'TBRICK',
        description: `Инвестиционная доля в ЖК Хакатон-Тауэр. ${investor.amountSol} SOL. Этап: ${stageConfig.name}`,
        image: stageConfig.image,
        external_url: 'https://trustbrick.io',
        attributes: [
          { trait_type: 'stage', value: toStage },
          { trait_type: 'stage_name', value: stageConfig.name },
          { trait_type: 'amount_sol', value: investor.amountSol.toString() },
          { trait_type: 'investor', value: investor.wallet },
          { trait_type: 'project', value: 'ЖК Хакатон-Тауэр' },
        ],
      };

      // Загружаем новый JSON метаданных
      let newUri: string;
      try {
        newUri = await umi.uploader.uploadJson(newMetadata);
      } catch {
        // Фоллбэк для локальной разработки
        const json = JSON.stringify(newMetadata);
        const base64 = Buffer.from(json).toString('base64');
        newUri = `data:application/json;base64,${base64}`;
      }

      // Получаем текущий NFT asset
      const asset = await fetchDigitalAsset(umi, mintPubkey);

      // Обновляем метаданные on-chain
      await updateV1(umi, {
        mint: mintPubkey,
        data: {
          ...asset.metadata,
          uri: newUri,
          name: newMetadata.name,
        },
      }).sendAndConfirm(umi);

      // Обновляем запись в БД
      updateInvestorStage(investor.mintAddress, toStage);
      updated++;

      console.log(`[ORACLE:B] Updated NFT ${investor.mintAddress} for ${investor.wallet}`);

      // Небольшая задержка между запросами (100ms)
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (err: any) {
      const errMsg = `Failed to update NFT ${investor.mintAddress}: ${err.message}`;
      console.error(`[ORACLE:B] ${errMsg}`);
      errors.push(errMsg);
    }
  }

  console.log(`[ORACLE:B] Done. Updated: ${updated}/${investors.length}`);
  return { updated, errors };
}

// ── Основной обработчик ──────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Проверяем авторизацию
  const auth = verifyAdmin(req);
  if (!auth.authorized) {
    return auth.error!;
  }

  try {
    const body: ConfirmStageRequest = await req.json();
    const { targetStage, releaseAmountSol } = body;

    // Валидация
    if (!targetStage || !releaseAmountSol) {
      return NextResponse.json(
        { error: 'Missing required fields: targetStage, releaseAmountSol' },
        { status: 400 }
      );
    }

    if (!STAGES[targetStage]) {
      return NextResponse.json(
        { error: `Invalid stage: ${targetStage}. Valid: ${STAGE_ORDER.join(', ')}` },
        { status: 400 }
      );
    }

    // Определяем текущий этап (из которого переходим)
    const targetIdx = STAGE_ORDER.indexOf(targetStage);
    if (targetIdx <= 0) {
      return NextResponse.json(
        { error: `Cannot transition to stage: ${targetStage}. Must be after foundation.` },
        { status: 400 }
      );
    }
    const fromStage = STAGE_ORDER[targetIdx - 1];

    console.log(`[ORACLE] ══════════════════════════════════════════`);
    console.log(`[ORACLE] Stage confirmation: ${fromStage} → ${targetStage}`);
    console.log(`[ORACLE] Release: ${releaseAmountSol} SOL`);
    console.log(`[ORACLE] ══════════════════════════════════════════`);

    // Запускаем оба потока параллельно
    const [chainResult, nftResult] = await Promise.all([
      // Поток А: release_funds на блокчейне
      releaseFundsOnChain(releaseAmountSol)
        .then((result) => ({ success: true as const, ...result }))
        .catch((err) => ({ success: false as const, error: err.message })),

      // Поток Б: обновление метаданных NFT
      updateAllNftMetadata(fromStage, targetStage)
        .then((result) => ({ success: true as const, ...result }))
        .catch((err) => ({ success: false as const, error: err.message, updated: 0, errors: [] })),
    ]);

    // Определяем общий статус
    const overallSuccess = chainResult.success && nftResult.success;

    const response = {
      success: overallSuccess,
      stage: {
        from: fromStage,
        to: targetStage,
        stageConfig: STAGES[targetStage],
      },
      releaseFunds: chainResult,
      nftUpdates: nftResult,
      timestamp: new Date().toISOString(),
    };

    console.log(`[ORACLE] Result:`, JSON.stringify(response, null, 2));

    return NextResponse.json(response, {
      status: overallSuccess ? 200 : 207, // 207 Multi-Status если частичный успех
    });

  } catch (err: any) {
    console.error('[ORACLE] Critical error:', err);
    return NextResponse.json(
      { error: `Oracle error: ${err.message}` },
      { status: 500 }
    );
  }
}

// ── GET: получить текущее состояние ──────────────────────────────

export async function GET(req: NextRequest) {
  const auth = verifyAdmin(req);
  if (!auth.authorized) {
    return auth.error!;
  }

  try {
    const investors = getAllInvestors();

    // Подсчёт по этапам
    const stageCounts: Record<string, number> = {};
    for (const stage of STAGE_ORDER) {
      stageCounts[stage] = investors.filter((inv) => inv.stage === stage).length;
    }

    // Общая сумма инвестиций
    const totalInvested = investors.reduce((sum, inv) => sum + inv.amountSol, 0);

    return NextResponse.json({
      totalInvestors: investors.length,
      totalInvestedSol: totalInvested,
      stageCounts,
      investors: investors.map((inv) => ({
        wallet: inv.wallet,
        mintAddress: inv.mintAddress,
        amountSol: inv.amountSol,
        stage: inv.stage,
        createdAt: inv.createdAt,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
