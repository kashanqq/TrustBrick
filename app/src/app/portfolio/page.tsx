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
  },
];

export default function Portfolio() {
  const { connected } = useWallet();
  const { t } = useLanguage();

  const [holdings, setHoldings] = useState(MOCK_HOLDINGS);

  useEffect(() => {
    if (!connected) {
      setHoldings(MOCK_HOLDINGS.map((h) => ({ ...h, quantity: 0 })));
    } else {
      setHoldings(MOCK_HOLDINGS);
    }
  }, [connected]);

  const totalValue = holdings.reduce((sum, h) => sum + h.quantity * h.currentPrice, 0);
  const totalCost = holdings.reduce((sum, h) => sum + h.quantity * h.avgBuy, 0);
  const totalPnl = totalValue - totalCost;
  const pnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  return (
    <>
      <div className="p-12 min-h-[calc(100vh-80px)]">
        {/* Header */}
        <div className="flex flex-col mb-16">
          <div className="font-body text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-4 flex items-center gap-2">
            <span>Network</span> <span className="text-outline">/</span>
            <span className="text-primary">Portfolio Manager</span>
          </div>
          <div className="flex justify-between items-end">
            <h1 className="font-headline text-6xl font-light tracking-tighter leading-none">
              Institutional <br />
              <span className="text-primary font-medium">Holdings Archive</span>
            </h1>
            <div className="flex gap-8">
              <div className="text-right">
                <p className="text-[10px] text-on-surface-variant tracking-widest uppercase mb-1">Total Value</p>
                <p className="text-3xl font-headline font-bold">{totalValue.toFixed(2)} <span className="text-lg text-on-surface-variant font-light">SOL</span></p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-on-surface-variant tracking-widest uppercase mb-1">Unrealized PNL</p>
                <p className={`text-3xl font-headline font-bold ${totalPnl > 0 ? "text-primary" : totalPnl < 0 ? "text-error" : ""}`}>
                  {totalPnl > 0 ? "+" : ""}{totalPnl.toFixed(2)}
                  <span className="text-lg font-light ml-2">({pnlPercent > 0 ? "+" : ""}{pnlPercent.toFixed(2)}%)</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-9">
            <div className="bg-surface-container-low/50 border-t border-outline-variant/10">
              <div className="flex justify-between items-center p-10 border-b border-outline-variant/10">
                <h3 className="font-headline text-2xl font-light tracking-tighter uppercase">Asset Composition</h3>
                <div className="flex gap-4">
                  <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">download</button>
                  <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">filter_list</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="font-body text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                      <th className="px-10 py-6 font-medium">Property</th>
                      <th className="px-6 py-6 font-medium text-right">Avg Buy</th>
                      <th className="px-6 py-6 font-medium text-right">Current</th>
                      <th className="px-6 py-6 font-medium text-right">Qty</th>
                      <th className="px-6 py-6 font-medium text-right">Value</th>
                      <th className="px-10 py-6 font-medium text-right">PNL</th>
                    </tr>
                  </thead>
                  <tbody className="font-body text-sm border-t border-outline-variant/5 divide-y divide-outline-variant/5">
                    {holdings.map((h) => {
                      const value = h.quantity * h.currentPrice;
                      const cost = h.quantity * h.avgBuy;
                      const pnl = value - cost;
                      const pct = cost > 0 ? (pnl / cost) * 100 : 0;
                      return (
                        <tr key={h.id} className="hover:bg-surface-container-high transition-colors">
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-surface-container-high overflow-hidden flex-shrink-0">
                                <Image alt={h.name} src={h.image} width={40} height={40} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <div className="font-bold">{h.name}</div>
                                <div className="text-[10px] text-on-surface-variant">{h.ticker}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-right font-medium text-on-surface-variant tabular-nums">{h.avgBuy.toFixed(2)}</td>
                          <td className="px-6 py-6 text-right font-medium tabular-nums">{h.currentPrice.toFixed(2)}</td>
                          <td className="px-6 py-6 text-right font-bold text-primary tabular-nums">{h.quantity.toFixed(2)}</td>
                          <td className="px-6 py-6 text-right font-bold tabular-nums">{value.toFixed(2)}</td>
                          <td className="px-10 py-6 text-right">
                            <div className={`font-bold tabular-nums ${pnl > 0 ? "text-primary" : pnl < 0 ? "text-error" : "text-on-surface-variant"}`}>
                              {pnl > 0 ? "+" : ""}{pnl.toFixed(2)}
                            </div>
                            <div className={`text-[10px] ${pnl > 0 ? "text-primary/70" : pnl < 0 ? "text-error/70" : "text-on-surface-variant"}`}>
                              {pct > 0 ? "+" : ""}{pct.toFixed(2)}%
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {holdings.every((h) => h.quantity === 0) && (
                      <tr>
                        <td colSpan={6} className="py-16 text-center text-on-surface-variant text-sm">
                          <span className="material-symbols-outlined block text-4xl mb-2 opacity-50">account_balance_wallet</span>
                          Connect your wallet to view holdings.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar Analytics */}
          <div className="col-span-12 lg:col-span-3 space-y-8">
            <div className="bg-surface-container-low p-8 spectral-outline">
              <h3 className="font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-6">
                Allocation Analytics
              </h3>
              <div className="space-y-4">
                {holdings.filter((h) => h.quantity > 0).map((h, i) => (
                  <div key={h.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-on-surface-variant truncate pr-2 max-w-[120px]">{h.name}</span>
                      <span className="tabular-nums font-bold">
                        {((h.quantity * h.currentPrice) / totalValue * 100 || 0).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1 bg-surface-container-highest overflow-hidden">
                      <div
                        className={`h-full ${i === 0 ? "bg-primary" : i === 1 ? "bg-accent" : "bg-on-surface-variant/40"}`}
                        style={{ width: `${(h.quantity * h.currentPrice) / totalValue * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-4 mb-4">
                <span className="material-symbols-outlined text-primary">account_balance</span>
                <span className="text-[10px] tracking-[0.3em] font-bold text-primary uppercase">Staking & Yield</span>
              </div>
              <p className="text-[11px] leading-relaxed text-on-surface-variant mb-6">
                Lock your assets inside the TrustBrick escrow to earn compound staking rewards.
              </p>
              <button className="w-full bg-primary text-on-primary py-3 text-[10px] font-bold tracking-widest uppercase hover:opacity-90 transition-all">
                Stake Assets
              </button>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
