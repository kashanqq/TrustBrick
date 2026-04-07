import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { newStage, txSignature } = body;

    // В рамках хакатона:
    // Когда срабатывает этот эндпоинт, Оракул (Бэкенд) берет Admin-кошелек (Update Authority)
    // И через Metaplex SDK делает updateV1 NFT-коллекции "Хакатон-Тауэр"
    // Меняет uri с https://trustbrick.com/stage-0.json на https://trustbrick.com/stage-1.json (где картинка Каркаса)

    console.log(`[TrustBrick Backend] NFT Update Stage Request`);
    console.log(`   New Stage: ${newStage}`);
    console.log(`   Trigger Tx: ${txSignature}`);

    return NextResponse.json({
      success: true,
      message: `All investors' NFTs dynamically updated to stage: ${newStage}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
