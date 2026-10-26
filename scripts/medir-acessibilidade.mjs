#!/usr/bin/env node
/**
 * Mede a acessibilidade do build (`docs/`) num Chrome de verdade: alvos de toque
 * e contraste do texto, no celular (390×844, `pointer: coarse`) e no desktop
 * (1280×900). Telas medidas: inicial, modal do Segredo e gaveta de Ajustes (só
 * no celular, onde ela existe).
 *
 * Uso (rode `npm run build` antes):
 *   node scripts/medir-acessibilidade.mjs              resumo
 *   node scripts/medir-acessibilidade.mjs --detalhes   lista cada alvo e cada texto reprovado
 *   node scripts/medir-acessibilidade.mjs --json       saída completa em JSON
 *
 * Variável CHROME_PATH aponta para outro Chrome/Chromium/Edge. Termina com
 * código 1 se algum alvo ficar abaixo de 24 px ou algum texto abaixo do AA.
 * Os limites da medição de contraste estão em `scripts/acessibilidade.mjs`.
 */

import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { ALVO_CONFORTAVEL, ALVO_MINIMO_AA } from "./acessibilidade.mjs";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = join(RAIZ, "docs");

const DISPOSITIVOS = [
  { nome: "celular", largura: 390, altura: 844, toque: true },
  { nome: "desktop", largura: 1280, altura: 900, toque: false },
];

const TIPOS = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".json": "application/json" };

/** Página que carrega o app num iframe do tamanho da janela e mede cada tela. */
export const PAGINA_DE_MEDICAO = `<!doctype html><meta charset="utf-8">
<body style="margin:0"><iframe id="app" src="/" style="border:0"></iframe>
<img src="/__espera.png" width="1" height="1" alt="">
<script type="module">
import { medirAlvos, medirContraste } from "/acessibilidade.mjs";
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const quadro = document.getElementById("app");
const consulta = new URLSearchParams(location.search);
quadro.style.width = consulta.get("w") + "px";
quadro.style.height = consulta.get("h") + "px";
await new Promise((r) => quadro.addEventListener("load", r, { once: true }));
await esperar(1500);
const doc = quadro.contentDocument, win = quadro.contentWindow;
const botao = (nome) => [...doc.querySelectorAll("button")].find((b) => (b.getAttribute("aria-label") || b.textContent).trim() === nome);
const medir = (raiz) => ({ alvos: medirAlvos(raiz, win), contraste: medirContraste(raiz, win) });
const telas = { inicial: medir(doc.body) };
if (botao("Segredo")) {
  botao("Segredo").click();
  await esperar(1200);
  const dialogo = doc.querySelector('[role="dialog"]');
  if (dialogo) telas.segredo = medir(dialogo);
  const fechar = [...doc.querySelectorAll('[role="dialog"] button')].find((b) => b.textContent.trim() === "Fechar" || b.getAttribute("aria-label") === "Fechar");
  if (fechar) { fechar.click(); await esperar(1200); }
}
const ajustes = botao("Ajustes");
if (ajustes && win.getComputedStyle(ajustes).display !== "none") {
  ajustes.click();
  await esperar(1500);
  const gaveta = doc.querySelector(".fixed.inset-0.z-40");
  if (gaveta) telas.gaveta = medir(gaveta);
}
document.body.dataset.resultado = encodeURIComponent(JSON.stringify({
  janela: [win.innerWidth, win.innerHeight],
  toque: win.matchMedia("(pointer: coarse)").matches,
  telas,
}));
await fetch("/__pronto");
</script>`;

export function acharChrome() {
  const candidatos = [
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);
  const achado = candidatos.find((caminho) => existsSync(caminho));
  if (!achado) throw new Error("Chrome não encontrado: defina CHROME_PATH com o caminho do executável.");
  return achado;
}

export function servir() {
  // O Chrome só despeja o DOM depois do evento `load`; esta imagem o segura até a página avisar que terminou.
  let espera = null;
  let limite = null;
  const servidor = createServer((req, res) => {
    const caminho = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let arquivo;
    if (caminho === "/__espera.png") {
      espera = res;
      limite = setTimeout(() => res.writableEnded || res.writeHead(404).end(), 60000);
      return;
    }
    if (caminho === "/__pronto") {
      clearTimeout(limite);
      espera?.writeHead(404).end();
      res.writeHead(200).end("ok");
      return;
    }
    if (caminho === "/__medir.html") {
      res.writeHead(200, { "content-type": TIPOS[".html"] }).end(PAGINA_DE_MEDICAO);
      return;
    }
    if (caminho === "/acessibilidade.mjs") arquivo = join(RAIZ, "scripts", "acessibilidade.mjs");
    else {
      arquivo = normalize(join(DOCS, caminho === "/" ? "index.html" : caminho));
      if (!arquivo.startsWith(DOCS)) arquivo = null;
    }
    if (!arquivo || !existsSync(arquivo)) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { "content-type": TIPOS[extname(arquivo)] ?? "application/octet-stream" }).end(readFileSync(arquivo));
  });
  return new Promise((resolve) => servidor.listen(0, "127.0.0.1", () => resolve(servidor)));
}

