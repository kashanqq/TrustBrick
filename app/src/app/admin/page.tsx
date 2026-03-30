"use client";

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { getProgram, getBuildingProjectPda, PROJECT_ID } from "@/utils/anchor";
import { AnchorProvider, BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

// Адрес застройщика, который мы записывали при 
// initialize в тестах. Здесь мы его хардкодим для хакатона, 
// но в идеале передавать из базы.
const BUILDER_PUBKEY = new PublicKey("11111111111111111111111111111111");

export default function AdminPanel() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  
  const handleApproveStage = async (stageName: string, releaseSol: number) => {
    if (!wallet.connected || !wallet.publicKey) {
      alert("Сначала подключите кошелек Оракула!");
      return;
    }

    try {
      setLoading(true);
      const provider = new AnchorProvider(connection, wallet as any, { preflightCommitment: "confirmed" });
      const program = getProgram(provider);
      
      const releaseAmount = new BN(releaseSol * LAMPORTS_PER_SOL);
      
      console.log(`Запрос на высвобождение ${releaseSol} SOL для ${stageName}...`);

      const tx = await program.methods.releaseFunds(new BN(PROJECT_ID), releaseAmount)
        .accounts({
          admin: wallet.publicKey,
          builder: BUILDER_PUBKEY, // В реальности берется из стейта контракта
        })
        .rpc();

      alert(`✅ Транзакция успешна! Средства переведены Застройщику: ${tx}`);
      
      // Здесь бэкенд обновляет Метаданные NFT всем владельцам с "Пустого поля" на "Каркас"
      await fetch("/api/nft_metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newStage: stageName,
          txSignature: tx
        })
      });

    } catch (err: any) {
      console.error(err);
      if (err.message.includes("Unauthorized")) {
         alert("Ошибка Безопасности: Ваш кошелек не является доверенным Оракулом!");
      } else {
         alert("Сбой транзакции: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-panel" style={{ backgroundColor: "#000", padding: "4rem", minHeight: "100vh" }}>
      <h1 className="admin-title">ТЕХНАДЗОР :: TRUSTBRICK</h1>
      <p style={{ color: "grey", marginBottom: "2rem" }}>
        Панель управления состоянием строек. Любые действия журналируются. 
      </p>

      {wallet.connected ? (
        <div style={{ color: "#10b981", marginBottom: "2rem", fontFamily: "monospace" }}>
          AUTH OK: {wallet.publicKey?.toBase58()}
        </div>
      ) : (
        <div style={{ color: "red", marginBottom: "2rem" }}>
          НЕ АВТОРИЗОВАН (Требуется Web3 Auth)
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <button 
          onClick={() => handleApproveStage("stage1-skeleton", 5)}
          className="btn" 
          disabled={!wallet.connected || loading}
          style={{ backgroundColor: "#0f172a", border: "1px solid #334155" }}
        >
          [ АКТИВ ] Подтвердить Этап 1 ("Каркас Здания") — Разблокировать 5 SOL
        </button>

        <button 
          onClick={() => handleApproveStage("stage2-finished", 10)}
          className="btn" 
          disabled={!wallet.connected || loading}
          style={{ backgroundColor: "#0f172a", border: "1px solid #334155" }}
        >
          [ ПАССИВ ] Подтвердить Этап 2 ("Готовый дом") — Разблокировать 10 SOL
        </button>
      </div>

    </div>
  );
}
