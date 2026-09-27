#!/usr/bin/env node
/**
 * Aplica um arquivo de revisão de cartas ao baralho base (`src/data/cards/*.ts`).
 *
 * Cada revisão troca o texto de uma carta e carrega o motivo da troca, para que
 * a correção fique auditável em vez de sumir numa edição manual. O script é
 * idempotente: revisão já aplicada é pulada, e só grava quando TODAS as revisões
 * do arquivo batem com o baralho atual — se uma falhar, nada é escrito.
 *
 * Uso:
 *   node scripts/aplicar-revisao-cartas.mjs <revisao.json>            simula
 *   node scripts/aplicar-revisao-cartas.mjs <revisao.json> --aplicar  grava
 *
 * Formato do arquivo: { "revisoes": [{ "id", "de", "para", "motivo" }] }.
 * Hoje só o texto é revisado; nível e categorias continuam sendo editados no
 * próprio arquivo do modo.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const ARQUIVOS_DO_BARALHO = ["never", "most", "truth", "dare"].map((modo) =>
  join(RAIZ, "src", "data", "cards", `${modo}.ts`)
);

/** Erro de revisão: a mensagem já é o que a pessoa precisa ler. */
export class ErroDeRevisao extends Error {}

/** Confere o formato do arquivo antes de tocar em qualquer fonte. */
export function validarRevisoes(documento) {
  const revisoes = documento?.revisoes;
  if (!Array.isArray(revisoes) || revisoes.length === 0) {
    throw new ErroDeRevisao('O arquivo precisa de uma lista "revisoes" com ao menos um item.');
  }
  const vistos = new Set();
  for (const [indice, r] of revisoes.entries()) {
    for (const campo of ["id", "de", "para", "motivo"]) {
      if (typeof r?.[campo] !== "string" || !r[campo].trim()) {
        throw new ErroDeRevisao(`Revisão ${indice + 1}: o campo "${campo}" é obrigatório e não pode ser vazio.`);
      }
    }
    if (r.de === r.para) throw new ErroDeRevisao(`Revisão ${r.id}: "de" e "para" são iguais.`);
    if (vistos.has(r.id)) throw new ErroDeRevisao(`Revisão ${r.id}: a mesma carta aparece duas vezes.`);
    vistos.add(r.id);
  }
  return revisoes;
}

/**
 * Planeja as revisões sobre as fontes em memória, sem gravar nada.
 *
 * @param {Record<string, string>} fontes caminho do arquivo → conteúdo
 * @param {{ id: string, de: string, para: string, motivo: string }[]} revisoes
 * @returns {{ resultados: { id: string, estado: "aplicar" | "ja-aplicada" | "erro", detalhe: string }[],
 *             fontes: Record<string, string> }}
 */
export function planejarRevisoes(fontes, revisoes) {
  const novas = { ...fontes };
  const resultados = [];

  for (const r of revisoes) {
    const marcador = `id: ${JSON.stringify(r.id)},`;
    const locais = Object.keys(novas).filter((arquivo) => novas[arquivo].includes(marcador));
    if (locais.length !== 1) {
      const onde = locais.length ? `em ${locais.length} arquivos` : "em nenhum arquivo do baralho";
      resultados.push({ id: r.id, estado: "erro", detalhe: `carta encontrada ${onde}` });
      continue;
    }

    const arquivo = locais[0];
    const conteudo = novas[arquivo];
    const inicio = conteudo.indexOf(marcador);
    const fimDaLinha = conteudo.indexOf("\n", inicio);
    const fim = fimDaLinha === -1 ? conteudo.length : fimDaLinha;
    const linha = conteudo.slice(inicio, fim);
    const textoAntigo = `text: ${JSON.stringify(r.de)}`;
    const textoNovo = `text: ${JSON.stringify(r.para)}`;

    if (linha.includes(textoNovo)) {
      resultados.push({ id: r.id, estado: "ja-aplicada", detalhe: r.para });
    } else if (linha.includes(textoAntigo)) {
      novas[arquivo] = conteudo.slice(0, inicio) + linha.replace(textoAntigo, textoNovo) + conteudo.slice(fim);
      resultados.push({ id: r.id, estado: "aplicar", detalhe: `${r.de}  →  ${r.para}` });
    } else {
      resultados.push({
        id: r.id,
        estado: "erro",
        detalhe: 'o texto atual não é nem o "de" nem o "para" da revisão — o baralho mudou desde que ela foi escrita',
      });
    }
  }

  return { resultados, fontes: novas };
}

function principal(argumentos) {
  const aplicar = argumentos.includes("--aplicar");
  const caminho = argumentos.find((a) => !a.startsWith("--"));
  if (!caminho) {
    throw new ErroDeRevisao("Informe o arquivo de revisão: node scripts/aplicar-revisao-cartas.mjs <revisao.json> [--aplicar]");
  }

  let documento;
  try {
    documento = JSON.parse(readFileSync(caminho, "utf8"));
  } catch (erro) {
    throw new ErroDeRevisao(`Não consegui ler ${caminho} como JSON: ${erro.message}`);
  }
  const revisoes = validarRevisoes(documento);

  const fontes = Object.fromEntries(ARQUIVOS_DO_BARALHO.map((arquivo) => [arquivo, readFileSync(arquivo, "utf8")]));
  const { resultados, fontes: novas } = planejarRevisoes(fontes, revisoes);

  const rotulo = { aplicar: aplicar ? "aplicada " : "aplicaria", "ja-aplicada": "já estava", erro: "ERRO     " };
  for (const r of resultados) console.log(`${rotulo[r.estado]}  ${r.id.padEnd(6)} ${r.detalhe}`);

  const erros = resultados.filter((r) => r.estado === "erro").length;
  const pendentes = resultados.filter((r) => r.estado === "aplicar").length;
  if (erros) {
    console.error(`\n${erros} revisão(ões) com erro — nenhum arquivo foi alterado.`);
    return 1;
  }
  if (!aplicar) {
    console.log(`\nSimulação: ${pendentes} a aplicar. Rode de novo com --aplicar para gravar.`);
    return 0;
  }
  for (const arquivo of ARQUIVOS_DO_BARALHO) {
    if (novas[arquivo] !== fontes[arquivo]) {
      writeFileSync(arquivo, novas[arquivo]);
      console.log(`gravado: ${relative(RAIZ, arquivo)}`);
    }
  }
  console.log(`\n${pendentes} revisão(ões) aplicada(s). Rode npm test para conferir o baralho.`);
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    process.exitCode = principal(process.argv.slice(2));
  } catch (erro) {
    if (!(erro instanceof ErroDeRevisao)) throw erro;
    console.error(erro.message);
    process.exitCode = 1;
  }
}
