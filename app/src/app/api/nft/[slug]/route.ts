import { NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { getBuildingProjectPda, PROGRAM_ID } from '@/utils/anchor';
import { getProjectBySlug } from '@/lib/projects';
import { STAGES, STAGE_ORDER, BuildStage } from '@/lib/constants';
import * as anchor from '@coral-xyz/anchor';
import idl from '@/idl/trustbrick.json';

import { getImageForProjectStage } from '@/lib/server/imagesDb';

const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8899';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  const project = getProjectBySlug(slug);
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  // 1. По умолчанию отдаём стадию 0 (Foundation)
  let currentStageIndex = 0;

  try {
    const connection = new Connection(rpcUrl, 'confirmed');
    // Используем dummy wallet для read-only provider
    const dummyWallet = {
      publicKey: PublicKey.default,
      signTransaction: async () => { throw new Error("Read only") },
      signAllTransactions: async () => { throw new Error("Read only") }
    };
    const provider = new anchor.AnchorProvider(connection, dummyWallet, {});
    const program = new anchor.Program(idl as anchor.Idl, provider) as any;
    
    // 2. Идём в смарт-контракт, запрашиваем реальное состояние
    const pda = getBuildingProjectPda(project.id);
    const accountData = await program.account.buildingProject.fetch(pda);
    
    currentStageIndex = accountData.stage || 0;
  } catch (e: any) {
    console.log(`[Dynamic NFT] Contract uninitialized or err for ${slug}: ${e.message}`);
    // Игнорируем ошибку (если контракт еще не инициализирован для этого проекта)
  }

  // Получаем конфигурацию этапа по индексу
  const stageEntry = Object.entries(STAGES).find(([, cfg]) => cfg.stageIndex === currentStageIndex);
  let stageKey: BuildStage = 'foundation';
  let stageConfig = STAGES.foundation;

  if (stageEntry) {
    stageKey = stageEntry[0] as BuildStage;
    stageConfig = stageEntry[1];
  }

  // Если Оракул загрузил свою картинку, подменяем!
  const customImage = getImageForProjectStage(project.id, currentStageIndex);
  // Вместо сломанных arweave placeholder-ов берем официальную картинку проекта
  const finalImage = customImage || project.previewImage;

  // Извлекаем amount из query-параметров или используем дефолтный
  const { searchParams } = new URL(request.url);
  const amountStr = searchParams.get('amount') || project.mintPriceSol.toString();

  // Динамический вывод метаданных
  return NextResponse.json({
    name: `TrustBrick Доля ${project.name}`,
    symbol: 'TBRICK',
    description: `Инвестиционная доля в ${project.name} (${project.location}). Этап: ${stageConfig.name}. Объем: ${amountStr} SOL.`,
    // Пока возвращаем дефолт картинку по этапу строительства
    image: finalImage,
    external_url: `https://trustbrick.com/project/${project.slug}`,
    attributes: [
      { trait_type: 'Project ID', value: project.id.toString() },
      { trait_type: 'Location', value: project.location },
      { trait_type: 'Stage', value: stageConfig.name },
      { trait_type: 'Yield', value: project.yieldInfo },
      { trait_type: 'amount_sol', value: amountStr },
      { trait_type: 'Original Price', value: project.mintPriceSol + ' SOL' }
    ],
    properties: {
      category: 'image'
    }
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    }
  });
}
