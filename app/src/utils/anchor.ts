import { AnchorProvider, Program, Idl } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { SolanaCounter } from "../../../target/types/solana_counter";
import idl from "../idl/solana_counter.json";

export const PROGRAM_ID = new PublicKey(idl.address);

// Идентификатор нашего первого объекта
export const PROJECT_ID = 1;

export function getProgram(provider: AnchorProvider): Program<SolanaCounter> {
  return new Program(idl as Idl, provider) as unknown as Program<SolanaCounter>;
}

export function getBuildingProjectPda(): PublicKey {
  const projectIdBuffer = Buffer.alloc(8);
  projectIdBuffer.writeBigUInt64LE(BigInt(PROJECT_ID));
  
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), projectIdBuffer],
    PROGRAM_ID
  );
  return pda;
}
