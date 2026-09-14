import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { levelRank, type CardItem, type Category } from "../data/taxonomy";
import { STORAGE_KEY } from "../lib/storage";
import { MemoryStorage } from "../test-utils";
import { useGameSession, type GameSession } from "./useGameSession";

const LEGACY_STORAGE_KEY = "couple-night-state-v1";

function makeCard(overrides: Partial<CardItem> = {}): CardItem {
  return {
    id: "custom-test-card",
    mode: "never",
    text: "Carta customizada de teste",
    level: "cute",
    cats: ["cute"],
    ...overrides,
  };
}

function readJson<T>(storage: Storage, key: string): T {
  const raw = storage.getItem(key);
  if (!raw) throw new Error(`Nenhum valor salvo em ${key}`);
  return JSON.parse(raw) as T;
}

type HookProbeProps = {
  onRender: (session: GameSession) => void;
};

function HookProbe({ onRender }: HookProbeProps) {
  onRender(useGameSession());
  return null;
}

type MountedSession = {
  get: () => GameSession;
  update: (callback: () => void) => void;
  unmount: () => void;
};

function mountSession(): MountedSession {
  let latest: GameSession | undefined;
  let renderer: ReactTestRenderer | undefined;

  act(() => {
    renderer = create(
      createElement(HookProbe, {
        onRender: (session) => {
          latest = session;
        },
      }),
    );
  });

  return {
    get: () => {
      if (!latest) throw new Error("O hook ainda não renderizou");
      return latest;
    },
    update: (callback) => {
      act(callback);
    },
    unmount: () => {
      if (!renderer) return;
      act(() => renderer?.unmount());
    },
  };
}

let storage: MemoryStorage;
let mounted: MountedSession | undefined;

beforeEach(() => {
  storage = new MemoryStorage();
  vi.stubGlobal("localStorage", storage);
});

afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function startSession(): MountedSession {
  const session = mountSession();
  mounted = session;
  return session;
}

describe("useGameSession — hidratação e persistência", () => {
  it("hidrata o estado salvo, mescla categorias novas e monta o baralho", () => {
    const hiddenCustomCard = makeCard({
      id: "custom-card-hidden",
      mode: "truth",
      level: "hot",
      cats: ["spicy"],
    });
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        players: ["Ana", "Bia"],
        currentMode: "truth",
        levelIndex: 2,
        cats: { cute: false },
        customCards: [hiddenCustomCard],
        hiddenIds: [hiddenCustomCard.id],
        scores: { Ana: 3 },
      }),
    );

    const session = startSession().get();

    expect(session.players).toEqual(["Ana", "Bia"]);
    expect(session.currentMode).toBe("truth");
    expect(session.levelIndex).toBe(2);
    expect(session.level).toBe("hot");
    expect(session.cats.cute).toBe(false);
    expect(session.cats.funny).toBe(true);
    expect(session.customCards).toEqual([hiddenCustomCard]);
    expect(session.hiddenIds).toEqual([hiddenCustomCard.id]);
    expect(session.scores).toEqual({ Ana: 3 });
    expect(session.deck.some((card) => card.id === hiddenCustomCard.id)).toBe(false);
    expect(new Set(session.deck.map((card) => card.id)).size).toBe(session.deck.length);
    expect(session.deck.every((card) => card.mode === "truth")).toBe(true);
    expect(session.deck.every((card) => levelRank(card.level) <= 2)).toBe(true);
  });

  it("salva alterações somente depois da hidratação", () => {
    const session = startSession();

    session.update(() => {
      const current = session.get();
      current.addPlayer("  Lia ");
      current.addPlayer("Lia");
      current.addPlayer("   ");
      current.addPoint("Lia", 3);
      current.toggleCategory("cute", false);
    });

    const saved = readJson<{
      players: string[];
      cats: Record<Category, boolean>;
      scores: Record<string, number>;
    }>(storage, STORAGE_KEY);
    expect(saved.players).toEqual(["Ela", "Ele", "Lia"]);
    expect(saved.cats.cute).toBe(false);
    expect(saved.scores).toEqual({ Lia: 3 });
  });

  it("migra a leitura da chave legada para a nova chave ao salvar", () => {
    storage.setItem(
      LEGACY_STORAGE_KEY,
      JSON.stringify({
        players: ["Jo"],
        currentMode: "dare",
        levelIndex: 3,
        cats: { romantic: false },
        customCards: [],
        hiddenIds: [],
        scores: { Jo: 4 },
      }),
    );

    const session = startSession().get();

    expect(session.players).toEqual(["Jo"]);
    expect(session.currentMode).toBe("dare");
    expect(session.levelIndex).toBe(3);
    expect(session.cats.romantic).toBe(false);
    expect(session.scores).toEqual({ Jo: 4 });
    expect(storage.getItem(STORAGE_KEY)).not.toBeNull();
    expect(readJson<{ currentMode: string }>(storage, STORAGE_KEY).currentMode).toBe("dare");
  });

  it("ignora persistência inválida e regrava um estado padrão utilizável", () => {
    storage.setItem(STORAGE_KEY, "{ estado quebrado");

    const session = startSession().get();

    expect(session.players).toEqual(["Ela", "Ele"]);
    expect(session.currentMode).toBe("never");
    expect(session.levelIndex).toBe(1);
    expect(readJson<{ players: string[] }>(storage, STORAGE_KEY).players).toEqual([
      "Ela",
      "Ele",
    ]);
  });
});

