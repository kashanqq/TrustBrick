"use client";

import { useCallback, useEffect, useState } from "react";
import { useAnchorWallet, useWallet, useConnection } from "@solana/wallet-adapter-react";
import ClientWalletButton from "@/components/ClientWalletButton";
import { getProgram, getBuildingProjectPda, PROJECT_ID } from "@/utils/anchor";
import { AnchorProvider, BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import Image from "next/image";

const GOAL_SOL = 50;

export default function Home() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const [totalInvested, setTotalInvested] = useState(0);
  const [stage, setStage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [investing, setInvesting] = useState(false);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectData = useCallback(async () => {
    if (!anchorWallet) return;
    try {
      const provider = new AnchorProvider(connection, anchorWallet, {});
      const program = getProgram(provider);
      const pda = getBuildingProjectPda();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const accountData = await (program.account as any).buildingProject.fetch(pda) as {
        totalInvested: { toNumber(): number };
        stage: number;
      };
      setTotalInvested(accountData.totalInvested.toNumber() / LAMPORTS_PER_SOL);
      setStage(accountData.stage);
    } catch {
      // Контракт ещё не задеплоен или аккаунт не создан — показываем fallback
    } finally {
      setLoading(false);
    }
  }, [anchorWallet, connection]);

  useEffect(() => {
    if (wallet.connected && anchorWallet) {
      void fetchProjectData();
    } else {
      setLoading(false);
    }
  }, [wallet.connected, anchorWallet, fetchProjectData]);

  const handleInvest = async () => {
    if (!wallet.connected || !wallet.publicKey || !anchorWallet) return;
    setError(null);
    setTxSuccess(null);

    try {
      setInvesting(true);
      const provider = new AnchorProvider(connection, anchorWallet, {
        preflightCommitment: "confirmed",
      });
      const program = getProgram(provider);
      const investAmount = new BN(1 * LAMPORTS_PER_SOL);

      const tx = await program.methods
        .invest(new BN(PROJECT_ID), investAmount)
        .accounts({ investor: wallet.publicKey })
        .rpc();

      setTxSuccess(tx);
      await fetchProjectData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    } finally {
      setInvesting(false);
    }
  };

  const progressPercent = Math.min((totalInvested / GOAL_SOL) * 100, 100);

  const imageSrc =
    stage === 0 ? "/stage-0.png" : stage === 1 ? "/stage-1.png" : "/stage-2.png";

  return (
    <main>
      <header className="header">
        <div className="logo">TRUSTBRICK</div>
        <ClientWalletButton />
      </header>

      <div style={{ marginTop: "4rem" }} className="card">
        <h1 className="card-title">ЖК &quot;Хакатон-Тауэр&quot;</h1>

        <div className="card-image-container">
          <Image
            src={imageSrc}
            alt="Состояние стройки"
            fill
            style={{ objectFit: "cover" }}
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
          <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
        </div>

        <button
          type="button"
          className="btn"
          onClick={handleInvest}
          disabled={!wallet.connected || loading || investing}
        >
          {loading ? "Загрузка..." : investing ? "Подписание..." : "Инвестировать 1 SOL"}
        </button>

        {!wallet.connected && (
          <p style={{ textAlign: "center", marginTop: "1rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Подключите кошелёк Phantom для инвестирования
          </p>
        )}

        {txSuccess && (
          <div style={{
            marginTop: "1rem",
            padding: "0.75rem",
            borderRadius: "8px",
            background: "rgba(20, 83, 45, 0.2)",
            border: "1px solid rgba(74, 222, 128, 0.25)",
            color: "#bbf7d0",
            fontSize: "0.85rem",
            wordBreak: "break-all",
          }}>
            Инвестиция принята! Tx:{" "}
            <a
              href={`https://explorer.solana.com/tx/${txSuccess}?cluster=devnet`}
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--accent-blue)" }}
            >
              {txSuccess.slice(0, 20)}…
            </a>
          </div>
        )}

        {error && (
          <div style={{
            marginTop: "1rem",
            padding: "0.75rem",
            borderRadius: "8px",
            background: "rgba(127, 29, 29, 0.18)",
            border: "1px solid rgba(239, 68, 68, 0.35)",
            color: "#fca5a5",
            fontSize: "0.85rem",
          }}>
            {error}
          </div>
        )}
      </div>
    </main>
  );
}
