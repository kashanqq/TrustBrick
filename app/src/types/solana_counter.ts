import type { Idl } from "@coral-xyz/anchor";

export type SolanaCounter = {
  address: "4Acsi2H93uxQq6gEANgBMxiZu9MP2VSxZV6uBRAiTXSs";
  metadata: { name: "solana_counter"; version: "0.1.0"; spec: "0.1.0" };
  instructions: [
    {
      name: "initialize";
      discriminator: number[];
      accounts: [
        { name: "admin"; writable: true; signer: true },
        { name: "building_project"; writable: true },
        { name: "system_program" }
      ];
      args: [
        { name: "project_id"; type: "u64" },
        { name: "builder"; type: "pubkey" }
      ];
    },
    {
      name: "invest";
      discriminator: number[];
      accounts: [
        { name: "investor"; writable: true; signer: true },
        { name: "building_project"; writable: true },
        { name: "system_program" }
      ];
      args: [
        { name: "project_id"; type: "u64" },
        { name: "amount"; type: "u64" }
      ];
    },
    {
      name: "release_funds";
      discriminator: number[];
      accounts: [
        { name: "admin"; writable: true; signer: true },
        { name: "building_project"; writable: true },
        { name: "builder"; writable: true },
        { name: "system_program" }
      ];
      args: [
        { name: "project_id"; type: "u64" },
        { name: "release_amount"; type: "u64" }
      ];
    }
  ];
  accounts: [{ name: "BuildingProject"; discriminator: number[] }];
  types: [
    {
      name: "BuildingProject";
      type: {
        kind: "struct";
        fields: [
          { name: "admin"; type: "pubkey" },
          { name: "builder"; type: "pubkey" },
          { name: "total_invested"; type: "u64" },
          { name: "stage"; type: "u8" },
          { name: "project_id"; type: "u64" }
        ];
      };
    }
  ];
} & Idl;
