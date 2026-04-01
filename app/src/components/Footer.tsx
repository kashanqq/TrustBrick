export default function Footer() {
  return (
    <footer className="bg-slate-950 w-full py-12 px-8 border-t border-orange-900/10 mt-24 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-7xl mx-auto">
        <div className="space-y-4">
          <div className="text-slate-500 font-['Inter'] tabular-nums text-[10px] uppercase tracking-[0.1em]">
            © 2024 TRUSTBRICK ARCHITECTURAL LEDGER. SECURED BY SOLANA.
          </div>
          <div className="flex gap-6">
            <a className="text-slate-600 hover:text-orange-500 transition-colors text-[10px] uppercase tracking-[0.1em] font-['Inter'] font-bold" href="#">Terms of Issue</a>
            <a className="text-slate-600 hover:text-orange-500 transition-colors text-[10px] uppercase tracking-[0.1em] font-['Inter'] font-bold" href="#">Risk Disclosure</a>
            <a className="text-slate-600 hover:text-orange-500 transition-colors text-[10px] uppercase tracking-[0.1em] font-['Inter'] font-bold" href="#">Privacy</a>
            <a className="text-slate-600 hover:text-orange-500 transition-colors text-[10px] uppercase tracking-[0.1em] font-['Inter'] font-bold" href="#">Terminal Status</a>
          </div>
        </div>
        <div className="flex md:justify-end items-center gap-12">
          <div className="text-right">
            <div className="text-slate-500 text-[10px] uppercase tracking-[0.1em] mb-1">Network Capacity</div>
            <div className="text-orange-400 font-[family-name:var(--font-headline)] font-bold">65,000 TPS</div>
          </div>
          <div className="text-right">
            <div className="text-slate-500 text-[10px] uppercase tracking-[0.1em] mb-1">Active Collateral</div>
            <div className="text-orange-400 font-[family-name:var(--font-headline)] font-bold">$1.2B USD</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
