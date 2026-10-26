#!/usr/bin/env node
/**
 * Teste de mutação das regras críticas do jogo.
 *
 * Quebra uma regra de cada vez no código-fonte, roda a suíte inteira e confere
 * que algum teste falha. Mutação que a suíte não acusa é regra sem proteção:
 * "tudo verde" ali é falsa segurança. O arquivo mutado é sempre restaurado, e
 * a suíte tem de estar verde antes de começar (senão não há o que medir).
 *
 * Uso:
 *   node scripts/mutacoes.mjs            roda as 15 mutações
 *   node scripts/mutacoes.mjs M01 M03    roda só as indicadas
 *   node scripts/mutacoes.mjs --lista    mostra as mutações sem rodar nada
 *
 * Cada mutação troca UM trecho de uma linha por outro. Se o código mudar e o
 * trecho deixar de existir (ou passar a aparecer duas vezes), o script para e
 * avisa em vez de medir contra um código que já não é o da regra. Terminou com
 * código 0 só quando todas as mutações foram mortas.
 *
 * Se o processo for morto à força (kill -9), o arquivo mutado pode ficar
 * quebrado: `git checkout -- <arquivo>` desfaz.
 */

import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const HOOK = "src/hooks/useGameSession.ts";

/** `de` string: tem de aparecer 1 vez. `de` RegExp: troca só a primeira ocorrência. */
export const MUTACOES = [
  { id: "M01", nome: "Nível máximo exclusivo (`<` no lugar de `<=`)", arquivo: HOOK, de: "levelRank(c.level) <= levelIndex);", para: "levelRank(c.level) < levelIndex);" },
  { id: "M02", nome: "Fim do baralho recomeça sem reembaralhar", arquivo: HOOK, de: ": newCycle(cards, cards[cursor]);", para: ": { cards, cursor: 0 };" },
  { id: "M03", nome: "Sem a trava `hydrated` ao salvar", arquivo: HOOK, de: "if (!hydrated) return;", para: "" },
  { id: "M04", nome: "Filtro de categorias ignorado", arquivo: HOOK, de: "return byCats;", para: "return byLevel;" },
  { id: "M05", nome: "Cartas ocultas ignoradas", arquivo: HOOK, de: "const visible = allCards.filter((c) => !hiddenIds.includes(c.id));", para: "const visible = allCards;" },
  { id: "M06", nome: "Nível ignorado", arquivo: HOOK, de: "const byLevel = byMode.filter((c) => levelRank(c.level) <= levelIndex);", para: "const byLevel = byMode;" },
  { id: "M07", nome: "Cursor passa do fim do baralho", arquivo: HOOK, de: "cursor < cards.length - 1", para: "cursor < cards.length" },
  { id: "M08", nome: "Remover jogador mantém o placar dele", arquivo: HOOK, de: "return rest;", para: "return s;" },
  { id: "M09", nome: "Placar pode ficar negativo", arquivo: HOOK, de: "Math.max(0, (s[name] ?? 0) + delta)", para: "(s[name] ?? 0) + delta" },
  { id: "M10", nome: "`{p}` e `{p2}` podem ser a mesma pessoa", arquivo: "src/lib/placeholders.ts", de: "const others = pool.filter((p) => p !== first);", para: "const others = pool;" },
  { id: "M11", nome: "Exportação sem as categorias", arquivo: "src/lib/stateTransfer.ts", de: "cats: state.cats,", para: "" },
  { id: "M12", nome: "Reset sem limpar o storage", arquivo: HOOK, de: "clearState();", para: "" },
  { id: "M13", nome: "Carta sem categoria no baralho base", arquivo: "src/data/cards/never.ts", de: /cats: \[[^\]]*\]/, para: "cats: []" },
  { id: "M14", nome: "Carta com texto cortado no baralho base", arquivo: "src/data/cards/never.ts", de: /(text: "[^"]{25,}?)[.?!]"/, para: '$1…"' },
  { id: "M15", nome: "`{p}` no Mais Provável", arquivo: "src/data/cards/most.ts", de: /text: "/, para: 'text: "{p} ' },
];

