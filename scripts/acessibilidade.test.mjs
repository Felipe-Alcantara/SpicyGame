import { describe, expect, it } from "vitest";
import {
  FUNDO_DA_PAGINA,
  compor,
  contrasteMinimo,
  ehTextoGrande,
  lerCor,
  luminancia,
  razaoDeContraste,
} from "./acessibilidade.mjs";

const BRANCO = { r: 255, g: 255, b: 255, a: 1 };
const PRETO = { r: 0, g: 0, b: 0, a: 1 };

describe("lerCor", () => {
  it("lê rgb e rgba com vírgula", () => {
    expect(lerCor("rgb(255, 228, 230)")).toEqual({ r: 255, g: 228, b: 230, a: 1 });
    expect(lerCor("rgba(255, 228, 230, 0.3)")).toEqual({ r: 255, g: 228, b: 230, a: 0.3 });
  });

  it("lê a sintaxe moderna com espaço e barra, inclusive alfa em porcentagem", () => {
    expect(lerCor("rgb(255 228 230 / 0.6)")).toEqual({ r: 255, g: 228, b: 230, a: 0.6 });
    expect(lerCor("rgb(0 0 0 / 40%)")).toEqual({ r: 0, g: 0, b: 0, a: 0.4 });
  });

  it("devolve null para o que não é rgb (transparent, nomes, lixo)", () => {
    expect(lerCor("transparent")).toBeNull();
    expect(lerCor("red")).toBeNull();
    expect(lerCor("")).toBeNull();
  });
});

describe("compor", () => {
  it("mistura a cor com alfa sobre o fundo opaco", () => {
    expect(compor({ r: 255, g: 255, b: 255, a: 0.5 }, PRETO)).toEqual({ r: 127.5, g: 127.5, b: 127.5, a: 1 });
  });

  it("alfa 1 devolve a própria cor; alfa 0 devolve o fundo", () => {
    expect(compor(BRANCO, PRETO)).toEqual(BRANCO);
    expect(compor({ ...BRANCO, a: 0 }, PRETO)).toEqual(PRETO);
  });
});

describe("razaoDeContraste", () => {
  it("branco sobre preto é 21:1, e a ordem dos argumentos não importa", () => {
    expect(razaoDeContraste(BRANCO, PRETO)).toBeCloseTo(21, 5);
    expect(razaoDeContraste(PRETO, BRANCO)).toBeCloseTo(21, 5);
  });

  it("mesma cor é 1:1", () => {
    expect(razaoDeContraste(BRANCO, BRANCO)).toBe(1);
  });

  it("bate com o valor de referência do WCAG para #767676 sobre branco (4,54:1)", () => {
    expect(razaoDeContraste({ r: 118, g: 118, b: 118, a: 1 }, BRANCO)).toBeCloseTo(4.54, 2);
  });

  it("luminância de preto é 0 e de branco é 1", () => {
    expect(luminancia(PRETO)).toBe(0);
    expect(luminancia(BRANCO)).toBeCloseTo(1, 10);
  });

  it("texto rose-100 a 30% sobre o fundo da página reprova e a 60% passa", () => {
    const rosa = { r: 255, g: 228, b: 230 };
    const trinta = razaoDeContraste(compor({ ...rosa, a: 0.3 }, FUNDO_DA_PAGINA), FUNDO_DA_PAGINA);
    const sessenta = razaoDeContraste(compor({ ...rosa, a: 0.6 }, FUNDO_DA_PAGINA), FUNDO_DA_PAGINA);
    expect(trinta).toBeLessThan(4.5);
    expect(sessenta).toBeGreaterThan(4.5);
  });
});

describe("texto grande", () => {
  it("24 px é grande; 18,66 px só em negrito", () => {
    expect(ehTextoGrande(24, 400)).toBe(true);
    expect(ehTextoGrande(18.66, 700)).toBe(true);
    expect(ehTextoGrande(18.66, 400)).toBe(false);
    expect(ehTextoGrande(16, 700)).toBe(false);
  });

  it("exige 3:1 do texto grande e 4,5:1 do resto", () => {
    expect(contrasteMinimo(30, 400)).toBe(3);
    expect(contrasteMinimo(14, 400)).toBe(4.5);
  });
});
