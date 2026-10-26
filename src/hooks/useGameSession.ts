/**
 * Estado central da partida.
 *
 * Concentra aqui tudo que era estado solto dentro do componente gigante:
 * jogadores, filtros, cartas customizadas, placar, baralho e navegação.
 * A UI só consome o que este hook devolve — nenhum componente visual mexe
 * em localStorage nem embaralha carta por conta própria.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CardItem,
  Category,
  CATEGORIES,
  LIMIT_CATEGORIES,
  Level,
  LEVELS,
  Mode,
  levelRank,
} from "../data/taxonomy";
import { ALL_BASE_CARDS } from "../data/cards";
import { shuffle, uid } from "../lib/random";
import { clearState, loadState, saveState } from "../lib/storage";
import { parseGameState, serializeGameState } from "../lib/stateTransfer";

const DEFAULT_PLAYERS = ["Ela", "Ele"];
const DEFAULT_LEVEL_INDEX = 1;

const allCategoriesOn = (): Record<Category, boolean> =>
  CATEGORIES.reduce(
    (acc, cat) => ({ ...acc, [cat]: true }),
    {} as Record<Category, boolean>
  );

/** Baralho de um modo: a ordem sorteada e a posição da carta que está na tela. */
type ModeDeck = { cards: CardItem[]; cursor: number };
type Decks = Partial<Record<Mode, ModeDeck>>;

const EMPTY_DECK: ModeDeck = { cards: [], cursor: 0 };

/** Embaralha um ciclo novo; havendo outra carta, ele não abre com a que acabou de sair. */
function newCycle(cards: CardItem[], last?: CardItem): ModeDeck {
  const shuffled = shuffle(cards);
  const end = shuffled.length - 1;
  if (last && end > 0 && shuffled[0].id === last.id) {
    [shuffled[0], shuffled[end]] = [shuffled[end], shuffled[0]];
  }
  return { cards: shuffled, cursor: 0 };
}

/** Segue para a próxima carta; no fim do baralho abre um ciclo novo. */
function advance({ cards, cursor }: ModeDeck): ModeDeck {
  return cursor < cards.length - 1
    ? { cards, cursor: cursor + 1 }
    : newCycle(cards, cards[cursor]);
}

const patchDeck = (decks: Decks, mode: Mode, change: (deck: ModeDeck) => ModeDeck): Decks => ({
  ...decks,
  [mode]: change(decks[mode] ?? EMPTY_DECK),
});

/**
 * Ajusta o baralho do modo ao pool atual sem recomeçar: as cartas vistas e a
 * ordem das não vistas ficam, as que saíram do pool caem e as novas entram em
 * posições sorteadas entre as não vistas. Cada carta é trocada pelo objeto
 * atual do pool, para que um texto editado apareça.
 */
function syncDeck(saved: ModeDeck | undefined, pool: CardItem[]): ModeDeck {
  if (!saved) return newCycle(pool);
  const current = new Map(pool.map((card) => [card.id, card]));
  const refresh = (cards: CardItem[]) => cards.flatMap((card) => current.get(card.id) ?? []);
  const seen = refresh(saved.cards.slice(0, saved.cursor + 1));
  const unseen = refresh(saved.cards.slice(saved.cursor + 1));
  const known = new Set(saved.cards.map((card) => card.id));
  for (const card of pool) {
    if (!known.has(card.id)) unseen.splice(Math.floor(Math.random() * (unseen.length + 1)), 0, card);
  }
  const cards = [...seen, ...unseen];
  // saindo a carta da tela, a próxima não vista ocupa o lugar dela
  const onScreenLeft = !current.has(saved.cards[saved.cursor]?.id ?? "");
  const cursor = onScreenLeft ? seen.length : seen.length - 1;
  return cursor < cards.length ? { cards, cursor } : newCycle(cards, seen[seen.length - 1]);
}

