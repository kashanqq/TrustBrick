#!/bin/bash
echo "Deploying Anchor program..."
anchor build && anchor deploy
echo "Airdropping 1000 SOL to Server Keypair (UMI)..."
solana airdrop 1000 BjwsdUGdDK5kBorM3djZeedQjwTGmzhukxQB2uVnGJCu -u localhost
echo "Airdropping 1000 SOL to Kashtan's Phantom Wallet..."
solana airdrop 1000 7jvMuWwUXK9ZWLQjx1qztngpoUzDJhyDCVPe38E7iWyZ -u localhost
echo "============================="
echo "✅ LOCALNET IS FULLY READY ✅"
echo "============================="
