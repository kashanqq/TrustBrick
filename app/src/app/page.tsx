"use client";

import { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import ClientWalletButton from "@/components/ClientWalletButton";
import { getProgram, getBuildingProjectPda, PROJECT_ID } from "@/utils/anchor";
import { AnchorProvider, BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import Image from "next/image";

// Заглушка, если сервер еще не запущен или проект не инициализирован
const GOAL_SOL = 50; 

export default function Home() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [totalInvested, setTotalInvested] = useState(0);
  const [stage, setStage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [investing, setInvesting] = useState(false);

  const fetchProjectData = async () => {
    if (!wallet.publicKey) {
      // Если кошелек не подключен, попробуем использовать заглушечный провайдер
      // Но для простоты демо пока просто вернемся
      // setTotalInvested(15); setStage(1);
      // return;
    }
    
    try {
      if (!wallet.publicKey || !wallet.signTransaction) return;
      const provider = new AnchorProvider(connection, wallet as any, {});
      const program = getProgram(provider);
      const pda = getBuildingProjectPda();

      // Пытаемся забрать стейт из контракта
      const accountData = await program.account.buildingProject.fetch(pda);
      const investedSol = accountData.totalInvested.toNumber() / LAMPORTS_PER_SOL;
      setTotalInvested(investedSol);
      setStage(accountData.stage);
    } catch (err) {
      console.error("Не удалось прочитать контракт:", err);
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (wallet.connected) {
      fetchProjectData();
    } else {
      setLoading(false);
    }
  }, [wallet.connected, connection]);

  const handleInvest = async () => {
    if (!wallet.connected || !wallet.publicKey) return;

    try {
      setInvesting(true);
      const provider = new AnchorProvider(connection, wallet as any, { preflightCommitment: "confirmed" });
      const program = getProgram(provider);
      const pda = getBuildingProjectPda();

      // Инвестируем фиксированно 1 SOL для демо
      const investAmount = new BN(1 * LAMPORTS_PER_SOL); 
      
      const tx = await program.methods.invest(new BN(PROJECT_ID), investAmount)
        .accounts({
          investor: wallet.publicKey,
        })
        .rpc();

      console.log("Успешная транзакция:", tx);
      
      // Здесь мы делаем запрос к нашему бэкенду (Вариант А из плана)
      // чтобы бэкенд выпустил нам Фракционные токены и NFT-пас
      try {
        await fetch("/api/mint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            investor: wallet.publicKey.toBase58(),
            amount: 1, // 1 SOL
            txSignature: tx
          })
        });
        alert("✅ Инвестиция принята и NFT выдан на ваш кошелек!");
      } catch (backendErr) {
        console.error("Бэкенд не смог выдать NFT:", backendErr);
        alert("Частичный успех: Деньги ушли в смарт-контракт, но бакэнд не смог выпустить NFT.");
      }

      // Обновляем UI
      await fetchProjectData();

    } catch (err: any) {
      console.error("Ошибка при инвестировании:", err);
      alert("Ошибка транзакции: " + err.message);
    } finally {
      setInvesting(false);
    }
  };

  const progressPercent = Math.min((totalInvested / GOAL_SOL) * 100, 100);

  // Выбор картинки в зависимости от стадии
  const getImageSource = () => {
    if (stage === 0) return "/stage-0.png";
    if (stage === 1) return "/stage-1.png";
    return "/stage-2.png";
  };

  return (
    <main>
      <header className="header">
        <div className="logo">TRUSTBRICK</div>
        <ClientWalletButton />
      </header>

      <div style={{ marginTop: "4rem" }} className="card">
        <h1 className="card-title">ЖК "Хакатон-Тауэр"</h1>
        
        <div className="card-image-container">
          <Image 
            src={getImageSource()} 
            alt="Состояние стройки" 
            layout="fill" 
            objectFit="cover" 
            className="card-image"
          />
        </div>

        <div className="stats">
          <div className="stat-item">
            <span className="stat-label">Собрано средств</span>
            <span className="stat-value">{totalInvested} SOL</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Цель</span>
            <span className="stat-value">{GOAL_SOL} SOL</span>
          </div>
          <div className="stat-item" style={{ textAlign: "right" }}>
            <span className="stat-label">Этап строительства</span>
            <span className="stat-value" style={{ color: "var(--accent-blue)" }}>
              {stage === 0 ? "Старт" : stage === 1 ? "Каркас" : "Готово"}
            </span>
          </div>
        </div>

        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
        </div>

        <button 
          className="btn" 
          onClick={handleInvest}
          disabled={!wallet.connected || loading || investing}
        >
          {loading ? "Загрузка..." : investing ? "Подписание ✍️" : "Инвестировать 1 SOL"}
        </button>

        {!wallet.connected && (
          <p style={{ textAlign: "center", marginTop: "1rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Подключите кошелек Phantom для инвестирования
          </p>
        )}
      </div>
    </main>
  );
}
