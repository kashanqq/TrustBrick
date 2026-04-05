"use client";

import Footer from "@/components/Footer";

export default function Treasury() {
  return (
    <>
      <div className="p-12 min-h-[calc(100vh-80px)] overflow-y-auto no-scrollbar">
        {/* Header Section */}
        <div className="flex flex-col mb-16">
          <div className="font-body text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-4 flex items-center gap-2">
            <span>Network</span> <span className="text-outline">/</span>{" "}
            <span className="text-primary">Treasury Control</span>
          </div>
          <div className="flex justify-between items-end">
            <h1 className="font-headline text-6xl font-light tracking-tighter max-w-2xl leading-none">
              Global Institutional <br />
              <span className="text-primary font-medium">Liquidity Archive</span>
            </h1>
            <div className="flex gap-4">
              <button className="bg-primary text-on-primary px-8 py-4 font-headline text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-all">
                Execute Transfer
              </button>
            </div>
          </div>
        </div>

        {/* Bento Grid for Core Metrics */}
        <div className="grid grid-cols-12 gap-8 mb-16">
          {/* AUM Hero Card */}
          <div className="col-span-12 lg:col-span-8 bg-surface-container-low p-10 flex flex-col justify-between min-h-[400px] border-l border-primary/20">
            <div>
              <label className="font-body text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-2 block">
                Managed Value (AUM)
              </label>
              <div className="font-headline text-7xl font-bold tracking-tighter">
                $1.42<span className="text-on-surface-variant font-light">B</span>
              </div>
              <div className="flex items-center gap-2 text-primary mt-4">
                <span className="material-symbols-outlined">trending_up</span>
                <span className="font-body text-sm tracking-widest">+4.2% (24H PERIOD)</span>
              </div>
            </div>
            <div className="h-48 mt-8 flex items-end gap-1">
              <div className="w-full bg-surface-container-high h-1/2 hover:bg-primary/40 transition-all"></div>
              <div className="w-full bg-surface-container-high h-3/4 hover:bg-primary/40 transition-all"></div>
              <div className="w-full bg-surface-container-high h-2/3 hover:bg-primary/40 transition-all"></div>
              <div className="w-full bg-surface-container-high h-5/6 hover:bg-primary/40 transition-all"></div>
              <div className="w-full bg-primary/20 h-full border-t border-primary/60 transition-all"></div>
              <div className="w-full bg-surface-container-high h-4/5 hover:bg-primary/40 transition-all"></div>
              <div className="w-full bg-surface-container-high h-2/3 hover:bg-primary/40 transition-all"></div>
              <div className="w-full bg-surface-container-high h-3/4 hover:bg-primary/40 transition-all"></div>
              <div className="w-full bg-surface-container-high h-4/5 hover:bg-primary/40 transition-all"></div>
              <div className="w-full bg-primary/60 h-full border-t border-primary transition-all"></div>
            </div>
          </div>

          {/* Liquidity Breakdown */}
          <div className="col-span-12 lg:col-span-4 bg-surface-container-low p-10 flex flex-col border-t border-outline-variant/20">
            <label className="font-body text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-8 block">
              Liquidity Distribution
            </label>
            <div className="space-y-10">
              <div className="group cursor-default">
                <div className="flex justify-between items-end mb-3">
                  <span className="font-headline text-lg tracking-tight uppercase">Stable Assets</span>
                  <span className="font-body text-on-surface-variant text-sm tracking-widest">62%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container-highest">
                  <div className="h-full bg-primary w-[62%] transition-all"></div>
                </div>
                <p className="mt-3 text-xs text-on-surface-variant font-light leading-relaxed">
                  Liquid cash equivalents, US-denominated treasury bills, and Tier-1 reserves.
                </p>
              </div>
              <div className="group cursor-default">
                <div className="flex justify-between items-end mb-3">
                  <span className="font-headline text-lg tracking-tight uppercase">Growth Ventures</span>
                  <span className="font-body text-on-surface-variant text-sm tracking-widest">38%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container-highest">
                  <div className="h-full bg-on-surface-variant/40 w-[38%] transition-all"></div>
                </div>
                <p className="mt-3 text-xs text-on-surface-variant font-light leading-relaxed">
                  Direct equity stakes, strategic tech infrastructure, and long-term yield vehicles.
                </p>
              </div>
            </div>
            <div className="mt-auto pt-8 border-t border-outline-variant/10">
              <button className="w-full text-left text-[10px] text-primary uppercase tracking-[0.3em] font-bold flex items-center justify-between group">
                <span>View All Categories</span>
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                  arrow_right_alt
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity Ledger */}
        <div className="bg-surface-container-low/50 border-t border-outline-variant/10">
          <div className="flex justify-between items-center p-10 border-b border-outline-variant/10">
            <h3 className="font-headline text-2xl font-light tracking-tighter uppercase">
              Recent Activity Ledger
            </h3>
            <div className="flex gap-8 text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase">
              <span className="text-primary">All Transactions</span>
              <span className="hover:text-on-surface cursor-pointer">Settled</span>
              <span className="hover:text-on-surface cursor-pointer">Processing</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="font-body text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                  <th className="px-10 py-6 font-medium">Transaction ID</th>
                  <th className="px-10 py-6 font-medium">Asset Class</th>
                  <th className="px-10 py-6 font-medium text-right">Volume</th>
                  <th className="px-10 py-6 font-medium text-center">Status</th>
                  <th className="px-10 py-6 font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody className="font-body text-sm tracking-tight border-t border-outline-variant/5">
                <tr className="hover:bg-surface-container-high transition-colors">
                  <td className="px-10 py-6 font-mono text-xs text-on-surface-variant">TXN-8821-0024-XCA</td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-primary"></span>
                      <span className="uppercase tracking-widest text-xs">Stablecoin Reserve Rebalance</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right font-medium">$12,400,000.00</td>
                  <td className="px-10 py-6 text-center">
                    <span className="bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest px-3 py-1">Settled</span>
                  </td>
                  <td className="px-10 py-6 text-on-surface-variant">2024.10.24 14:22:01</td>
                </tr>
                <tr className="hover:bg-surface-container-high transition-colors">
                  <td className="px-10 py-6 font-mono text-xs text-on-surface-variant">TXN-8821-0023-FRL</td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-on-surface-variant/40"></span>
                      <span className="uppercase tracking-widest text-xs">Equity Acquisition: Vector AI</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right font-medium">$4,500,000.00</td>
                  <td className="px-10 py-6 text-center">
                    <span className="bg-outline-variant/10 text-on-surface-variant text-[9px] font-bold uppercase tracking-widest px-3 py-1">Processing</span>
                  </td>
                  <td className="px-10 py-6 text-on-surface-variant">2024.10.24 11:05:44</td>
                </tr>
                <tr className="hover:bg-surface-container-high transition-colors">
                  <td className="px-10 py-6 font-mono text-xs text-on-surface-variant">TXN-8820-9941-ZKM</td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-primary"></span>
                      <span className="uppercase tracking-widest text-xs">Monthly Operational Overhead</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right font-medium">$840,230.12</td>
                  <td className="px-10 py-6 text-center">
                    <span className="bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest px-3 py-1">Settled</span>
                  </td>
                  <td className="px-10 py-6 text-on-surface-variant">2024.10.23 09:12:11</td>
                </tr>
                <tr className="hover:bg-surface-container-high transition-colors">
                  <td className="px-10 py-6 font-mono text-xs text-on-surface-variant">TXN-8820-9939-OPQ</td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-on-surface-variant/40"></span>
                      <span className="uppercase tracking-widest text-xs">Yield Harvesting: Pool 04</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right font-medium">$1,102,400.00</td>
                  <td className="px-10 py-6 text-center">
                    <span className="bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest px-3 py-1">Settled</span>
                  </td>
                  <td className="px-10 py-6 text-on-surface-variant">2024.10.23 08:45:00</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="p-8 border-t border-outline-variant/10 text-center">
            <button className="text-[10px] text-on-surface-variant hover:text-primary uppercase tracking-[0.4em] font-bold transition-colors">
              Download Full Ledger Archive (CSV/PDF)
            </button>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
