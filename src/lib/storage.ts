/**
 * Persistência local do jogo.
 *
 * Tudo mora no navegador (localStorage): nenhuma carta, nome ou preferência
 * sai do dispositivo. A chave é versionada para que um formato novo não tente
 * ler um estado antigo incompatível.
 */

import { CardItem, Category, Mode } from "../data/taxonomy";

export const STORAGE_KEY = "spicy-game-state-v2";

/** Chave da versão anterior, migrada automaticamente na primeira carga. */
const LEGACY_STORAGE_KEY = "couple-night-state-v1";

export interface PersistedState {
  players: string[];
  currentMode: Mode;
  levelIndex: number;
  cats: Record<Category, boolean>;
  customCards: CardItem[];
  hiddenIds: string[];
  scores: Record<string, number>;
}

/** Lê o estado salvo. Devolve `null` quando não há nada utilizável. */
export function loadState(): Partial<PersistedState> | null {
  const raw =
    safeGet(STORAGE_KEY) ?? safeGet(LEGACY_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : null;
  } catch {
    return null;
  }
}

/** Grava o estado. Falha em silêncio se o navegador bloquear o storage. */
export function saveState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* modo anônimo ou cota cheia — o jogo continua funcionando em memória */
  }
}

/** Apaga tudo que o jogo salvou neste navegador. */
export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    /* nada a fazer */
  }
}

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
