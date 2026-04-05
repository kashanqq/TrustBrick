"use client";

import { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { getProgram, getBuildingProjectPda, PROJECT_ID } from "@/utils/anchor";
import { AnchorProvider, BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import Footer from "@/components/Footer";
import { useLanguage } from "@/components/LanguageContext";

const GOAL_SOL = 50; 

export default function Home() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { t } = useLanguage();
  
  const [totalInvested, setTotalInvested] = useState(0);
  const [stage, setStage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [investing, setInvesting] = useState(false);

  // Автоматический airdrop на локальном валидаторе
  useEffect(() => {
    if (!wallet.publicKey || !wallet.connected) return;
    const endpoint = connection.rpcEndpoint;
    if (endpoint.includes("localhost") || endpoint.includes("127.0.0.1")) {
      connection.getBalance(wallet.publicKey).then((bal) => {
        if (bal < LAMPORTS_PER_SOL) {
          console.log("Localnet: airdrop 2 SOL to", wallet.publicKey!.toBase58());
          connection.requestAirdrop(wallet.publicKey!, 2 * LAMPORTS_PER_SOL)
            .then((sig) => connection.confirmTransaction(sig))
            .catch((e) => console.warn("Airdrop failed:", e));
        }
      });
    }
  }, [wallet.publicKey, wallet.connected, connection]);

  const fetchProjectData = async () => {
    try {
      if (!wallet.publicKey) return;
      const pda = getBuildingProjectPda();

      // Читаем аккаунт напрямую через connection (не требует SOL)
      const accountInfo = await connection.getAccountInfo(pda);
      if (!accountInfo) {
        console.log("Контракт еще не инициализирован (PDA не найден). Ожидание инициализации Оракулом.");
        return;
      }

      // Парсим BuildingProject вручную:
      // 8 (discriminator) + 32 (admin) + 32 (builder) + 8 (total_invested) + 8 (released_amount) + 1 (stage) + 8 (project_id)
      const data = accountInfo.data;
      const totalInvestedBytes = data.subarray(8 + 32 + 32, 8 + 32 + 32 + 8);
      const totalInvestedBN = new BN(totalInvestedBytes, "le");
      const investedSol = totalInvestedBN.toNumber() / LAMPORTS_PER_SOL;
      const stageByte = data[8 + 32 + 32 + 8 + 8]; // after released_amount
      
      setTotalInvested(investedSol);
      setStage(stageByte);
    } catch (err: any) {
      console.error("Не удалось прочитать контракт:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (wallet.connected) {
      fetchProjectData();
    } else {
      setLoading(false);
    }
  }, [wallet.connected, connection]);

  const handleInvest = async () => {
    if (!wallet.connected || !wallet.publicKey) return;
    try {
      setInvesting(true);
      const provider = new AnchorProvider(connection, wallet as any, { preflightCommitment: "confirmed" });
      const program = getProgram(provider);
      
      const investAmount = new BN(1 * LAMPORTS_PER_SOL); 
      
      // Внимание: смарт-контракт теперь требует SPL Token логику.
      // Для корректной работы нужны pdaTokenInventory и investorTokenAccount.
      // const tx = await program.methods.buyShares(new BN(PROJECT_ID), investAmount)
      //   .accounts({ 
      //      investor: wallet.publicKey,
      //      pdaTokenInventory: ..., 
      //      investorTokenAccount: ... 
      //   })
      //   .rpc();
      const tx = "mock-tx-signature-skip-contract"; // Убрать после интеграции SPL টокенов в UI

      try {
        await fetch("/api/mint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            investor: wallet.publicKey.toBase58(),
            amount: 1, 
            txSignature: tx
          })
        });
        alert("✅ Инвестиция принята. Доля приобретена!");
      } catch (backendErr) {
        console.error("Бэкенд не смог выдать NFT:", backendErr);
      }

      await fetchProjectData();

    } catch (err: any) {
      console.error("Ошибка при инвестировании:", err);
      alert("Ошибка транзакции: " + err.message);
    } finally {
      setInvesting(false);
    }
  };

  const progressPercent = Math.min((totalInvested / GOAL_SOL) * 100, 100);

  return (
    <>
      <main className="pt-24 pb-20 min-h-[calc(100vh-80px)]">
        <section className="max-w-7xl mx-auto px-8 mb-16 relative z-10">
            <div className="relative overflow-hidden rounded-xl h-[420px] group border border-outline-variant/20">
                <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt="Hero Building"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1ggLQ6Hf5RWRFs0pUwWO4zxDOZmT-Fz2dEzdMzX6NCiOwKMPU2TB17qsfqX_g81l_FwMJcGxg_E0_DSuwAyXBo74yG2LNsJEZeC67CTr7arUA37EPn27a5GiW7pNJi8C5PGlBmYXv4A82xVHsIWCHjNjReyTDCXfm4YSDtIJIZP-Tv6hbGm9Mh51S6FakMVaw56xutdHu-New4tbdtaXl2WAsmpijzl9KjiwfDnsQu-zKbDm26qmJ6bITdVF_Z4sbebrs2PnhVB0" />
                <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/80 to-transparent"></div>
                <div className="relative h-full flex flex-col justify-center px-12 max-w-2xl">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-8 h-[1px] bg-primary"></span>
                        <span className="text-secondary tracking-[0.2em] uppercase text-xs font-bold">{t("hero.subtitle")}</span>
                    </div>
                    <h1 className="text-6xl font-headline font-bold text-white leading-tight mb-6 tracking-tight">{t("hero.title")}</h1>
                    <p className="text-on-surface-variant text-lg mb-8 leading-relaxed max-w-lg">{t("hero.desc")}</p>
                    <div className="flex gap-4">
                        <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary-fixed font-bold px-8 py-3 rounded flex items-center gap-2 hover:brightness-110 transition-all">
                            {t("hero.btn.explore")}
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                        <button className="bg-surface-container-highest/80 backdrop-blur text-white px-8 py-3 rounded border border-white/10 hover:bg-surface-container-highest transition-colors">
                            {t("hero.btn.whitepaper")}
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <section className="max-w-7xl mx-auto px-8 mb-16 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-surface-container-low p-6 rounded-lg border-l-2 border-primary">
                    <div className="text-secondary text-[10px] uppercase tracking-widest mb-1">{t("stats.tvl")}</div>
                    <div className="text-2xl font-headline font-bold tabular-nums">$1,248,592,010</div>
                </div>
                <div className="bg-surface-container-low p-6 rounded-lg border-l-2 border-secondary">
                    <div className="text-secondary text-[10px] uppercase tracking-widest mb-1">{t("stats.tps")}</div>
                    <div className="text-2xl font-headline font-bold tabular-nums">65,000 TPS</div>
                </div>
                <div className="bg-surface-container-low p-6 rounded-lg border-l-2 border-tertiary">
                    <div className="text-secondary text-[10px] uppercase tracking-widest mb-1">{t("stats.investors")}</div>
                    <div className="text-2xl font-headline font-bold tabular-nums">14,802</div>
                </div>
                <div className="bg-surface-container-low p-6 rounded-lg border-l-2 border-primary-container">
                    <div className="text-secondary text-[10px] uppercase tracking-widest mb-1">{t("stats.yield")}</div>
                    <div className="text-2xl font-headline font-bold tabular-nums text-tertiary">14.2% AVG</div>
                </div>
            </div>
        </section>

        <section className="max-w-7xl mx-auto px-8 mb-20 relative z-10">
            <h2 className="text-xl font-headline font-bold mb-6 flex items-center gap-2 border-b border-outline-variant/20 pb-4">
                <span className="material-symbols-outlined text-primary">trending_up</span>
                {t("trending.title")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface-container p-6 rounded-xl hover:bg-surface-container-high transition-all group border border-outline-variant/10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="text-on-surface-variant text-xs uppercase tracking-wider mb-1">{t("trending.hot")}</div>
                            <h3 className="font-headline font-bold text-lg">Hackathon Tower</h3>
                        </div>
                        <span className="text-tertiary bg-tertiary/10 px-2 py-1 rounded text-xs font-bold">+18.4% APY</span>
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                            <div className="text-2xl font-headline font-bold tabular-nums">1 SOL</div>
                            <div className="text-[10px] text-slate-500">{t("trending.unitPrice")} (1 SOL)</div>
                        </div>
                        <img className="w-16 h-16 rounded-lg object-cover grayscale group-hover:grayscale-0 transition-all border border-outline-variant/20"
                            alt="Hackathon Tower"
                            src="/stage-1.png" />
                    </div>
                </div>
                <div className="bg-surface-container p-6 rounded-xl hover:bg-surface-container-high transition-all group border border-outline-variant/10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="text-on-surface-variant text-xs uppercase tracking-wider mb-1">{t("trending.new")}</div>
                            <h3 className="font-headline font-bold text-lg">Dubai Marina Loft</h3>
                        </div>
                        <span className="text-tertiary bg-tertiary/10 px-2 py-1 rounded text-xs font-bold">+12.1% APY</span>
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                            <div className="text-2xl font-headline font-bold tabular-nums">$245.00</div>
                            <div className="text-[10px] text-slate-500">{t("trending.unitPrice")} (0.32 SOL)</div>
                        </div>
                        <img className="w-16 h-16 rounded-lg object-cover grayscale group-hover:grayscale-0 transition-all border border-outline-variant/20"
                            alt="Dubai Loft"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8-Ow4CT9O_b08CJzLH74d60idNlxIoBH7UzkjQS-vx7xqBbcH45NyTKJTKCpJpHIZes0MLfvZFr9Zd4IXP7OHljfP7mh511HMDph6zc4CbnD_Z3VhDc6SmGMyMVlOwGpoK4s42k6a4eEfi9HA3xeQIJEL5QUH7AI38EhLBNqwp-h8Kmp2-h-Vgn0YGz7D5Z3t6QI3qppS98eKFbvkV00_IIdJf_jsUGlWcjXofSU8wP18zEaHBdACT3UHNPaj_01ZGBVWLRfsXuI" />
                    </div>
                </div>
                <div className="bg-surface-container p-6 rounded-xl hover:bg-surface-container-high transition-all group border border-outline-variant/10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="text-on-surface-variant text-xs uppercase tracking-wider mb-1">{t("trending.stable")}</div>
                            <h3 className="font-headline font-bold text-lg">London Fin-Center</h3>
                        </div>
                        <span className="text-tertiary bg-tertiary/10 px-2 py-1 rounded text-xs font-bold">+9.8% APY</span>
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                            <div className="text-2xl font-headline font-bold tabular-nums">$412.80</div>
                            <div className="text-[10px] text-slate-500">{t("trending.unitPrice")} (0.45 SOL)</div>
                        </div>
                        <img className="w-16 h-16 rounded-lg object-cover grayscale group-hover:grayscale-0 transition-all border border-outline-variant/20"
                            alt="London Fin-Center"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDu5WjZc2WvbANMGyfH2zyZszN6UzoArtH9m9sZgPqH0nrvyFTkRUeGZWeMvD9FuAWQFjuFyUtInMKmtK6dWDifTmgkde0HQWVJMO-nw3G-pqJH-wekySt4EiiVEHcaZIaYnrx-XBoe5IVzgmYmLJNsKmaqgan1gm5qjy8YXSOte2ovQsXpA1MGpe3YZdOpRFFRCqSKgjgQg0dU8z6ejNqd_225nUxGiPsS83toSJyBLb2o44DO1vmoMhjdd5hUvUlvNqftDvFgIQA" />
                    </div>
                </div>
            </div>
        </section>

        <section className="max-w-7xl mx-auto px-8 relative z-10">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-headline font-bold border-l-4 border-primary pl-4">{t("ledger.title")}</h2>
                <div className="flex gap-4">
                    <button className="text-sm font-bold text-primary border-b-2 border-primary pb-1">{t("ledger.all")}</button>
                    <button className="text-sm text-slate-500 hover:text-white transition-colors pb-1">{t("ledger.residential")}</button>
                    <button className="text-sm text-slate-500 hover:text-white transition-colors pb-1">{t("ledger.commercial")}</button>
                    <button className="text-sm text-slate-500 hover:text-white transition-colors pb-1">{t("ledger.industrial")}</button>
                </div>
            </div>
            <div className="overflow-x-auto bg-surface-container-low rounded-xl border border-outline-variant/10 p-4">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-[10px] uppercase tracking-widest text-slate-500 border-b border-white/5">
                            <th className="pb-4 pt-2 px-4 font-normal">{t("ledger.col.project")}</th>
                            <th className="pb-4 pt-2 px-4 font-normal">{t("ledger.col.apy")}</th>
                            <th className="pb-4 pt-2 px-4 font-normal">{t("ledger.col.price")}</th>
                            <th className="pb-4 pt-2 px-4 font-normal">{t("ledger.col.progress")}</th>
                            <th className="pb-4 pt-2 px-4 font-normal text-right">{t("ledger.col.action")}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        <tr className="group hover:bg-surface-container transition-colors">
                            <td className="py-5 px-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded overflow-hidden bg-slate-800 flex-shrink-0">
                                        <img className="w-full h-full object-cover" alt="Hackathon Tower" src="/stage-1.png" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-100">Hackathon Tower</div>
                                        <div className="text-[10px] text-slate-500">SOL-0001 • LIVE</div>
                                    </div>
                                </div>
                            </td>
                            <td className="py-5 px-4 tabular-nums text-tertiary font-bold">18.42%</td>
                            <td className="py-5 px-4">
                                <div className="tabular-nums font-bold">1.0 SOL</div>
                            </td>
                            <td className="py-5 px-4">
                                <div className="w-full max-w-[200px]">
                                    <div className="flex justify-between text-[10px] mb-1 tabular-nums text-slate-400 font-bold">
                                        <span>{progressPercent.toFixed(1)}% Filled</span>
                                        <span>{totalInvested} / {GOAL_SOL} SOL</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary shadow-[0_0_10px_rgba(255,181,157,0.5)] transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                                    </div>
                                </div>
                            </td>
                            <td className="py-5 px-4 text-right">
                                <button
                                    onClick={handleInvest}
                                    disabled={!wallet.connected || loading || investing}
                                    className="px-6 py-2.5 bg-primary/20 text-primary font-bold text-xs rounded hover:bg-primary hover:text-on-primary-fixed transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                    {investing ? t("project.investing") : t("project.investButton")}
                                </button>
                            </td>
                        </tr>
                        
                        <tr className="group hover:bg-surface-container transition-colors">
                            <td className="py-5 px-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded overflow-hidden bg-slate-800 flex-shrink-0">
                                        <img className="w-full h-full object-cover" alt="Dubai" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFesfW_XkXgZYUyiHU-gnSPGw3agfOeBeCoQ8YDksWKNAeLaz-Le99GVlpxJFd_tmqDizDlHJuVtFu2aO348RdZBYDvMzekLH5wkK6rC-cwgVMiP4WL_utal6oTBx6QrJb_inhEvVHN7ndlnO_lQQZFMR-Jfsx6tA3TEI8GEqW5DzCboUo6GjGG8OfiCJipCxga7xcEWfPi74_q9r3BQhmNDtz1lutrfgxS0e0z47wMd9ZQsOkG5JQoNYOelcgzpl8PpYb9g69Ajs" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-100">Dubai Marina Loft</div>
                                        <div className="text-[10px] text-slate-500">UAE-8812 • Exclusive</div>
                                    </div>
                                </div>
                            </td>
                            <td className="py-5 px-4 tabular-nums text-tertiary font-bold">12.10%</td>
                            <td className="py-5 px-4">
                                <div className="tabular-nums font-bold">$245.00</div>
                                <div className="text-[10px] text-slate-500">0.32 SOL</div>
                            </td>
                            <td className="py-5 px-4">
                                <div className="w-full max-w-[200px]">
                                    <div className="flex justify-between text-[10px] mb-1 tabular-nums text-slate-400">
                                        <span>42% Filled</span>
                                        <span>$12M / $30M</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-500" style={{ width: '42%' }}></div>
                                    </div>
                                </div>
                            </td>
                            <td className="py-5 px-4 text-right">
                                <button className="px-6 py-2.5 bg-slate-800 text-slate-400 font-bold text-xs rounded hover:text-white transition-all">
                                    {t("ledger.btn.mint")}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="mt-8 flex justify-center">
                <button className="text-sm font-bold text-secondary flex items-center gap-2 group hover:text-primary transition-colors">
                    {t("ledger.btn.more")}
                    <span className="material-symbols-outlined transition-transform group-hover:translate-x-1" data-icon="keyboard_double_arrow_right">keyboard_double_arrow_right</span>
                </button>
            </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
