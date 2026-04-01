import type { NextConfig } from "next";

const nextConfig = {
  turbopack: {},
  transpilePackages: [
    "@solana/wallet-adapter-react",
    "@solana/wallet-adapter-react-ui",
    "@solana/wallet-adapter-wallets",
    "@solana/web3.js",
    "@coral-xyz/anchor",
    "@noble/curves",
    "@noble/hashes",
  ],
};

export default nextConfig;
