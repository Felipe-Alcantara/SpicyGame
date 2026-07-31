/**
 * Agregador do baralho base.
 *
 * Cada modo vive em seu próprio arquivo para que dê para crescer o conteúdo
 * sem transformar um único módulo em um paredão de milhares de linhas.
 */

import { CardItem, Mode } from "../taxonomy";
import { NEVER_CARDS } from "./never";
import { MOST_CARDS } from "./most";
import { TRUTH_CARDS } from "./truth";
import { DARE_CARDS } from "./dare";

export const CARDS_BY_MODE: Record<Mode, CardItem[]> = {
  never: NEVER_CARDS,
  most: MOST_CARDS,
  truth: TRUTH_CARDS,
  dare: DARE_CARDS,
};

export const ALL_BASE_CARDS: CardItem[] = [
  ...NEVER_CARDS,
  ...MOST_CARDS,
  ...TRUTH_CARDS,
  ...DARE_CARDS,
];

export { NEVER_CARDS, MOST_CARDS, TRUTH_CARDS, DARE_CARDS };
