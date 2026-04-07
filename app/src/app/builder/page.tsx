"use client";

import { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { getProgram, getBuildingProjectPda } from "@/utils/anchor";
import { AnchorProvider } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import Footer from "@/components/Footer";
import { PROJECTS } from "@/lib/projects";

export default function BuilderDashboard() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [projectBalances, setProjectBalances] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!wallet.publicKey) {
      setLoading(false);
      return;
    }

    try {
      // Fetch builder's personal wallet balance 
      const bal = await connection.getBalance(wallet.publicKey);
      setWalletBalance(bal / LAMPORTS_PER_SOL);

      if (!wallet.signTransaction) return;
      const provider = new AnchorProvider(connection, wallet as any, {});
      
      const balances: Record<number, number> = {};
      for (const proj of PROJECTS) {
        try {
          const pda = getBuildingProjectPda(proj.id);
          const pdaBalance = await connection.getBalance(pda);
          
          // Rent exemption is usually around 0.002 SOL, but let's just show total PDA balance
          balances[proj.id] = pdaBalance / LAMPORTS_PER_SOL;
        } catch(e) {
          balances[proj.id] = 0;
        }
      }
      setProjectBalances(balances);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 5 seconds to see incoming funds live
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [wallet.connected, connection]);

  return (
    <div className="p-12 min-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex flex-col mb-16">
        <div className="font-body text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-4 flex items-center gap-2">
          <span className="text-primary">Corporate Dashboard</span> <span className="text-outline">/</span>
          <span>Builder Portal</span>
        </div>
        <div className="flex justify-between items-end">
          <h1 className="font-headline text-6xl font-light tracking-tighter leading-none">
            Corporate <br />
            <span className="text-primary font-medium">Treasury</span>
          </h1>
          <div className="text-right">
            <p className="text-[10px] text-on-surface-variant tracking-widest uppercase mb-1">Company Balance</p>
            <p className="text-3xl font-headline font-bold text-primary">
              {walletBalance.toFixed(2)} <span className="text-lg text-on-surface-variant font-light">SOL</span>
            </p>
            <p className="text-[10px] text-on-surface-variant tracking-widest uppercase mt-1">Available Funds</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-9">
          <div className="bg-surface-container-low/50 border-t border-outline-variant/10 p-10">
            <h3 className="font-headline text-2xl font-light tracking-tighter uppercase mb-6">Escrow Contracts</h3>
            <p className="font-body text-sm text-on-surface-variant mb-10 max-w-2xl">
              These are the locked funds held in the Blockchain Escrow. 
              As the Oracle confirms construction stages, funds are automatically routed directly into your Company Balance.
            </p>

            <div className="space-y-6">
              {PROJECTS.map((proj) => {
                const escrowBal = projectBalances[proj.id] || 0;
                return (
                  <div key={proj.id} className="flex justify-between items-center p-6 bg-surface-container border border-outline-variant/10">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 overflow-hidden">
                        <img src={`/api/images/${proj.id}`} alt={proj.name} className="w-full h-full object-cover grayscale" />
                      </div>
                      <div>
                        <h4 className="font-headline text-xl font-bold">{proj.name}</h4>
                        <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">{proj.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-on-surface-variant tracking-widest uppercase mb-1">Locked in Escrow</p>
                      <p className="text-2xl font-headline font-light">{escrowBal.toFixed(2)} SOL</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-3 space-y-8">
          <div className="bg-surface-container-low p-8 spectral-outline">
            <h3 className="font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
              Payout Mechanics
            </h3>
            <p className="font-body text-xs text-on-surface-variant leading-relaxed">
              When the <span className="text-primary font-bold">Oracle</span> confirms a new construction stage has been met, 
              the Smart Contract automatically signs the release of a 20% tranche directly to the Builder Wallet. 
              <br/><br/>
              To test this, open the <a href="/oracle" className="text-primary underline" target="_blank">Oracle Portal</a>, confirm a stage, and watch your Company Balance instantly increase without any manual withdrawal!
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
