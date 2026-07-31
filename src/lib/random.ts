/** Utilitários de aleatoriedade usados pelo baralho. */

/** Identificador curto para cartas criadas pelo usuário. */
export const uid = (): string => Math.random().toString(36).slice(2, 9);

/** Embaralha uma cópia do array (Fisher-Yates) — não muta a origem. */
export function shuffle<T>(items: T[]): T[] {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Escolhe um item ao acaso; devolve `undefined` se a lista estiver vazia. */
export function pickOne<T>(items: T[]): T | undefined {
  if (!items.length) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}
