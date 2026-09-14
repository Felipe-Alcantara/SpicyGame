import { describe, expect, it } from "vitest";

import { CATEGORIES, type Category } from "../data/taxonomy";
import type { PersistedState } from "./storage";
import {
  EXPORT_FORMAT_VERSION,
  parseGameState,
  serializeGameState,
} from "./stateTransfer";

function categories(overrides: Partial<Record<Category, boolean>> = {}): Record<Category, boolean> {
  return Object.fromEntries(
    CATEGORIES.map((category) => [category, overrides[category] ?? true]),
  ) as Record<Category, boolean>;
}

function makeState(): PersistedState {
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
