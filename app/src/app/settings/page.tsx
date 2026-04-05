"use client";

import Footer from "@/components/Footer";

export default function Settings() {
  return (
    <>
      <div className="max-w-[1400px] mx-auto p-12 lg:p-20">
        {/* Page Header */}
        <div className="grid grid-cols-12 gap-8 mb-24">
          <div className="col-span-12 lg:col-span-4">
            <h1 className="font-headline text-5xl font-bold tracking-tighter leading-none">
              SYSTEM<br />CONTROL
            </h1>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-6 flex flex-col justify-end">
            <p className="font-body text-on-surface-variant leading-relaxed max-w-md">
              Manage your institutional parameters, API integrations, and sovereign identity controls.
              All changes are logged to the immutable ledger.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-12">
          {/* Profile & Identity */}
          <section className="col-span-12 lg:col-span-8 space-y-12">
            {/* Account Profile */}
            <div className="bg-surface-container-low p-10 spectral-outline group hover:bg-surface-container transition-colors duration-500">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <span className="font-label text-[10px] tracking-[0.3em] text-primary uppercase mb-2 block">
                    Institutional Identity
                  </span>
                  <h2 className="font-headline text-2xl font-semibold tracking-tight">Account Profile</h2>
                </div>
                <button className="px-6 py-2 border border-outline-variant/30 text-[10px] tracking-[0.2em] uppercase hover:border-primary hover:text-primary transition-all">
                  Edit Identity
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="space-y-1">
                    <label className="font-label text-[9px] tracking-widest text-on-surface-variant uppercase">User Handle</label>
                    <p className="text-on-surface font-medium border-b border-outline-variant/20 pb-2">Institutional_User</p>
                  </div>
                  <div className="space-y-1">
                    <label className="font-label text-[9px] tracking-widest text-on-surface-variant uppercase">Institution</label>
                    <p className="text-on-surface font-medium border-b border-outline-variant/20 pb-2">Sovereign Asset Management</p>
                  </div>
                  <div className="space-y-1">
                    <label className="font-label text-[9px] tracking-widest text-on-surface-variant uppercase">Email Vector</label>
                    <p className="text-on-surface font-medium border-b border-outline-variant/20 pb-2">terminal-ops@sovereign.io</p>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-8 bg-surface-container-lowest spectral-outline">
                  <div className="w-24 h-24 mb-6 relative bg-surface-container-high flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">person</span>
                    <div className="absolute inset-0 border border-primary/20"></div>
                  </div>
                  <span className="text-[10px] tracking-widest uppercase text-on-surface-variant">Update Biometrics</span>
                </div>
              </div>
            </div>

            {/* API Management */}
            <div className="bg-surface-container-low p-10 spectral-outline">
              <div className="flex justify-between items-end mb-10">
                <div>
                  <span className="font-label text-[10px] tracking-[0.3em] text-primary uppercase mb-2 block">Access Protocols</span>
                  <h2 className="font-headline text-2xl font-semibold tracking-tight">API Management</h2>
                </div>
                <button className="bg-primary text-on-primary px-8 py-3 font-label text-[10px] tracking-widest uppercase font-bold">
                  Generate New Key
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-body">
                  <thead>
                    <tr className="border-b border-outline-variant/20">
                      <th className="py-4 font-label text-[9px] tracking-widest text-on-surface-variant uppercase">Label</th>
                      <th className="py-4 font-label text-[9px] tracking-widest text-on-surface-variant uppercase">Endpoint</th>
                      <th className="py-4 font-label text-[9px] tracking-widest text-on-surface-variant uppercase">Status</th>
                      <th className="py-4 font-label text-[9px] tracking-widest text-on-surface-variant uppercase text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {[
                      { label: "Production Mainnet", endpoint: "https://api.trustbrick.io/v1/live", active: true },
                      { label: "Staging Terminal", endpoint: "https://api.trustbrick.io/v1/test", active: true },
                      { label: "Archive Read-Only", endpoint: "https://api.trustbrick.io/v1/hist", active: false },
                    ].map((api) => (
                      <tr key={api.label} className="border-b border-outline-variant/10 hover:bg-surface-container-high transition-colors">
                        <td className="py-6 font-medium">{api.label}</td>
                        <td className="py-6 text-on-surface-variant font-mono">{api.endpoint}</td>
                        <td className="py-6">
                          <span className="inline-flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 ${api.active ? "bg-[#4caf50]" : "bg-outline-variant"}`}></span>
                            <span className={`uppercase tracking-widest text-[10px] ${api.active ? "" : "text-on-surface-variant"}`}>
                              {api.active ? "Active" : "Disabled"}
                            </span>
                          </span>
                        </td>
                        <td className="py-6 text-right">
                          <button className={`uppercase tracking-widest text-[9px] hover:underline ${api.active ? "text-primary" : "text-on-surface-variant hover:text-on-surface"}`}>
                            {api.active ? "Revoke" : "Enable"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Configuration Sidebar */}
          <aside className="col-span-12 lg:col-span-4 space-y-12">
            {/* Theme Switcher */}
            <div className="bg-surface-container-low p-8 spectral-outline">
              <span className="font-label text-[10px] tracking-[0.3em] text-primary uppercase mb-6 block">Environment</span>
              <h3 className="font-headline text-lg font-semibold tracking-tight mb-8">Display Theme</h3>
              <div className="flex flex-col gap-4">
                <button className="w-full flex items-center justify-between p-4 bg-surface-container-high border-l-2 border-primary text-on-surface">
                  <span className="text-xs uppercase tracking-widest font-medium">Obsidian (Dark)</span>
                  <span className="material-symbols-outlined text-primary">radio_button_checked</span>
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-surface-container-lowest border-l-2 border-transparent text-on-surface-variant hover:bg-surface-container-high transition-all">
                  <span className="text-xs uppercase tracking-widest font-medium">Parchment (Light)</span>
                  <span className="material-symbols-outlined">radio_button_unchecked</span>
                </button>
              </div>
            </div>

            {/* Language */}
            <div className="bg-surface-container-low p-8 spectral-outline">
              <span className="font-label text-[10px] tracking-[0.3em] text-primary uppercase mb-6 block">Localization</span>
              <h3 className="font-headline text-lg font-semibold tracking-tight mb-6">Language Switcher</h3>
              <div className="relative">
                <select className="w-full bg-surface-container-lowest border-b border-outline-variant/40 rounded-none text-xs uppercase tracking-[0.2em] py-4 px-0 focus:ring-0 focus:border-primary appearance-none cursor-pointer text-on-surface">
                  <option value="EN">English (Global Institutional)</option>
                  <option value="RU">Russian (Русский)</option>
                  <option value="JP">Japanese (Nihongo)</option>
                  <option value="DE">German (Deutsch)</option>
                </select>
                <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                  unfold_more
                </span>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-surface-container-low p-8 spectral-outline">
              <span className="font-label text-[10px] tracking-[0.3em] text-primary uppercase mb-6 block">Data Streams</span>
              <h3 className="font-headline text-lg font-semibold tracking-tight mb-8">Notification Routing</h3>
              <div className="space-y-6">
                {[
                  { label: "Direct Messages", desc: "Internal secure comms", on: true },
                  { label: "Trade Execution", desc: "Real-time settlement alerts", on: true },
                  { label: "Security Audits", desc: "Weekly integrity reports", on: false },
                ].map((n) => (
                  <div key={n.label} className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium">{n.label}</span>
                      <span className="text-[10px] text-on-surface-variant">{n.desc}</span>
                    </div>
                    <div className={`w-10 h-5 ${n.on ? "bg-primary" : "bg-surface-container-high"} relative cursor-pointer`}>
                      <div className={`absolute ${n.on ? "right-1" : "left-1"} top-1 w-3 h-3 ${n.on ? "bg-on-primary" : "bg-outline"}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Status */}
            <div className="p-8 bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-4 mb-4">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                <span className="text-[10px] tracking-[0.3em] font-bold text-primary uppercase">Security Tier 3</span>
              </div>
              <p className="text-[11px] leading-relaxed text-on-primary-container">
                Your terminal is operating under full encryption protocols. Hardware security keys are
                required for all asset movements exceeding 5.0M USD equivalent.
              </p>
            </div>
          </aside>
        </div>

        <Footer />
      </div>
    </>
  );
}
