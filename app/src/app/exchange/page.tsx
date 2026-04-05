"use client";

import { useState } from "react";
import Image from "next/image";
import Footer from "@/components/Footer";
import { useLanguage } from "@/components/LanguageContext";

const ASSETS = [
  {
    id: "hackathon",
    name: "Hackathon Tower",
    series: "Series A",
    phase: "Phase 3: Structural Core Completion",
    price: 142.85,
    change: "+4.2%",
    image: "/stage-1.png",
    volume: "1,248.5",
    status: "Verified Audit",
  },
  {
    id: "dubai",
    name: "Dubai Marina Loft",
    series: "Exclusive Phase",
    phase: "Phase 1: Foundation",
    price: 245.0,
    change: "+12.1%",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA8-Ow4CT9O_b08CJzLH74d60idNlxIoBH7UzkjQS-vx7xqBbcH45NyTKJTKCpJpHIZes0MLfvZFr9Zd4IXP7OHljfP7mh511HMDph6zc4CbnD_Z3VhDc6SmGMyMVlOwGpoK4s42k6a4eEfi9HA3xeQIJEL5QUH7AI38EhLBNqwp-h8Kmp2-h-Vgn0YGz7D5Z3t6QI3qppS98eKFbvkV00_IIdJf_jsUGlWcjXofSU8wP18zEaHBdACT3UHNPaj_01ZGBVWLRfsXuI",
    volume: "4,102.1",
    status: "Verified Audit",
  },
  {
    id: "london",
    name: "London Fin-Center",
    series: "Commercial",
    phase: "Phase 5: Interior Fit-out",
    price: 412.8,
    change: "+9.8%",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDu5WjZc2WvbANMGyfH2zyZszN6UzoArtH9m9sZgPqH0nrvyFTkRUeGZWeMvD9FuAWQFjuFyUtInMKmtK6dWDifTmgkde0HQWVJMO-nw3G-pqJH-wekySt4EiiVEHcaZIaYnrx-XBoe5IVzgmYmLJNsKmaqgan1gm5qjy8YXSOte2ovQsXpA1MGpe3YZdOpRFFRCqSKgjgQg0dU8z6ejNqd_225nUxGiPsS83toSJyBLb2o44DO1vmoMhjdd5hUvUlvNqftDvFgIQA",
    volume: "8,920.4",
    status: "Verified Audit",
  },
];

