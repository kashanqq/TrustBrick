import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "arweave.net",
      },
    ],
  },
  transpilePackages: [
    "@solana/wallet-adapter-react",
    "@solana/wallet-adapter-react-ui",
    "@solana/wallet-adapter-wallets",
    "@solana/web3.js",
    "@coral-xyz/anchor",
    "@noble/curves",
    "@noble/hashes",
    "@metaplex-foundation/umi",
    "@metaplex-foundation/umi-bundle-defaults",
    "@metaplex-foundation/mpl-token-metadata",
    "@metaplex-foundation/mpl-toolbox",
    "@metaplex-foundation/umi-uploader-irys",
  ],
};

export default nextConfig;
