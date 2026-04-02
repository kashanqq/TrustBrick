/**
 * UMI Singleton — единственная точка инициализации Metaplex UMI.
 * Используется всеми API routes для минта и обновления NFT.
 * 
 * Identity и Payer — adminKeypair из env-переменных.
 */

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { 
  createSignerFromKeypair, 
  keypairIdentity,
  type Umi,
  type KeypairSigner,
} from '@metaplex-foundation/umi';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys';

// ── Парсинг приватного ключа ──────────────────────────────────────

function parseAdminKeypair(): Uint8Array {
  const raw = process.env.ADMIN_KEYPAIR;
  if (!raw) {
    throw new Error('ADMIN_KEYPAIR не задан в .env.local');
  }

  // Поддержка формата JSON-массива: [1,2,3,...]
  if (raw.startsWith('[')) {
    const arr = JSON.parse(raw) as number[];
    return Uint8Array.from(arr);
  }

  // Поддержка формата base58
  // Для base58 используем динамический импорт bs58
  throw new Error(
    'ADMIN_KEYPAIR должен быть в формате JSON-массива байт, например: [1,2,3,...,64]'
  );
}

// ── Singleton ─────────────────────────────────────────────────────

let _umi: Umi | null = null;
let _adminSigner: KeypairSigner | null = null;

export function getUmi(): Umi {
  if (_umi) return _umi;

  const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8899';
  const secretKey = parseAdminKeypair();

  const umi = createUmi(rpcUrl)
    .use(mplTokenMetadata())
    .use(irysUploader());

  // Создаём keypair из секретного ключа
  const adminKeypair = umi.eddsa.createKeypairFromSecretKey(secretKey);
  const adminSigner = createSignerFromKeypair(umi, adminKeypair);

  // Устанавливаем identity и payer
  umi.use(keypairIdentity(adminSigner));

  _umi = umi;
  _adminSigner = adminSigner;

  console.log(`[UMI] Initialized. Admin: ${adminSigner.publicKey}`);
  console.log(`[UMI] RPC: ${rpcUrl}`);

  return umi;
}

export function getAdminSigner(): KeypairSigner {
  if (!_adminSigner) {
    getUmi(); // инициализация
  }
  return _adminSigner!;
}

export function getAdminPublicKey(): string {
  return getAdminSigner().publicKey.toString();
}
