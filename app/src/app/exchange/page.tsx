"use client";

import Image from "next/image";
import Footer from "@/components/Footer";

export default function Exchange() {
  return (
    <>
      <main className="pt-24 pb-12 px-6 max-w-screen-2xl mx-auto grid grid-cols-12 gap-6 min-h-[calc(100vh-80px)]">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 relative z-10">
            <div className="bg-surface-container-low rounded-xl overflow-hidden flex flex-col h-[500px]">
                <div className="px-6 py-4 flex justify-between items-center bg-surface-container/40">
                    <div className="flex items-center gap-4">
                        <div className="bg-surface-container-high p-2 rounded">
                            <span className="material-symbols-outlined text-primary">apartment</span>
                        </div>
                        <div>
                            <h1 className="font-headline text-lg font-bold uppercase tracking-tight">Hackathon Tower · Series A</h1>
                            <p className="text-xs text-secondary italic">Phase 3: Structural Core Completion</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 tabular-nums">
                        <div className="text-right">
                            <span className="block text-[10px] uppercase text-slate-500">Last Price</span>
                            <span className="text-primary font-bold">142.85 SOL</span>
                        </div>
                        <div className="text-right">
                            <span className="block text-[10px] uppercase text-slate-500">24h Progress</span>
                            <span className="text-tertiary-fixed-dim">+4.2%</span>
                        </div>
                    </div>
                </div>
                <div className="flex-1 relative p-8">
                    <div className="absolute inset-0 flex items-end px-8 pb-12">
                        <div className="w-full h-full bg-primary/5 staircase-path relative border-t-2 border-primary/40">
                            <div className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full shadow-[0_0_12px_rgba(255,181,157,0.8)]"></div>
                        </div>
                    </div>
                    <div className="absolute inset-0 grid grid-cols-6 pointer-events-none px-8 pb-12">
                        <div className="border-r border-outline-variant/10 h-full flex items-end justify-center pb-2">
                            <span className="text-[9px] uppercase tracking-tighter text-slate-600">Foundation</span>
                        </div>
                        <div className="border-r border-outline-variant/10 h-full flex items-end justify-center pb-2">
                            <span className="text-[9px] uppercase tracking-tighter text-slate-600">Excavation</span>
                        </div>
                        <div className="border-r border-outline-variant/10 h-full flex items-end justify-center pb-2">
                            <span className="text-[9px] uppercase tracking-tighter text-slate-600">Basement</span>
                        </div>
                        <div className="border-r border-outline-variant/10 h-full flex items-end justify-center pb-2">
                            <span className="text-[9px] uppercase tracking-tighter text-slate-400 font-bold">Structural</span>
                        </div>
                        <div className="border-r border-outline-variant/10 h-full flex items-end justify-center pb-2 opacity-30">
                            <span className="text-[9px] uppercase tracking-tighter text-slate-600">Cladding</span>
                        </div>
                        <div className="h-full flex items-end justify-center pb-2 opacity-30">
                            <span className="text-[9px] uppercase tracking-tighter text-slate-600">Interior</span>
                        </div>
                    </div>
                    <div className="absolute left-8 top-8 bottom-12 flex flex-col justify-between text-[10px] text-slate-600 tabular-nums">
                        <span>200.0</span>
                        <span>150.0</span>
                        <span>100.0</span>
                        <span>50.0</span>
                        <span>0.0</span>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                <div className="bg-surface-container-low p-8 rounded-xl flex flex-col gap-6">
                    <div className="flex gap-1">
                        <button className="flex-1 py-3 text-sm font-headline font-bold uppercase tracking-widest bg-primary-container text-on-primary-container rounded-sm">Buy</button>
                        <button className="flex-1 py-3 text-sm font-headline font-bold uppercase tracking-widest text-slate-500 hover:bg-surface-container-high transition-colors rounded-sm">Sell</button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-secondary mb-2">Order Type</label>
                            <div className="relative">
                                <select className="w-full bg-surface-container border-b border-outline-variant text-on-surface py-3 px-0 appearance-none focus:outline-none focus:border-secondary transition-colors cursor-pointer">
                                    <option>Market Order</option>
                                    <option>Limit Order</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">expand_more</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-secondary mb-2">Brick Quantity</label>
                                <input className="w-full bg-surface-container border-b border-outline-variant text-on-surface py-3 px-0 focus:outline-none focus:border-secondary transition-colors tabular-nums" type="number" defaultValue="1.0" />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-secondary mb-2">Estimated Price</label>
                                <div className="py-3 text-on-surface font-headline font-bold tabular-nums">142.85 SOL</div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-auto border-t border-outline-variant/10 pt-6">
                        <div className="flex justify-between text-xs mb-4">
                            <span className="text-slate-500">Transactional Fee (0.2%)</span>
                            <span className="text-on-surface tabular-nums">0.285 SOL</span>
                        </div>
                        <button className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed font-headline font-extrabold uppercase tracking-widest rounded-lg shadow-lg hover:brightness-110 active:scale-[0.98] transition-all">
                            Place Buy Order
                        </button>
                    </div>
                </div>

                <div className="bg-surface-container-low p-6 rounded-xl overflow-hidden flex flex-col">
                    <h3 className="font-headline text-[10px] uppercase tracking-[0.2em] text-secondary mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>
                        Asset Intelligence
                    </h3>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-16 h-16 rounded bg-surface-container-high flex-shrink-0 relative overflow-hidden">
                                <Image alt="Building core" fill className="w-full h-full object-cover" src="/stage-1.png" />
                            </div>
                            <div>
                                <span className="text-[10px] text-tertiary-fixed-dim bg-on-tertiary-fixed-variant/20 px-2 py-0.5 rounded">Verified Audit</span>
                                <p className="text-sm mt-1 text-on-surface-variant leading-relaxed">Structural integrity certificate issued by BrickGuard Labs. Current load capacity: 110% of planned.</p>
                            </div>
                        </div>
                        <div className="bg-surface-container p-4 rounded-sm border-l-2 border-secondary">
                            <span className="text-[9px] uppercase tracking-widest text-secondary">Phase Reward Milestone</span>
                            <p className="text-xs mt-1">Investors holding &gt;10 Bricks qualify for 'Golden Key' priority on Series B penthouse listings.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-surface-container-low rounded-xl flex flex-col overflow-hidden relative z-10">
            <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
                <h2 className="font-headline text-xs font-bold uppercase tracking-widest">Public Ledger</h2>
                <div className="flex gap-4">
                    <span className="text-[9px] uppercase text-slate-500 cursor-pointer hover:text-on-surface">Standard</span>
                    <span className="text-[9px] uppercase text-primary font-bold cursor-pointer">Spread</span>
                </div>
            </div>
            
            <div className="flex-1 flex flex-col min-h-0">
                <div className="bg-red-500/5 px-6 py-4 flex flex-col gap-1 overflow-y-auto h-1/2 scrollbar-hide">
                    <div className="flex justify-between text-[9px] uppercase tracking-widest text-slate-600 mb-2 font-bold">
                        <span>Price (SOL)</span>
                        <span>Quantity</span>
                        <span>Total</span>
                    </div>
                    <div className="flex justify-between text-xs tabular-nums text-on-error py-1 hover:bg-white/5 transition-colors group">
                        <span className="font-bold">143.15</span><span className="text-slate-400">12.4</span><span className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">1,775</span>
                    </div>
                    <div className="flex justify-between text-xs tabular-nums text-on-error py-1 hover:bg-white/5 transition-colors group">
                        <span className="font-bold">143.08</span><span className="text-slate-400">0.5</span><span className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">71</span>
                    </div>
                    <div className="flex justify-between text-xs tabular-nums text-on-error py-1 hover:bg-white/5 transition-colors group">
                        <span className="font-bold">142.99</span><span className="text-slate-400">45.0</span><span className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">6,434</span>
                    </div>
                    <div className="flex justify-between text-xs tabular-nums text-on-error py-1 hover:bg-white/5 transition-colors group opacity-80">
                        <span className="font-bold">142.92</span><span className="text-slate-400">8.2</span><span className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">1,171</span>
                    </div>
                    <div className="flex justify-between text-xs tabular-nums text-on-error py-1 hover:bg-white/5 transition-colors group opacity-60">
                        <span className="font-bold">142.88</span><span className="text-slate-400">2.1</span><span className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">300</span>
                    </div>
                </div>

                <div className="py-4 px-6 bg-surface-container-high/40 flex items-center justify-center border-y border-outline-variant/10">
                    <div className="flex items-center gap-3">
                        <span className="text-xl font-headline font-extrabold text-on-surface tabular-nums">142.85</span>
                        <span className="material-symbols-outlined text-primary text-sm">trending_up</span>
                        <span className="text-[10px] uppercase font-bold text-slate-500">Market Price</span>
                    </div>
                </div>

                <div className="bg-green-500/5 px-6 py-4 flex flex-col gap-1 overflow-y-auto h-1/2 scrollbar-hide">
                    <div className="flex justify-between text-xs tabular-nums text-tertiary-fixed-dim py-1 hover:bg-white/5 transition-colors group opacity-60">
                        <span className="font-bold">142.82</span><span className="text-slate-400">1.8</span><span className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">257</span>
                    </div>
                    <div className="flex justify-between text-xs tabular-nums text-tertiary-fixed-dim py-1 hover:bg-white/5 transition-colors group opacity-80">
                        <span className="font-bold">142.75</span><span className="text-slate-400">15.0</span><span className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">2,141</span>
                    </div>
                    <div className="flex justify-between text-xs tabular-nums text-tertiary-fixed-dim py-1 hover:bg-white/5 transition-colors group">
                        <span className="font-bold">142.70</span><span className="text-slate-400">102.5</span><span className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">14,626</span>
                    </div>
                    <div className="flex justify-between text-xs tabular-nums text-tertiary-fixed-dim py-1 hover:bg-white/5 transition-colors group">
                        <span className="font-bold">142.66</span><span className="text-slate-400">4.4</span><span className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">627</span>
                    </div>
                    <div className="flex justify-between text-xs tabular-nums text-tertiary-fixed-dim py-1 hover:bg-white/5 transition-colors group">
                        <span className="font-bold">142.50</span><span className="text-slate-400">22.9</span><span className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">3,263</span>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-surface-container-highest/20 mt-auto">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] uppercase tracking-widest text-slate-500">Live P2P Activity</span>
                    <div className="w-1.5 h-1.5 bg-primary animate-pulse rounded-full"></div>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between text-[10px]">
                        <span className="text-on-surface">3.2 BRK Filled</span>
                        <span className="text-slate-600 font-label">2s ago</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                        <span className="text-on-surface">New Ask: 144.10 SOL</span>
                        <span className="text-slate-600 font-label">5s ago</span>
                    </div>
                </div>
            </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
