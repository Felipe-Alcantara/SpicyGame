/**
 * Substituição dos curingas de nome no texto das cartas.
 *
 * `{p}` vira um jogador sorteado e `{p2}` vira outro — quando há gente
 * suficiente, os dois nunca são a mesma pessoa (era o bug da versão antiga,
 * que sorteava os dois de forma independente e escrevia "Ela beija Ela").
 */

const FALLBACK = "alguém aí";

export function replacePlaceholders(text: string, players: string[]): string {
  const pool = players.filter((p) => p.trim().length > 0);
  if (!text.includes("{p}") && !text.includes("{p2}")) return text;

  const first = pool.length ? pool[Math.floor(Math.random() * pool.length)] : FALLBACK;
  const others = pool.filter((p) => p !== first);
  const second = others.length
    ? others[Math.floor(Math.random() * others.length)]
    : first || FALLBACK;

  return text.split("{p}").join(first).split("{p2}").join(second);
}
