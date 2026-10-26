/**
 * Medição de acessibilidade do build: tamanho dos alvos de toque e contraste do texto.
 *
 * O mesmo arquivo roda nos dois lugares: no Node (testes da matemática de cor) e
 * dentro do navegador, importado pela página que `medir-acessibilidade.mjs`
 * monta. Por isso não importa nada e as funções que tocam no DOM recebem
 * `raiz` e `win` em vez de usar globais.
 *
 * Limites declarados da medição de contraste:
 * - só `background-color` e gradientes dos ANCESTRAIS do texto entram na conta
 *   (gradiente: o pior caso entre as paradas); texto sobre um irmão posicionado
 *   (a aba ativa) é medido contra o fundo do ancestral;
 * - desfoque (`backdrop-filter`) e sombras não entram;
 * - elementos com opacidade efetiva abaixo de 0,99 (estados desativados, ou meio
 *   de transição) ficam de fora e são contados em `ignoradosPorOpacidade`.
 */

/** WCAG 2.2, critério 2.5.8 (AA): alvo mínimo de 24 px. */
export const ALVO_MINIMO_AA = 24;
/** Mínimo confortável para o polegar (WCAG 2.5.5, AAA; Apple e Material). */
export const ALVO_CONFORTAVEL = 44;
/** Fundo da página (`zinc-950`), base de toda composição de cor. */
export const FUNDO_DA_PAGINA = { r: 9, g: 9, b: 11, a: 1 };

/** Lê `rgb(...)`/`rgba(...)` em qualquer das duas sintaxes; `null` se não entender. */
export function lerCor(texto) {
  const partes = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)$/i.exec(
    String(texto).trim()
  );
  if (!partes) return null;
  const alfa = partes[4] === undefined ? 1 : partes[4].endsWith("%") ? parseFloat(partes[4]) / 100 : parseFloat(partes[4]);
  return { r: +partes[1], g: +partes[2], b: +partes[3], a: alfa };
}

/** Compõe `frente` (com alfa) sobre `fundo` opaco. */
export function compor(frente, fundo) {
  const a = frente.a;
  return {
    r: frente.r * a + fundo.r * (1 - a),
    g: frente.g * a + fundo.g * (1 - a),
    b: frente.b * a + fundo.b * (1 - a),
    a: 1,
  };
}

