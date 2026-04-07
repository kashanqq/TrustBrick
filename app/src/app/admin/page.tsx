"use client";

import bs58 from "bs58";
import Link from "next/link";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import ClientWalletButton from "@/components/ClientWalletButton";

type MintApiResponse = {
  success: boolean;
  transaction: string;
  lastValidBlockHeight: number;
  mintAddress: string;
  metadataUrl: string;
  imageUrl: string;
  recipient: string;
  cluster?: string;
  explorerTxUrl: null;
  error?: string;
};

type MintResult = {
  txSignature: string;
  mintAddress: string;
  metadataUrl: string;
  imageUrl: string;
  cluster?: string;
  explorerTxUrl: string | null;
};

type WalletBindResponse = {
  success: boolean;
  boundWallet: string | null;
  isAuthorized?: boolean;
  error?: string;
};

type WalletBindChallengeResponse = {
  success: boolean;
  wallet: string;
  nonce: string;
  message: string;
  expiresAt: string;
  error?: string;
};

const DEFAULT_NFT_NAME = "TrustBrick Contributor Pass";

function truncateAddress(addr: string) {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function AdminPage() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [file, setFile] = useState<File | null>(null);
  const [nftName, setNftName] = useState(DEFAULT_NFT_NAME);
  const [isBinding, setIsBinding] = useState(false);
  const [isUnbinding, setIsUnbinding] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [loadingBoundWallet, setLoadingBoundWallet] = useState(true);
  const [boundWallet, setBoundWallet] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showConnectHint, setShowConnectHint] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MintResult | null>(null);

  const connectedWallet = wallet.publicKey?.toBase58() ?? null;
  const isBoundToConnectedWallet = Boolean(connectedWallet && boundWallet === connectedWallet);
  const canMint = isBoundToConnectedWallet && isAuthorized;

  const fileLabel = file
    ? `${file.name} (${Math.max(1, Math.round(file.size / 1024))} KB)`
    : "Файл не выбран";

  const refreshBoundWallet = useCallback(async () => {
    try {
      setLoadingBoundWallet(true);
      const response = await fetch("/api/wallet/bind", { cache: "no-store" });
      const data = (await response.json()) as WalletBindResponse;
      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Не удалось получить привязку кошелька.");
      }
      setBoundWallet(data.boundWallet ?? null);
      setIsAuthorized(Boolean(data.isAuthorized));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка.");
      setIsAuthorized(false);
    } finally {
      setLoadingBoundWallet(false);
    }
  }, []);

  useEffect(() => {
    void refreshBoundWallet();
  }, [refreshBoundWallet]);

  useEffect(() => {
    if (!wallet.connecting) {
      setShowConnectHint(false);
      return;
    }
    const timer = window.setTimeout(() => setShowConnectHint(true), 8000);
    return () => window.clearTimeout(timer);
  }, [wallet.connecting]);

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setResult(null);
    setFile(event.target.files?.[0] ?? null);
  };

  const handleBindWallet = async () => {
    setError(null);
    setResult(null);

    if (!connectedWallet) {
      setError("Подключи Phantom перед привязкой.");
      return;
    }
    if (!wallet.signMessage) {
      setError("Кошелёк не поддерживает подпись сообщений.");
      return;
    }

    try {
      setIsBinding(true);

      const challengeRes = await fetch("/api/wallet/bind/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: connectedWallet }),
      });
      const challengeData = (await challengeRes.json()) as WalletBindChallengeResponse;
      if (!challengeRes.ok || !challengeData.success) {
        throw new Error(challengeData.error ?? "Не удалось получить challenge.");
      }

      const signatureBytes = await wallet.signMessage(
        new TextEncoder().encode(challengeData.message)
      );
      const signatureBase58 = bs58.encode(signatureBytes);

      const bindRes = await fetch("/api/wallet/bind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: connectedWallet,
          nonce: challengeData.nonce,
          signature: signatureBase58,
        }),
      });
      const bindData = (await bindRes.json()) as WalletBindResponse;
      if (!bindRes.ok || !bindData.success) {
        throw new Error(bindData.error ?? "Не удалось привязать кошелёк.");
      }

      setBoundWallet(bindData.boundWallet);
      setIsAuthorized(Boolean(bindData.isAuthorized ?? true));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка.");
      setIsAuthorized(false);
    } finally {
      setIsBinding(false);
    }
  };

  const handleUnbindWallet = async () => {
    if (!confirm("Сбросить привязку кошелька? Текущая сессия будет завершена.")) return;
    setError(null);
    setResult(null);

    try {
      setIsUnbinding(true);
      const res = await fetch("/api/wallet/bind", { method: "DELETE" });
      const data = (await res.json()) as WalletBindResponse;
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Не удалось снять привязку.");
      }
      setBoundWallet(null);
      setIsAuthorized(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка.");
    } finally {
      setIsUnbinding(false);
    }
  };

  const handleMint = async () => {
    setError(null);
    setResult(null);

    if (!connectedWallet) {
      setError("Подключи Phantom перед выпуском NFT.");
      return;
    }
    if (!canMint) {
      setError("Сначала привяжи и авторизуй кошелёк.");
      return;
    }
    if (!file) {
      setError("Добавь изображение перед выпуском NFT.");
      return;
    }
    if (!wallet.signTransaction) {
      setError("Кошелёк не поддерживает подпись транзакций.");
      return;
    }

    try {
      setIsMinting(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("recipient", connectedWallet);
      formData.append("name", nftName.trim() || DEFAULT_NFT_NAME);

      const res = await fetch("/api/mint", { method: "POST", body: formData });
      const data = (await res.json()) as MintApiResponse;
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Mint API вернул ошибку.");
      }

      // Deserialize the partially-signed tx, add Phantom signature, then broadcast
      const tx = Transaction.from(Buffer.from(data.transaction, "base64"));
      const signedTx = await wallet.signTransaction(tx);
      const txSignature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      await connection.confirmTransaction(
        {
          signature: txSignature,
          blockhash: tx.recentBlockhash!,
          lastValidBlockHeight: data.lastValidBlockHeight,
        },
        "confirmed"
      );

      const cluster = data.cluster ?? "devnet";
      setResult({
        txSignature,
        mintAddress: data.mintAddress,
        metadataUrl: data.metadataUrl,
        imageUrl: data.imageUrl,
        cluster,
        explorerTxUrl: cluster !== "custom"
          ? `https://explorer.solana.com/tx/${txSignature}?cluster=${cluster}`
          : null,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка.");
    } finally {
      setIsMinting(false);
    }
  };

  const mintButtonLabel = isMinting
    ? "Выпускаем NFT…"
    : !connectedWallet
      ? "Сначала подключи кошелёк"
      : !canMint
        ? "Привяжи и авторизуй кошелёк"
        : "Выпустить NFT";

  const walletMismatch =
    boundWallet && connectedWallet && boundWallet !== connectedWallet;

  return (
    <main className="admin-layout">
      <div className="admin-container">

        {/* Header */}
        <div className="admin-header">
          <Link href="/" className="admin-back-link">← Главная</Link>
          <span className="admin-page-title">Панель администратора</span>
        </div>

        {/* Wallet connection */}
        <div className="admin-section">
          <div className="admin-section-title">Кошелёк</div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
            <ClientWalletButton />
          </div>

          {showConnectHint && (
            <div className="connect-hint">
              Подключение зависло. Проверь Phantom — разблокирован ли кошелёк, открыто ли окно подтверждения. Нажми Disconnect и попробуй снова.
            </div>
          )}

          <div className="status-row">
            <span className="status-label">Статус</span>
            <span className={`status-badge ${wallet.connected ? "status-badge-green" : "status-badge-red"}`}>
              {wallet.connected ? "Подключён" : "Не подключён"}
            </span>
          </div>

          {connectedWallet && (
            <>
              <div className="status-divider" />
              <div className="status-row">
                <span className="status-label">Адрес</span>
                <span className="status-value" title={connectedWallet}>
                  {truncateAddress(connectedWallet)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Wallet binding */}
        <div className="admin-section">
          <div className="admin-section-title">Привязка кошелька</div>

          <div className="status-row">
            <span className="status-label">Привязан</span>
            {loadingBoundWallet ? (
              <span className="status-badge status-badge-yellow">Проверяем…</span>
            ) : boundWallet ? (
              <span className="status-value" title={boundWallet}>
                {truncateAddress(boundWallet)}
              </span>
            ) : (
              <span className="status-badge status-badge-red">Нет</span>
            )}
          </div>

          <div className="status-divider" />

          <div className="status-row">
            <span className="status-label">Сессия</span>
            <span className={`status-badge ${isAuthorized ? "status-badge-green" : "status-badge-red"}`}>
              {isAuthorized ? "Авторизован" : "Не авторизован"}
            </span>
          </div>

          {walletMismatch && (
            <div className="alert alert-warning" style={{ marginTop: "0.75rem", marginBottom: 0 }}>
              Подключён другой адрес. Для операций нужен привязанный кошелёк.
            </div>
          )}

          <div className="wallet-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleBindWallet}
              disabled={isBinding || !connectedWallet}
            >
              {isBinding ? "Подписываем…" : "Привязать кошелёк"}
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={handleUnbindWallet}
              disabled={isUnbinding || !boundWallet}
            >
              {isUnbinding ? "Сбрасываем…" : "Сбросить привязку"}
            </button>
          </div>
        </div>

        {/* NFT configuration */}
        <div className="admin-section">
          <div className="admin-section-title">Настройка NFT</div>

          <div className="field-group">
            <label htmlFor="nft-name" className="field-label">Название NFT</label>
            <input
              id="nft-name"
              className="field-input"
              value={nftName}
              onChange={(e) => setNftName(e.target.value)}
              placeholder={DEFAULT_NFT_NAME}
              maxLength={32}
            />
          </div>

          <div className="field-group" style={{ marginBottom: "1.25rem" }}>
            <label htmlFor="nft-file" className="field-label">
              Изображение (PNG / JPG / WebP / GIF, макс. 10 МБ)
            </label>
            <input
              id="nft-file"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={onFileChange}
              className="field-input"
              style={{ cursor: "pointer" }}
            />
            <div className="field-hint">{fileLabel}</div>
          </div>

          <button
            type="button"
            className="btn"
            onClick={handleMint}
            disabled={isMinting || !canMint || !file}
          >
            {mintButtonLabel}
          </button>
        </div>

        {/* Error */}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Success result */}
        {result && (
          <div className="admin-section alert-success">
            <div className="mint-result">
              <div className="mint-result-title">NFT успешно выпущен on-chain</div>
              <div className="mint-result-row">
                <span className="mint-result-key">Mint Address</span>
                <span className="mint-result-val">{result.mintAddress}</span>
              </div>
              <div className="mint-result-row">
                <span className="mint-result-key">Транзакция</span>
                <span className="mint-result-val">
                  {result.explorerTxUrl ? (
                    <a href={result.explorerTxUrl} target="_blank" rel="noreferrer">
                      {result.txSignature}
                    </a>
                  ) : (
                    result.txSignature
                  )}
                </span>
              </div>
              {result.cluster && (
                <div className="mint-result-row">
                  <span className="mint-result-key">Кластер</span>
                  <span className="mint-result-val">{result.cluster}</span>
                </div>
              )}
              <div className="mint-result-row">
                <span className="mint-result-key">Metadata</span>
                <span className="mint-result-val">
                  <a href={result.metadataUrl} target="_blank" rel="noreferrer">
                    {result.metadataUrl}
                  </a>
                </span>
              </div>
              <div className="mint-result-row">
                <span className="mint-result-key">Изображение</span>
                <span className="mint-result-val">
                  <a href={result.imageUrl} target="_blank" rel="noreferrer">
                    {result.imageUrl}
                  </a>
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
