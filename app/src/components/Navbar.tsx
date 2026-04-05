"use client";

import ClientWalletButton from "./ClientWalletButton";
import { useLanguage } from "./LanguageContext";

export default function Navbar() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <header className="fixed top-0 right-0 left-64 z-50 flex justify-between items-center px-12 h-20 bg-[#0e0e0e]/70 backdrop-blur-xl border-b border-on-surface-variant/10">
      <div className="flex items-center gap-8">
        <span className="font-headline font-bold text-on-surface tracking-tighter text-lg uppercase">
          THE ARCHIVE
        </span>
        <div className="relative flex items-center group">
          <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-sm">
            search
          </span>
          <input
            className="bg-surface-container-low border-b border-outline-variant/30 text-[10px] tracking-widest uppercase pl-10 pr-4 py-2 w-64 focus:outline-none focus:border-primary transition-all text-on-surface placeholder:text-outline"
            placeholder="SEARCH ARCHIVE..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined">language</span>
          <span className="font-body text-xs font-medium uppercase tracking-widest">
            {language}
          </span>
        </button>
        <div className="relative text-on-surface-variant hover:text-primary transition-all cursor-pointer">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-primary"></span>
        </div>
        <div className="pl-4 border-l border-outline-variant/30">
          <ClientWalletButton />
        </div>
      </div>
    </header>
  );
}
