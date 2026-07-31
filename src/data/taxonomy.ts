/**
 * Taxonomia do baralho: os tipos e rótulos que descrevem uma carta.
 *
 * Este arquivo é a fonte única da verdade sobre modos, níveis e categorias.
 * Qualquer lugar do app que precise listar ou rotular um desses eixos deve
 * importar daqui — nunca repetir a lista literal inline.
 */

/** Modo de jogo — cada modo é uma aba e um sub-baralho. */
export type Mode = "never" | "most" | "truth" | "dare";

/** Intensidade da carta, do mais leve ao mais pesado. */
export type Level = "cute" | "spicy" | "hot" | "nuclear";

/** Assunto da carta. Uma carta pode ter várias categorias. */
export type Category =
  | "cute"
  | "funny"
  | "spicy"
  | "deep"
  | "kink"
  | "bdsm"
  | "esex"
  | "twitter"
  | "roleplay"
  | "relationship"
  | "life"
  | "romantic"
  | "confession"
  | "drink"
  | "sexual";

/** Uma carta do baralho. O texto aceita os curingas `{p}` e `{p2}`. */
export interface CardItem {
  id: string;
  mode: Mode;
  text: string;
  level: Level;
  cats: Category[];
}

/** Ordem canônica dos modos — define a ordem das abas. */
export const MODES: Mode[] = ["never", "most", "truth", "dare"];

/** Ordem canônica dos níveis, do mais leve ao mais pesado. */
export const LEVELS: Level[] = ["cute", "spicy", "hot", "nuclear"];

/** Ordem canônica das categorias — define a ordem dos filtros. */
export const CATEGORIES: Category[] = [
  "cute",
  "funny",
  "spicy",
  "deep",
  "romantic",
  "relationship",
  "life",
  "confession",
  "drink",
  "twitter",
  "roleplay",
  "esex",
  "kink",
  "bdsm",
  "sexual",
];

export const MODE_LABELS: Record<Mode, string> = {
  never: "Eu Nunca",
  most: "Mais Provável",
  truth: "Verdade",
  dare: "Desafio",
};

export const MODE_DESCRIPTIONS: Record<Mode, string> = {
  never: "Quem já fez, bebe. Quem mentiu, bebe dobrado.",
  most: "Apontem ao mesmo tempo. Quem for apontado, paga.",
  truth: "Responde de verdade ou vira o copo.",
  dare: "Cumpre o desafio ou vira o copo.",
};

export const LEVEL_LABELS: Record<Level, string> = {
  cute: "Fofo",
  spicy: "Picante",
  hot: "Hot",
  nuclear: "Nuclear",
};

/** Como cada nível se pinta na UI (chip, borda e brilho da carta). */
export const LEVEL_THEME: Record<Level, { chip: string; glow: string; accent: string }> = {
  cute: {
    chip: "bg-pink-500/15 text-pink-200 border-pink-400/30",
    glow: "shadow-[0_0_60px_-15px_rgba(244,114,182,0.55)]",
    accent: "text-pink-300",
  },
  spicy: {
    chip: "bg-rose-500/15 text-rose-200 border-rose-400/30",
    glow: "shadow-[0_0_60px_-15px_rgba(244,63,94,0.6)]",
    accent: "text-rose-300",
  },
  hot: {
    chip: "bg-orange-500/15 text-orange-200 border-orange-400/30",
    glow: "shadow-[0_0_70px_-15px_rgba(249,115,22,0.65)]",
    accent: "text-orange-300",
  },
  nuclear: {
    chip: "bg-red-500/20 text-red-200 border-red-400/40",
    glow: "shadow-[0_0_80px_-12px_rgba(239,68,68,0.8)]",
    accent: "text-red-300",
  },
};

export const CATEGORY_LABELS: Record<Category, string> = {
  cute: "Fofo",
  funny: "Zoeira",
  spicy: "Picante",
  deep: "Profundo",
  kink: "Kink",
  bdsm: "BDSM",
  esex: "Sexting",
  twitter: "Internet",
  roleplay: "Roleplay",
  relationship: "Relação",
  life: "Vida",
  romantic: "Romance",
  confession: "Confissão",
  drink: "Bebida",
  sexual: "Sexo",
};

/** Índice do nível na escala de intensidade (0 = mais leve). */
export function levelRank(level: Level): number {
  return LEVELS.indexOf(level);
}
