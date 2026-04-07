"use client";

import Footer from "@/components/Footer";

export default function Reports() {
  return (
    <>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="px-12 py-16">
          <div className="grid grid-cols-12 gap-12 items-end">
            <div className="col-span-12 lg:col-span-8">
              <span className="font-label text-[10px] tracking-[0.4em] text-primary uppercase mb-6 block">
                Reporting Interface
              </span>
              <h2 className="text-7xl font-headline font-light tracking-tight text-on-surface leading-[0.9] mb-8 max-w-2xl">
                Rigorous <br />
                <span className="font-bold text-primary italic">Financial Memory.</span>
              </h2>
              <p className="font-body text-on-surface-variant text-lg leading-relaxed max-w-xl">
                Access the terminal&apos;s repository of cryptographic audits and institutional summaries.
                Every record is immutable, timestamped, and verified by the vault.
              </p>
            </div>
            <div className="col-span-12 lg:col-span-4 flex justify-end">
              <div className="bg-surface-container-low p-12 w-full max-w-sm flex flex-col gap-4">
                <div className="text-4xl font-headline font-bold text-on-surface">942</div>
                <div className="text-[10px] font-label tracking-widest text-on-surface-variant uppercase border-t border-outline-variant pt-4">
                  Total Documents in Vault
                </div>
                <div className="flex gap-2 items-center mt-4">
                  <div className="h-1 flex-1 bg-primary"></div>
                  <div className="h-1 flex-1 bg-outline-variant"></div>
                  <div className="h-1 flex-1 bg-outline-variant"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Periodic Library */}
        <section className="px-12 py-24 bg-surface-container-low">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h3 className="font-headline text-3xl font-bold tracking-tight text-on-surface mb-2">Periodic Library</h3>
              <p className="font-body text-sm text-on-surface-variant">Scheduled institutional performance records.</p>
            </div>
            <button className="px-6 py-2 border border-outline-variant hover:border-primary text-[10px] font-label tracking-[0.2em] uppercase transition-all">
              View Full Archive
            </button>
          </div>
          <div className="grid grid-cols-12 gap-6">
            {/* Q3 Featured Card */}
            <div className="col-span-12 md:col-span-8 group relative overflow-hidden bg-surface-container h-[420px]">
              <div className="absolute inset-0 z-0 opacity-40">
                <img
                  alt="Q3 Performance"
                  className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpB-B2YdvY0yhSIOiG7xQWunOoqPRblA49H_ehqoZ0tqqPfm-bggrSwc_iWPpuf3X6ieo2LWsr6WGpa21ov3uJgbPfd2LKWOrFvGWXZ2KbwNiDRVMEFmJmSEEoq-Fi4GKJ5F38xShTVYCQHqQoGPfUFm22n0LUebxKg3D8nAenKffFRwtJJ_4oZ6yRtRDwApx1ii92muTtJNCTH5fnz-ncmMjVRooLR0GVYC05QUn7syLyNBQwRtk_2c23Rkdk1OLDEanggAX_x6L7"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent z-10"></div>
              <div className="relative z-20 h-full p-12 flex flex-col justify-end">
                <span className="text-primary text-[10px] font-label tracking-widest uppercase mb-4">Quarterly Recap</span>
                <h4 className="text-4xl font-headline font-bold text-on-surface mb-4">Q3 Performance Summary</h4>
                <p className="text-on-surface-variant text-sm max-w-md mb-8">
                  Comprehensive analysis of yield generation, risk exposure, and treasury growth across the
                  sovereign portfolio for the third fiscal period.
                </p>
                <div className="flex gap-4">
                  <button className="bg-primary text-on-primary px-8 py-3 font-label text-[10px] tracking-widest uppercase font-bold">
                    Open Document
                  </button>
                  <button className="border border-outline-variant text-on-surface px-8 py-3 font-label text-[10px] tracking-widest uppercase hover:bg-surface-container-high transition-all">
                    Export PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Annual Audit Card */}
            <div className="col-span-12 md:col-span-4 bg-surface-container p-10 flex flex-col border-l-4 border-primary">
              <div className="flex justify-between mb-12">
                <span className="material-symbols-outlined text-primary text-3xl">verified_user</span>
                <span className="text-[10px] font-label text-on-surface-variant tracking-tighter">FY 2023-24</span>
              </div>
              <h4 className="text-2xl font-headline font-bold text-on-surface mb-4 leading-tight">
                Annual Institutional Audit
              </h4>
              <p className="text-on-surface-variant text-xs mb-auto">
                Verified by independent sovereign nodes. Full compliance ledger including on-chain
                transaction hashes and cold-storage verification.
              </p>
              <div className="mt-8 pt-8 border-t border-outline-variant/30">
                <div className="flex items-center justify-between text-xs font-label text-on-surface">
                  <span>Status: Verified</span>
                  <span className="material-symbols-outlined text-sm">lock</span>
                </div>
              </div>
            </div>

            {/* Treasury Allocation */}
            <div className="col-span-12 md:col-span-5 bg-surface-container h-[300px] p-10 flex flex-col justify-between">
              <div>
                <h4 className="text-xl font-headline font-medium text-on-surface mb-2">Treasury Allocation</h4>
                <div className="text-[10px] font-label tracking-widest text-on-surface-variant uppercase">Real-time Balance Sheet</div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-label uppercase">
                  <span className="text-on-surface-variant">Liquidity Pool</span>
                  <span className="text-on-surface">62%</span>
                </div>
                <div className="w-full bg-outline-variant h-1 overflow-hidden">
                  <div className="bg-primary h-full w-[62%]"></div>
                </div>
                <div className="flex justify-between text-[10px] font-label uppercase">
                  <span className="text-on-surface-variant">Long-term Vault</span>
                  <span className="text-on-surface">38%</span>
                </div>
                <div className="w-full bg-outline-variant h-1 overflow-hidden">
                  <div className="bg-primary h-full w-[38%] opacity-50"></div>
                </div>
              </div>
              <a className="text-[10px] font-label text-primary tracking-widest uppercase hover:underline" href="#">
                View Allocation History →
              </a>
            </div>

            {/* Report Builder */}
            <div className="col-span-12 md:col-span-7 bg-surface-bright p-10 flex items-center">
              <div className="grid grid-cols-2 gap-12 w-full">
                <div>
                  <h4 className="text-xl font-headline font-bold text-on-surface mb-4">Report Builder</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Synthesize custom data views using the terminal&apos;s analytical engine. Select modules to
                    generate an instant institutional overview.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="bg-surface-container-highest p-4 flex justify-between items-center group cursor-pointer hover:bg-surface-variant">
                    <span className="text-[10px] font-label tracking-widest uppercase text-on-surface">Portfolio Delta</span>
                    <span className="material-symbols-outlined text-sm text-outline-variant group-hover:text-primary">add</span>
                  </div>
                  <div className="bg-surface-container-highest p-4 flex justify-between items-center group cursor-pointer hover:bg-surface-variant">
                    <span className="text-[10px] font-label tracking-widest uppercase text-on-surface">Exposure Matrix</span>
                    <span className="material-symbols-outlined text-sm text-outline-variant group-hover:text-primary">add</span>
                  </div>
                  <button className="mt-2 bg-primary text-on-primary py-3 font-label text-[10px] font-bold uppercase tracking-[0.2em]">
                    Generate View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Compliance Vault */}
        <section className="px-12 py-32">
          <div className="flex flex-col md:flex-row gap-20">
            <div className="w-full md:w-1/3">
              <h3 className="font-headline text-5xl font-bold tracking-tighter text-on-surface leading-[0.8] mb-12">
                Compliance <br />Vault Access
              </h3>
              <div className="space-y-12">
                <div>
                  <div className="text-[10px] font-label tracking-widest text-primary uppercase mb-2">Protocol 01</div>
                  <p className="text-sm text-on-surface-variant font-light">
                    All reports are signed with a 256-bit institutional private key, ensuring absolute non-repudiation of financial claims.
                  </p>
                </div>
                <div>
                  <div className="text-[10px] font-label tracking-widest text-primary uppercase mb-2">Protocol 02</div>
                  <p className="text-sm text-on-surface-variant font-light">
                    Access is logged via multi-sig authorization. Your terminal signature is currently active.
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full md:w-2/3">
              <div className="bg-surface-container-low overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/30 text-[10px] font-label tracking-[0.2em] text-on-surface-variant uppercase">
                      <th className="py-6 px-8">ID</th>
                      <th className="py-6 px-8">Document Name</th>
                      <th className="py-6 px-8">Date</th>
                      <th className="py-6 px-8">Verification</th>
                      <th className="py-6 px-8"></th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-body">
                    {[
                      { id: "#AUD-992", name: "Anti-Money Laundering Cert", date: "Sep 12, 2023" },
                      { id: "#AUD-988", name: "KYC Omnibus Ledger", date: "Aug 30, 2023" },
                      { id: "#TAX-441", name: "Jurisdictional Tax Summary", date: "Aug 15, 2023" },
                      { id: "#LGL-002", name: "Regulatory Variance Report", date: "Jul 22, 2023" },
                    ].map((doc) => (
                      <tr key={doc.id} className="border-b border-outline-variant/10 hover:bg-surface-container transition-colors">
                        <td className="py-6 px-8 font-mono text-primary-dim">{doc.id}</td>
                        <td className="py-6 px-8 text-on-surface font-semibold">{doc.name}</td>
                        <td className="py-6 px-8 text-on-surface-variant uppercase">{doc.date}</td>
                        <td className="py-6 px-8">
                          <span className="flex items-center gap-2 text-[10px] font-label uppercase text-on-surface-variant">
                            <span className="w-1.5 h-1.5 bg-primary"></span> HASHED
                          </span>
                        </td>
                        <td className="py-6 px-8 text-right">
                          <span className="material-symbols-outlined text-outline-variant cursor-pointer hover:text-on-surface">download</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
