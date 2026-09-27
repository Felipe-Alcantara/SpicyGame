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

describe("validarRevisoes", () => {
  it("exige lista não vazia, campos preenchidos, mudança real e carta única", () => {
    expect(() => validarRevisoes({})).toThrow(ErroDeRevisao);
    expect(() => validarRevisoes({ revisoes: [revisao({ motivo: " " })] })).toThrow(/motivo/);
    expect(() => validarRevisoes({ revisoes: [revisao({ para: revisao().de })] })).toThrow(/iguais/);
    expect(() => validarRevisoes({ revisoes: [revisao(), revisao()] })).toThrow(/duas vezes/);
    expect(validarRevisoes({ revisoes: [revisao()] })).toHaveLength(1);
  });
});
