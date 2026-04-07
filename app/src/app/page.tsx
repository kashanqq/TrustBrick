"use client";

import { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { getProgram, getBuildingProjectPda } from "@/utils/anchor";
import { AnchorProvider, BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import Footer from "@/components/Footer";
import { useLanguage } from "@/components/LanguageContext";
import { PROJECTS, ProjectConfig } from "@/lib/projects";

export default function Home() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { t } = useLanguage();

  const [projectStates, setProjectStates] = useState<Record<number, { invested: number, stage: number }>>({});
  const [loading, setLoading] = useState(true);
  const [investing, setInvesting] = useState<number | null>(null);
  const [amounts, setAmounts] = useState<Record<number, number>>({});

  const fetchProjectData = async () => {
    try {
      if (!wallet.publicKey || !wallet.signTransaction) return;
      const provider = new AnchorProvider(connection, wallet as any, {});
      const program = getProgram(provider);
      
      const newStates: Record<number, { invested: number, stage: number }> = {};
      for (const proj of PROJECTS) {
        try {
          const pda = getBuildingProjectPda(proj.id);
          const accountData = await program.account.buildingProject.fetch(pda);
          newStates[proj.id] = {
            invested: accountData.totalInvested.toNumber() / LAMPORTS_PER_SOL,
            stage: accountData.stage
          };
        } catch(e) {
          // Если контракт не инициирован для этого здания, ставим нули
          newStates[proj.id] = { invested: 0, stage: 0 };
        }
      }
      setProjectStates(newStates);
    } catch (err: any) {
      console.error("Failed to read contract:", err);
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

  const handleInvest = async (proj: ProjectConfig) => {
    if (!wallet.connected || !wallet.publicKey) return;
    try {
      setInvesting(proj.id);
      
      const customAmount = amounts[proj.id];
      const selectedAmount = customAmount !== undefined && !isNaN(customAmount) && customAmount > 0 ? customAmount : proj.mintPriceSol;

      const provider = new AnchorProvider(connection, wallet as any, { preflightCommitment: "confirmed" });
      const program = getProgram(provider);
      const investAmount = new BN(selectedAmount * LAMPORTS_PER_SOL);
      const tx = await program.methods
        .invest(new BN(proj.id), investAmount)
        .accounts({ investor: wallet.publicKey })
        .rpc();
      try {
        const res = await fetch("/api/mint-investor-nft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            investorWallet: wallet.publicKey.toBase58(),
            amountSol: selectedAmount,
            txSignature: tx,
            slug: proj.slug
          }),
        });
        const backendRes = await res.json();
        if(!backendRes.success) {
          alert("Бэкенд вернул ошибку при минте: " + (backendRes.error || JSON.stringify(backendRes)));
          console.error("Backend Error:", backendRes);
        } else {
          alert(`✅ Investment accepted. Share in ${proj.name} acquired!`);
        }
      } catch (backendErr) {
        console.error("Backend failed to issue NFT:", backendErr);
        alert("Критическая ошибка бэкенда: " + backendErr);
      }
      await fetchProjectData();
    } catch (err: any) {
      console.error("Investment error:", err);
      alert("Transaction error: " + err.message);
    } finally {
      setInvesting(null);
    }
  };

  return (
    <>
      {/* Hero Canvas */}
      <section className="pt-20 px-12 pb-24">
        <div className="grid grid-cols-12 gap-8 items-end">
          <div className="col-span-12 md:col-span-7">
            <h1 className="text-7xl font-headline font-light tracking-tighter text-on-surface mb-8 leading-[0.9]">
              Liquidate <br />
              <span className="text-accent font-medium italic">Concrete</span>
            </h1>
            <p className="font-body text-lg text-on-surface-variant max-w-md leading-relaxed border-l border-accent/30 pl-8 ml-2">
              Institutional-grade asset tokenization for the sovereign era. High-liquidity real
              estate pools backed by immutable settlement layers.
            </p>
          </div>
          <div className="col-span-12 md:col-span-5 bg-surface-container-low p-8 relative overflow-hidden spectral-outline">
            <div className="flex justify-between items-start mb-12">
              <div>
                <span className="block font-body text-[10px] uppercase tracking-[0.3em] text-on-surface-variant mb-2">
                  Network Volume
                </span>
                <span className="block font-headline text-4xl font-bold text-on-surface tracking-tighter">
                  $2.4B+
                </span>
              </div>
              <div className="flex space-x-1">
                <span className="w-1 h-3 bg-accent"></span>
                <span className="w-1 h-6 bg-accent"></span>
                <span className="w-1 h-4 bg-accent"></span>
              </div>
            </div>
            <div className="h-32 w-full flex items-end space-x-1 overflow-hidden opacity-40">
              <div className="flex-1 bg-surface-bright h-[20%]"></div>
              <div className="flex-1 bg-surface-bright h-[35%]"></div>
              <div className="flex-1 bg-surface-bright h-[25%]"></div>
              <div className="flex-1 bg-surface-bright h-[45%]"></div>
              <div className="flex-1 bg-accent h-[60%]"></div>
              <div className="flex-1 bg-surface-bright h-[40%]"></div>
              <div className="flex-1 bg-surface-bright h-[75%]"></div>
              <div className="flex-1 bg-surface-bright h-[55%]"></div>
              <div className="flex-1 bg-accent h-[90%]"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Assets Grid */}
      <section className="px-12 pb-24">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="font-headline text-xs font-bold uppercase tracking-[0.5em] text-accent mb-4">
              Live Assets
            </h2>
            <p className="text-[10px] text-on-surface-variant font-body uppercase tracking-widest">
              Active opportunities on-chain
            </p>
          </div>
          <div className="flex space-x-8 text-[10px] uppercase tracking-widest font-bold">
            <button className="text-on-surface border-b border-accent pb-1">All Sectors</button>
            <button className="text-on-surface-variant hover:text-on-surface pb-1">Logistics</button>
            <button className="text-on-surface-variant hover:text-on-surface pb-1">Residential</button>
            <button className="text-on-surface-variant hover:text-on-surface pb-1">Mixed Use</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {PROJECTS.map((proj) => {
            const dynamicState = projectStates[proj.id];
            
            return (
              <div key={proj.id} className="group border border-transparent hover:border-outline-variant/30 p-2 transition-all">
                <a href={`/project/${proj.slug}`} className="cursor-pointer block relative overflow-hidden aspect-[4/5] bg-surface-container mb-6">
                  <img
                    className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-700"
                    src={`/api/images/${proj.id}`}
                    alt={proj.name}
                  />
                  <div className="absolute top-0 right-0 p-4">
                    <span className="bg-primary text-on-primary text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                      Minting Live
                    </span>
                  </div>
                </a>
                <div className="flex justify-between items-start">
                  <a href={`/project/${proj.slug}`} className="block cursor-pointer">
                    <h3 className="font-headline text-xl font-bold tracking-tighter text-on-surface">
                      {proj.name}
                    </h3>
                    <p className="text-xs text-on-surface-variant uppercase tracking-widest font-medium mt-1">
                      {proj.location}
                    </p>
                  </a>
                  <div className="text-right">
                    <span className="block text-xl font-headline font-light text-on-surface">
                      {(dynamicState?.invested || 0).toFixed(1)} SOL
                    </span>
                    <span className="block text-[10px] text-accent uppercase tracking-tighter font-bold">
                      {proj.yieldInfo}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <div className="relative w-1/3">
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      className="w-full py-3 px-3 pl-8 bg-surface-container border justify-center border-outline-variant/20 text-xs font-bold text-on-surface focus:outline-none focus:border-primary transition-all"
                      placeholder="SOL"
                      value={amounts[proj.id] !== undefined ? amounts[proj.id] : proj.mintPriceSol}
                      onChange={(e) => setAmounts({...amounts, [proj.id]: parseFloat(e.target.value)})}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant bg-transparent min-h-0 py-0 border-none">◎</span>
                  </div>
                  <button
                    onClick={() => handleInvest(proj)}
                    disabled={investing === proj.id || !wallet.connected}
                    className="flex-1 py-3 bg-surface-container-high border justify-center border-outline-variant/20 hover:border-primary text-xs uppercase tracking-widest font-bold text-on-surface hover:text-primary transition-all flex items-center gap-2"
                  >
                    {investing === proj.id ? 'PROCCESSING...' : `INVEST`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Compliance Banner */}
      <section className="px-12 pb-32">
        <div className="grid grid-cols-12 gap-0 border-t border-on-surface-variant/10 pt-24">
          <div className="col-span-12 md:col-span-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">
              Protocol Status
            </span>
          </div>
          <div className="col-span-12 md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-12 mt-8 md:mt-0">
            <div>
              <h4 className="font-headline text-lg font-bold text-on-surface mb-4 uppercase">
                Asset Custody
              </h4>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                Multi-Sig Asset Custody &amp; Settlement. All underlying physical titles are vaulted
                via SEC-qualified custodians with institutional-grade hardware security modules.
              </p>
            </div>
            <div>
              <h4 className="font-headline text-lg font-bold text-on-surface mb-4 uppercase">
                Regulatory
              </h4>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                Global Regulatory Compliance. Fully automated KYC/AML/Sanction screening at the
                protocol level ensuring all secondary market transfers remain within legal
                frameworks.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
