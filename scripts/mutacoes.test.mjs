import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { MUTACOES, aplicarMutacao, classificar } from "./mutacoes.mjs";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("aplicarMutacao", () => {
  it("troca o trecho que aparece uma vez", () => {
    const mutada = aplicarMutacao("a <= b; c", { id: "T", de: "<=", para: "<" });
    expect(mutada).toBe("a < b; c");
  });

  it("não interpreta `$` no texto novo de uma troca por string", () => {
    expect(aplicarMutacao("x", { id: "T", de: "x", para: "$&$&" })).toBe("$&$&");
  });

  it("recusa o trecho que sumiu do código", () => {
    expect(() => aplicarMutacao("a < b", { id: "T", de: "<=", para: "<" })).toThrow(/T: .*0 vez/);
  });

  it("recusa o trecho que passou a aparecer duas vezes", () => {
    expect(() => aplicarMutacao("<= <=", { id: "T", de: "<=", para: "<" })).toThrow(/T: .*2 vez/);
  });

  it("com expressão regular, troca só a primeira ocorrência", () => {
    const mutada = aplicarMutacao("cats: [a], cats: [b]", { id: "T", de: /cats: \[[^\]]*\]/, para: "cats: []" });
    expect(mutada).toBe("cats: [], cats: [b]");
  });

  it("recusa a expressão regular que não casa", () => {
    expect(() => aplicarMutacao("sem nada", { id: "T", de: /cats: \[/, para: "x" })).toThrow(/T: .*não casou/);
  });
});

describe("classificar", () => {
  const arquivo = (status, testes) => ({ status, assertionResults: testes });
  const teste = (status, fullName) => ({ status, fullName });

  it("dá como morta a mutação que faz um teste falhar", () => {
    const relatorio = { testResults: [arquivo("failed", [teste("passed", "ok"), teste("failed", "a regra")])] };
    expect(classificar(relatorio)).toEqual({ estado: "morta", falhos: ["a regra"] });
  });

  it("dá como sobrevivente a mutação que deixa tudo verde", () => {
    const relatorio = { testResults: [arquivo("passed", [teste("passed", "ok")])] };
    expect(classificar(relatorio)).toEqual({ estado: "sobreviveu", falhos: [] });
  });

  it("não conta como morte o arquivo que só quebrou ao carregar", () => {
    const relatorio = { testResults: [arquivo("failed", []), arquivo("passed", [teste("passed", "ok")])] };
    expect(classificar(relatorio)).toEqual({ estado: "inválida", falhos: [] });
  });
});

describe("lista de mutações", () => {
  it("tem as 15 regras, com ids únicos", () => {
    const ids = MUTACOES.map((m) => m.id);
    expect(ids).toHaveLength(15);
    expect(new Set(ids).size).toBe(15);
  });

  it("ainda se aplica ao código atual — a lista não pode envelhecer em silêncio", () => {
    for (const mutacao of MUTACOES) {
      const fonte = readFileSync(join(RAIZ, mutacao.arquivo), "utf8");
      expect(aplicarMutacao(fonte, mutacao), mutacao.id).not.toBe(fonte);
    }
  });
});
