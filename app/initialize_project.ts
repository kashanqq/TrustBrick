
const anchor = require("@coral-xyz/anchor");
const { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } = require("@solana/web3.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

async function main() {
    const idlPath = path.join(__dirname, "src/idl/trustbrick.json");
    const idl = JSON.parse(fs.readFileSync(idlPath, "utf8"));

    const rpcUrl = process.env.RPC_URL || "http://127.0.0.1:8899";
    const connection = new Connection(rpcUrl, "confirmed");

    const adminSecret = new Uint8Array(JSON.parse(process.env.ADMIN_KEYPAIR || "[]"));
    const adminKeypair = Keypair.fromSecretKey(adminSecret);
    
    const wallet = new anchor.Wallet(adminKeypair);
    const provider = new anchor.AnchorProvider(connection, wallet, {
        preflightCommitment: "confirmed",
    });

    const programId = new PublicKey(process.env.PROGRAM_ID || idl.address);
    const program = new anchor.Program(idl, provider);

    const projectId = new anchor.BN(parseInt(process.env.PROJECT_ID || "1"));
    const builderPubkey = new PublicKey("7jvMuWwUXK9ZWLQjx1qztngpoUzDJhyDCVPe38E7iWyZ");

    const [buildingProjectPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), projectId.toArrayLike(Buffer, "le", 8)],
        programId
    );

    console.log("Initializing Project...");
    console.log("  Program ID:", programId.toBase58());
    console.log("  PDA:", buildingProjectPda.toBase58());

    try {
        const tx = await program.methods
            .initialize(projectId, builderPubkey)
            .accounts({
                admin: adminKeypair.publicKey,
                buildingProject: buildingProjectPda,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([adminKeypair])
            .rpc({ commitment: 'processed' }); // Use simpler commitment

        console.log("✅ Project Initialized! Tx:", tx);
    } catch (err: any) {
        if (err.message && (err.message.includes("already in use") || err.logs?.some((l: string) => l.includes("already in use")))) {
            console.log("ℹ️ Project already initialized.");
        } else {
            console.error("❌ Error initializing project:", err);
            if (err.getLogs) console.log(err.getLogs());
        }
    }
}

main().catch(console.error);