export function useGameSession() {
  const [players, setPlayers] = useState<string[]>(DEFAULT_PLAYERS);
  const [currentMode, setCurrentMode] = useState<Mode>("never");
  const [levelIndex, setLevelIndex] = useState(DEFAULT_LEVEL_INDEX);
  const [cats, setCats] = useState<Record<Category, boolean>>(allCategoriesOn);
  const [customCards, setCustomCards] = useState<CardItem[]>([]);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [decks, setDecks] = useState<Decks>({});
  const [hydrated, setHydrated] = useState(false);

  const level: Level = LEVELS[levelIndex] ?? "spicy";

  // ---------- Persistência ----------
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      if (Array.isArray(saved.players) && saved.players.length) setPlayers(saved.players);
      if (saved.currentMode) setCurrentMode(saved.currentMode);
      if (typeof saved.levelIndex === "number") setLevelIndex(saved.levelIndex);
      // categorias não são restauradas: limite vale só para a visita, e toda
      // visita começa com tudo ligado (decisão do dono em 08/10/2026)
      if (Array.isArray(saved.customCards)) setCustomCards(saved.customCards);
      if (Array.isArray(saved.hiddenIds)) setHiddenIds(saved.hiddenIds);
      if (saved.scores) setScores(saved.scores);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return; // não sobrescreve o salvo antes de terminar de ler
    saveState({ players, currentMode, levelIndex, customCards, hiddenIds, scores });
  }, [hydrated, players, currentMode, levelIndex, customCards, hiddenIds, scores]);

  // ---------- Baralho ----------
  const allCards = useMemo(() => [...ALL_BASE_CARDS, ...customCards], [customCards]);

  /** Cartas que passam por todos os filtros ativos. */
  const pool = useMemo(() => {
    const visible = allCards.filter((c) => !hiddenIds.includes(c.id));
    const byMode = visible.filter((c) => c.mode === currentMode);
    const byLevel = byMode.filter((c) => levelRank(c.level) <= levelIndex);
    // assunto: basta uma categoria ligada; limite: qualquer limite desligado tira a carta
    const byCats = byLevel.filter(
      (c) =>
        c.cats.some((k) => cats[k]) &&
        !c.cats.some((k) => LIMIT_CATEGORIES.includes(k) && !cats[k])
    );
    // filtros desligados são respeitados: sem correspondência, o pool fica vazio
    return byCats;
  }, [allCards, hiddenIds, currentMode, levelIndex, cats]);

  // cada modo guarda o próprio baralho: alternar Verdade e Desafio não pode
  // devolver cartas já vistas, e mudar o pool só ajusta o que já foi sorteado
  useEffect(() => {
    setDecks((all) => ({ ...all, [currentMode]: syncDeck(all[currentMode], pool) }));
  }, [currentMode, pool]);

  const { cards: deck, cursor } = decks[currentMode] ?? EMPTY_DECK;
  const currentCard: CardItem | undefined = deck[cursor];

  const nextCard = useCallback(() => {
    setDecks((all) => patchDeck(all, currentMode, advance));
  }, [currentMode]);

  const previousCard = useCallback(() => {
    setDecks((all) =>
      patchDeck(all, currentMode, ({ cards, cursor: at }) => ({ cards, cursor: Math.max(0, at - 1) }))
    );
  }, [currentMode]);

  const reshuffle = useCallback(() => {
    setDecks((all) => ({ ...all, [currentMode]: newCycle(pool) }));
  }, [currentMode, pool]);

  /** Sair de um modo dá a carta da tela como vista: ao voltar, o baralho dele segue da próxima. */
  const switchMode = useCallback(
    (mode: Mode) => {
      if (mode === currentMode) return;
      setDecks((all) => patchDeck(all, currentMode, advance));
      setCurrentMode(mode);
    },
    [currentMode]
  );

  // ---------- Jogadores e placar ----------
  const addPlayer = useCallback((name: string) => {
    const value = name.trim();
    if (!value) return;
    setPlayers((ps) => (ps.includes(value) ? ps : [...ps, value]));
  }, []);

  const removePlayer = useCallback((name: string) => {
    setPlayers((ps) => ps.filter((p) => p !== name));
    setScores((s) => {
      const { [name]: _removed, ...rest } = s;
      return rest;
    });
  }, []);

  const addPoint = useCallback((name: string, delta = 1) => {
    setScores((s) => ({ ...s, [name]: Math.max(0, (s[name] ?? 0) + delta) }));
  }, []);

  const resetScores = useCallback(() => setScores({}), []);

  // ---------- Cartas customizadas ----------
  const addCustomCard = useCallback((card: Omit<CardItem, "id">) => {
    setCustomCards((cc) => [...cc, { id: `custom-${uid()}`, ...card }]);
  }, []);

  const updateCustomCard = useCallback(
    (id: string, patch: Partial<Omit<CardItem, "id">>) => {
      setCustomCards((cc) => cc.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    },
    []
  );

  const deleteCustomCard = useCallback((id: string) => {
    setCustomCards((cc) => cc.filter((c) => c.id !== id));
  }, []);

  const duplicateCard = useCallback((card: CardItem) => {
    const { id: _id, ...rest } = card;
    setCustomCards((cc) => [...cc, { id: `custom-${uid()}`, ...rest }]);
  }, []);

  const toggleHidden = useCallback((id: string) => {
    setHiddenIds((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]));
  }, []);

  const toggleCategory = useCallback((cat: Category, value: boolean) => {
    setCats((cs) => ({ ...cs, [cat]: value }));
  }, []);

  const setAllCategories = useCallback((value: boolean) => {
    setCats(
      CATEGORIES.reduce(
        (acc, cat) => ({ ...acc, [cat]: value }),
        {} as Record<Category, boolean>
      )
    );
  }, []);

  // ---------- Exportar / importar / resetar ----------
  const exportState = useCallback(() => {
    return serializeGameState({
      players,
      currentMode,
      levelIndex,
      cats,
      customCards,
      hiddenIds,
      scores,
    });
  }, [players, currentMode, levelIndex, cats, customCards, hiddenIds, scores]);

  /** Valida o arquivo inteiro antes de alterar qualquer parte do estado. */
  const importState = useCallback((json: string): string | null => {
    const result = parseGameState(json);
    if (!result.ok) return result.error;

    const { state } = result;
    if (state.players !== undefined) setPlayers(state.players);
    if (state.currentMode !== undefined) setCurrentMode(state.currentMode);
    if (state.levelIndex !== undefined) setLevelIndex(state.levelIndex);
    if (state.cats !== undefined) setCats(state.cats);
    if (state.customCards !== undefined) setCustomCards(state.customCards);
    if (state.hiddenIds !== undefined) setHiddenIds(state.hiddenIds);
    if (state.scores !== undefined) setScores(state.scores);
    return null;
  }, []);

  const resetAll = useCallback(() => {
    clearState();
    setPlayers(DEFAULT_PLAYERS);
    setCurrentMode("never");
    setLevelIndex(DEFAULT_LEVEL_INDEX);
    setCats(allCategoriesOn());
    setCustomCards([]);
    setHiddenIds([]);
    setScores({});
  }, []);

  return {
    // estado
    players,
    currentMode,
    levelIndex,
    level,
    cats,
    customCards,
    hiddenIds,
    scores,
    deck,
    cursor,
    currentCard,
    poolSize: pool.length,
    allCards,
    // ações
    setCurrentMode: switchMode,
    setLevelIndex,
    nextCard,
    previousCard,
    reshuffle,
    addPlayer,
    removePlayer,
    addPoint,
    resetScores,
    addCustomCard,
    updateCustomCard,
    deleteCustomCard,
    duplicateCard,
    toggleHidden,
    toggleCategory,
    setAllCategories,
    exportState,
    importState,
    resetAll,
  };
}

export type GameSession = ReturnType<typeof useGameSession>;
