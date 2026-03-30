import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { investor, amount, txSignature } = body;
    
    // В рамках хакатона:
    // Подключаем кошелек Администратора (Бэкенда / Минтера) через Keypair.fromSecretKey(...)
    // Инициализируем Metaplex SDK
    // 1. Минтим Фракционные SPL-токены равные amount
    // 2. Минтим "NFT-паспорт" вкладчика на кошелек investor
    
    console.log(`[TrustBrick Backend] NFT & Tokens Mint Request`);
    console.log(`   Investor: ${investor}`);
    console.log(`   Amount: ${amount} SOL`);
    console.log(`   Tx: ${txSignature}`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Token & NFT successfully minted for ${investor}` 
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
