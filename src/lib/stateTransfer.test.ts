import { describe, expect, it } from "vitest";

import { CATEGORIES, type CardItem, type Category } from "../data/taxonomy";
import {
  EXPORT_FORMAT_VERSION,
  describeMergeResult,
  mergeCustomCards,
  parseGameState,
  serializeGameState,
  type TransferableState,
} from "./stateTransfer";

function categories(overrides: Partial<Record<Category, boolean>> = {}): Record<Category, boolean> {
  return Object.fromEntries(
    CATEGORIES.map((category) => [category, overrides[category] ?? true]),
  ) as Record<Category, boolean>;
}

function makeState(): TransferableState {
  return {
    players: ["Ana", "Bia"],
    currentMode: "truth",
    levelIndex: 2,
    cats: categories({ cute: false }),
    customCards: [
      {
        id: "custom-1",
        mode: "truth",
        text: "Pergunta salva",
        level: "hot",
        cats: ["deep", "romantic"],
      },
    ],
    hiddenIds: ["n1"],
    scores: { Ana: 2 },
  };
}

describe("stateTransfer", () => {
  it("serializa e lê de volta o formato atual completo", () => {
    const state = makeState();
    const serialized = serializeGameState(state);

    expect(JSON.parse(serialized)).toMatchObject({ version: EXPORT_FORMAT_VERSION, ...state });
    expect(parseGameState(serialized)).toEqual({
      ok: true,
      format: "current",
      state,
    });
  });

  it("normaliza espaços e duplicatas sem perder campos válidos", () => {
    const state = makeState();
    const result = parseGameState(
      JSON.stringify({
        version: EXPORT_FORMAT_VERSION,
        players: [" Ana ", "Ana", "Bia"],
        currentMode: " truth ",
        levelIndex: 2,
        cats: categories({ cute: false }),
        customCards: [
          {
            id: " custom-1 ",
            mode: "truth",
            text: "  Pergunta salva  ",
            level: "hot",
            cats: [" deep ", "deep", "romantic"],
          },
        ],
        hiddenIds: [" n1 ", "n1"],
        scores: { " Ana ": 2 },
      }),
    );

    expect(result).toEqual({
      ok: true,
      format: "current",
      state: {
        ...state,
        players: ["Ana", "Bia"],
        customCards: [
          {
            id: "custom-1",
            mode: "truth",
            text: "Pergunta salva",
            level: "hot",
            cats: ["deep", "romantic"],
          },
        ],
        hiddenIds: ["n1"],
      },
    });
  });

  it("aceita exportação antiga sem filtros e identifica o formato legado", () => {
    const state = makeState();
    const { currentMode: _mode, levelIndex: _level, cats: _cats, ...legacy } = state;

    expect(parseGameState(JSON.stringify(legacy))).toEqual({
      ok: true,
      format: "legacy",
      state: legacy,
    });
  });

  it("rejeita versão desconhecida, campos ausentes e cards malformados", () => {
    const state = JSON.parse(serializeGameState(makeState())) as Record<string, unknown>;

    expect(parseGameState(JSON.stringify({ ...state, version: 99 }))).toMatchObject({
      ok: false,
      error: expect.stringContaining("Versão de estado não suportada"),
    });
    expect(parseGameState(JSON.stringify({ ...state, scores: undefined }))).toMatchObject({
      ok: false,
      error: expect.stringContaining("Estado inválido"),
    });
    expect(
      parseGameState(
        JSON.stringify({
          ...state,
          customCards: [
            {
              id: "custom-invalid",
              mode: "truth",
              text: "",
              level: "hot",
              cats: ["deep"],
            },
          ],
        }),
      ),
    ).toMatchObject({
      ok: false,
      error: expect.stringContaining("Estado inválido"),
    });
    expect(parseGameState("não é JSON")).toMatchObject({
      ok: false,
      error: expect.stringContaining("JSON inválido"),
    });
  });
});

function card(overrides: Partial<CardItem> = {}): CardItem {
  return { id: "custom-a", mode: "truth", text: "Pergunta", level: "cute", cats: ["cute"], ...overrides };
}

describe("mergeCustomCards", () => {
  const newIds = () => {
    let n = 0;
    return () => `custom-novo-${++n}`;
  };

  it("soma as cartas novas e mantém os ids que estão livres", () => {
    const incoming = [card({ id: "custom-x", text: "Nova" }), card({ id: "custom-y", text: "Outra" })];

    const result = mergeCustomCards([card({ id: "custom-a" })], incoming, new Set(), newIds());

    expect(result.added).toEqual(incoming);
    expect(result.skipped).toBe(0);
  });

  it("ignora a carta que o baralho já tem — mesmo modo e mesmo texto, sem contar caixa e espaços", () => {
    const existing = [card({ id: "n1", mode: "never", text: "Nunca viajei de avião" })];
    const incoming = [
      card({ id: "custom-1", mode: "never", text: "  nunca   viajei de AVIÃO " }),
      card({ id: "custom-2", mode: "truth", text: "Nunca viajei de avião" }),
      card({ id: "custom-3", mode: "truth", text: "Nunca viajei de avião" }),
    ];

    const result = mergeCustomCards(existing, incoming, new Set(["n1"]), newIds());

    expect(result.added.map((c) => c.id)).toEqual(["custom-2"]);
    expect(result.skipped).toBe(2);
  });

  it("dá id novo à carta cujo id já está em uso, sem mexer no resto da carta", () => {
    const existing = [card({ id: "custom-a", text: "Minha carta" })];
    const incoming = [card({ id: "custom-a", text: "Carta de outra pessoa", level: "hot", cats: ["kink"] })];

    const result = mergeCustomCards(existing, incoming, new Set(["custom-a", "custom-oculta"]), newIds());

    expect(result.added).toEqual([{ ...incoming[0], id: "custom-novo-1" }]);
  });

  it("não reaproveita um id reservado, como o de uma carta apagada que segue oculta", () => {
    const incoming = [card({ id: "custom-oculta", text: "Volta no arquivo" })];

    const result = mergeCustomCards([], incoming, new Set(["custom-oculta"]), newIds());

    expect(result.added[0]?.id).toBe("custom-novo-1");
  });
});

describe("describeMergeResult", () => {
  it("conta o que entrou e o que já existia", () => {
    expect(describeMergeResult({ added: 3, skipped: 0 })).toBe("3 cartas somadas ao seu baralho.");
    expect(describeMergeResult({ added: 1, skipped: 2 })).toBe(
      "1 carta somada ao seu baralho; 2 já estavam nele.",
    );
    expect(describeMergeResult({ added: 0, skipped: 1 })).toBe(
      "Nenhuma carta nova: a do arquivo já estava no seu baralho.",
    );
    expect(describeMergeResult({ added: 0, skipped: 4 })).toBe(
      "Nenhuma carta nova: as 4 do arquivo já estavam no seu baralho.",
    );
    expect(describeMergeResult({ added: 0, skipped: 0 })).toBe(
      "O arquivo não tem cartas próprias para somar.",
    );
  });
});
