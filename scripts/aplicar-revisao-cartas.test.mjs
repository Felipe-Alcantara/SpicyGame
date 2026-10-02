import { describe, expect, it } from "vitest";
import { ErroDeRevisao, planejarRevisoes, validarRevisoes } from "./aplicar-revisao-cartas.mjs";

const FONTE = [
  "export const X = [",
  '  { id: "n4", mode: "never", text: "Eu nunca fantasi… sobre {p}.", level: "hot", cats: ["spicy"] },',
  '  { id: "n40", mode: "never", text: "Eu nunca ensaiei uma conversa.", level: "cute", cats: ["funny"] },',
  "];",
].join("\n");

const revisao = (extra = {}) => ({
  id: "n4",
  de: "Eu nunca fantasi… sobre {p}.",
  para: "Eu nunca fantasiei sobre {p}.",
  motivo: "texto cortado",
  ...extra,
});

describe("planejarRevisoes", () => {
  it("troca só o texto da carta certa, sem confundir n4 com n40", () => {
    const { resultados, fontes } = planejarRevisoes({ "never.ts": FONTE }, [revisao()]);
    expect(resultados).toEqual([expect.objectContaining({ id: "n4", estado: "aplicar" })]);
    expect(fontes["never.ts"]).toContain('text: "Eu nunca fantasiei sobre {p}."');
    expect(fontes["never.ts"]).toContain('text: "Eu nunca ensaiei uma conversa."');
    expect(fontes["never.ts"].split("\n")).toHaveLength(FONTE.split("\n").length);
  });

  it("é idempotente: revisão já aplicada não muda nada", () => {
    const primeira = planejarRevisoes({ "never.ts": FONTE }, [revisao()]).fontes;
    const segunda = planejarRevisoes(primeira, [revisao()]);
    expect(segunda.resultados[0].estado).toBe("ja-aplicada");
    expect(segunda.fontes).toEqual(primeira);
  });

  it("recusa quando o texto atual não é nem o de nem o para", () => {
    const { resultados, fontes } = planejarRevisoes({ "never.ts": FONTE }, [revisao({ de: "outro texto" })]);
    expect(resultados[0].estado).toBe("erro");
    expect(fontes["never.ts"]).toBe(FONTE);
  });

  it("recusa carta que não existe ou que aparece em mais de um arquivo", () => {
    const sumida = planejarRevisoes({ "never.ts": FONTE }, [revisao({ id: "n999" })]);
    expect(sumida.resultados[0]).toMatchObject({ estado: "erro", detalhe: expect.stringContaining("nenhum") });
    const dobrada = planejarRevisoes({ "a.ts": FONTE, "b.ts": FONTE }, [revisao()]);
    expect(dobrada.resultados[0]).toMatchObject({ estado: "erro", detalhe: expect.stringContaining("2 arquivos") });
  });
});

const FONTE_POR_NIVEL = [
  "export const X = [",
  "  // ---------- Fofo ----------",
  '  { id: "d1", mode: "dare", text: "Abraço.", level: "cute", cats: ["cute"] },',
  "",
  "  // ---------- Picante ----------",
  '  { id: "d4", mode: "dare", text: "Dança.", level: "spicy", cats: ["funny"] },',
  '  { id: "d5", mode: "dare", text: "Beijo.", level: "spicy", cats: ["spicy"] },',
  "",
  "  // ---------- Hot ----------",
  '  { id: "d9", mode: "dare", text: "Massagem.", level: "hot", cats: ["spicy"] },',
  "];",
].join("\n");

