import { Keypair, Connection } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { keypairIdentity, createSignerFromKeypair, generateSigner, percentAmount } from "@metaplex-foundation/umi";
import { createFungible, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import * as fs from "fs";

async function run() {
  const adminSecret = new Uint8Array([178,192,7,5,18,136,74,58,87,141,163,6,32,15,163,163,162,84,17,28,105,153,1,140,210,76,47,57,233,22,188,202,159,149,78,232,244,182,40,69,239,66,144,238,56,242,39,228,34,56,33,132,148,124,190,6,102,104,105,84,226,152,247,62]);
  
  const umi = createUmi("http://127.0.0.1:8899").use(mplTokenMetadata());
  const adminKeypair = umi.eddsa.createKeypairFromSecretKey(adminSecret);
  const adminSigner = createSignerFromKeypair(umi, adminKeypair);
  umi.use(keypairIdentity(adminSigner));

  console.log("Setting up Fungible Tokens for 3 Projects...");

  const astanaMint = generateSigner(umi);
  await createFungible(umi, {
    mint: astanaMint,
    name: "Astana Hub Coin",
    symbol: "ASTANA",
    uri: "https://trustbrick.com/api/nft/astana-plaza", // We can use the dynamic UI or static!
    sellerFeeBasisPoints: percentAmount(0),
    decimals: 2,
  }).sendAndConfirm(umi);

  const almatyMint = generateSigner(umi);
  await createFungible(umi, {
    mint: almatyMint,
    name: "Almaty Financial Coin",
    symbol: "ALMATY",
    uri: "https://trustbrick.com/api/nft/almaty-hub",
    sellerFeeBasisPoints: percentAmount(0),
    decimals: 2,
  }).sendAndConfirm(umi);

  const atyrauMint = generateSigner(umi);
  await createFungible(umi, {
    mint: atyrauMint,
    name: "Atyrau Logistics Coin",
    symbol: "ATYRAU",
    uri: "https://trustbrick.com/api/nft/atyrau-logistics",
    sellerFeeBasisPoints: percentAmount(0),
    decimals: 2,
  }).sendAndConfirm(umi);

  const envVars = `
ASTANA_MINT_F=${astanaMint.publicKey}
ALMATY_MINT_F=${almatyMint.publicKey}
ATYRAU_MINT_F=${atyrauMint.publicKey}
`;
  fs.appendFileSync(".env.local", envVars);
  
  console.log("Fungible Tokens deployed! appended to .env.local");
  console.log("Astana:", astanaMint.publicKey);
  console.log("Almaty:", almatyMint.publicKey);
  console.log("Atyrau:", atyrauMint.publicKey);
}

run().catch(console.error);
