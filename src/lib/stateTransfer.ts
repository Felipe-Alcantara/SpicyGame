import {
  CATEGORIES,
  LEVELS,
  MODES,
  type CardItem,
  type Category,
  type Mode,
} from "../data/taxonomy";
import type { PersistedState } from "./storage";

/** Versão do formato compartilhado pelo export/import, independente da chave local. */
export const EXPORT_FORMAT_VERSION = 1 as const;

export type ExportedGameState = PersistedState & {
  version: typeof EXPORT_FORMAT_VERSION;
};

export type StateTransferResult =
  | { ok: true; format: "current" | "legacy"; state: Partial<PersistedState> }
  | { ok: false; error: string };

const INVALID_JSON_MESSAGE = "JSON inválido — confira se você colou o texto inteiro.";
const INVALID_STATE_MESSAGE =
  "Estado inválido — o arquivo não segue o formato esperado do Spicy Game.";
const UNSUPPORTED_VERSION_MESSAGE =
  "Versão de estado não suportada — exporte o estado novamente nesta versão do Spicy Game.";

const LEGACY_FIELDS = ["players", "customCards", "hiddenIds", "scores"] as const;
const CURRENT_FIELDS = [
  "version",
  "players",
  "currentMode",
  "levelIndex",
  "cats",
  "customCards",
  "hiddenIds",
  "scores",
] as const;

type JsonObject = Record<string, unknown>;

/** Serializa o estado configurável completo com uma versão explícita. */
export function serializeGameState(state: PersistedState): string {
  const exported: ExportedGameState = {
    version: EXPORT_FORMAT_VERSION,
    players: state.players,
    currentMode: state.currentMode,
    levelIndex: state.levelIndex,
    cats: state.cats,
    customCards: state.customCards,
    hiddenIds: state.hiddenIds,
    scores: state.scores,
  };
  return JSON.stringify(exported, null, 2);
}

/**
 * Valida e normaliza um arquivo antes de qualquer setter do hook ser chamado.
 * Exportações antigas não tinham `version` nem os filtros; nesse caso só os
 * quatro campos antigos são aplicados e os filtros atuais são preservados.
 */
export function parseGameState(json: string): StateTransferResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json) as unknown;
  } catch {
    return { ok: false, error: INVALID_JSON_MESSAGE };
  }

  if (!isJsonObject(parsed)) return { ok: false, error: INVALID_STATE_MESSAGE };

  if (!hasOwn(parsed, "version")) {
    const state = parseLegacyState(parsed);
    return state
      ? { ok: true, format: "legacy", state }
      : { ok: false, error: INVALID_STATE_MESSAGE };
  }

  if (parsed.version !== EXPORT_FORMAT_VERSION) {
    return { ok: false, error: UNSUPPORTED_VERSION_MESSAGE };
  }

  const state = parseCurrentState(parsed);
  return state
    ? { ok: true, format: "current", state }
    : { ok: false, error: INVALID_STATE_MESSAGE };
}

function parseLegacyState(value: JsonObject): Partial<PersistedState> | null {
  if (!hasFields(value, LEGACY_FIELDS)) return null;

  const players = normalizeNames(value.players);
  const customCards = normalizeCards(value.customCards);
  const hiddenIds = normalizeIds(value.hiddenIds);
  const scores = normalizeScores(value.scores);
  if (!players || !customCards || !hiddenIds || !scores) return null;

  return { players, customCards, hiddenIds, scores };
}

function parseCurrentState(value: JsonObject): Partial<PersistedState> | null {
  if (!hasFields(value, CURRENT_FIELDS)) return null;

  const players = normalizeNames(value.players);
  const currentMode = normalizeMode(value.currentMode);
  const levelIndex = normalizeLevelIndex(value.levelIndex);
  const cats = normalizeCategories(value.cats);
  const customCards = normalizeCards(value.customCards);
  const hiddenIds = normalizeIds(value.hiddenIds);
  const scores = normalizeScores(value.scores);
  if (
    !players ||
    !currentMode ||
    levelIndex === null ||
    !cats ||
    !customCards ||
    !hiddenIds ||
    !scores
  ) {
    return null;
  }

  return { players, currentMode, levelIndex, cats, customCards, hiddenIds, scores };
}

function normalizeNames(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const names: string[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (typeof item !== "string") return null;
    const name = item.trim();
    if (!name) return null;
    if (seen.has(name)) continue;
    seen.add(name);
    names.push(name);
  }
  return names;
}

function normalizeIds(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const ids: string[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (typeof item !== "string") return null;
    const id = item.trim();
    if (!id) return null;
    if (seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  return ids;
}

function normalizeCards(value: unknown): CardItem[] | null {
  if (!Array.isArray(value)) return null;
  const cards: CardItem[] = [];
  const ids = new Set<string>();

  for (const item of value) {
    if (!isJsonObject(item)) return null;
    const id = normalizeText(item.id);
    const mode = normalizeMode(item.mode);
    const text = normalizeText(item.text);
    const level = normalizeLevel(item.level);
    const cats = normalizeCategoryList(item.cats);
    if (!id || !mode || !text || !level || !cats || ids.has(id)) return null;

    ids.add(id);
    cards.push({ id, mode, text, level, cats });
  }

  return cards;
}

function normalizeScores(value: unknown): Record<string, number> | null {
  if (!isJsonObject(value)) return null;
  const scores: Record<string, number> = {};
  const normalizedNames = new Set<string>();

  for (const [rawName, score] of Object.entries(value)) {
    const name = rawName.trim();
    if (!name || normalizedNames.has(name)) return null;
    if (typeof score !== "number" || !Number.isFinite(score) || score < 0) return null;
    normalizedNames.add(name);
    Object.defineProperty(scores, name, {
      configurable: true,
      enumerable: true,
      value: score,
      writable: true,
    });
  }

  return scores;
}

function normalizeCategories(value: unknown): Record<Category, boolean> | null {
  if (!isJsonObject(value)) return null;
  const categories = {} as Record<Category, boolean>;
  for (const category of CATEGORIES) {
    if (!hasOwn(value, category) || typeof value[category] !== "boolean") return null;
    categories[category] = value[category];
  }
  return categories;
}

function normalizeCategoryList(value: unknown): Category[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const categories: Category[] = [];
  for (const item of value) {
    const category = normalizeText(item);
    if (!isCategory(category)) return null;
    if (!categories.includes(category)) categories.push(category);
  }
  return categories;
}

function normalizeText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text || null;
}

function normalizeMode(value: unknown): Mode | null {
  const mode = normalizeText(value);
  return isMode(mode) ? mode : null;
}

function normalizeLevel(value: unknown): CardItem["level"] | null {
  const level = normalizeText(value);
  return typeof level === "string" && LEVELS.includes(level as CardItem["level"])
    ? (level as CardItem["level"])
    : null;
}

function normalizeLevelIndex(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < LEVELS.length
    ? value
    : null;
}

function isMode(value: unknown): value is Mode {
  return typeof value === "string" && MODES.includes(value as Mode);
}

function isCategory(value: unknown): value is Category {
  return typeof value === "string" && CATEGORIES.includes(value as Category);
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOwn(value: JsonObject, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function hasFields(value: JsonObject, fields: readonly string[]): boolean {
  return fields.every((field) => hasOwn(value, field));
}
