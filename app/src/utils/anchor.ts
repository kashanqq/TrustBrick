import { AnchorProvider, Program, Idl, BN } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { Trustbrick } from "../../../target/types/trustbrick";
import idl from "../idl/trustbrick.json";

export const PROGRAM_ID = new PublicKey(idl.address);

export function getProgram(provider: AnchorProvider): Program<Trustbrick> {
  return new Program(idl as Idl, provider) as unknown as Program<Trustbrick>;
}

// Удаляем хардкод PROJECT_ID
export function getBuildingProjectPda(projectId: number): PublicKey {
  const projectIdBuffer = new BN(projectId).toArrayLike(Buffer, "le", 8);
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), projectIdBuffer],
    PROGRAM_ID
  );
  return pda;
}
