import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const DB_PATH = join(DATA_DIR, 'images.json');

interface ImagesDB {
  [projectId: string]: {
    [stageIndex: number]: string;
  };
}

function ensureDataDir(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readImages(): ImagesDB {
  ensureDataDir();
  if (!existsSync(DB_PATH)) {
    const db = {};
    writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    return db;
  }
  return JSON.parse(readFileSync(DB_PATH, 'utf-8'));
}

export function setImageForProjectStage(projectId: number, stageIndex: number, imageUrl: string): void {
  const db = readImages();
  if (!db[projectId]) db[projectId] = {};
  db[projectId][stageIndex] = imageUrl;
  
  ensureDataDir();
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

export function getImageForProjectStage(projectId: number, stageIndex: number): string | null {
  const db = readImages();
  const projectImages = db[projectId];
  if (!projectImages) return null;

  // Try exact stage first
  if (projectImages[stageIndex]) return projectImages[stageIndex];

  // Fallback to latest available previous stage
  let latestAvailable = null;
  for (let i = stageIndex - 1; i >= 0; i--) {
    if (projectImages[i]) {
      latestAvailable = projectImages[i];
      break;
    }
  }
  return latestAvailable;
}
