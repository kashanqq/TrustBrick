"use client";

import Footer from "@/components/Footer";

export default function Assets() {
  return (
    <>
      <div className="p-12 min-h-[calc(100vh-80px)] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex flex-col mb-16">
          <div className="font-body text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-4 flex items-center gap-2">
            <span>Network</span> <span className="text-outline">/</span>{" "}
            <span className="text-primary">Asset Management</span>
          </div>
          <div className="flex justify-between items-end">
            <h1 className="font-headline text-6xl font-light tracking-tighter max-w-2xl leading-none">
              Sovereign Asset <br />
              <span className="text-primary font-medium">Control Center</span>
            </h1>
            <div className="flex gap-4">
              <button className="bg-primary text-on-primary px-8 py-4 font-headline text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-all">
                Register Asset
              </button>
            </div>
          </div>
        </div>

        {/* Asset Overview Grid */}
        <div className="grid grid-cols-12 gap-8 mb-16">
          {/* Total Assets Card */}
          <div className="col-span-12 lg:col-span-4 bg-surface-container-low p-10 border-l border-primary/20">
            <label className="font-body text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-2 block">
              Total Registered Assets
            </label>
            <div className="font-headline text-6xl font-bold tracking-tighter mt-4">247</div>
            <div className="flex items-center gap-2 text-primary mt-4">
              <span className="material-symbols-outlined">trending_up</span>
              <span className="font-body text-sm tracking-widest">+12 THIS MONTH</span>
            </div>
          </div>

          {/* Active Positions */}
          <div className="col-span-12 lg:col-span-4 bg-surface-container-low p-10 border-t border-outline-variant/20">
            <label className="font-body text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-2 block">
              Active Positions
            </label>
            <div className="font-headline text-6xl font-bold tracking-tighter mt-4">
              182
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">Real Estate</span>
                <span className="font-bold">124</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">Infrastructure</span>
                <span className="font-bold">38</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">Digital Securities</span>
                <span className="font-bold">20</span>
              </div>
            </div>
          </div>

          {/* Yield Performance */}
          <div className="col-span-12 lg:col-span-4 bg-surface-container-low p-10 border-t border-outline-variant/20">
            <label className="font-body text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-2 block">
              Average Yield Performance
            </label>
            <div className="font-headline text-6xl font-bold tracking-tighter text-primary mt-4">
              8.4%
            </div>
            <div className="mt-6 w-full h-1.5 bg-surface-container-highest">
              <div className="h-full bg-primary w-[84%] transition-all"></div>
            </div>
            <p className="mt-3 text-xs text-on-surface-variant">Target benchmark: 7.5%</p>
          </div>
        </div>

        {/* Asset Registry Table */}
        <div className="bg-surface-container-low/50 border-t border-outline-variant/10">
          <div className="flex justify-between items-center p-10 border-b border-outline-variant/10">
            <h3 className="font-headline text-2xl font-light tracking-tighter uppercase">
              Asset Registry
            </h3>
            <div className="flex gap-8 text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase">
              <span className="text-primary">All Assets</span>
              <span className="hover:text-on-surface cursor-pointer">Tokenized</span>
              <span className="hover:text-on-surface cursor-pointer">Pending</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="font-body text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                  <th className="px-10 py-6 font-medium">Asset ID</th>
                  <th className="px-10 py-6 font-medium">Asset Name</th>
                  <th className="px-10 py-6 font-medium">Type</th>
                  <th className="px-10 py-6 font-medium text-right">Valuation</th>
                  <th className="px-10 py-6 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="font-body text-sm tracking-tight border-t border-outline-variant/5">
                <tr className="hover:bg-surface-container-high transition-colors">
                  <td className="px-10 py-6 font-mono text-xs text-on-surface-variant">AST-001-EPA</td>
                  <td className="px-10 py-6 font-medium">Elysian Plaza Alpha</td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-primary"></span>
                      <span className="uppercase tracking-widest text-xs">Commercial RE</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right font-medium">$412,500,000</td>
                  <td className="px-10 py-6 text-center">
                    <span className="bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest px-3 py-1">
                      Tokenized
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-surface-container-high transition-colors">
                  <td className="px-10 py-6 font-mono text-xs text-on-surface-variant">AST-002-VLG</td>
                  <td className="px-10 py-6 font-medium">Vertex Logistics Hub</td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-on-surface-variant/40"></span>
                      <span className="uppercase tracking-widest text-xs">Industrial</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right font-medium">$89,200,000</td>
                  <td className="px-10 py-6 text-center">
                    <span className="bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest px-3 py-1">
                      Tokenized
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-surface-container-high transition-colors">
                  <td className="px-10 py-6 font-mono text-xs text-on-surface-variant">AST-003-ATP</td>
                  <td className="px-10 py-6 font-medium">Atrium Plaza Complex</td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-primary"></span>
                      <span className="uppercase tracking-widest text-xs">Mixed Use</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right font-medium">$210,000,000</td>
                  <td className="px-10 py-6 text-center">
                    <span className="bg-outline-variant/10 text-on-surface-variant text-[9px] font-bold uppercase tracking-widest px-3 py-1">
                      Pending
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
