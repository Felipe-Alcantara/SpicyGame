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
 * Formato do arquivo: { "revisoes": [{ "id", "motivo", ...mudanças }] }, em que
 * cada revisão traz ao menos uma destas mudanças:
 *   "de" e "para"                      texto
 *   "nivel": { "de", "para" }          nível — a carta vai para o fim da seção do novo nível
 *   "cats": { "de": [...], "para": [...] }  categorias, na ordem em que ficam no arquivo
 * Uma revisão só é aplicada quando TODAS as suas partes batem com o baralho.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { CATEGORIES, LEVEL_LABELS, LEVELS } from "../src/data/taxonomy.ts";

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
    for (const campo of ["id", "motivo"]) {
      if (typeof r?.[campo] !== "string" || !r[campo].trim()) {
        throw new ErroDeRevisao(`Revisão ${indice + 1}: o campo "${campo}" é obrigatório e não pode ser vazio.`);
      }
    }
    const temTexto = r.de !== undefined || r.para !== undefined;
    if (!temTexto && r.nivel === undefined && r.cats === undefined) {
      throw new ErroDeRevisao(`Revisão ${r.id}: nada para mudar — informe texto ("de"/"para"), "nivel" ou "cats".`);
    }
    if (temTexto) {
      for (const campo of ["de", "para"]) {
        if (typeof r[campo] !== "string" || !r[campo].trim()) {
          throw new ErroDeRevisao(`Revisão ${r.id}: "de" e "para" do texto vêm juntos e não podem ser vazios.`);
        }
      }
      if (r.de === r.para) throw new ErroDeRevisao(`Revisão ${r.id}: "de" e "para" são iguais.`);
    }
    if (r.nivel !== undefined) {
      if (!LEVELS.includes(r.nivel?.de) || !LEVELS.includes(r.nivel?.para)) {
        throw new ErroDeRevisao(`Revisão ${r.id}: nível precisa ser um de ${LEVELS.join(", ")}.`);
      }
      if (r.nivel.de === r.nivel.para) throw new ErroDeRevisao(`Revisão ${r.id}: o nível "de" e "para" são iguais.`);
    }
    if (r.cats !== undefined) {
      for (const lado of ["de", "para"]) {
        const lista = r.cats?.[lado];
        if (!Array.isArray(lista) || lista.length === 0 || !lista.every((c) => CATEGORIES.includes(c))) {
          throw new ErroDeRevisao(`Revisão ${r.id}: categoria "${lado}" precisa ser uma lista não vazia de ${CATEGORIES.join(", ")}.`);
        }
      }
      if (formatarCats(r.cats.de) === formatarCats(r.cats.para)) {
        throw new ErroDeRevisao(`Revisão ${r.id}: as categorias "de" e "para" são iguais.`);
      }
    }
    if (vistos.has(r.id)) throw new ErroDeRevisao(`Revisão ${r.id}: a mesma carta aparece duas vezes.`);
    vistos.add(r.id);
  }
  return revisoes;
}

/** Escreve a lista de categorias como o arquivo do baralho escreve. */
function formatarCats(cats) {
  return `[${cats.map((c) => JSON.stringify(c)).join(", ")}]`;
}

/**
 * Confere uma parte da carta (texto, nível ou categorias) e diz o que fazer com ela.
 * `rotulo` é como a parte aparece no relatório.
 */
function conferirParte(linha, antes, depois, rotulo) {
  if (linha.includes(depois)) return { estado: "ja-aplicada" };
  if (linha.includes(antes)) return { estado: "aplicar", trocar: [antes, depois] };
  return { estado: "erro", detalhe: `${rotulo}: o valor atual não é nem o "de" nem o "para" da revisão — o baralho mudou desde que ela foi escrita` };
}

/**
 * Tira a linha da carta de onde está e a põe depois da última carta da seção
 * do novo nível (`// ---------- Picante ----------`), para o arquivo continuar
 * agrupado por nível.
 */
function moverParaSecao(conteudo, linhaDaCarta, nivel) {
  const linhas = conteudo.split("\n");
  linhas.splice(linhas.indexOf(linhaDaCarta), 1);
  const cabecalho = linhas.findIndex((l) => l.trim() === `// ---------- ${LEVEL_LABELS[nivel]} ----------`);
  if (cabecalho === -1) return null;
  let ultimaCarta = cabecalho;
  for (let i = cabecalho + 1; i < linhas.length; i++) {
    const l = linhas[i].trim();
    if (l.startsWith("// ----------") || l.startsWith("];")) break;
    if (l.startsWith("{ id:")) ultimaCarta = i;
  }
  linhas.splice(ultimaCarta + 1, 0, linhaDaCarta);
  return linhas.join("\n");
}

/**
 * Planeja as revisões sobre as fontes em memória, sem gravar nada.
 *
 * @param {Record<string, string>} fontes caminho do arquivo → conteúdo
 * @param {{ id: string, motivo: string, de?: string, para?: string,
 *           nivel?: { de: string, para: string }, cats?: { de: string[], para: string[] } }[]} revisoes
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

    const partes = [];
    if (r.de !== undefined) {
      partes.push({ ...conferirParte(linha, `text: ${JSON.stringify(r.de)}`, `text: ${JSON.stringify(r.para)}`, "texto"), resumo: `${r.de}  →  ${r.para}` });
    }
    if (r.nivel !== undefined) {
      partes.push({ ...conferirParte(linha, `level: "${r.nivel.de}"`, `level: "${r.nivel.para}"`, "nível"), resumo: `nível ${r.nivel.de} → ${r.nivel.para}`, nivel: r.nivel.para });
    }
    if (r.cats !== undefined) {
      const de = formatarCats(r.cats.de);
      const para = formatarCats(r.cats.para);
      partes.push({ ...conferirParte(linha, `cats: ${de}`, `cats: ${para}`, "categorias"), resumo: `categorias ${de} → ${para}` });
    }

    const erro = partes.find((p) => p.estado === "erro");
    if (erro) {
      resultados.push({ id: r.id, estado: "erro", detalhe: erro.detalhe });
      continue;
    }
    const aAplicar = partes.filter((p) => p.estado === "aplicar");
    if (aAplicar.length === 0) {
      resultados.push({ id: r.id, estado: "ja-aplicada", detalhe: partes.map((p) => p.resumo).join(" · ") });
      continue;
    }

    const novaLinha = aAplicar.reduce((l, p) => l.replace(...p.trocar), linha);
    let novoConteudo = conteudo.slice(0, inicio) + novaLinha + conteudo.slice(fim);
    const mudancaDeNivel = aAplicar.find((p) => p.nivel);
    if (mudancaDeNivel) {
      const linhaInteira = novoConteudo.split("\n").find((l) => l.includes(marcador));
      novoConteudo = moverParaSecao(novoConteudo, linhaInteira, mudancaDeNivel.nivel);
      if (novoConteudo === null) {
        resultados.push({ id: r.id, estado: "erro", detalhe: `nível: o arquivo não tem a seção "${LEVEL_LABELS[mudancaDeNivel.nivel]}"` });
        continue;
      }
    }
    novas[arquivo] = novoConteudo;
    resultados.push({ id: r.id, estado: "aplicar", detalhe: aAplicar.map((p) => p.resumo).join(" · ") });
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
