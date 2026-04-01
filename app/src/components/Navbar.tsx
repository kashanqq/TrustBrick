"use client";

import Link from "next/link";
import ClientWalletButton from "./ClientWalletButton";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { publicKey } = useWallet();
  const pathname = usePathname();
  
  const isAdmin = publicKey?.toBase58() === "7jvMuWwUXK9ZWLQjx1qztngpoUzDJhyDCVPe38E7iWyZ";

  const getLinkClass = (path: string) => {
    return pathname === path 
      ? "text-orange-500 border-b-2 border-orange-600 pb-1 h-full flex items-center"
      : "text-slate-400 hover:text-slate-100 transition-colors h-full flex items-center";
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950/60 backdrop-blur-xl shadow-[0_32px_64px_-15px_rgba(218,226,253,0.06)]">
      <div className="flex justify-between items-center px-8 h-20 w-full max-w-screen-2xl mx-auto font-['Space_Grotesk'] tracking-tight">
        <div className="flex items-center gap-12">
          <Link href="/" className="text-2xl font-bold tracking-tighter text-slate-50 uppercase">TrustBrick</Link>
          <div className="hidden md:flex gap-8 items-center h-full">
            <Link className={getLinkClass('/')} href="/">Marketplace</Link>
            <Link className={getLinkClass('/portfolio')} href="/portfolio">Portfolio</Link>
            <Link className={getLinkClass('/exchange')} href="/exchange">Exchange</Link>
            {isAdmin && (
               <Link className={getLinkClass('/admin')} href="/admin">Admin</Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ClientWalletButton />
          <div className="flex gap-2">
            <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-slate-800/40 transition-all rounded">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
