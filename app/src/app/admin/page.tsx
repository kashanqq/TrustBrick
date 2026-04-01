"use client";

import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { getProgram, getBuildingProjectPda, PROJECT_ID } from "@/utils/anchor";
import { AnchorProvider, BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import Image from "next/image";
import ClientWalletButton from "@/components/ClientWalletButton";

const BUILDER_PUBKEY = new PublicKey("11111111111111111111111111111111");

export default function AdminPanel() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!wallet.connected) return;
    const checkInitialization = async () => {
      try {
        const provider = new AnchorProvider(connection, wallet as any, { preflightCommitment: "confirmed" });
        const program = getProgram(provider);
        const pda = getBuildingProjectPda();
        await program.account.buildingProject.fetch(pda);
        setIsInitialized(true);
      } catch (err: any) {
        if (err.message.includes("Account does not exist")) {
           setIsInitialized(false);
        }
      }
    };
    checkInitialization();
  }, [wallet.connected, connection]);

  const handleInitialize = async () => {
    if (!wallet.connected || !wallet.publicKey) return;
    try {
      setLoading(true);
      const provider = new AnchorProvider(connection, wallet as any, { preflightCommitment: "confirmed" });
      const program = getProgram(provider);
      
      const tx = await program.methods.initialize(new BN(PROJECT_ID), BUILDER_PUBKEY)
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
      
      const tx = await program.methods.releaseFunds(new BN(PROJECT_ID), releaseAmount)
        .accounts({
          admin: wallet.publicKey,
          builder: BUILDER_PUBKEY,
        })
        .rpc();

      alert(`✅ Транзакция успешна! Средства переведены Застройщику: ${tx}`);
      
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
    <main className="pt-20 min-h-screen bg-surface control-panel-grid relative">
        <div className="max-w-screen-2xl mx-auto p-8 lg:p-12 relative z-10">
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
                          <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Oracle Latency</p>
                          <p className="font-headline text-xl font-bold tabular-nums">14ms</p>
                      </div>
                  </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
                        <div className="mt-12 space-y-4">
                            <button
                                onClick={() => handleApproveStage("stage1-skeleton", 5)}
                                disabled={!wallet.connected || loading}
                                className="w-full bg-primary-container text-on-primary-container py-6 px-4 font-headline font-black text-lg tracking-tighter uppercase hover:bg-primary disabled:opacity-50 transition-all shadow-[0_10px_30px_-10px_rgba(194,65,12,0.5)] flex items-center justify-center">
                                <span className="material-symbols-outlined mr-3" data-icon="lock_open">lock_open</span>
                                {loading ? "ПРОЦЕСС..." : "АВТОРИЗОВАТЬ ТРАНШ 5 SOL"}
                            </button>
                            <button
                                onClick={() => handleApproveStage("stage2-finished", 10)}
                                disabled={!wallet.connected || loading}
                                className="w-full bg-surface-container text-on-surface py-3 px-4 font-headline font-bold text-sm tracking-tighter uppercase hover:bg-surface-variant disabled:opacity-50 transition-all flex items-center justify-center border border-outline-variant">
                                АВТОРИЗОВАТЬ ТРАНШ 10 SOL
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
  );
}