export default function Exchange() {
  const { t } = useLanguage();
  const [activeId, setActiveId] = useState("hackathon");

  const activeAsset = ASSETS.find((a) => a.id === activeId) || ASSETS[0];

  return (
    <>
      <div className="pt-4 pb-12 px-6 grid grid-cols-12 gap-6 min-h-[calc(100vh-80px)]">
        {/* Market Selector Sidebar */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
          <h2 className="font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
            Available Markets
          </h2>
          {ASSETS.map((asset) => (
            <div
              key={asset.id}
              onClick={() => setActiveId(asset.id)}
              className={`p-4 cursor-pointer transition-all border ${
                activeId === asset.id
                  ? "bg-surface-container border-primary/30 border-l-2 border-l-primary"
                  : "bg-surface-container-low border-outline-variant/10 hover:bg-surface-container"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-headline font-bold text-sm text-on-surface">{asset.name}</div>
                <span className="text-primary text-[10px] font-bold">{asset.change}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-[10px] uppercase text-on-surface-variant">{asset.series}</span>
                <span className="tabular-nums font-bold text-sm">{asset.price} SOL</span>
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-12 lg:col-span-6 flex flex-col gap-6 relative z-10">
          <div className="bg-surface-container-low overflow-hidden flex flex-col h-[400px]">
            <div className="px-6 py-4 flex justify-between items-center bg-surface-container/40 border-b border-outline-variant/10">
              <div className="flex items-center gap-4">
                <div className="bg-surface-container-high p-2">
                  <span className="material-symbols-outlined text-primary">apartment</span>
                </div>
                <div>
                  <h1 className="font-headline text-lg font-bold uppercase tracking-tight">
                    {activeAsset.name} · {activeAsset.series}
                  </h1>
                  <p className="text-xs text-on-surface-variant italic">{activeAsset.phase}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 tabular-nums">
                <div className="text-right">
                  <span className="block text-[10px] uppercase text-on-surface-variant">Last Price</span>
                  <span className="text-primary font-bold">{activeAsset.price} SOL</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] uppercase text-on-surface-variant">24h Progress</span>
                  <span className="text-primary">{activeAsset.change}</span>
                </div>
                <div className="text-right hidden md:block">
                  <span className="block text-[10px] uppercase text-on-surface-variant">24h Vol</span>
                  <span className="text-on-surface">{activeAsset.volume} SOL</span>
                </div>
              </div>
            </div>
            <div className="flex-1 relative p-8">
              <div className="absolute inset-0 flex items-end px-8 pb-12">
                <div className="w-full h-full bg-primary/5 staircase-path relative border-t-2 border-primary/40">
                  <div className="absolute top-0 right-0 w-2 h-2 bg-primary shadow-[0_0_12px_rgba(227,193,151,0.8)]"></div>
                </div>
              </div>
              <div className="absolute inset-0 grid grid-cols-6 pointer-events-none px-8 pb-12">
                {["Foundation", "Excavation", "Basement", "Structural", "Cladding", "Interior"].map(
                  (label, i) => (
                    <div
                      key={label}
                      className={`${i < 5 ? "border-r border-outline-variant/10" : ""} h-full flex items-end justify-center pb-2 ${i > 3 ? "opacity-30" : ""}`}
                    >
                      <span
                        className={`text-[9px] uppercase tracking-tighter ${
                          i === 3
                            ? "text-on-surface-variant font-bold"
                            : "text-outline"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  )
                )}
              </div>
              <div className="absolute left-8 top-8 bottom-12 flex flex-col justify-between text-[10px] text-outline tabular-nums">
                <span>{(activeAsset.price * 1.5).toFixed(1)}</span>
                <span>{(activeAsset.price * 1.25).toFixed(1)}</span>
                <span>{activeAsset.price.toFixed(1)}</span>
                <span>{(activeAsset.price * 0.75).toFixed(1)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            <div className="bg-surface-container-low p-8 flex flex-col gap-6">
              <div className="flex gap-1">
                <button className="flex-1 py-3 text-sm font-headline font-bold uppercase tracking-widest bg-primary-container text-on-primary-container">
                  Buy
                </button>
                <button className="flex-1 py-3 text-sm font-headline font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-high transition-colors">
                  Sell
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
                    Order Type
                  </label>
                  <div className="relative">
                    <select className="w-full bg-surface-container border-b border-outline-variant text-on-surface py-3 px-0 appearance-none focus:outline-none focus:border-primary transition-colors cursor-pointer">
                      <option>Market Order</option>
                      <option>Limit Order</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
                      Brick Quantity
                    </label>
                    <input
                      className="w-full bg-surface-container border-b border-outline-variant text-on-surface py-3 px-0 focus:outline-none focus:border-primary transition-colors tabular-nums"
                      type="number"
                      defaultValue="1.0"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
                      Estimated Price
                    </label>
                    <div className="py-3 text-on-surface font-headline font-bold tabular-nums">
                      {activeAsset.price} SOL
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-auto border-t border-outline-variant/10 pt-6">
                <div className="flex justify-between text-xs mb-4">
                  <span className="text-on-surface-variant">Transactional Fee (0.2%)</span>
                  <span className="text-on-surface tabular-nums">
                    {(activeAsset.price * 0.002).toFixed(3)} SOL
                  </span>
                </div>
                <button className="w-full py-4 bg-primary text-on-primary font-headline font-extrabold uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all">
                  Place Buy Order
                </button>
              </div>
            </div>

            <div className="bg-surface-container-low p-6 overflow-hidden flex flex-col">
              <h3 className="font-headline text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary"></span>
                Asset Intelligence
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-surface-container-high flex-shrink-0 relative overflow-hidden">
                    <Image
                      alt="Building Preview"
                      fill
                      className="w-full h-full object-cover"
                      src={activeAsset.image}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5">
                      {activeAsset.status}
                    </span>
                    <p className="text-xs mt-2 text-on-surface-variant leading-relaxed">
                      Structural integrity certificate issued. High institutional demand observed in
                      recent epochs.
                    </p>
                  </div>
                </div>
                <div className="bg-surface-container p-4 border-l-2 border-primary">
                  <span className="text-[9px] uppercase tracking-widest text-on-surface-variant">
                    Phase Reward Milestone
                  </span>
                  <p className="text-xs mt-1">
                    Investors holding &gt;10 Bricks qualify for &apos;Golden Key&apos; priority on{" "}
                    {activeAsset.series} listings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-3 bg-surface-container-low flex flex-col overflow-hidden relative z-10">
          <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
            <h2 className="font-headline text-xs font-bold uppercase tracking-widest">Public Ledger</h2>
            <div className="flex gap-4">
              <span className="text-[9px] uppercase text-on-surface-variant cursor-pointer hover:text-on-surface">
                Standard
              </span>
              <span className="text-[9px] uppercase text-primary font-bold cursor-pointer">Spread</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="bg-error/5 px-6 py-4 flex flex-col gap-1 overflow-y-auto h-1/2 no-scrollbar">
              <div className="flex justify-between text-[9px] uppercase tracking-widest text-outline mb-2 font-bold">
                <span>Price (SOL)</span>
                <span>Quantity</span>
              </div>
              {[0.3, 0.23, 0.14, 0.07, 0.03].map((offset, i) => (
                <div
                  key={offset}
                  className={`flex justify-between text-xs tabular-nums text-error py-1 hover:bg-on-surface/5 transition-colors ${i > 2 ? "opacity-60" : ""}`}
                >
                  <span className="font-bold">
                    {(activeAsset.price + offset).toFixed(2)}
                  </span>
                  <span className="text-on-surface-variant">
                    {[12.4, 0.5, 45.0, 8.2, 2.1][i]}
                  </span>
                </div>
              ))}
            </div>

            <div className="py-4 px-6 bg-surface-container-high/40 flex items-center justify-center border-y border-outline-variant/10">
              <div className="flex items-center gap-3">
                <span className="text-xl font-headline font-extrabold text-on-surface tabular-nums">
                  {activeAsset.price}
                </span>
                <span className="material-symbols-outlined text-primary text-sm">trending_up</span>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant">Market Price</span>
              </div>
            </div>

            <div className="bg-primary/5 px-6 py-4 flex flex-col gap-1 overflow-y-auto h-1/2 no-scrollbar">
              {[0.03, 0.1, 0.15, 0.19, 0.35].map((offset, i) => (
                <div
                  key={offset}
                  className={`flex justify-between text-xs tabular-nums text-primary py-1 hover:bg-on-surface/5 transition-colors ${i < 2 ? "opacity-60" : ""}`}
                >
                  <span className="font-bold">
                    {(activeAsset.price - offset).toFixed(2)}
                  </span>
                  <span className="text-on-surface-variant">
                    {[1.8, 15.0, 102.5, 4.4, 22.9][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-surface-container-highest/20 mt-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                Live P2P Activity
              </span>
              <div className="w-1.5 h-1.5 bg-primary animate-pulse"></div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-[10px]">
                <span className="text-on-surface">3.2 BRK Filled</span>
                <span className="text-outline font-label">2s ago</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-on-surface">
                  New Ask: {(activeAsset.price + 1.25).toFixed(2)} SOL
                </span>
                <span className="text-outline font-label">5s ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
