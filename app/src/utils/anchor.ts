import { AnchorProvider, Program, Idl, BN } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { Trustbrick } from "../../../target/types/trustbrick";
import idl from "../idl/trustbrick.json";

export const PROGRAM_ID = new PublicKey(idl.address);

// Идентификатор нашего первого объекта
export const PROJECT_ID = 1;

export function getProgram(provider: AnchorProvider): Program<Trustbrick> {
  return new Program(idl as Idl, provider) as unknown as Program<Trustbrick>;
}

export function getBuildingProjectPda(): PublicKey {
  const projectIdBuffer = new BN(PROJECT_ID).toArrayLike(Buffer, "le", 8);
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), projectIdBuffer],
    PROGRAM_ID
  );
  return pda;
}
