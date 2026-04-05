"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { getProgram, getBuildingProjectPda, PROJECT_ID } from "@/utils/anchor";
import { AnchorProvider, BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import Image from "next/image";
import ClientWalletButton from "@/components/ClientWalletButton";

// Builder pubkey для локальной разработки — кошелёк admin'а (задаётся в handleInitialize ниже)
// В продакшне заменить на реальный адрес застройщика
const DEFAULT_BUILDER = "11111111111111111111111111111111"; // placeholder, будет перезаписан

// ── Типы ──────────────────────────────────────────────────────────

interface InvestorInfo {
  wallet: string;
  mintAddress: string;
  amountSol: number;
  stage: string;
  createdAt: string;
}

interface InvestorsData {
  totalInvestors: number;
  totalInvestedSol: number;
  stageCounts: Record<string, number>;
  investors: InvestorInfo[];
}

// ── Конфигурация этапов ──────────────────────────────────────────

const STAGE_CONFIG = [
  {
    key: "floor_1",
    label: "ЭТАП 2: КАРКАС",
    labelEn: "PHASE 2: SKELETON",
    releaseSol: 5,
    color: "bg-primary-container text-on-primary-container",
    hoverColor: "hover:bg-primary",
    shadow: "shadow-[0_10px_30px_-10px_rgba(194,65,12,0.5)]",
  },
  {
    key: "floor_2",
    label: "ЭТАП 3: СТЕНЫ",
    labelEn: "PHASE 3: WALLS",
    releaseSol: 5,
    color: "bg-surface-container text-on-surface",
    hoverColor: "hover:bg-surface-variant",
    shadow: "",
  },
  {
    key: "complete",
    label: "ЭТАП 4: СДАЧА",
    labelEn: "PHASE 4: COMPLETE",
    releaseSol: 10,
    color: "bg-surface-container text-on-surface",
    hoverColor: "hover:bg-surface-variant",
    shadow: "",
  },
];

export default function AdminPanel() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean | null>(null);
  const [investorsData, setInvestorsData] = useState<InvestorsData | null>(null);
  const [lastResult, setLastResult] = useState<any>(null);

  // ── Auto-airdrop на localnet ─────────────────────────────────────

  useEffect(() => {
    if (!wallet.publicKey || !wallet.connected) return;
    const endpoint = connection.rpcEndpoint;
    if (endpoint.includes("localhost") || endpoint.includes("127.0.0.1")) {
      connection.getBalance(wallet.publicKey).then((bal) => {
        if (bal < LAMPORTS_PER_SOL) {
          console.log("Localnet: airdrop 2 SOL to", wallet.publicKey!.toBase58());
          connection.requestAirdrop(wallet.publicKey!, 2 * LAMPORTS_PER_SOL)
            .then((sig) => connection.confirmTransaction(sig))
            .catch((e) => console.warn("Airdrop failed:", e));
        }
      });
    }
  }, [wallet.publicKey, wallet.connected, connection]);

  // ── Загрузка состояния PDA ─────────────────────────────────────

  useEffect(() => {
    if (!wallet.connected) return;
    const checkInitialization = async () => {
      try {
        const pda = getBuildingProjectPda();
        const accountInfo = await connection.getAccountInfo(pda);
        setIsInitialized(accountInfo !== null);
      } catch (err: any) {
        console.error("Check init error:", err);
        setIsInitialized(false);
      }
    };
    checkInitialization();
  }, [wallet.connected, connection]);

  // ── Загрузка списка инвесторов ─────────────────────────────────

  const fetchInvestors = useCallback(async () => {
    try {
      const res = await fetch("/api/investors");
      if (res.ok) {
        const data: InvestorsData = await res.json();
        setInvestorsData(data);
      }
    } catch (err) {
      console.error("Failed to fetch investors:", err);
    }
  }, []);

  useEffect(() => {
    fetchInvestors();
    const interval = setInterval(fetchInvestors, 10000);
    return () => clearInterval(interval);
  }, [fetchInvestors]);

  // ── Инициализация контракта ────────────────────────────────────

  const handleInitialize = async () => {
    if (!wallet.connected || !wallet.publicKey) return;
    try {
      setLoading(true);
      const provider = new AnchorProvider(connection, wallet as any, { preflightCommitment: "confirmed" });
      const program = getProgram(provider);
      
      // На локальной разработке admin == builder для простоты тестирования.
      // В продакшне передать отдельный PublicKey застройщика.
      const builderForInit = wallet.publicKey;

      const tx = await program.methods.initialize(new BN(PROJECT_ID), builderForInit)
        .accounts({
          admin: wallet.publicKey,
        })
        .rpc();
        
      alert(`✅ Контракт успешно инициализирован: ${tx}`);
      setIsInitialized(true);
    } catch (err: any) {
      console.error(err);
      alert("Ошибка инициализации: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // ── Подтверждение этапа через Оракул ───────────────────────────

  const handleConfirmStage = async (targetStage: string, releaseSol: number) => {
    if (!wallet.connected || !wallet.publicKey) {
      alert("Сначала подключите кошелек Оракула!");
      return;
    }

    const confirmed = window.confirm(
      `⚠️ Вы уверены?\n\nЭтап: ${targetStage}\nТранш: ${releaseSol} SOL\n\nЭто действие необратимо!`
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      setActiveAction(targetStage);
      setLastResult(null);

      // Читаем builder из PDA чтобы не использовать захардкоженный placeholder
      const pda = getBuildingProjectPda();
      const accountInfo = await connection.getAccountInfo(pda);
      if (!accountInfo) throw new Error("Контракт не инициализирован! Сначала нажмите 'Initialize Ledger PDA'");
      // BuildingProject layout: 8 (disc) + 32 (admin) + 32 (builder) ...
      const builderBytes = accountInfo.data.subarray(8 + 32, 8 + 32 + 32);
      const builderPubkey = new PublicKey(builderBytes);
      console.log("Builder prochitan iz PDA:", builderPubkey.toBase58());

      const provider = new AnchorProvider(connection, wallet as any, { preflightCommitment: "confirmed" });
      const program = getProgram(provider);

      const tx = await program.methods.releaseFunds(new BN(PROJECT_ID))
        .accounts({
          admin: wallet.publicKey,
          builder: builderPubkey,
        })
        .rpc();

      console.log(`release_funds tx: ${tx}`);

      // Вариант 2: Вызов backend oracle для обновления NFT
      const oracleRes = await fetch("/api/nft_metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newStage: targetStage,
          txSignature: tx,
        }),
      });

      const oracleData = await oracleRes.json();

      setLastResult({
        success: true,
        txSignature: tx,
        stage: targetStage,
        nftUpdates: oracleData,
      });

      await fetchInvestors();

      alert(`✅ Этап подтверждён! Транш ${releaseSol} SOL отправлен.\nTx: ${tx}`);

    } catch (err: any) {
      console.error(err);
      setLastResult({ success: false, error: err.message });
      if (err.message.includes("Unauthorized")) {
         alert("Ошибка Безопасности: Ваш кошелек не является доверенным Оракулом!");
      } else {
         alert("Сбой транзакции: " + err.message);
      }
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

  return (
    <main className="pt-20 min-h-screen bg-surface control-panel-grid relative">
        <div className="max-w-screen-2xl mx-auto p-8 lg:p-12 relative z-10">
            {/* ── Header ──────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-l-4 border-primary pl-6">
                <div>
                    <div className="flex items-center space-x-3 mb-2">
                        <span className={"w-3 h-3 rounded-full mb-0 " + (wallet.connected ? "bg-primary animate-pulse" : "bg-red-500")}></span>
                        <span className="font-headline text-xs tracking-widest uppercase text-secondary">Live Telemetry: Oracle Node</span>
                    </div>
                    <h1 className="font-headline text-5xl font-extrabold tracking-tighter uppercase">Oracle Admin</h1>
                    <p className="text-slate-500 font-mono mt-2 uppercase text-xs">The Architectural Ledger // Verification Terminal</p>
                </div>
                {!wallet.connected && (
                    <div className="flex items-center bg-surface-container px-6 py-4 border-b-2 border-error">
                      <span className="text-error mr-4 text-xs font-bold uppercase tracking-widest">Auth Required</span>
                      <ClientWalletButton />
                    </div>
                )}
                {wallet.connected && (
                  <div className="flex space-x-4">
                      {isInitialized === false && (
                          <div className="bg-error-container/20 px-6 py-4 border-b-2 border-error">
                            <p className="text-[10px] text-error uppercase tracking-tighter mb-2">Contract State Missing</p>
                            <button 
                                onClick={handleInitialize} 
                                disabled={loading}
                                className="bg-error text-on-error px-4 py-2 text-xs font-bold uppercase hover:opacity-80 transition-opacity">
                                {loading ? "..." : "Initialize Ledger PDA"}
                            </button>
                          </div>
                      )}
                      <div className="bg-surface-container px-6 py-4 border-b-2 border-outline-variant">
                          <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Connected Node</p>
                          <p className="font-headline text-xl font-bold tabular-nums text-primary">{wallet.publicKey?.toBase58().substring(0,6)}...</p>
                      </div>
                      <div className="bg-surface-container px-6 py-4 border-b-2 border-outline-variant">
                          <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Investors</p>
                          <p className="font-headline text-xl font-bold tabular-nums">{investorsData?.totalInvestors ?? '—'}</p>
                      </div>
                      <div className="bg-surface-container px-6 py-4 border-b-2 border-outline-variant">
                          <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Total Invested</p>
                          <p className="font-headline text-xl font-bold tabular-nums">{investorsData?.totalInvestedSol ?? '—'} SOL</p>
                      </div>
                  </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* ── Drone Feed ──────────────────────────────── */}
                <div className="lg:col-span-8 bg-surface-container-low overflow-hidden relative group">
                    <div className="absolute top-4 left-4 z-10 bg-slate-950/80 backdrop-blur px-3 py-1 flex items-center space-x-2 border border-outline-variant/20">
                        <span className="material-symbols-outlined text-xs text-primary" data-icon="videocam">videocam</span>
                        <span className="text-[10px] font-mono uppercase tracking-widest">Feed: Site_A_Drone_04</span>
                    </div>
                    <div className="absolute bottom-4 right-4 z-10 bg-slate-950/80 backdrop-blur p-4 space-y-2 border border-outline-variant/20">
                        <div className="flex justify-between items-center space-x-8">
                            <span className="text-[10px] text-slate-500">ALTITUDE</span>
                            <span className="text-xs font-mono">142.5M</span>
                        </div>
                        <div className="flex justify-between items-center space-x-8">
                            <span className="text-[10px] text-slate-500">PRECISION</span>
                            <span className="text-xs font-mono">99.8%</span>
                        </div>
                    </div>
                    <Image
                        className="w-full aspect-video object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                        src="/stage-1.png"
                        alt="Drone Feed"
                        width={1200}
                        height={675}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <path className="text-primary" d="M 0 10 L 100 10 M 0 90 L 100 90 M 10 0 L 10 100 M 90 0 L 90 100" stroke="currentColor" strokeWidth="0.1"></path>
                        <circle className="text-primary" cx="50" cy="50" fill="currentColor" r="2"></circle>
                    </svg>
                </div>

                {/* ── Verification Panel ─────────────────────── */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-surface-container-high p-8 flex-1 border-t-4 border-secondary">
                        <h3 className="font-headline text-lg font-bold mb-6 flex items-center">
                            <span className="material-symbols-outlined mr-2 text-secondary" data-icon="verified_user">verified_user</span>
                            VERIFICATION PROTOCOL
                        </h3>
                        <div className="space-y-6">
                            <div className="bg-surface-container p-4">
                                <span className="text-[10px] text-secondary uppercase font-bold tracking-widest block mb-2">Phase Identifier</span>
                                <p className="font-headline text-2xl font-bold tracking-tight">ЭТАП 2: ФУНДАМЕНТ</p>
                            </div>
                            <div className="space-y-4 pt-4">
                                <label className="flex items-start group cursor-pointer">
                                    <div className="relative flex items-center">
                                        <input className="peer h-6 w-6 border-2 border-outline bg-transparent text-primary focus:ring-0 rounded-none appearance-none checked:bg-primary" type="checkbox" />
                                        <span className="material-symbols-outlined absolute opacity-0 peer-checked:opacity-100 text-on-primary-fixed pointer-events-none text-xl" data-icon="check">check</span>
                                    </div>
                                    <span className="ml-4 text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Подтверждаю качество ГОСТ</span>
                                </label>
                                <label className="flex items-start group cursor-pointer">
                                    <div className="relative flex items-center">
                                        <input className="peer h-6 w-6 border-2 border-outline bg-transparent text-primary focus:ring-0 rounded-none appearance-none checked:bg-primary" type="checkbox" />
                                        <span className="material-symbols-outlined absolute opacity-0 peer-checked:opacity-100 text-on-primary-fixed pointer-events-none text-xl" data-icon="check">check</span>
                                    </div>
                                    <span className="ml-4 text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Check geometric alignment (LIDAR)</span>
                                </label>
                            </div>
                        </div>

                        {/* ── Action Buttons ─────────────────── */}
                        <div className="mt-12 space-y-4">
                            {STAGE_CONFIG.map((stage) => (
                              <button
                                key={stage.key}
                                onClick={() => handleConfirmStage(stage.key, stage.releaseSol)}
                                disabled={!wallet.connected || loading}
                                className={`w-full ${stage.color} py-5 px-4 font-headline font-black text-base tracking-tighter uppercase ${stage.hoverColor} disabled:opacity-50 transition-all ${stage.shadow} flex items-center justify-center border border-outline-variant/30`}
                              >
                                <span className="material-symbols-outlined mr-3" data-icon="lock_open">lock_open</span>
                                {loading && activeAction === stage.key
                                  ? "ПРОЦЕСС..."
                                  : `${stage.label} — ${stage.releaseSol} SOL`
                                }
                              </button>
                            ))}
                        </div>

                        {/* ── Last Result ─────────────────────── */}
                        {lastResult && (
                          <div className={`mt-6 p-4 border text-xs font-mono ${lastResult.success ? 'border-primary/30 bg-primary/5' : 'border-error/30 bg-error/5'}`}>
                            <p className={`font-bold mb-2 ${lastResult.success ? 'text-primary' : 'text-error'}`}>
                              {lastResult.success ? '✅ CONFIRMED' : '❌ FAILED'}
                            </p>
                            {lastResult.txSignature && (
                              <p className="text-slate-400 break-all">Tx: {lastResult.txSignature}</p>
                            )}
                            {lastResult.error && (
                              <p className="text-error break-all">{lastResult.error}</p>
                            )}
                          </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Investors Table ─────────────────────────────── */}
            {investorsData && investorsData.investors.length > 0 && (
              <div className="mt-8 bg-surface-container-low border border-outline-variant/20">
                <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between">
                  <h3 className="font-headline text-lg font-bold flex items-center">
                    <span className="material-symbols-outlined mr-2 text-primary" data-icon="groups">groups</span>
                    INVESTOR LEDGER
                  </h3>
                  <span className="text-xs font-mono text-slate-500">{investorsData.totalInvestors} records</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-outline-variant/20 text-[10px] uppercase tracking-widest text-slate-500">
                        <th className="text-left p-4">Wallet</th>
                        <th className="text-left p-4">Mint</th>
                        <th className="text-right p-4">Amount</th>
                        <th className="text-center p-4">Stage</th>
                        <th className="text-right p-4">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {investorsData.investors.map((inv, i) => (
                        <tr key={inv.mintAddress} className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors">
                          <td className="p-4 font-mono text-xs">{inv.wallet.substring(0, 8)}...{inv.wallet.slice(-4)}</td>
                          <td className="p-4 font-mono text-xs text-primary">{inv.mintAddress.substring(0, 8)}...</td>
                          <td className="p-4 text-right font-bold">{inv.amountSol} SOL</td>
                          <td className="p-4 text-center">
                            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                              {inv.stage}
                            </span>
                          </td>
                          <td className="p-4 text-right text-xs text-slate-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </div>
    </main>
  );
}
