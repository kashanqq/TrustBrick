"use client";

import { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { getProgram, getBuildingProjectPda, PROJECT_ID } from "@/utils/anchor";
import { AnchorProvider, BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import Footer from "@/components/Footer";
import { useLanguage } from "@/components/LanguageContext";

const GOAL_SOL = 50;

export default function Home() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { t } = useLanguage();

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
    } catch (err: any) {
      if (err.message.includes("Account does not exist")) {
        console.log("Contract not initialized yet");
      } else {
        console.error("Failed to read contract:", err);
      }
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
      const investAmount = new BN(1 * LAMPORTS_PER_SOL);
      const tx = await program.methods
        .invest(new BN(PROJECT_ID), investAmount)
        .accounts({ investor: wallet.publicKey })
        .rpc();
      try {
        await fetch("/api/mint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            investor: wallet.publicKey.toBase58(),
            amount: 1,
            txSignature: tx,
          }),
        });
        alert("✅ Investment accepted. Share acquired!");
      } catch (backendErr) {
        console.error("Backend failed to issue NFT:", backendErr);
      }
      await fetchProjectData();
    } catch (err: any) {
      console.error("Investment error:", err);
      alert("Transaction error: " + err.message);
    } finally {
      setInvesting(false);
    }
  };

  const progressPercent = Math.min((totalInvested / GOAL_SOL) * 100, 100);

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
          {/* Card 1: Elysian Tower */}
          <div className="group cursor-pointer">
            <div className="relative overflow-hidden aspect-[4/5] bg-surface-container mb-6">
              <img
                className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC17S9hOE0DWk7ymSuzqfgieEVI2TPQT6kAuCkxluNPxY1NCIZqK8xp99QYwDcGdQmgIHiiSRNpRx8CjaqGZO-gTgfdjfm_4D10frAKQxfWhLSaqeqZCEw8CFZRFdczwOD1tMxXjcJQxxs1J9Q-9wjr8so0JP_ecyPQS7_9hmA1BTrJDm-9xxZ4KXDOqzI5DfIEIELI2_m2vhO-KRdt1WUIf7V8YMJWRhvFleCWEM8Szn39HMJRvm7S1U1ZU6-JQzecbzPS6u7aNZzj"
                alt="Elysian Tower"
              />
              <div className="absolute top-0 right-0 p-4">
                <span className="bg-primary text-on-primary text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                  Minting Live
                </span>
              </div>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-headline text-2xl font-bold tracking-tighter text-on-surface">
                  Elysian Tower
                </h3>
                <p className="text-xs text-on-surface-variant uppercase tracking-widest font-medium mt-1">
                  Prime Midtown District
                </p>
              </div>
              <div className="text-right">
                <span className="block text-xl font-headline font-light text-on-surface">$124.5M</span>
                <span className="block text-[10px] text-accent uppercase tracking-tighter font-bold">
                  8.4% Target Yield
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Vertex Logistics */}
          <div className="group cursor-pointer">
            <div className="relative overflow-hidden aspect-[4/5] bg-surface-container mb-6">
              <img
                className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAD1eYxPy0mgxvFvW9aV2NLQeyaeSzVA3GNxPGk7-s_OyHuIY54b_cvXPEKZ4ROyGcloti5tTfrAtRBgLf4LLhWEIX1DjMFbnDo8gnWNqTQFV7yFarjQwi8Ru_RO13DG9JbuJHXJAWf7WNwhVyvu_tW1zmndEIaSe2dGVhDKak3mIsRFOEGPoGnss5qqgTZmNuISFlS-ce7dzLNUffptqidoTP4Iaj7JHBtEZ6yM3R0wRRM2Dyjxd67AK_8poDCcYyfu8nyFZS71E_L"
                alt="Vertex Logistics"
              />
              <div className="absolute top-0 right-0 p-4">
                <span className="bg-surface-container-high text-on-surface-variant text-[10px] font-bold uppercase tracking-widest px-3 py-1 spectral-outline">
                  Sold Out
                </span>
              </div>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-headline text-2xl font-bold tracking-tighter text-on-surface">
                  Vertex Logistics
                </h3>
                <p className="text-xs text-on-surface-variant uppercase tracking-widest font-medium mt-1">
                  Global Trade Corridor
                </p>
              </div>
              <div className="text-right">
                <span className="block text-xl font-headline font-light text-on-surface">$89.2M</span>
                <span className="block text-[10px] text-on-surface-variant uppercase tracking-tighter font-bold">
                  Historical 7.2%
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Atrium Plaza */}
          <div className="group cursor-pointer">
            <div className="relative overflow-hidden aspect-[4/5] bg-surface-container mb-6">
              <img
                className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8dhyW0mXM41Gavbw1-FEbARJsV6z4ludx-CBAV7CiOtSjcmMQvUmwX-IMhZjUtWWGrhmJr__-lo7a5W2h0n-c-7vczOXkXlQCgnGpgHBfGIzHZJOgOu7sg-ci39EuPHe_G5rewSNLsgdzWYVOAQ_u2bc4cLGvg95S9VowAahw9euqdOf7-D4k_l6Nura4ZeL9-8LJWFHOqZ5eQ6BV_Vze5U8XGzYonEYhK42z87q5gSXMlQcEd13VYXx2VglvuRyLvY-f_o-cw9d-"
                alt="Atrium Plaza"
              />
              <div className="absolute top-0 right-0 p-4">
                <span className="bg-surface-container-low text-accent text-[10px] font-bold uppercase tracking-widest px-3 py-1 spectral-outline">
                  Upcoming
                </span>
              </div>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-headline text-2xl font-bold tracking-tighter text-on-surface">
                  Atrium Plaza
                </h3>
                <p className="text-xs text-on-surface-variant uppercase tracking-widest font-medium mt-1">
                  Tech Hub Cluster
                </p>
              </div>
              <div className="text-right">
                <span className="block text-xl font-headline font-light text-on-surface">$210.0M</span>
                <span className="block text-[10px] text-accent uppercase tracking-tighter font-bold">
                  Registration Open
                </span>
              </div>
            </div>
          </div>
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
