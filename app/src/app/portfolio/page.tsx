"use client";

import Image from "next/image";
import Footer from "@/components/Footer";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageContext";

const MOCK_HOLDINGS = [
  {
    id: "hackathon",
    name: "Hackathon Tower",
    ticker: "NFT-HACK-TB",
    avgBuy: 140.50,
    currentPrice: 142.85,
    quantity: 1.0, 
    image: "/stage-1.png",
  },
  {
    id: "dubai",
    name: "Dubai Marina Loft",
    ticker: "UAE-8812",
    avgBuy: 200.00,
    currentPrice: 245.00,
    quantity: 3.5,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA8-Ow4CT9O_b08CJzLH74d60idNlxIoBH7UzkjQS-vx7xqBbcH45NyTKJTKCpJpHIZes0MLfvZFr9Zd4IXP7OHljfP7mh511HMDph6zc4CbnD_Z3VhDc6SmGMyMVlOwGpoK4s42k6a4eEfi9HA3xeQIJEL5QUH7AI38EhLBNqwp-h8Kmp2-h-Vgn0YGz7D5Z3t6QI3qppS98eKFbvkV00_IIdJf_jsUGlWcjXofSU8wP18zEaHBdACT3UHNPaj_01ZGBVWLRfsXuI",
  },
  {
    id: "london",
    name: "London Fin-Center",
    ticker: "UK-0019",
    avgBuy: 430.00,
    currentPrice: 412.80,
    quantity: 0.8,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDu5WjZc2WvbANMGyfH2zyZszN6UzoArtH9m9sZgPqH0nrvyFTkRUeGZWeMvD9FuAWQFjuFyUtInMKmtK6dWDifTmgkde0HQWVJMO-nw3G-pqJH-wekySt4EiiVEHcaZIaYnrx-XBoe5IVzgmYmLJNsKmaqgan1gm5qjy8YXSOte2ovQsXpA1MGpe3YZdOpRFFRCqSKgjgQg0dU8z6ejNqd_225nUxGiPsS83toSJyBLb2o44DO1vmoMhjdd5hUvUlvNqftDvFgIQA",
  }
];