describe("useGameSession — baralho e filtros", () => {
  it("percorre cada carta uma vez antes de reembaralhar", () => {
    const session = startSession();
    const initialDeck = session.get().deck.map((card) => card.id);

    expect(initialDeck.length).toBeGreaterThan(1);
    expect(new Set(initialDeck).size).toBe(initialDeck.length);

    const visited = [session.get().currentCard?.id];
    for (let index = 1; index < initialDeck.length; index += 1) {
      session.update(() => session.get().nextCard());
      visited.push(session.get().currentCard?.id);
    }

    expect(visited).toEqual(initialDeck);
    expect(session.get().cursor).toBe(initialDeck.length - 1);

    session.update(() => session.get().nextCard());
    expect(session.get().cursor).toBe(0);
    expect(new Set(session.get().deck.map((card) => card.id))).toEqual(new Set(initialDeck));
  });

  it("reinicia o cursor ao reembaralhar e não recua abaixo da primeira carta", () => {
    const session = startSession();
    const poolIds = new Set(session.get().deck.map((card) => card.id));

    session.update(() => session.get().nextCard());
    expect(session.get().cursor).toBe(1);

    session.update(() => session.get().reshuffle());
    expect(session.get().cursor).toBe(0);
    expect(new Set(session.get().deck.map((card) => card.id))).toEqual(poolIds);

    session.update(() => session.get().previousCard());
    expect(session.get().cursor).toBe(0);
  });

  it("aplica modo, nível, categoria e cartas ocultas sem depender da ordem sorteada", () => {
    const session = startSession();

    session.update(() => {
      const current = session.get();
      current.setCurrentMode("truth");
      current.setLevelIndex(2);
    });

    let current = session.get();
    expect(current.deck.every((card) => card.mode === "truth")).toBe(true);
    expect(current.deck.every((card) => levelRank(card.level) <= 2)).toBe(true);

    const categorySource = current.allCards.find(
      (card) => card.mode === current.currentMode && levelRank(card.level) <= current.levelIndex,
    );
    if (!categorySource) throw new Error("O baralho de teste não tem carta para selecionar categoria");
    const category = categorySource.cats[0];

    session.update(() => session.get().setAllCategories(false));
    expect(Object.values(session.get().cats).every((value) => value === false)).toBe(true);

    session.update(() => session.get().toggleCategory(category, true));
    current = session.get();
    expect(current.deck.length).toBeGreaterThan(0);
    expect(current.deck.every((card) => card.cats.includes(category))).toBe(true);

    const hiddenId = current.deck[0]?.id;
    if (!hiddenId) throw new Error("O baralho filtrado deveria ter uma carta");
    session.update(() => session.get().toggleHidden(hiddenId));
    current = session.get();
    expect(current.hiddenIds).toContain(hiddenId);
    expect(current.deck.some((card) => card.id === hiddenId)).toBe(false);

    session.update(() => session.get().toggleHidden(hiddenId));
    expect(session.get().hiddenIds).not.toContain(hiddenId);
  });

  it("mantém as operações seguras quando todos os cards do modo estão ocultos", () => {
    const session = startSession();
    const idsToHide = session
      .get()
      .allCards.filter((card) => card.mode === session.get().currentMode)
      .map((card) => card.id);

    session.update(() => {
      for (const id of idsToHide) session.get().toggleHidden(id);
    });

    expect(session.get().poolSize).toBe(0);
    expect(session.get().deck).toEqual([]);
    expect(session.get().currentCard).toBeUndefined();
    expect(() => {
      session.update(() => {
        session.get().nextCard();
        session.get().previousCard();
        session.get().reshuffle();
      });
    }).not.toThrow();
  });
});

