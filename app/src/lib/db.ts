/**
 * Простейшая JSON-файловая «база данных» для хранения записей об инвесторах.
 * 
 * В продакшне заменить на Supabase / PostgreSQL / MongoDB.
 * Для хакатона/MVP — достаточно файла.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { BuildStage } from './constants';

// ── Типы ──────────────────────────────────────────────────────────

export interface InvestorRecord {
  wallet: string;
  mintAddress: string;
  amountSol: number;
  stage: BuildStage;
  txSignature: string;
  createdAt: string;
  updatedAt: string;
}

export interface Database {
  investors: InvestorRecord[];
  collectionMint: string | null;
}

// ── Путь к файлу БД ──────────────────────────────────────────────

const DATA_DIR = join(process.cwd(), 'data');
const DB_PATH = join(DATA_DIR, 'investors.json');

// ── Чтение / Запись ──────────────────────────────────────────────

function ensureDataDir(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getDefaultDb(): Database {
  return {
    investors: [],
    collectionMint: null,
  };
}

export function readDb(): Database {
  ensureDataDir();
  if (!existsSync(DB_PATH)) {
    const db = getDefaultDb();
    writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    return db;
  }
  const raw = readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw) as Database;
}

export function writeDb(db: Database): void {
  ensureDataDir();
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

// ── CRUD операции ────────────────────────────────────────────────

/** Добавить запись инвестора */
export function addInvestor(record: InvestorRecord): void {
  const db = readDb();
  db.investors.push(record);
  writeDb(db);
}

/** Получить всех инвесторов по текущему этапу */
export function getInvestorsByStage(stage: BuildStage): InvestorRecord[] {
  const db = readDb();
  return db.investors.filter((inv) => inv.stage === stage);
}

/** Получить всех инвесторов */
export function getAllInvestors(): InvestorRecord[] {
  return readDb().investors;
}

/** Обновить этап для конкретного инвестора (по mintAddress) */
export function updateInvestorStage(mintAddress: string, newStage: BuildStage): void {
  const db = readDb();
  const investor = db.investors.find((inv) => inv.mintAddress === mintAddress);
  if (investor) {
    investor.stage = newStage;
    investor.updatedAt = new Date().toISOString();
  }
  writeDb(db);
}

/** Массовое обновление этапа */
export function bulkUpdateStage(fromStage: BuildStage, toStage: BuildStage): number {
  const db = readDb();
  let count = 0;
  const now = new Date().toISOString();
  for (const inv of db.investors) {
    if (inv.stage === fromStage) {
      inv.stage = toStage;
      inv.updatedAt = now;
      count++;
    }
  }
  writeDb(db);
  return count;
}

/** Сохранить адрес коллекции */
export function setCollectionMint(mint: string): void {
  const db = readDb();
  db.collectionMint = mint;
  writeDb(db);
}

/** Получить адрес коллекции */
export function getCollectionMint(): string | null {
  return readDb().collectionMint;
}
