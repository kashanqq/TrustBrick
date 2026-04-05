"use client";

import Footer from "@/components/Footer";

export default function Analytics() {
  return (
    <>
      <div className="pt-12 pb-20 px-12">
        {/* Dashboard Header */}
        <div className="mb-16 grid grid-cols-12 gap-8 items-end">
          <div className="col-span-12 lg:col-span-8">
            <h2 className="font-headline text-5xl font-light tracking-tight text-on-surface">
              Market Intelligence
            </h2>
            <p className="font-body text-on-surface-variant mt-4 max-w-xl text-lg leading-relaxed">
              Real-time quantitative analysis and high-fidelity forecasting for sovereign asset classes.
            </p>
          </div>
          <div className="col-span-12 lg:col-span-4 flex justify-end gap-12">
            <div>
              <span className="block text-[10px] tracking-[0.3em] uppercase text-primary mb-1">SENTIMENT SCORE</span>
              <span className="block font-headline text-4xl font-bold">84.2</span>
            </div>
            <div>
              <span className="block text-[10px] tracking-[0.3em] uppercase text-on-surface-variant mb-1">VOLATILITY (VIX)</span>
              <span className="block font-headline text-4xl font-bold text-error">12.8%</span>
            </div>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-6 mb-12">
          {/* Volatility Chart */}
          <div className="col-span-12 lg:col-span-8 bg-surface-container-low p-10 spectral-outline relative overflow-hidden h-[480px]">
            <div className="flex justify-between items-start relative z-10">
              <div>
                <h3 className="font-headline text-xs tracking-widest uppercase text-on-surface-variant">Market Volatility Index</h3>
                <p className="text-2xl font-light mt-1">Intraday Momentum</p>
              </div>
              <div className="flex gap-4">
                <span className="text-[10px] px-3 py-1 bg-surface-container-high border border-outline-variant/30 text-on-surface-variant">1H</span>
                <span className="text-[10px] px-3 py-1 bg-primary text-on-primary">1D</span>
                <span className="text-[10px] px-3 py-1 bg-surface-container-high border border-outline-variant/30 text-on-surface-variant">1W</span>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-64 flex items-end">
              <div className="w-full h-full relative opacity-40">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 300">
                  <path
                    d="M0,250 L100,220 L200,240 L300,180 L400,200 L500,120 L600,150 L700,90 L800,110 L900,40 L1000,60"
                    fill="none" stroke="#e3c197" strokeWidth="2"
                  />
                  <path
                    d="M0,250 L100,220 L200,240 L300,180 L400,200 L500,120 L600,150 L700,90 L800,110 L900,40 L1000,60 V300 H0 Z"
                    fill="url(#grad)"
                  />
                  <defs>
                    <linearGradient id="grad" x1="0%" x2="0%" y1="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: "#e3c197", stopOpacity: 0.2 }} />
                      <stop offset="100%" style={{ stopColor: "#e3c197", stopOpacity: 0 }} />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            <div className="absolute bottom-10 left-10 flex gap-8 z-10">
              <div>
                <p className="text-[9px] tracking-widest uppercase text-on-surface-variant">PEAK</p>
                <p className="font-headline text-lg">14.22</p>
              </div>
              <div>
                <p className="text-[9px] tracking-widest uppercase text-on-surface-variant">FLOOR</p>
                <p className="font-headline text-lg">11.05</p>
              </div>
            </div>
          </div>

          {/* Regional Trends */}
          <div className="col-span-12 lg:col-span-4 bg-surface-container-low p-10 spectral-outline flex flex-col">
            <h3 className="font-headline text-xs tracking-widest uppercase text-on-surface-variant mb-8">
              Regional Adoption Trends
            </h3>
            <div className="space-y-10 flex-1">
              {[
                { region: "European Union", label: "INSTITUTIONAL CORE", pct: "+12.4%", bar: 72 },
                { region: "North America", label: "MATURE MARKET", pct: "+8.1%", bar: 55 },
                { region: "Asia Pacific", label: "EMERGING ALPHA", pct: "+18.9%", bar: 88 },
              ].map((r) => (
                <div key={r.region} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{r.region}</p>
                    <p className="text-[10px] text-on-surface-variant tracking-wider">{r.label}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{r.pct}</p>
                    <div className="w-24 h-1 bg-surface-container-high mt-2 overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${r.bar}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-auto pt-10 border-t border-outline-variant/10">
              <div className="bg-surface-container-lowest p-6 flex items-center gap-4">
                <span className="material-symbols-outlined text-primary">language</span>
                <div>
                  <p className="text-[10px] tracking-widest text-on-surface-variant uppercase">Global Velocity</p>
                  <p className="text-lg font-headline">0.421 pts</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Yield Forecasting Matrix */}
        <section className="bg-surface-container-low spectral-outline">
          <div className="p-10 border-b border-outline-variant/10 flex justify-between items-end">
            <div>
              <h3 className="font-headline text-xs tracking-widest uppercase text-on-surface-variant">Yield Forecasting Matrix</h3>
              <p className="text-2xl font-light mt-1">Multi-Asset Projections Q3-Q4</p>
            </div>
            <button className="bg-primary px-6 py-2 text-on-primary text-[10px] font-bold tracking-[0.2em] uppercase transition-all active:opacity-90">
              EXPORT DATASET
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] tracking-widest text-on-surface-variant uppercase bg-surface-container-lowest">
                  <th className="px-10 py-6 font-semibold">Asset Identifier</th>
                  <th className="px-6 py-6 font-semibold">Probability Factor</th>
                  <th className="px-6 py-6 font-semibold">Forecasted Yield</th>
                  <th className="px-6 py-6 font-semibold">Volatility Risk</th>
                  <th className="px-6 py-6 font-semibold">Alpha Rank</th>
                  <th className="px-10 py-6 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {[
                  { id: "SOV-24-USD", desc: "US Treasury Equivalent", prob: "98.2%", yield_: "5.42%", risk: "MINIMAL", riskColor: "border-outline-variant text-on-surface-variant", rank: "A1", bar: "#A2845E" },
                  { id: "ALPH-ETH-01", desc: "Synthetic Alpha Curve", prob: "64.5%", yield_: "12.88%", risk: "ELEVATED", riskColor: "border-error/30 text-error", rank: "B2", bar: "rgba(172,171,170,0.2)" },
                  { id: "EMG-RGN-PAC", desc: "Emerging APAC Real Estate", prob: "82.1%", yield_: "8.15%", risk: "MODERATE", riskColor: "border-outline-variant text-on-surface-variant", rank: "A3", bar: "#A2845E" },
                ].map((row) => (
                  <tr key={row.id} className="hover:bg-surface-bright/50 transition-colors">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-8" style={{ backgroundColor: row.bar }}></div>
                        <div>
                          <p className="text-sm font-bold tracking-tight">{row.id}</p>
                          <p className="text-[10px] text-on-surface-variant">{row.desc}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-8 font-headline text-lg">{row.prob}</td>
                    <td className="px-6 py-8 font-headline text-lg text-primary">{row.yield_}</td>
                    <td className="px-6 py-8">
                      <span className={`text-[9px] px-2 py-0.5 border ${row.riskColor}`}>{row.risk}</span>
                    </td>
                    <td className="px-6 py-8 font-headline text-lg">{row.rank}</td>
                    <td className="px-10 py-8 text-right">
                      <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary">open_in_new</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer Metric Bar */}
        <div className="mt-20 flex justify-between items-center px-10 py-12 bg-surface-container-low spectral-outline">
          <div className="flex gap-20">
            <div>
              <span className="block text-[9px] tracking-[0.2em] text-on-surface-variant uppercase mb-2">LAST UPDATE</span>
              <span className="block text-sm font-medium uppercase">14:22:01 UTC</span>
            </div>
            <div>
              <span className="block text-[9px] tracking-[0.2em] text-on-surface-variant uppercase mb-2">DATA SOURCE</span>
              <span className="block text-sm font-medium uppercase">REUTERS INTEGRATED</span>
            </div>
            <div>
              <span className="block text-[9px] tracking-[0.2em] text-on-surface-variant uppercase mb-2">SESSION ID</span>
              <span className="block text-sm font-medium uppercase">QX-842-ARCHIVE</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-[10px] text-primary tracking-[0.3em] font-bold uppercase">SECURE CONNECTION</span>
            <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
          </div>
        </div>
      </div>
    </>
  );
}
