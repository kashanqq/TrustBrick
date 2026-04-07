import { NextRequest, NextResponse } from 'next/server';
import { getUmi } from '@/lib/umi';
import { publicKey } from '@metaplex-foundation/umi';
import { fetchAllDigitalAssetByOwner } from '@metaplex-foundation/mpl-token-metadata';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get('wallet');

  if (!wallet) {
    return NextResponse.json({ error: 'Missing wallet query parameter' }, { status: 400 });
  }

  try {
    const umi = getUmi();
    const assets = await fetchAllDigitalAssetByOwner(umi, publicKey(wallet));

    const protocolAssets = assets.filter(a => {
      const sym = a.metadata.symbol.replace(/\0/g, '').trim();
      return sym === 'TBRICK';
    });
    console.log(`[PORTFOLIO] Wallet ${wallet}: Found ${assets.length} total NFTs, ${protocolAssets.length} TBRICK NFTs`);

    // Fetch off-chain JSON for each to get the image, name, etc.
    const holdings = await Promise.all(
      protocolAssets.map(async (asset) => {
        const uri = asset.metadata.uri.replace(/\0/g, ''); // Fix null terminators
        
        // Fetch JSON
        let json = null;
        if (uri) {
          try {
            if (uri.startsWith('data:application/json;base64,')) {
              const base64 = uri.split(',')[1];
              json = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
            } else {
              const reqUrl = uri.startsWith('http') ? uri : `https://${uri}`;
              const fetched = await fetch(reqUrl, { cache: "no-store" });
              json = await fetched.json();
            }
          } catch(e) {
             console.log("Failed to fetch JSON", uri);
          }
        }

        return {
          mint: asset.publicKey.toString(),
          name: json?.name || asset.metadata.name,
          image: json?.image || 'https://arweave.net/placeholder-foundation',
          attributes: json?.attributes || [],
          // Pull amount_sol from attributes
          solValue: json?.attributes?.find((a:any) => a.trait_type === 'amount_sol')?.value || '1'
        };
      })
    );

    // Fetch SPL Tokens
    const { Connection, PublicKey } = require('@solana/web3.js');
    const { getProjectBySlug, PROJECTS } = require('@/lib/projects');
    const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8899';
    const connection = new Connection(rpcUrl, 'confirmed');

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(wallet),
      { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") }
    );

    const tokenHoldings = [];
    for (const info of tokenAccounts.value) {
      const parsedInfo = info.account.data.parsed.info;
      const mintAdd = parsedInfo.mint;
      const balance = parsedInfo.tokenAmount.uiAmount;
      
      if (balance > 0) {
        const foundProj = PROJECTS.find((p:any) => p.mintAddress === mintAdd);
        if (foundProj) {
          // Fetch dynamic image
          let coinImage = foundProj.previewImage;
          let stageName = "Unknown";
          try {
            const reqUrl = `http://127.0.0.1:3000/api/nft/${foundProj.slug}`;
            const fetched = await fetch(reqUrl, { cache: "no-store" });
            const nftJson = await fetched.json();
            if (nftJson.image) coinImage = nftJson.image;
            if (nftJson.attributes) {
              const stg = nftJson.attributes.find((a:any) => a.trait_type === 'Stage');
              if (stg) stageName = stg.value;
            }
          } catch(e) {}

          tokenHoldings.push({
            mint: mintAdd,
            name: foundProj.name + " (Coin)", 
            image: coinImage, 
            attributes: [{ trait_type: 'Stage', value: stageName }],
            solValue: balance.toString(), 
            isFungible: true
          });
        }
      }
    }

    const mergedHoldings = [...holdings, ...tokenHoldings];

    return NextResponse.json({ holdings: mergedHoldings });
  } catch (err: any) {
    console.error('Error fetching portfolio:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
