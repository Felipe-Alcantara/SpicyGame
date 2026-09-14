import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CATEGORIES, type Category } from "../data/taxonomy";
import { MemoryStorage } from "../test-utils";
import {
  clearState,
  loadState,
  saveState,
  STORAGE_KEY,
  type PersistedState,
} from "./storage";

const LEGACY_STORAGE_KEY = "couple-night-state-v1";

function allCategoriesOn(): Record<Category, boolean> {
  return Object.fromEntries(CATEGORIES.map((category) => [category, true])) as Record<
    Category,
    boolean
  >;
}

function makeState(overrides: Partial<PersistedState> = {}): PersistedState {
  return {
    players: ["Ela", "Ele"],
    currentMode: "never",
    levelIndex: 1,
    cats: allCategoriesOn(),
    customCards: [],
    hiddenIds: [],
    scores: {},
    ...overrides,
  };
}

let storage: MemoryStorage;

beforeEach(() => {
  storage = new MemoryStorage();
  vi.stubGlobal("localStorage", storage);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("storage", () => {
  it("prefere a chave atual quando as duas versões existem", () => {
    const current = makeState({ players: ["Atual"] });
    const legacy = makeState({ players: ["Legado"] });
    storage.setItem(STORAGE_KEY, JSON.stringify(current));
    storage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(legacy));

    expect(loadState()).toEqual(current);
  });

  it("usa a chave legada quando a versão atual ainda não existe", () => {
    const legacy = makeState({ currentMode: "truth", players: ["Legado"] });
    storage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(legacy));

    expect(loadState()).toEqual(legacy);
  });

  it("rejeita JSON inválido ou valores que não são objetos", () => {
    storage.setItem(STORAGE_KEY, "{ quebrado");
    expect(loadState()).toBeNull();

    storage.setItem(STORAGE_KEY, JSON.stringify(["não é estado"]));
    expect(loadState()).toBeNull();
  });

  it("salva o estado completo e remove as chaves atual e legada", () => {
    const state = makeState({ players: ["Salva"], scores: { Salva: 2 } });

    saveState(state);
    expect(JSON.parse(storage.getItem(STORAGE_KEY) ?? "null")).toEqual(state);

    storage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(state));
    clearState();
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
    expect(storage.getItem(LEGACY_STORAGE_KEY)).toBeNull();
  });
});
