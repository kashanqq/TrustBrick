import { NextResponse } from 'next/server';
import { getImageForProjectStage } from '@/lib/server/imagesDb';
import { getProjectById } from '@/lib/projects';
import { Connection, PublicKey } from '@solana/web3.js';
import { getBuildingProjectPda } from '@/utils/anchor';
import * as anchor from '@coral-xyz/anchor';
import idl from '@/idl/trustbrick.json';

const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8899';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projectId = parseInt(id);
  const project = getProjectById(projectId);
  
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  let currentStageIndex = 0;
  try {
    const connection = new Connection(rpcUrl, 'confirmed');
    const dummyWallet = {
      publicKey: PublicKey.default,
      signTransaction: async () => { throw new Error("Read only") },
      signAllTransactions: async () => { throw new Error("Read only") }
    };
    const provider = new anchor.AnchorProvider(connection, dummyWallet, {});
    const program = new anchor.Program(idl as anchor.Idl, provider) as any;
    
    const pda = getBuildingProjectPda(project.id);
    const accountData = await program.account.buildingProject.fetch(pda);
    currentStageIndex = accountData.stage || 0;
  } catch (e) {
    // contract not initialized
  }

  const customImage = getImageForProjectStage(project.id, currentStageIndex);
  const finalImage = customImage || project.previewImage;

  return NextResponse.redirect(finalImage, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    },
  });
}