describe("planejarRevisoes — nível e categorias", () => {
  it("muda o nível e leva a carta para o fim da seção do novo nível", () => {
    const r = { id: "d4", nivel: { de: "spicy", para: "cute" }, motivo: "suave demais" };
    const { resultados, fontes } = planejarRevisoes({ "dare.ts": FONTE_POR_NIVEL }, [r]);
    expect(resultados[0]).toMatchObject({ estado: "aplicar", detalhe: expect.stringContaining("spicy → cute") });
    const linhas = fontes["dare.ts"].split("\n");
    expect(linhas[3]).toContain('id: "d4"');
    expect(linhas[3]).toContain('level: "cute"');
    expect(linhas[4]).toBe("");
    expect(linhas[6]).toContain('id: "d5"');
    expect(linhas).toHaveLength(FONTE_POR_NIVEL.split("\n").length);
  });

  it("move para o fim do baralho quando o novo nível é a última seção", () => {
    const r = { id: "d1", nivel: { de: "cute", para: "hot" }, motivo: "x" };
    const linhas = planejarRevisoes({ "dare.ts": FONTE_POR_NIVEL }, [r]).fontes["dare.ts"].split("\n");
    expect(linhas.at(-2)).toContain('id: "d1"');
    expect(linhas.at(-1)).toBe("];");
  });

  it("troca categorias e texto juntos, no formato do arquivo", () => {
    const r = { id: "d5", de: "Beijo.", para: "Beijo longo.", cats: { de: ["spicy"], para: ["spicy", "romantic"] }, motivo: "x" };
    const { fontes } = planejarRevisoes({ "dare.ts": FONTE_POR_NIVEL }, [r]);
    expect(fontes["dare.ts"]).toContain('text: "Beijo longo.", level: "spicy", cats: ["spicy", "romantic"] }');
  });

  it("é idempotente com nível e categorias", () => {
    const r = { id: "d4", nivel: { de: "spicy", para: "hot" }, cats: { de: ["funny"], para: ["spicy"] }, motivo: "x" };
    const primeira = planejarRevisoes({ "dare.ts": FONTE_POR_NIVEL }, [r]).fontes;
    const segunda = planejarRevisoes(primeira, [r]);
    expect(segunda.resultados[0].estado).toBe("ja-aplicada");
    expect(segunda.fontes).toEqual(primeira);
  });

  it("recusa a carta inteira quando uma das partes não bate, sem aplicar as outras", () => {
    const r = { id: "d4", de: "Dança.", para: "Dança lenta.", nivel: { de: "hot", para: "cute" }, motivo: "x" };
    const { resultados, fontes } = planejarRevisoes({ "dare.ts": FONTE_POR_NIVEL }, [r]);
    expect(resultados[0]).toMatchObject({ estado: "erro", detalhe: expect.stringContaining("nível") });
    expect(fontes["dare.ts"]).toBe(FONTE_POR_NIVEL);
  });
});

describe("validarRevisoes", () => {
  it("exige lista não vazia, campos preenchidos, mudança real e carta única", () => {
    expect(() => validarRevisoes({})).toThrow(ErroDeRevisao);
    expect(() => validarRevisoes({ revisoes: [revisao({ motivo: " " })] })).toThrow(/motivo/);
    expect(() => validarRevisoes({ revisoes: [revisao({ para: revisao().de })] })).toThrow(/iguais/);
    expect(() => validarRevisoes({ revisoes: [revisao(), revisao()] })).toThrow(/duas vezes/);
    expect(validarRevisoes({ revisoes: [revisao()] })).toHaveLength(1);
  });

  it("aceita revisão só de nível ou só de categorias, e recusa nível ou categoria fora da taxonomia", () => {
    const soNivel = { id: "d4", nivel: { de: "spicy", para: "cute" }, motivo: "x" };
    const soCats = { id: "d5", cats: { de: ["drink"], para: ["funny"] }, motivo: "x" };
    expect(validarRevisoes({ revisoes: [soNivel, soCats] })).toHaveLength(2);
    expect(() => validarRevisoes({ revisoes: [{ id: "d4", motivo: "x" }] })).toThrow(/nada para mudar/);
    expect(() => validarRevisoes({ revisoes: [{ ...soNivel, nivel: { de: "spicy", para: "mild" } }] })).toThrow(/nível/);
    expect(() => validarRevisoes({ revisoes: [{ ...soCats, cats: { de: ["drink"], para: ["bebida"] } }] })).toThrow(/categoria/);
    expect(() => validarRevisoes({ revisoes: [{ ...soCats, cats: { de: ["drink"], para: [] } }] })).toThrow(/categoria/);
    expect(() => validarRevisoes({ revisoes: [{ ...soNivel, de: "Dança." }] })).toThrow(/"de" e "para"/);
  });
});