export default function Portfolio() {
  const { connected } = useWallet();
  const { t } = useLanguage();
  
  const [holdings, setHoldings] = useState(MOCK_HOLDINGS);

  useEffect(() => {
     if (!connected) {
         setHoldings(MOCK_HOLDINGS.map(h => ({...h, quantity: 0})));
     } else {
         setHoldings(MOCK_HOLDINGS);
     }
  }, [connected]);

  const totalValue = holdings.reduce((sum, h) => sum + (h.quantity * h.currentPrice), 0);
  const totalCost = holdings.reduce((sum, h) => sum + (h.quantity * h.avgBuy), 0);
  const totalPnl = totalValue - totalCost;
  const pnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  return (
    <>
      <main className="pt-28 pb-20 px-6 max-w-screen-2xl mx-auto flex flex-col gap-10 min-h-[calc(100vh-80px)]">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end relative z-10 gap-6">
          <div>
            <p className="font-headline text-secondary tracking-[0.2em] text-xs uppercase mb-2">Institutional Dashboard</p>
            <h1 className="font-headline text-4xl font-bold text-on-background tracking-tight">Portfolio Manager</h1>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="bg-surface-container-low p-4 min-w-[180px] border-l-2 border-primary rounded-r">
              <p className="font-label text-[10px] text-secondary uppercase tracking-widest mb-1">Total Network Value</p>
              <p className="font-headline text-2xl font-bold tabular-nums">{totalValue.toFixed(2)} <span className="text-sm font-normal text-slate-500">SOL</span></p>
            </div>
            <div className="bg-surface-container-low p-4 min-w-[180px] border-l-2 border-tertiary rounded-r">
              <p className="font-label text-[10px] text-secondary uppercase tracking-widest mb-1">Unrealized PNL</p>
              <div className="flex items-center gap-2">
                 <p className={`font-headline text-2xl font-bold tabular-nums ${totalPnl > 0 ? 'text-tertiary-fixed-dim' : totalPnl < 0 ? 'text-error' : 'text-slate-100'}`}>
                    {totalPnl > 0 ? '+' : ''}{totalPnl.toFixed(2)} SOL
                 </p>
                 <span className={`text-xs px-2 py-0.5 rounded font-bold ${totalPnl > 0 ? 'bg-tertiary/20 text-tertiary' : totalPnl < 0 ? 'bg-error/20 text-error' : 'bg-slate-800 text-slate-400'}`}>
                    {totalPnl > 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                 </span>
              </div>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">
          <div className="lg:col-span-3 bg-surface-container-low border border-outline-variant/10 rounded-xl flex flex-col overflow-hidden">
             <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-lowest/50">
                <h2 className="font-headline text-sm font-bold uppercase tracking-widest text-slate-100">Asset Composition (Bricks)</h2>
                <div className="flex gap-4">
                    <button className="material-symbols-outlined text-slate-500 cursor-pointer hover:text-white transition-colors">download</button>
                    <button className="material-symbols-outlined text-slate-500 cursor-pointer hover:text-white transition-colors">filter_list</button>
                </div>
             </div>
             <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse min-w-[800px]">
                     <thead>
                         <tr className="text-[10px] uppercase tracking-widest text-slate-500 bg-surface-container/30">
                             <th className="py-4 px-6 font-normal">Property Focus</th>
                             <th className="py-4 px-6 font-normal text-right">Avg Buy Price</th>
                             <th className="py-4 px-6 font-normal text-right">Current Price</th>
                             <th className="py-4 px-6 font-normal text-right">Qty (Bricks)</th>
                             <th className="py-4 px-6 font-normal text-right">Est. Value (SOL)</th>
                             <th className="py-4 px-6 font-normal text-right">Unrealized PNL</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                         {holdings.map(h => {
                             const value = h.quantity * h.currentPrice;
                             const cost = h.quantity * h.avgBuy;
                             const pnl = value - cost;
                             const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
                             
                             return (
                                 <tr key={h.id} className="hover:bg-surface-container-high/40 transition-colors group">
                                     <td className="py-4 px-6">
                                         <div className="flex items-center gap-4">
                                             <div className="w-10 h-10 rounded overflow-hidden bg-slate-800 flex-shrink-0">
                                                 <Image alt={h.name} src={h.image} width={40} height={40} className="w-full h-full object-cover" />
                                             </div>
                                             <div>
                                                 <div className="font-bold text-slate-100">{h.name}</div>
                                                 <div className="text-[10px] text-slate-500">{h.ticker}</div>
                                             </div>
                                         </div>
                                     </td>
                                     <td className="py-4 px-6 tabular-nums text-right font-medium text-slate-300">
                                         {h.avgBuy.toFixed(2)}
                                     </td>
                                     <td className="py-4 px-6 tabular-nums text-right font-medium text-slate-100">
                                         {h.currentPrice.toFixed(2)}
                                     </td>
                                     <td className="py-4 px-6 tabular-nums text-right font-bold text-primary">
                                         {h.quantity.toFixed(2)}
                                     </td>
                                     <td className="py-4 px-6 tabular-nums text-right font-bold text-slate-100">
                                         {value.toFixed(2)}
                                     </td>
                                     <td className="py-4 px-6 tabular-nums text-right">
                                         <div className={`font-bold ${pnl > 0 ? 'text-tertiary-fixed-dim' : pnl < 0 ? 'text-error' : 'text-slate-500'}`}>
                                             {pnl > 0 ? '+' : ''}{pnl.toFixed(2)} SOL
                                         </div>
                                         <div className={`text-[10px] ${pnl > 0 ? 'text-tertiary-fixed-dim/70' : pnl < 0 ? 'text-error/70' : 'text-slate-500'}`}>
                                             {pnl > 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                                         </div>
                                     </td>
                                 </tr>
                             );
                         })}
                         {holdings.every(h => h.quantity === 0) && (
                             <tr>
                                 <td colSpan={6} className="py-12 text-center text-slate-500 text-sm">
                                     <span className="material-symbols-outlined block text-4xl mb-2 opacity-50">account_balance_wallet</span>
                                     Please connect your wallet or purchase assets in the Exchange.
                                 </td>
                             </tr>
                         )}
                     </tbody>
                 </table>
             </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
             <div className="bg-surface-container-low border border-outline-variant/10 rounded-xl p-6">
                <h3 className="font-headline text-xs font-bold uppercase tracking-widest text-secondary mb-6">Allocation Analytics</h3>
                
                <div className="flex justify-center mb-6">
                    <div className="w-40 h-40 rounded-full border-[12px] border-surface-container-highest relative flex items-center justify-center">
                        <div className="absolute inset-[-12px] rounded-full border-[12px] border-transparent border-t-primary border-r-primary rotate-45"></div>
                        <div className="absolute inset-[-12px] rounded-full border-[12px] border-transparent border-b-tertiary rotate-12"></div>
                        <div className="text-center">
                            <span className="block text-2xl font-headline font-bold text-slate-100">{holdings.filter(h=>h.quantity>0).length}</span>
                            <span className="text-[9px] uppercase tracking-widest text-slate-500">Assets</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {holdings.filter(h => h.quantity > 0).map((h, i) => (
                        <div key={h.id}>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-300 truncate pr-2 max-w-[120px]">{h.name}</span>
                                <span className="tabular-nums font-bold text-slate-100">{((h.quantity * h.currentPrice) / totalValue * 100 || 0).toFixed(1)}%</span>
                            </div>
                            <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                                <div className={`h-full ${i === 0 ? 'bg-primary' : i === 1 ? 'bg-tertiary' : 'bg-slate-400'}`} style={{width: `${(h.quantity * h.currentPrice) / totalValue * 100}%`}}></div>
                            </div>
                        </div>
                    ))}
                    {holdings.every(h => h.quantity === 0) && (
                        <p className="text-center text-xs text-slate-500 mt-8">No allocation to analyze</p>
                    )}
                </div>
             </div>

             <div className="bg-gradient-to-br from-surface-container-high to-surface-container border border-outline-variant/10 rounded-xl p-6 relative overflow-hidden group hover:border-primary/50 transition-colors">
                <div className="absolute -right-4 -top-4 text-primary/10 group-hover:text-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-8xl">account_balance</span>
                </div>
                <h3 className="font-headline text-lg font-bold text-white mb-2 relative z-10">Staking & Yield</h3>
                <p className="text-xs text-slate-400 leading-relaxed relative z-10 mb-6 font-['Inter']">Lock your assets inside the TrustBrick escrow to earn compound staking rewards.</p>
                <button className="w-full bg-primary/20 text-primary font-bold py-3 text-xs uppercase tracking-widest rounded relative z-10 hover:bg-primary hover:text-on-primary-fixed transition-all">Stake Assets</button>
             </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
