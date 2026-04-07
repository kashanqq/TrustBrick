"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Marketplace", icon: "storefront" },
  { href: "/portfolio", label: "Portfolio", icon: "pie_chart" },
  { href: "/exchange", label: "Exchange", icon: "swap_horiz" },
  { href: "/treasury", label: "Treasury", icon: "account_balance" },
  { href: "/assets", label: "Assets", icon: "account_balance_wallet" },
  { href: "/analytics", label: "Analytics", icon: "query_stats" },
  { href: "/reports", label: "Reports", icon: "description" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-full flex flex-col bg-[#0e0e0e] w-64 z-[60] border-r-0">
      {/* Logo */}
      <div className="p-8 pb-12">
        <Link href="/" className="block">
          <h1 className="text-xl font-bold tracking-tighter text-on-surface font-headline">
            TRUSTBRICK
          </h1>
          <p className="font-headline tracking-tight text-[10px] uppercase text-accent mt-1 opacity-80">
            Terminal v1.0
          </p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 font-headline tracking-tight text-sm uppercase transition-colors duration-300 ${
                isActive
                  ? "text-primary border-l-2 border-accent bg-surface-container-high"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom status */}
      <div className="p-8">
        <div className="bg-surface-container-low p-4 spectral-outline">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-accent"></div>
            <span className="text-[10px] tracking-widest text-on-surface-variant uppercase">
               
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