/** Roda o Chrome e devolve o stdout. Assíncrono de propósito: o servidor da página mora neste processo. */
function rodar(chrome, argumentos, limiteMs) {
  return new Promise((resolve, reject) => {
    const processo = spawn(chrome, argumentos, { stdio: ["ignore", "pipe", "ignore"] });
    let saida = "";
    processo.stdout.setEncoding("utf8").on("data", (pedaco) => (saida += pedaco));
    const relogio = setTimeout(() => {
      processo.kill();
      reject(new Error(`O Chrome passou de ${limiteMs / 1000} s sem terminar.`));
    }, limiteMs);
    processo.on("error", reject);
    processo.on("close", () => {
      clearTimeout(relogio);
      resolve(saida);
    });
  });
}

async function medirDispositivo(chrome, porta, dispositivo) {
  const perfil = mkdtempSync(join(tmpdir(), "a11y-chrome-"));
  try {
    const flags = [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--hide-scrollbars",
      `--user-data-dir=${perfil}`,
      `--window-size=${dispositivo.largura},${dispositivo.altura}`,
      "--dump-dom",
    ];
    // ponteiro "grosso" e sem hover, como um celular (pointer: coarse)
    if (dispositivo.toque) flags.splice(-1, 0, "--blink-settings=primaryPointerType=2,availablePointerTypes=2,primaryHoverType=1,availableHoverTypes=1");
    const saida = await rodar(chrome, [...flags, `http://127.0.0.1:${porta}/__medir.html?w=${dispositivo.largura}&h=${dispositivo.altura}`], 120000);
    const achado = /data-resultado="([^"]*)"/.exec(saida);
    if (!achado) throw new Error(`O Chrome não devolveu a medição de ${dispositivo.nome}.`);
    return JSON.parse(decodeURIComponent(achado[1]));
  } finally {
    try {
      rmSync(perfil, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    } catch {
      /* o Chrome ainda segurava o perfil: a pasta temporária some sozinha depois */
    }
  }
}

function resumir(tela) {
  const abaixoDe = (limite) => tela.alvos.filter((a) => Math.min(a.largura, a.altura) < limite);
  return {
    alvos: tela.alvos.length,
    abaixoDe44: abaixoDe(ALVO_CONFORTAVEL).length,
    abaixoDe24: abaixoDe(ALVO_MINIMO_AA).length,
    textos: tela.contraste.total,
    reprovados: tela.contraste.falhas.length,
    ignoradosPorOpacidade: tela.contraste.ignoradosPorOpacidade,
  };
}

async function principal(args) {
  if (!existsSync(join(DOCS, "index.html"))) throw new Error("docs/ não existe: rode `npm run build` antes.");
  const chrome = acharChrome();
  const servidor = await servir();
  const resultados = [];
  try {
    for (const dispositivo of DISPOSITIVOS) {
      resultados.push({ dispositivo, ...(await medirDispositivo(chrome, servidor.address().port, dispositivo)) });
    }
  } finally {
    servidor.close();
  }

  if (args.includes("--json")) {
    console.log(JSON.stringify(resultados, null, 2));
  } else {
    let reprovou = false;
    for (const { dispositivo, janela, toque, telas } of resultados) {
      console.log(`\n${dispositivo.nome} ${janela[0]}×${janela[1]} (pointer: coarse = ${toque})`);
      for (const [nome, tela] of Object.entries(telas)) {
        const r = resumir(tela);
        if (r.abaixoDe24 || r.reprovados) reprovou = true;
        console.log(
          `  ${nome.padEnd(8)} ${String(r.alvos).padStart(3)} alvos · ${String(r.abaixoDe44).padStart(3)} abaixo de 44 px · ${String(r.abaixoDe24).padStart(3)} abaixo de 24 px · ${r.reprovados} de ${r.textos} textos abaixo do AA` +
            (r.ignoradosPorOpacidade ? ` (+${r.ignoradosPorOpacidade} ignorados por opacidade)` : "")
        );
        if (args.includes("--detalhes")) {
          for (const a of tela.alvos.filter((alvo) => Math.min(alvo.largura, alvo.altura) < ALVO_CONFORTAVEL)) console.log(`      alvo   ${a.largura}×${a.altura}  ${a.nome}`);
          for (const i of tela.contraste.ignorados) console.log(`      ignorado (opacidade ${i.opacidade})  "${i.texto}"`);
          for (const f of tela.contraste.falhas) console.log(`      texto  ${f.razao}:1 (mín. ${f.minimo}, ${f.tamanho}px)  "${f.texto}"  [${f.classe}]`);
        }
      }
    }
    process.exitCode = reprovou ? 1 : 0;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  principal(process.argv.slice(2)).catch((erro) => {
    console.error(erro instanceof Error ? erro.message : erro);
    process.exitCode = 1;
  });
}
