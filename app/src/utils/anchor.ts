import { AnchorProvider, BN, Idl, Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import idl from "@/idl/solana_counter.json";

export const PROGRAM_ID = new PublicKey(idl.address);

export const PROJECT_ID = 1;

export function getProgram(provider: AnchorProvider): Program<Idl> {
  return new Program(idl as unknown as Idl, provider);
}

export function getBuildingProjectPda(): PublicKey {
  const projectIdBuffer = new BN(PROJECT_ID).toArrayLike(Buffer, "le", 8);
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), projectIdBuffer],
    PROGRAM_ID
  );
  return pda;
}
