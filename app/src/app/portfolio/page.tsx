"use client";

import Image from "next/image";
import Footer from "@/components/Footer";
import { useWallet } from "@solana/wallet-adapter-react";

export default function Portfolio() {
  const { connected } = useWallet();

  return (
    <>
      <main className="pt-28 pb-20 px-8 max-w-screen-2xl mx-auto flex flex-col gap-10 min-h-[calc(100vh-80px)]">
        <header className="flex justify-between items-end relative z-10">
          <div>
            <p className="font-headline text-secondary tracking-[0.2em] text-xs uppercase mb-2">Institutional Dashboard</p>
            <h1 className="font-headline text-4xl font-bold text-on-background tracking-tight">Portfolio Overview</h1>
          </div>
          <div className="flex gap-4">
            <div className="bg-surface-container-low p-4 min-w-[200px] border-l-2 border-primary">
              <p className="font-label text-[10px] text-secondary uppercase tracking-widest mb-1">Active Assets</p>
              <p className="font-headline text-2xl font-bold">{connected ? "1.0" : "0.0"} <span className="text-sm font-normal text-slate-500">TBRK</span></p>
            </div>
            <div className="bg-surface-container-low p-4 min-w-[200px] border-l-2 border-tertiary">
              <p className="font-label text-[10px] text-secondary uppercase tracking-widest mb-1">Portfolio Yield</p>
              <p className="font-headline text-2xl font-bold text-tertiary">{connected ? "+12.4%" : "0.0%"} <span className="material-symbols-outlined text-sm align-middle">trending_up</span></p>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative z-10">
          <div className="lg:col-span-8 group relative overflow-hidden bg-surface-container-low rounded-xl min-h-[500px] flex flex-col border border-outline-variant/20">
            <div className="absolute inset-0 z-0">
              <Image 
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                src="/stage-1.png"
                alt="Construction status"
                fill
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
            </div>
            <div className="relative z-10 p-8 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div className="bg-slate-950/80 backdrop-blur-md px-4 py-3 rounded-lg border-l-4 border-orange-500">
                  <h2 className="font-headline text-xl font-bold text-white mb-1">Hackathon Tower</h2>
                  <p className="text-xs text-slate-400 font-label tracking-wide">ASSET ID: NFT-HACK-TB</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="bg-orange-500 text-on-primary-fixed text-[10px] font-bold px-3 py-1 uppercase tracking-widest mb-2">Phase 02 / 03</span>
                  <div className="flex gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                    <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div className="glass-panel p-6 rounded-lg max-w-sm">
                  <p className="text-xs font-label text-orange-400 uppercase tracking-widest mb-2">Construction Status</p>
                  <p className="text-sm text-on-surface leading-relaxed mb-4">Structural integrity verified. Steel frame elevation currently at 45% completion. Oracle feed synchronized.</p>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div className="bg-orange-500 h-full w-[45%] shadow-[0_0_10px_rgba(249,115,22,0.8)]"></div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-all">View Blueprints</button>
                  <button className="bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    Live Feed
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-4 bg-surface-container border border-outline-variant/10 flex flex-col p-8 rounded-xl">
            <h3 className="font-headline text-lg font-bold mb-8 flex items-center gap-3 border-b border-outline-variant/20 pb-4">
              <span className="material-symbols-outlined text-orange-500">account_tree</span>
              CONSTRUCTION TIMELINE
            </h3>
            <div className="relative flex-grow">
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-800"></div>
              <div className="space-y-12 relative">
                <div className="flex gap-6 items-start opacity-60">
                  <div className="relative z-10 w-6 h-6 rounded-full bg-tertiary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-xs font-bold text-on-tertiary-container">done</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-on-surface">Сбор средств завершен</h4>
                    <p className="text-[11px] font-label text-slate-500 mt-1 uppercase tracking-tighter">Verified on Solana • Jan 12, 2026</p>
                  </div>
                </div>
                <div className="flex gap-6 items-start opacity-60">
                  <div className="relative z-10 w-6 h-6 rounded-full bg-tertiary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-xs font-bold text-on-tertiary-container">done</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-on-surface">Подготовка площадки</h4>
                    <p className="text-[11px] font-label text-slate-500 mt-1 uppercase tracking-tighter">Оракул подтвердил • Feb 28, 2026</p>
                  </div>
                </div>
                <div className="flex gap-6 items-start">
                  <div className="relative z-10 w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center ring-4 ring-orange-900/30">
                    <span className="material-symbols-outlined text-xs font-bold text-white">hourglass_empty</span>
                  </div>
                  <div className="bg-orange-950/20 p-4 -mt-3 rounded-lg border-l-2 border-orange-500 w-full">
                    <h4 className="font-bold text-sm text-orange-400">Возведение каркаса</h4>
                    <p className="text-[11px] font-label text-orange-200/60 mt-1 uppercase tracking-tighter">В процессе...</p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-1 bg-orange-900/40 flex-grow rounded-full overflow-hidden">
                        <div className="bg-orange-500 h-full w-[45%]"></div>
                      </div>
                      <span className="text-[10px] font-bold tabular-nums text-orange-400">45%</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-6 items-start opacity-30">
                  <div className="relative z-10 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center"></div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-400">Сдача объекта</h4>
                    <p className="text-[11px] font-label text-slate-600 mt-1 uppercase tracking-tighter">Estimated Q4 2026</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-800">
              <button className="w-full flex items-center justify-center gap-3 bg-surface-container-highest py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-slate-700 transition-colors">
                All Records <span className="material-symbols-outlined text-sm">open_in_new</span>
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
          <div className="md:col-span-3 bg-surface-container-low p-8 rounded-xl flex flex-col md:flex-row gap-12 items-center border border-outline-variant/10">
            <div className="flex-shrink-0 relative">
              <div className="w-32 h-32 rounded-full border-4 border-slate-800 flex items-center justify-center relative">
                <div className="absolute inset-0 border-4 border-orange-500 rounded-full" style={{ clipPath: "polygon(50% 50%, -50% -50%, 150% -50%)" }}></div>
                <div className="text-center">
                  <p className="font-headline text-xl font-bold tabular-nums text-white">72%</p>
                  <p className="text-[8px] font-label text-slate-500 uppercase tracking-widest">Utilized</p>
                </div>
              </div>
            </div>
            <div className="flex-grow grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
                <p className="font-label text-[10px] text-secondary uppercase tracking-widest mb-1">Total Invested</p>
                <p className="font-headline text-xl font-bold text-on-background tabular-nums">1.0 SOL</p>
              </div>
              <div>
                <p className="font-label text-[10px] text-secondary uppercase tracking-widest mb-1">Estimated ROI</p>
                <p className="font-headline text-xl font-bold text-tertiary tabular-nums">12.4% p.a.</p>
              </div>
              <div>
                <p className="font-label text-[10px] text-secondary uppercase tracking-widest mb-1">Dividends Paid</p>
                <p className="font-headline text-xl font-bold text-on-background tabular-nums">0 SOL</p>
              </div>
              <div>
                <p className="font-label text-[10px] text-secondary uppercase tracking-widest mb-1">Liquidity Status</p>
                <span className="inline-block px-2 py-1 bg-tertiary-container/20 text-tertiary text-[9px] font-bold uppercase tracking-widest rounded mt-1">High Liquid</span>
              </div>
            </div>
          </div>
          <button className="bg-gradient-to-br from-primary to-primary-container p-8 rounded-xl flex flex-col justify-between group hover:shadow-[0_20px_40px_-10px_rgba(194,65,12,0.3)] transition-all">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-on-primary-fixed text-4xl">add_chart</span>
              <span className="material-symbols-outlined text-on-primary-fixed opacity-40 group-hover:opacity-100 transition-opacity">arrow_forward_ios</span>
            </div>
            <div className="text-left">
              <p className="font-headline text-lg font-bold text-on-primary-fixed leading-tight">Increase Your<br />Ownership</p>
              <p className="text-[10px] text-on-primary-fixed opacity-70 mt-2 font-label uppercase tracking-widest">Limited Supply Remains</p>
            </div>
          </button>
        </section>

        <section className="bg-surface-container-lowest border border-orange-900/10 p-4 rounded-lg overflow-hidden flex items-center gap-8 relative z-10">
          <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] whitespace-nowrap">Asset Ticker:</span>
          <div className="flex gap-12 animate-marquee">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="font-headline text-xs font-medium text-slate-300">EMERALD_HEIGHTS</span>
              <span className="font-headline text-xs font-bold text-tertiary">+4.2%</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="font-headline text-xs font-medium text-slate-300">SOLANA_LOFTS_NYC</span>
              <span className="font-headline text-xs font-bold text-tertiary">+2.1%</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="font-headline text-xs font-medium text-slate-300">HARBOR_QUAY</span>
              <span className="font-headline text-xs font-bold text-error">-0.4%</span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
