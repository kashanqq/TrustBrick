/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/trustbrick.json`.
 */
export type Trustbrick = {
  "address": "4Acsi2H93uxQq6gEANgBMxiZu9MP2VSxZV6uBRAiTXSs",
  "metadata": {
    "name": "trustbrick",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "buyFromMarket",
      "docs": [
        "Купить токены с рынка"
      ],
      "discriminator": [
        91,
        171,
        56,
        146,
        74,
        47,
        77,
        202
      ],
      "accounts": [
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "seller",
          "writable": true,
          "relations": [
            "listing"
          ]
        },
        {
          "name": "listing",
          "writable": true
        },
        {
          "name": "p2pEscrowWallet",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  50,
                  112,
                  95,
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "listing"
              }
            ]
          }
        },
        {
          "name": "buyerTokenAccount",
          "writable": true
        },
        {
          "name": "buyerPaymentTokenAccount",
          "writable": true
        },
        {
          "name": "sellerPaymentTokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "docs": [
        "1. Инициализация проекта (Создание \"сейфа\" для SOL и метаданных)"
      ],
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "buildingProject",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "arg",
                "path": "projectId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "projectId",
          "type": "u64"
        },
        {
          "name": "builder",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "invest",
      "docs": [
        "2. Ивестирование: Инвестор отправляет SOL в PDA-сейф проекта"
      ],
      "discriminator": [
        13,
        245,
        180,
        103,
        254,
        182,
        121,
        4
      ],
      "accounts": [
        {
          "name": "investor",
          "writable": true,
          "signer": true
        },
        {
          "name": "buildingProject",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "arg",
                "path": "projectId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "projectId",
          "type": "u64"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "listToken",
      "docs": [
        "P2P Выставить токены на продажу"
      ],
      "discriminator": [
        210,
        166,
        134,
        74,
        206,
        157,
        92,
        138
      ],
      "accounts": [
        {
          "name": "seller",
          "writable": true,
          "signer": true
        },
        {
          "name": "sellerTokenAccount",
          "writable": true
        },
        {
          "name": "mint"
        },
        {
          "name": "paymentMint"
        },
        {
          "name": "listing",
          "writable": true,
          "signer": true
        },
        {
          "name": "p2pEscrowWallet",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  50,
                  112,
                  95,
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "listing"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "price",
          "type": "u64"
        }
      ]
    },
    {
      "name": "releaseFunds",
      "docs": [
        "3. Выплата транша (Только для Админа/Оракула)"
      ],
      "discriminator": [
        225,
        88,
        91,
        108,
        126,
        52,
        2,
        26
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "buildingProject",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "arg",
                "path": "projectId"
              }
            ]
          }
        },
        {
          "name": "builder",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "projectId",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "buildingProject",
      "discriminator": [
        52,
        49,
        2,
        138,
        77,
        74,
        252,
        79
      ]
    },
    {
      "name": "marketListing",
      "discriminator": [
        175,
        123,
        31,
        97,
        53,
        211,
        229,
        16
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorized",
      "msg": "You are not authorized to perform this action."
    },
    {
      "code": 6001,
      "name": "invalidBuilder",
      "msg": "The provided builder account does not match the project's builder."
    },
    {
      "code": 6002,
      "name": "insufficientFunds",
      "msg": "Insufficient funds in the escrow PDA to release the requested amount."
    },
    {
      "code": 6003,
      "name": "projectCompleted",
      "msg": "The project has already reached maximum completion stage."
    },
    {
      "code": 6004,
      "name": "mathOverflow",
      "msg": "Calculation overflow error."
    }
  ],
  "types": [
    {
      "name": "buildingProject",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "builder",
            "type": "pubkey"
          },
          {
            "name": "totalInvested",
            "type": "u64"
          },
          {
            "name": "releasedAmount",
            "type": "u64"
          },
          {
            "name": "stage",
            "type": "u8"
          },
          {
            "name": "projectId",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "marketListing",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "seller",
            "type": "pubkey"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "paymentMint",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "price",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
