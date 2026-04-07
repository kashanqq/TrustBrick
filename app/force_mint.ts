import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createSignerFromKeypair, keypairIdentity, publicKey, percentAmount, generateSigner } from '@metaplex-foundation/umi';
import { createNft, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys';

async function run() {
  const adminSecret = new Uint8Array([178,192,7,5,18,136,74,58,87,141,163,6,32,15,163,163,162,84,17,28,105,153,1,140,210,76,47,57,233,22,188,202,159,149,78,232,244,182,40,69,239,66,144,238,56,242,39,228,34,56,33,132,148,124,190,6,102,104,105,84,226,152,247,62]);
  
  const umi = createUmi('http://127.0.0.1:8899').use(mplTokenMetadata()).use(irysUploader());
  const adminKeypair = umi.eddsa.createKeypairFromSecretKey(adminSecret);
  const adminSigner = createSignerFromKeypair(umi, adminKeypair);
  umi.use(keypairIdentity(adminSigner));

  const investorPubkeyStr = "7jvMuWwUXK9ZWLQjx1qztngpoUzDJhyDCVPe38E7iWyZ"; // user wallet
  const mintSigner = generateSigner(umi);

  console.log("Minting to:", investorPubkeyStr);
  const txBuilder = createNft(umi, {
    mint: mintSigner,
    name: 'TrustBrick Share',
    symbol: 'TBRICK',
    uri: 'http://localhost:3000/api/nft/almaty-hub',
    sellerFeeBasisPoints: percentAmount(0),
    tokenOwner: publicKey(investorPubkeyStr),
    isMutable: true,
  });

  const sig = await txBuilder.sendAndConfirm(umi);
  console.log("Success! Mint address:", mintSigner.publicKey);
}
run().catch(console.error);
