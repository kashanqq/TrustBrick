"use client";

import { useEffect, useState, use } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { AnchorProvider } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getProgram, getBuildingProjectPda } from "@/utils/anchor";
import { PROJECTS } from "@/lib/projects";
import { STAGES, STAGE_ORDER } from "@/lib/constants";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const project = PROJECTS.find((p) => p.slug === slug);

  const { connection } = useConnection();
  const wallet = useWallet();

  const [loading, setLoading] = useState(true);
  const [stageIndex, setStageIndex] = useState(0);
  const [invested, setInvested] = useState(0);

  useEffect(() => {
    if (!project) return;
    
    const fetchState = async () => {
      try {
        const dummyWallet = {
          publicKey: wallet.publicKey || undefined,
          signTransaction: async () => { throw new Error("Read only") },
          signAllTransactions: async () => { throw new Error("Read only") }
        };
        const provider = new AnchorProvider(connection, dummyWallet as any, {});
        const program = getProgram(provider);
        const pda = getBuildingProjectPda(project.id);
        const accountData = await program.account.buildingProject.fetch(pda);
        
        setStageIndex(accountData.stage || 0);
        setInvested(accountData.totalInvested.toNumber() / LAMPORTS_PER_SOL);
      } catch (err) {
        setStageIndex(0);
      } finally {
        setLoading(false);
      }
    };

    fetchState();
  }, [slug, connection, wallet.publicKey]);

  if (!project) {
    return <div className="p-24 text-center">Project not found.</div>;
  }

  // Find stage details
  const stageEntry = Object.entries(STAGES).find(([, cfg]) => cfg.stageIndex === stageIndex);
  const currentStageConfig = stageEntry ? stageEntry[1] : STAGES.foundation;

  const progressPercent = Math.min(100, Math.round((invested / project.totalGoal) * 100));

  // Simulated price history since token issuance
  const basePrice = 100;
  // Increase price purely for visual effect based on progress/stage
  const currentPrice = basePrice + (stageIndex * 15) + (progressPercent * 0.1);

  return (
    <div className="min-h-screen flex flex-col pt-12">
      <div className="flex-1 grid grid-cols-12">
        {/* Left Col - Image */}
        <div className="col-span-12 lg:col-span-6 relative bg-surface-container h-[50vh] lg:h-auto border-r border-outline-variant/10">
          <Link href="/" className="absolute top-8 left-8 z-10 flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors bg-surface/80 px-4 py-2 backdrop-blur-md">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span className="text-xs uppercase tracking-widest font-bold">Back to Market</span>
          </Link>
          
          <img 
            src={`/api/images/${project.id}`} 
            alt={project.name} 
            className="w-full h-full object-cover transition-opacity duration-1000 opacity-90"
          />
          
          <div className="absolute bottom-8 left-8 px-4 py-2 bg-primary/90 text-on-primary text-[10px] font-bold uppercase tracking-widest">
            {currentStageConfig.name}
          </div>
        </div>

        {/* Right Col - Info */}
        <div className="col-span-12 lg:col-span-6 pl-0 lg:pl-16 pr-8 lg:pr-24 py-16 flex flex-col justify-center">
          <div className="font-body text-[10px] uppercase tracking-[0.3em] text-accent mb-4">
            {project.location} • {project.series}
          </div>
          
          <h1 className="font-headline text-5xl lg:text-7xl font-bold tracking-tighter leading-none mb-6">
            {project.name}
          </h1>

          <div className="grid grid-cols-2 gap-8 mb-12 border-y border-outline-variant/10 py-8">
            <div>
              <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Target Yield</div>
              <div className="font-headline text-3xl font-light text-primary">{project.yieldInfo}</div>
            </div>
            <div>
              <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Current Coin Price</div>
              <div className="font-headline text-3xl font-light">${currentPrice.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Total Raised</div>
              <div className="font-headline text-3xl font-light">{invested.toFixed(1)} <span className="text-sm">SOL</span></div>
            </div>
            <div>
              <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Goal</div>
              <div className="font-headline text-3xl font-light">{project.totalGoal} <span className="text-sm">SOL</span></div>
            </div>
          </div>

          <div className="mb-12">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold uppercase tracking-widest">Funding Progress</span>
              <span className="text-primary font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-surface-container-high h-2 overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-1000 ease-out" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
          </div>

          {/* Construction Timeline */}
          <div>
            <h3 className="font-headline text-lg font-bold uppercase tracking-widest mb-6">Construction Timeline</h3>
            <div className="space-y-6">
              {STAGE_ORDER.map((stageKey, idx) => {
                const cfg = STAGES[stageKey];
                const isCompleted = idx <= stageIndex;
                const isCurrent = idx === stageIndex;
                
                return (
                  <div key={stageKey} className={`flex gap-6 ${isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${isCurrent ? 'bg-primary shadow-[0_0_10px_var(--color-primary)]' : isCompleted ? 'bg-on-surface-variant' : 'bg-outline-variant/30'}`} />
                      {idx !== STAGE_ORDER.length - 1 && (
                        <div className={`w-px h-full mt-2 ${isCompleted ? 'bg-on-surface-variant' : 'bg-outline-variant/30'}`} />
                      )}
                    </div>
                    <div className="pb-4">
                      <div className="font-bold text-sm tracking-wide">{cfg.name}</div>
                      <div className="text-xs text-on-surface-variant mt-1">{cfg.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