/** Luminância relativa (WCAG), de 0 (preto) a 1 (branco). */
export function luminancia({ r, g, b }) {
  const canal = (valor) => {
    const c = valor / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

/** Razão de contraste entre duas cores opacas, de 1 a 21. */
export function razaoDeContraste(a, b) {
  const [claro, escuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (escuro + 0.05);
}

/** Texto grande (WCAG): 24 px, ou 18,66 px em negrito. */
export function ehTextoGrande(tamanhoPx, peso) {
  return tamanhoPx >= 24 || (tamanhoPx >= 18.66 && peso >= 700);
}

/** Contraste mínimo exigido para o texto: 3:1 se for grande, senão 4,5:1 (AA). */
export function contrasteMinimo(tamanhoPx, peso) {
  return ehTextoGrande(tamanhoPx, peso) ? 3 : 4.5;
}

const arredondar = (valor, casas = 2) => Math.round(valor * 10 ** casas) / 10 ** casas;

// ---------- Parte que toca no DOM (roda no navegador) ----------

const SELETOR_ALVO = [
  "button",
  "a[href]",
  'input:not([type="hidden"])',
  "select",
  "textarea",
  "summary",
  '[role="button"]',
  '[role="tab"]',
  '[role="switch"]',
  '[role="checkbox"]',
].join(",");

function visivel(el, win) {
  const caixa = el.getBoundingClientRect();
  if (caixa.width === 0 || caixa.height === 0) return false;
  const estilo = win.getComputedStyle(el);
  return estilo.visibility !== "hidden" && estilo.display !== "none" && !el.closest('[aria-hidden="true"]');
}

function nomeDe(el) {
  const nome = el.getAttribute("aria-label") || el.getAttribute("title") || el.textContent.trim() || el.tagName.toLowerCase();
  return nome.replace(/\s+/g, " ").slice(0, 40);
}

/**
 * Alvos de toque visíveis dentro de `raiz`. Quando o controle mora num `<label>`,
 * a área real de toque é a do label (clicar nele aciona o controle).
 */
export function medirAlvos(raiz, win) {
  const vistos = new Set();
  const alvos = [];
  for (const el of raiz.querySelectorAll(SELETOR_ALVO)) {
    if (el.disabled || !visivel(el, win)) continue;
    const dono = el.closest("label") ?? el;
    if (vistos.has(dono)) continue;
    vistos.add(dono);
    const caixa = dono.getBoundingClientRect();
    alvos.push({ nome: nomeDe(el), largura: arredondar(caixa.width, 1), altura: arredondar(caixa.height, 1) });
  }
  return alvos;
}

function opacidadeEfetiva(el, win) {
  let opacidade = 1;
  for (let no = el; no && no.nodeType === 1; no = no.parentElement) opacidade *= parseFloat(win.getComputedStyle(no).opacity);
  return opacidade;
}

/** Cores de fundo possíveis atrás do texto: uma só, ou uma por parada de gradiente (pior caso). */
function fundosPossiveis(el, win, base) {
  const camadas = [];
  for (let no = el; no && no.nodeType === 1; no = no.parentElement) camadas.unshift(no);
  let fundos = [base];
  for (const no of camadas) {
    const estilo = win.getComputedStyle(no);
    const cor = lerCor(estilo.backgroundColor);
    if (cor && cor.a > 0) fundos = fundos.map((fundo) => compor(cor, fundo));
    const paradas = (estilo.backgroundImage.match(/rgba?\([^)]*\)/g) ?? []).map(lerCor).filter(Boolean);
    if (estilo.backgroundImage.includes("gradient") && paradas.length) {
      fundos = fundos.flatMap((fundo) => paradas.map((parada) => compor(parada, fundo)));
    }
  }
  return fundos;
}

function temTextoProprio(el) {
  return [...el.childNodes].some((no) => no.nodeType === 3 && no.textContent.trim().length > 0);
}

/** Avalia um texto contra os fundos possíveis: devolve a falha, ou `null` se passa. */
function avaliar(el, win, cor, fundos, texto) {
  const estilo = win.getComputedStyle(el);
  const tamanho = parseFloat(estilo.fontSize);
  const minimo = contrasteMinimo(tamanho, parseInt(estilo.fontWeight, 10) || 400);
  const piorRazao = Math.min(...fundos.map((fundo) => razaoDeContraste(compor(cor, fundo), fundo)));
  if (piorRazao >= minimo) return null;
  return {
    texto: texto.replace(/\s+/g, " ").trim().slice(0, 48),
    razao: arredondar(piorRazao),
    minimo,
    tamanho,
    classe: String(el.getAttribute("class") ?? "").split(/\s+/).filter((c) => /^(text-|placeholder:)/.test(c)).join(" "),
  };
}

/** Texto visível dentro de `raiz` com contraste abaixo do AA. Inclui o `placeholder` dos campos. */
export function medirContraste(raiz, win, base = FUNDO_DA_PAGINA) {
  const falhas = [];
  let total = 0;
  const ignorados = [];
  for (const el of raiz.querySelectorAll("*")) {
    if (!visivel(el, win) || el.closest("script, style, option, [disabled], [aria-disabled='true']")) continue;
    const estilo = win.getComputedStyle(el);
    const comTexto = temTextoProprio(el);
    const comPlaceholder = el.matches("input[placeholder], textarea[placeholder]") && el.getAttribute("placeholder");
    if (!comTexto && !comPlaceholder) continue;
    const opacidade = opacidadeEfetiva(el, win);
    if (opacidade < 0.99) {
      ignorados.push({ texto: [...el.childNodes].filter((no) => no.nodeType === 3).map((no) => no.textContent).join(" ").replace(/\s+/g, " ").trim().slice(0, 40) || el.getAttribute("placeholder") || el.tagName, opacidade: arredondar(opacidade) });
      continue;
    }
    const fundos = fundosPossiveis(el, win, base);
    if (comTexto) {
      const cor = lerCor(estilo.color);
      if (cor && cor.a > 0) {
        total += 1;
        const falha = avaliar(el, win, cor, fundos, [...el.childNodes].filter((no) => no.nodeType === 3).map((no) => no.textContent).join(" "));
        if (falha) falhas.push(falha);
      }
    }
    if (comPlaceholder) {
      const cor = lerCor(win.getComputedStyle(el, "::placeholder").color);
      if (cor && cor.a > 0) {
        total += 1;
        const falha = avaliar(el, win, cor, fundos, `placeholder: ${comPlaceholder}`);
        if (falha) falhas.push(falha);
      }
    }
  }
  return { total, falhas, ignorados, ignoradosPorOpacidade: ignorados.length };
}
