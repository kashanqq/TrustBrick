/**
 * GET /api/investors
 * 
 * Публичный эндпоинт для получения списка инвесторов.
 * Используется фронтендом (админка, портфолио).
 */

import { NextResponse } from 'next/server';
import { getAllInvestors } from '@/lib/db';
import { STAGE_ORDER } from '@/lib/constants';

export async function GET() {
  try {
    const investors = getAllInvestors();

    // Подсчёт по этапам
    const stageCounts: Record<string, number> = {};
    for (const stage of STAGE_ORDER) {
      stageCounts[stage] = investors.filter((inv) => inv.stage === stage).length;
    }

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
