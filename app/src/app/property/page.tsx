"use client";

import Footer from "@/components/Footer";

export default function Property() {
  return (
    <>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="p-12 pb-24 grid grid-cols-12 gap-8 items-end border-b border-on-surface-variant/5">
          <div className="col-span-12 lg:col-span-8">
            <div className="flex items-center space-x-3 mb-6">
              <span className="bg-primary/10 text-primary px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
                Premium Asset
              </span>
              <span className="text-on-surface-variant text-[10px] tracking-widest uppercase">
                ID: EPA-001-ALPHA
              </span>
            </div>
            <h1 className="text-7xl font-headline font-bold tracking-tighter text-on-surface leading-[0.9]">
              Elysian Plaza Alpha
            </h1>
            <p className="text-xl font-body text-on-surface-variant mt-8 max-w-2xl leading-relaxed">
              A multi-generational commercial landmark situated in the central financial district.
              Engineered for permanence, sustainability, and institutional-grade yield stability.
            </p>
          </div>
          <div className="col-span-12 lg:col-span-4 flex justify-end space-x-8">
            <div className="text-right">
              <p className="text-[10px] text-on-surface-variant tracking-widest uppercase mb-1">Current Valuation</p>
              <p className="text-3xl font-headline font-bold text-on-surface">$412.5M</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-on-surface-variant tracking-widest uppercase mb-1">Target Yield</p>
              <p className="text-3xl font-headline font-bold text-primary">8.42%</p>
            </div>
          </div>
        </section>

        {/* Asymmetric Data Grid */}
        <section className="grid grid-cols-12">
          {/* Left Column */}
          <div className="col-span-12 lg:col-span-7 p-12 space-y-24 border-r border-on-surface-variant/5">
            {/* Main Visual */}
            <div className="relative aspect-video bg-surface-container-low group overflow-hidden">
              <img
                alt="Elysian Plaza Alpha"
                className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQHEu08mJZw7A_W4CIPbtygRT_dDEX8q6z5MY1IrXwHQlWoGFlu8qSiQfcw4a29sPNn0aqRgrNvpDc1oLDcfuj68_-KCXiG1T3iRybRcZjST5BaV8tmeYyNNQfIbdSxsq_bPrIPSRbYq_sv6YTBLnzDwDg73kA71gyN8cioG-NeTF4Nut1jLxGnpjV2DX-CrVa-VRfno3YaXonkm_aXeqMfTxvx1-4qsixZI6-DOFWNhI9VDYMUs_UwdktPxgh43nH33q3EchsGxKA"
              />
              <div className="absolute bottom-0 left-0 p-8 w-full bg-gradient-to-t from-background to-transparent">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-on-surface-variant tracking-widest uppercase">Location</p>
                    <p className="text-lg font-headline font-medium">Metropolis Financial Core</p>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-12 h-[2px] bg-primary"></div>
                    <div className="w-12 h-[2px] bg-outline-variant"></div>
                    <div className="w-12 h-[2px] bg-outline-variant"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Matrix + Allocation */}
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-8">
                <h3 className="font-headline text-3xl font-bold tracking-tight">Performance Matrix</h3>
                <div className="space-y-6">
                  {[
                    { label: "Projected 5Y ROI", value: "42.1%" },
                    { label: "Cap Rate", value: "5.8%" },
                    { label: "Occupancy", value: "98.4%" },
                  ].map((m) => (
                    <div key={m.label} className="flex justify-between items-end border-b border-on-surface-variant/10 pb-4">
                      <span className="text-xs text-on-surface-variant uppercase tracking-widest">{m.label}</span>
                      <span className="font-headline text-xl font-bold">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-surface-container-low p-8 flex flex-col justify-between">
                <p className="text-[10px] text-primary tracking-widest uppercase font-bold">Allocation Status</p>
                <div className="mt-8">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-5xl font-headline font-bold">72.4%</span>
                    <span className="text-xs text-on-surface-variant uppercase mb-1">Minted</span>
                  </div>
                  <div className="w-full h-1 bg-surface-container-high">
                    <div className="h-full bg-primary" style={{ width: "72.4%" }}></div>
                  </div>
                </div>
                <button className="mt-12 w-full bg-primary text-on-primary py-4 text-xs font-bold tracking-widest uppercase hover:opacity-90 transition-all">
                  Initiate Allocation
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-12 lg:col-span-5 p-12 bg-surface-container-low space-y-16">
            {/* ESG Rating */}
            <div className="space-y-4">
              <p className="text-[10px] text-on-surface-variant tracking-widest uppercase">Environmental Social Governance</p>
              <div className="flex items-baseline space-x-4">
                <h2 className="text-8xl font-headline font-bold text-primary leading-none">AAA</h2>
                <span className="text-xs text-on-surface-variant font-medium max-w-[140px] uppercase">
                  Standard of Institutional Excellence
                </span>
              </div>
              <div className="pt-4 flex space-x-2">
                <span className="h-1 flex-1 bg-primary"></span>
                <span className="h-1 flex-1 bg-primary"></span>
                <span className="h-1 flex-1 bg-primary"></span>
              </div>
            </div>

            {/* Document Vault */}
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="font-headline text-2xl font-bold tracking-tight">Technical Vault</h3>
                <span className="material-symbols-outlined text-primary">lock</span>
              </div>
              <div className="space-y-4">
                {[
                  { icon: "description", title: "Technical Audit 2024", meta: "PDF • 12.4 MB" },
                  { icon: "verified_user", title: "Land Registry Certificate", meta: "OFFICIAL • BLOCKCHAIN VERIFIED" },
                  { icon: "fact_check", title: "Structural Integrity Report", meta: "PDF • 8.1 MB" },
                ].map((doc) => (
                  <div key={doc.title} className="group cursor-pointer flex items-center justify-between p-6 bg-surface-container-high transition-all hover:bg-surface-bright">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 border border-on-surface-variant/20 flex items-center justify-center">
                        <span className="material-symbols-outlined">{doc.icon}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold tracking-tight">{doc.title}</p>
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">{doc.meta}</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-all">download</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Investment Mandate */}
            <div className="pt-8 border-t border-on-surface-variant/10">
              <p className="text-[10px] text-on-surface-variant tracking-widest uppercase mb-4">Investment Mandate</p>
              <p className="text-sm leading-relaxed text-on-surface-variant">
                Asset EPA-001 represents a defensive core position. Preferred for institutional
                treasuries seeking capital preservation with systematic inflation hedging through
                triple-net lease structures and ESG-compliance incentives.
              </p>
            </div>
          </div>
        </section>

        {/* Technical Metadata Footer */}
        <footer className="p-12 border-t border-on-surface-variant/5 grid grid-cols-4 gap-8">
          {[
            { label: "Asset Class", value: "Tokenized Commercial Real Estate" },
            { label: "Network Status", value: "Mainnet Operational" },
            { label: "Custodian", value: "TrustBrick Trust Ltd." },
            { label: "Compliance", value: "Reg S / Reg D Compliant" },
          ].map((m) => (
            <div key={m.label}>
              <p className="text-[10px] text-on-surface-variant tracking-widest uppercase mb-2">{m.label}</p>
              <p className="text-xs font-bold text-on-surface">{m.value}</p>
            </div>
          ))}
        </footer>
      </div>
    </>
  );
}
