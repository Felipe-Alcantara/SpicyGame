import { describe, expect, it } from "vitest";
import { ALL_BASE_CARDS, CARDS_BY_MODE } from ".";
import { CATEGORIES, CATEGORY_LABELS, LEVEL_LABELS, LEVELS, MODES } from "../taxonomy";
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

  it("não publica carta com texto cortado no meio", () => {
    // Reticências no baralho só apareceram como sobra de texto truncado ("fantasi…").
    const cortadas = ALL_BASE_CARDS.filter((c) => /…|\.\.\./.test(c.text)).map((c) => c.id);
    expect(cortadas).toEqual([]);
  });

  it("não nomeia ninguém no Mais Provável, onde os dois são candidatos", () => {
    // Com {p} sorteado, metade das vezes a pergunta aponta para a própria resposta.
    const comNome = CARDS_BY_MODE.most.filter((c) => /\{p2?\}/.test(c.text)).map((c) => c.id);
    expect(comNome).toEqual([]);
  });

  it("não põe artigo com gênero na frente de um nome sorteado", () => {
    // "do {p}" vira "do Ela"; use "de {p}", "pra {p}", "com {p}".
    const generoFixo = /\b(do|da|no|na|pelo|pela|ao|à)\s+\{p2?\}/i;
    const erradas = ALL_BASE_CARDS.filter((c) => generoFixo.test(c.text)).map((c) => c.id);
    expect(erradas).toEqual([]);
  });

  it("não marca gênero com '(a)': a carta serve para qualquer casal sem barra nem parêntese", () => {
    const marcadas = ALL_BASE_CARDS.filter((c) => /\w\((a|o)\)/.test(c.text)).map((c) => c.id);
    expect(marcadas).toEqual([]);
  });

  it("não depende de histórico que o app não guarda nem de rodada, que o app não tem", () => {
    const historico = /nesta partida|já sorteada|da rodada|\brodada\b/i;
    const dependentes = ALL_BASE_CARDS.filter((c) => historico.test(c.text)).map((c) => c.id);
    expect(dependentes).toEqual([]);
  });

  it("usa o imperativo em 'você' (Descreva, Responda), sem misturar com o de 'tu'", () => {
    const tu = /\b(Descreve|Responde|Fala|Conta)\b(?! (a|o|as|os|um|uma)\b)/;
    const misturadas = ALL_BASE_CARDS.filter((c) => tu.test(c.text)).map((c) => c.id);
    expect(misturadas).toEqual([]);
  });
});

describe("rótulos", () => {
  it("não repete nome entre nível e categoria, para o filtro não confundir os dois eixos", () => {
    const niveis = new Set(Object.values(LEVEL_LABELS));
    const repetidos = Object.values(CATEGORY_LABELS).filter((rotulo) => niveis.has(rotulo));
    expect(repetidos).toEqual([]);
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
