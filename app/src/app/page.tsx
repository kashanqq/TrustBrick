"use client";

import { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { getProgram, getBuildingProjectPda, PROJECT_ID } from "@/utils/anchor";
import { AnchorProvider, BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import Image from "next/image";
import Footer from "@/components/Footer";

const GOAL_SOL = 50; 

export default function Home() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [totalInvested, setTotalInvested] = useState(0);
  const [stage, setStage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [investing, setInvesting] = useState(false);

  const fetchProjectData = async () => {
    try {
      if (!wallet.publicKey || !wallet.signTransaction) return;
      const provider = new AnchorProvider(connection, wallet as any, {});
      const program = getProgram(provider);
      const pda = getBuildingProjectPda();

      const accountData = await program.account.buildingProject.fetch(pda);
      const investedSol = accountData.totalInvested.toNumber() / LAMPORTS_PER_SOL;
      setTotalInvested(investedSol);
      setStage(accountData.stage);
    } catch (err) {
      console.error("Не удалось прочитать контракт:", err);
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

      const investAmount = new BN(1 * LAMPORTS_PER_SOL); 
      
      const tx = await program.methods.invest(new BN(PROJECT_ID), investAmount)
        .accounts({ investor: wallet.publicKey })
        .rpc();

      try {
        await fetch("/api/mint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            investor: wallet.publicKey.toBase58(),
            amount: 1, 
            txSignature: tx
          })
        });
        alert("✅ Инвестиция принята. Доля приобретена!");
      } catch (backendErr) {
        console.error("Бэкенд не смог выдать NFT:", backendErr);
      }

      await fetchProjectData();

    } catch (err: any) {
      console.error("Ошибка при инвестировании:", err);
      alert("Ошибка транзакции: " + err.message);
    } finally {
      setInvesting(false);
    }
  };

  const progressPercent = Math.min((totalInvested / GOAL_SOL) * 100, 100);

  const getImageSource = () => {
    if (stage === 0) return "/stage-0.png";
    if (stage === 1) return "/stage-1.png";
    return "/stage-2.png";
  };

  const statusText = stage === 0 ? "MINTING" : stage === 1 ? "STAGE 1" : "COMPLETED";

  return (
    <>
      <main className="relative pt-20 overflow-hidden min-h-screen">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] hero-gradient pointer-events-none"></div>
          
          <div className="w-full bg-surface-container-lowest py-3 overflow-hidden whitespace-nowrap border-y border-outline-variant/10 relative z-10">
              <div className="inline-flex gap-12 items-center animate-marquee">
                  <div className="flex items-center gap-3">
                      <span className="text-secondary font-headline text-xs uppercase tracking-widest">HACKATHON TOWER</span>
                      <span className="text-tertiary text-tabular font-bold">+12.4% APY</span>
                  </div>
                  <div className="flex items-center gap-3">
                      <span className="text-secondary font-headline text-xs uppercase tracking-widest">SOLANA LOGISTICS HUB</span>
                      <span className="text-tertiary text-tabular font-bold">+18.2% APY</span>
                  </div>
              </div>
          </div>

          <section className="max-w-7xl mx-auto px-8 pt-24 pb-12 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                  <div className="lg:col-span-5 space-y-8">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-high rounded-sm">
                          <div className={"w-2 h-2 rounded-full " + (wallet.connected ? "bg-primary animate-pulse" : "bg-red-500")}></div>
                          <span className="text-[10px] uppercase tracking-[0.2em] text-primary">Live Marketplace</span>
                      </div>
                      <h1 className="font-headline text-6xl lg:text-7xl font-bold tracking-tighter leading-[0.9] text-on-background">
                          Сделай бетон <span className="text-primary italic">ликвидным.</span>
                      </h1>
                      <p className="text-xl text-slate-400 max-w-md leading-relaxed font-light">
                          Инвестируйте в элитную коммерческую недвижимость от <span className="text-slate-100 font-bold">1 SOL</span> через прозрачные смарт-контракты Solana.
                      </p>
                      <div className="flex items-center gap-6 pt-4">
                          <button
                              onClick={handleInvest}
                              disabled={!wallet.connected || loading || investing}
                              className="bg-gradient-to-br from-primary to-primary-container text-on-primary-fixed px-8 py-4 rounded-md font-bold text-lg hover:shadow-[0_0_30px_rgba(194,65,12,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                              {investing ? "Оформляем..." : "Инвестировать 1 SOL"} 
                          </button>
                      </div>
                  </div>

                  <div className="lg:col-span-7 relative group">
                      <div className="absolute -inset-4 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative glass-panel rounded-xl overflow-hidden shadow-2xl border border-white/5">
                          <div className="aspect-[16/10] relative">
                              <Image 
                                src={getImageSource()} 
                                alt="Хакатон Тауэр" 
                                fill 
                                className="w-full h-full object-cover" 
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
                              <div className="absolute top-6 left-6 flex gap-2">
                                  <span className="px-3 py-1 bg-surface-container-lowest/80 backdrop-blur-md rounded-sm text-[10px] font-bold uppercase tracking-widest text-primary">Class A+ Office</span>
                                  <span className="px-3 py-1 bg-surface-container-lowest/80 backdrop-blur-md rounded-sm text-[10px] font-bold uppercase tracking-widest text-secondary">Verified</span>
                              </div>
                              <div className="absolute bottom-6 left-8 right-8">
                                  <h3 className="font-headline text-4xl font-bold tracking-tighter text-slate-50 mb-1">Hackathon Tower</h3>
                                  <p className="text-slate-300 font-light text-sm flex items-center gap-2">
                                      <span className="material-symbols-outlined text-sm">location_on</span>
                                      Solana City, Devnet District
                                  </p>
                              </div>
                          </div>
                          <div className="p-8 space-y-8 bg-surface-container-low/40">
                              <div className="grid grid-cols-3 gap-8">
                                  <div className="space-y-1">
                                      <span className="text-[10px] uppercase tracking-widest text-slate-500">Target APY</span>
                                      <div className="text-2xl font-headline font-bold text-primary tracking-tight">12.4%</div>
                                  </div>
                                  <div className="space-y-1">
                                      <span className="text-[10px] uppercase tracking-widest text-slate-500">Price / Share</span>
                                      <div className="text-2xl font-headline font-bold text-slate-100 tracking-tight text-tabular">1 SOL</div>
                                  </div>
                                  <div className="space-y-1">
                                      <span className="text-[10px] uppercase tracking-widest text-slate-500">Status</span>
                                      <div className="text-2xl font-headline font-bold text-secondary tracking-tight">{statusText}</div>
                                  </div>
                              </div>
                              <div className="space-y-3">
                                  <div className="flex justify-between text-sm">
                                      <span className="text-slate-400">Собрано <span className="text-slate-100 font-bold">{totalInvested} SOL</span></span>
                                      <span className="text-slate-400">Цель <span className="text-slate-100 font-bold">{GOAL_SOL} SOL</span></span>
                                  </div>
                                  <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                                      <div className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full shadow-[0_0_15px_rgba(194,65,12,0.4)] transition-all duration-1000" style={{width: `${progressPercent}%`}}></div>
                                  </div>
                                  <div className="flex justify-between text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                                      <span>{progressPercent.toFixed(1)}% Funding reached</span>
                                      <span>Hackathon Final</span>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </section>

          <section className="max-w-7xl mx-auto px-8 py-24 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              <div className="p-8 bg-surface-container-low/30 rounded-xl space-y-4 ghost-border hover:bg-surface-container-low/50 transition-colors">
                  <span className="material-symbols-outlined text-primary text-4xl">account_balance</span>
                  <h4 className="font-headline text-xl font-bold uppercase tracking-tight text-slate-100">Institutional Access</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">Early-stage commercial opportunities previously reserved for family offices and institutional funds.</p>
              </div>
              <div className="p-8 bg-surface-container-low/30 rounded-xl space-y-4 ghost-border hover:bg-surface-container-low/50 transition-colors">
                  <span className="material-symbols-outlined text-primary text-4xl">security</span>
                  <h4 className="font-headline text-xl font-bold uppercase tracking-tight text-slate-100">Fractional Ledger</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">Ownership is recorded on-chain, providing instant settlement and immutable proof of equity shares.</p>
              </div>
              <div className="p-8 bg-surface-container-low/30 rounded-xl space-y-4 ghost-border hover:bg-surface-container-low/50 transition-colors">
                  <span className="material-symbols-outlined text-primary text-4xl">monitoring</span>
                  <h4 className="font-headline text-xl font-bold uppercase tracking-tight text-slate-100">Secondary Market</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">Exit your position anytime via our automated liquidity pool, turning rigid concrete into liquid capital.</p>
              </div>
          </section>
      </main>
      <Footer />
    </>
  );
}
