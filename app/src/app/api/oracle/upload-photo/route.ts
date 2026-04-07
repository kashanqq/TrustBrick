import { NextResponse } from 'next/server';
import { setImageForProjectStage } from '@/lib/server/imagesDb';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId, stageIndex, imageUrl } = body;

    // TODO: Verify signature from wallet admin/oracle to prevent unauthorized updates
    // For hackathon, just trusting the payload

    if (!projectId || stageIndex === undefined || !imageUrl) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    setImageForProjectStage(projectId, stageIndex, imageUrl);

    return NextResponse.json({ success: true, message: 'Image successfully set for dynamic NFT' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
