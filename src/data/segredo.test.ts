import { describe, expect, it } from "vitest";

import { paragrafos, senhaCorreta, temMensagem } from "./segredo";

/**
 * O segredo é um recado, não um desbloqueio de nível — ver o comentário de
 * história em `segredo.ts`. Estes testes travam as duas coisas que fariam o
 * easter egg falhar em silêncio: aceitar a senha errada, e abrir uma tela
 * vazia porque a mensagem ainda não foi escrita.
 */
describe("senhaCorreta", () => {
  it("aceita a senha exata", () => {
    expect(senhaCorreta("novidade")).toBe(true);
  });

  it("ignora caixa e espaço nas pontas, como já era antes", () => {
    expect(senhaCorreta("  NoViDaDe  ")).toBe(true);
  });

  it("recusa senha errada", () => {
    expect(senhaCorreta("nuclear")).toBe(false);
  });

  it("recusa vazio — senão Enter numa caixa em branco abriria o segredo", () => {
    expect(senhaCorreta("")).toBe(false);
    expect(senhaCorreta("   ")).toBe(false);
  });

  it("aceita senha própria quando informada", () => {
    expect(senhaCorreta("outra", "OUTRA")).toBe(true);
  });
});

describe("temMensagem", () => {
  it("reconhece mensagem escrita de verdade", () => {
    expect(temMensagem("Te amo, e é só isso mesmo.")).toBe(true);
  });

  it("mensagem vazia não conta", () => {
    expect(temMensagem("")).toBe(false);
    expect(temMensagem("   \n  ")).toBe(false);
  });

  it("o texto de exemplo do arquivo NÃO conta como mensagem", () => {
    // Sem isto, o easter egg "funcionaria" mostrando a instrução de
    // preenchimento para a pessoa que deveria receber o recado.
    expect(
      temMensagem("Escreva aqui o que você quer que ela leia.\n\nOutra linha."),
    ).toBe(false);
  });

  it("o arquivo hoje ainda está com o texto de exemplo", () => {
    // Guarda de entrega: quando o Felipe escrever a mensagem, este teste falha
    // e é para ser apagado — é o lembrete de que o conteúdo entrou.
    expect(temMensagem()).toBe(false);
  });
});

describe("paragrafos", () => {
  it("separa por linha em branco", () => {
    expect(paragrafos("um\n\ndois")).toEqual(["um", "dois"]);
  });

  it("mantém quebra simples dentro do mesmo parágrafo", () => {
    expect(paragrafos("uma linha\noutra linha")).toEqual([
      "uma linha\noutra linha",
    ]);
  });

  it("ignora linhas em branco extras em vez de gerar parágrafo vazio", () => {
    expect(paragrafos("um\n\n\n\n  \n\ndois")).toEqual(["um", "dois"]);
  });

  it("mensagem vazia não gera parágrafo", () => {
    expect(paragrafos("   ")).toEqual([]);
  });
});