/** Devolve a fonte com a mutação aplicada; recusa se o código já não casa com ela. */
export function aplicarMutacao(fonte, { id, de, para }) {
  if (typeof de === "string") {
    const ocorrencias = fonte.split(de).length - 1;
    if (ocorrencias !== 1) {
      throw new Error(`${id}: o trecho aparece ${ocorrencias} vez(es) em vez de 1 — o código mudou, atualize a mutação.`);
    }
    return fonte.replace(de, () => para);
  }
  const mutada = fonte.replace(de, para);
  if (mutada === fonte) throw new Error(`${id}: o padrão não casou — o código mudou, atualize a mutação.`);
  return mutada;
}

/**
 * Lê o relatório JSON do vitest. Morta = algum teste falhou; inválida = a suíte
 * só quebrou ao carregar (erro, não regra protegida); sobreviveu = tudo verde.
 */
export function classificar(relatorio) {
  const falhos = relatorio.testResults.flatMap((arquivo) =>
    arquivo.assertionResults.filter((teste) => teste.status === "failed").map((teste) => teste.fullName)
  );
  const quebrouAoCarregar = relatorio.testResults.some(
    (arquivo) => arquivo.status === "failed" && arquivo.assertionResults.length === 0
  );
  const estado = falhos.length ? "morta" : quebrouAoCarregar ? "inválida" : "sobreviveu";
  return { estado, falhos };
}

function rodarSuite() {
  const pasta = mkdtempSync(join(tmpdir(), "mutacao-"));
  const saida = join(pasta, "resultado.json");
  try {
    // o teste do próprio script lê o código-fonte: mutado, ele "mataria" tudo pelo motivo errado
    spawnSync(
      process.execPath,
      [join(RAIZ, "node_modules", "vitest", "vitest.mjs"), "run", "--exclude", "scripts/mutacoes.test.mjs", "--reporter=json", `--outputFile=${saida}`],
      { cwd: RAIZ, stdio: "ignore" }
    );
    return classificar(JSON.parse(readFileSync(saida, "utf8")));
  } finally {
    rmSync(pasta, { recursive: true, force: true });
  }
}

const originais = new Map();
function restaurar() {
  for (const [caminho, texto] of originais) writeFileSync(caminho, texto);
  originais.clear();
}

function principal(args) {
  const ids = args.filter((arg) => !arg.startsWith("--"));
  const desconhecidos = ids.filter((id) => !MUTACOES.some((m) => m.id === id));
  if (desconhecidos.length) throw new Error(`Mutação desconhecida: ${desconhecidos.join(", ")}`);
  const escolhidas = ids.length ? MUTACOES.filter((m) => ids.includes(m.id)) : MUTACOES;

  if (args.includes("--lista")) {
    for (const m of escolhidas) console.log(`${m.id}  ${m.nome}  (${m.arquivo})`);
    return 0;
  }

  console.log("Conferindo que a suíte está verde antes de mutar…");
  const base = rodarSuite();
  if (base.estado !== "sobreviveu") {
    throw new Error(`A suíte já falha sem mutação (${base.estado}): ${base.falhos.slice(0, 3).join(" | ")}`);
  }

  process.on("exit", restaurar);
  const placar = [];
  for (const m of escolhidas) {
    const caminho = join(RAIZ, m.arquivo);
    const original = readFileSync(caminho, "utf8");
    originais.set(caminho, original);
    try {
      writeFileSync(caminho, aplicarMutacao(original, m));
      const { estado, falhos } = rodarSuite();
      placar.push({ ...m, estado, falhos });
      console.log(`${m.id}  ${estado.padEnd(10)} ${m.nome}${falhos.length ? ` — ${falhos[0]}` : ""}`);
    } finally {
      restaurar();
    }
  }

  const vivas = placar.filter((p) => p.estado !== "morta");
  console.log(`\n${placar.length - vivas.length} de ${placar.length} mutações mortas.`);
  if (vivas.length) console.log(`Sem proteção: ${vivas.map((p) => `${p.id} (${p.estado})`).join(", ")}`);
  return vivas.length ? 1 : 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    process.exitCode = principal(process.argv.slice(2));
  } catch (erro) {
    console.error(erro instanceof Error ? erro.message : erro);
    process.exitCode = 1;
  }
}
