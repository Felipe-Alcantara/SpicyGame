import { describe, expect, it } from "vitest";
import { ALL_BASE_CARDS, CARDS_BY_MODE } from ".";
import { CATEGORIES, LEVELS, MODES } from "../taxonomy";
import { replacePlaceholders } from "../../lib/placeholders";

describe("baralho base", () => {
  it("não repete id entre cartas", () => {
    const ids = ALL_BASE_CARDS.map((c) => c.id);
    const duplicated = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(duplicated).toEqual([]);
  });

  it("guarda cada carta no arquivo do próprio modo", () => {
    for (const mode of MODES) {
      const foreign = CARDS_BY_MODE[mode].filter((c) => c.mode !== mode);
      expect(foreign).toEqual([]);
    }
  });

  it("só usa níveis e categorias declarados na taxonomia", () => {
    for (const card of ALL_BASE_CARDS) {
      expect(LEVELS).toContain(card.level);
      expect(card.cats.length).toBeGreaterThan(0);
      for (const cat of card.cats) expect(CATEGORIES).toContain(cat);
    }
  });

  it("tem carta suficiente em todo modo e nível para a partida não secar", () => {
    for (const mode of MODES) {
      for (const level of LEVELS) {
        const count = CARDS_BY_MODE[mode].filter((c) => c.level === level).length;
        expect(count, `${mode}/${level}`).toBeGreaterThanOrEqual(5);
      }
    }
  });

  it("não deixa texto vazio nem curinga malformado", () => {
    for (const card of ALL_BASE_CARDS) {
      expect(card.text.trim().length).toBeGreaterThan(0);
      expect(card.text).not.toMatch(/\{p[^}2]/);
    }
  });
});

describe("curingas de nome", () => {
  it("sorteia pessoas diferentes para {p} e {p2}", () => {
    for (let i = 0; i < 50; i++) {
      const result = replacePlaceholders("{p} e {p2}", ["Ana", "Bia"]);
      expect(["Ana e Bia", "Bia e Ana"]).toContain(result);
    }
  });

  it("aguenta um jogador só sem quebrar", () => {
    expect(replacePlaceholders("{p} e {p2}", ["Ana"])).toBe("Ana e Ana");
  });

  it("não trava quando não há jogador nenhum", () => {
    expect(replacePlaceholders("{p}", [])).toBe("alguém aí");
  });
});
