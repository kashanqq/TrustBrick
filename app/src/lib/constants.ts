/**
 * Константы этапов строительства и их метаданные.
 * 
 * URI изображений — заглушки для devnet. 
 * Перед деплоем на mainnet загрузить реальные картинки на Arweave
 * и заменить URI здесь.
 */

// ── Этапы строительства ──────────────────────────────────────────

export type BuildStage = 'foundation' | 'floor_1' | 'floor_2' | 'complete';

export interface StageConfig {
  name: string;
  description: string;
  image: string;
  stageIndex: number; // соответствует on-chain stage (u8)
}

/**
 * Захардкоженные URI изображений этапов.
 * В продакшне — загрузить на Arweave и вставить реальные URI.
 * Сейчас используются placeholder-изображения.
 */
export const STAGE_IMAGES: Record<BuildStage, string> = {
  foundation: 'https://arweave.net/placeholder-foundation',
  floor_1:    'https://arweave.net/placeholder-floor1',
  floor_2:    'https://arweave.net/placeholder-floor2',
  complete:   'https://arweave.net/placeholder-complete',
};

export const STAGES: Record<BuildStage, StageConfig> = {
  foundation: {
    name: 'Котлован / Фундамент',
    description: 'Начальный этап строительства. Фундамент заложен.',
    image: STAGE_IMAGES.foundation,
    stageIndex: 0,
  },
  floor_1: {
    name: 'Каркас / 1-й этаж',
    description: 'Возведён каркас здания, первый этаж готов.',
    image: STAGE_IMAGES.floor_1,
    stageIndex: 1,
  },
  floor_2: {
    name: 'Стены / 2-й этаж',
    description: 'Возведены стены, второй этаж и перекрытия.',
    image: STAGE_IMAGES.floor_2,
    stageIndex: 2,
  },
  complete: {
    name: 'Завершено',
    description: 'Строительство завершено. Объект сдан.',
    image: STAGE_IMAGES.complete,
    stageIndex: 3,
  },
};

/** Порядок этапов для перехода */
export const STAGE_ORDER: BuildStage[] = ['foundation', 'floor_1', 'floor_2', 'complete'];

/** Получить следующий этап */
export function getNextStage(current: BuildStage): BuildStage | null {
  const idx = STAGE_ORDER.indexOf(current);
  if (idx === -1 || idx >= STAGE_ORDER.length - 1) return null;
  return STAGE_ORDER[idx + 1];
}

/** Получить этап по on-chain индексу */
export function getStageByIndex(index: number): BuildStage | null {
  const entry = Object.entries(STAGES).find(([, cfg]) => cfg.stageIndex === index);
  return entry ? (entry[0] as BuildStage) : null;
}