describe("useGameSession — jogadores, cartas e exportação", () => {
  it("normaliza jogadores, pontua sem permitir placar negativo e remove o score junto", () => {
    const session = startSession();

    session.update(() => {
      const current = session.get();
      current.addPlayer("  Ana ");
      current.addPlayer("Ana");
      current.addPlayer("   ");
    });
    expect(session.get().players).toEqual(["Ela", "Ele", "Ana"]);

    session.update(() => {
      const current = session.get();
      current.addPoint("Ana");
      current.addPoint("Ana", 2);
      current.addPoint("Ana", -10);
      current.addPoint("Bia", -1);
    });
    expect(session.get().scores).toEqual({ Ana: 0, Bia: 0 });

    session.update(() => session.get().removePlayer("Ana"));
    expect(session.get().players).toEqual(["Ela", "Ele"]);
    expect(session.get().scores).toEqual({ Bia: 0 });

    session.update(() => {
      const current = session.get();
      current.addPoint("Ele", 2);
      current.resetScores();
    });
    expect(session.get().scores).toEqual({});
  });

  it("cria, atualiza, duplica e apaga cartas customizadas com ids distintos", () => {
    const session = startSession();
    const input: Omit<CardItem, "id"> = {
      mode: "never",
      text: "Pergunta criada no teste",
      level: "cute",
      cats: ["cute"],
    };

    session.update(() => session.get().addCustomCard(input));
    let current = session.get();
    expect(current.customCards).toHaveLength(1);
    const original = current.customCards[0];
    if (!original) throw new Error("A carta customizada não foi criada");
    expect(original.id).toMatch(/^custom-/);
    expect(current.allCards).toContainEqual(original);

    session.update(() => session.get().updateCustomCard(original.id, { text: "Texto atualizado" }));
    current = session.get();
    expect(current.customCards[0]?.text).toBe("Texto atualizado");

    session.update(() => session.get().duplicateCard(current.customCards[0]!));
    current = session.get();
    expect(current.customCards).toHaveLength(2);
    expect(new Set(current.customCards.map((card) => card.id)).size).toBe(2);

    session.update(() => session.get().deleteCustomCard(original.id));
    expect(session.get().customCards).toHaveLength(1);
    expect(session.get().customCards[0]?.id).not.toBe(original.id);
  });

  it("exporta os dados editáveis e importa estado válido ou rejeita JSON inválido", () => {
    const session = startSession();
    const hiddenId = session.get().allCards.find((card) => card.mode === "never")?.id;
    if (!hiddenId) throw new Error("O baralho não tem carta para exportar como oculta");

    session.update(() => {
      const current = session.get();
      current.addPlayer("Carol");
      current.addPoint("Carol", 2);
      current.addCustomCard({
        mode: "never",
        text: "Exportada",
        level: "spicy",
        cats: ["romantic"],
      });
      current.toggleHidden(hiddenId);
    });

    const exported = JSON.parse(session.get().exportState()) as {
      players: string[];
      customCards: CardItem[];
      hiddenIds: string[];
      scores: Record<string, number>;
    };
    expect(exported.players).toContain("Carol");
    expect(exported.customCards.map((card) => card.text)).toContain("Exportada");
    expect(exported.hiddenIds).toContain(hiddenId);
    expect(exported.scores).toEqual({ Carol: 2 });

    let importResult: string | null = "não executado";
    const importedCard = makeCard({ id: "custom-imported", text: "Importada" });
    session.update(() => {
      importResult = session.get().importState(
        JSON.stringify({
          players: ["Dani"],
          customCards: [importedCard],
          hiddenIds: ["custom-imported"],
          scores: { Dani: 5 },
        }),
      );
    });
    expect(importResult).toBeNull();
    expect(session.get().players).toEqual(["Dani"]);
    expect(session.get().customCards).toEqual([importedCard]);
    expect(session.get().hiddenIds).toEqual(["custom-imported"]);
    expect(session.get().scores).toEqual({ Dani: 5 });

    const beforeInvalidImport = session.get();
    importResult = null;
    session.update(() => {
      importResult = session.get().importState("{ JSON inválido");
    });
    expect(importResult).toContain("JSON inválido");
    expect(session.get().players).toEqual(beforeInvalidImport.players);
    expect(session.get().scores).toEqual(beforeInvalidImport.scores);
  });

  it("restaura todos os defaults e limpa as chaves ao resetar", () => {
    storage.setItem(LEGACY_STORAGE_KEY, "estado legado");
    const session = startSession();

    session.update(() => {
      const current = session.get();
      current.setCurrentMode("dare");
      current.setLevelIndex(3);
      current.setAllCategories(false);
      current.addPlayer("Nina");
      current.addPoint("Nina", 2);
      current.addCustomCard({
        mode: "dare",
        text: "Temporária",
        level: "hot",
        cats: ["spicy"],
      });
      current.toggleHidden(current.allCards[0]!.id);
    });

    session.update(() => session.get().resetAll());
    const current = session.get();
    expect(current.players).toEqual(["Ela", "Ele"]);
    expect(current.currentMode).toBe("never");
    expect(current.levelIndex).toBe(1);
    expect(Object.values(current.cats).every((value) => value)).toBe(true);
    expect(current.customCards).toEqual([]);
    expect(current.hiddenIds).toEqual([]);
    expect(current.scores).toEqual({});
    expect(storage.getItem(LEGACY_STORAGE_KEY)).toBeNull();
    expect(readJson<{ players: string[] }>(storage, STORAGE_KEY).players).toEqual([
      "Ela",
      "Ele",
    ]);
  });
});
