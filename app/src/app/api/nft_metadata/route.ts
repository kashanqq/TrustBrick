/**
 * POST /api/nft_metadata
 * 
 * Совместимый endpoint для обновления NFT.
 * Прокси к новому oracle/confirm-stage для обратной совместимости
 * с текущим admin/page.tsx, который вызывает этот endpoint напрямую.
 * 
 * Body: { newStage: string, txSignature: string }
 */

import { NextResponse } from 'next/server';
import { getUmi } from '@/lib/umi';
import {
  getInvestorsByStage,
  updateInvestorStage,
  getAllInvestors,
} from '@/lib/db';
import {
  STAGES,
  STAGE_ORDER,
  type BuildStage,
} from '@/lib/constants';
import {
  updateV1,
  fetchDigitalAsset,
} from '@metaplex-foundation/mpl-token-metadata';
import { publicKey } from '@metaplex-foundation/umi';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { newStage, txSignature } = body;

    console.log(`[NFT_METADATA] Stage update request`);
    console.log(`  New Stage: ${newStage}`);
    console.log(`  Trigger Tx: ${txSignature}`);

    // Определяем из какого этапа идёт переход
    const targetIdx = STAGE_ORDER.indexOf(newStage as BuildStage);
    if (targetIdx < 0) {
      return NextResponse.json({ 
        success: true, 
        message: `Stage ${newStage} not found in STAGE_ORDER, skipping NFT update.`,
        warning: true,
      });
    }

    // Если это первый этап — нечего обновлять
    if (targetIdx === 0) {
      return NextResponse.json({ 
        success: true, 
        message: `Foundation stage, no NFT update needed.`
      });
    }

    const fromStage = STAGE_ORDER[targetIdx - 1];
    const toStage = newStage as BuildStage;
    const investors = getInvestorsByStage(fromStage);
    const stageConfig = STAGES[toStage];
    
    console.log(`[NFT_METADATA] Updating ${investors.length} NFTs: ${fromStage} → ${toStage}`);

    let updated = 0;
    const errors: string[] = [];

    if (investors.length > 0) {
      const umi = getUmi();
      
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

          // Загружаем метаданные
          let newUri: string;
          try {
            newUri = await umi.uploader.uploadJson(newMetadata);
          } catch {
            const json = JSON.stringify(newMetadata);
            const base64 = Buffer.from(json).toString('base64');
            newUri = `data:application/json;base64,${base64}`;
          }

          // Обновляем on-chain
          const asset = await fetchDigitalAsset(umi, mintPubkey);
          await updateV1(umi, {
            mint: mintPubkey,
            data: {
              ...asset.metadata,
              uri: newUri,
              name: newMetadata.name,
            },
          }).sendAndConfirm(umi);

          updateInvestorStage(investor.mintAddress, toStage);
          updated++;

          console.log(`[NFT_METADATA] Updated ${investor.mintAddress}`);
          await new Promise((r) => setTimeout(r, 100));
        } catch (err: any) {
          errors.push(`${investor.mintAddress}: ${err.message}`);
          console.error(`[NFT_METADATA] Error updating ${investor.mintAddress}:`, err.message);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${updated}/${investors.length} NFTs to stage: ${newStage}`,
      updated,
      total: investors.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    console.error('[NFT_METADATA] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
