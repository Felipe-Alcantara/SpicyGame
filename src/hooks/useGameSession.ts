/**
 * Estado central da partida.
 *
 * Concentra aqui tudo que era estado solto dentro do componente gigante:
 * jogadores, filtros, cartas customizadas, placar, baralho e navegação.
 * A UI só consome o que este hook devolve — nenhum componente visual mexe
 * em localStorage nem embaralha carta por conta própria.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CardItem,
  Category,
  CATEGORIES,
  Level,
  LEVELS,
  Mode,
  levelRank,
} from "../data/taxonomy";
import { ALL_BASE_CARDS } from "../data/cards";
import { shuffle, uid } from "../lib/random";
import { clearState, loadState, saveState } from "../lib/storage";

const DEFAULT_PLAYERS = ["Ela", "Ele"];
const DEFAULT_LEVEL_INDEX = 1;

const allCategoriesOn = (): Record<Category, boolean> =>
  CATEGORIES.reduce(
    (acc, cat) => ({ ...acc, [cat]: true }),
    {} as Record<Category, boolean>
  );

export function useGameSession() {
  const [players, setPlayers] = useState<string[]>(DEFAULT_PLAYERS);
  const [currentMode, setCurrentMode] = useState<Mode>("never");
  const [levelIndex, setLevelIndex] = useState(DEFAULT_LEVEL_INDEX);
  const [cats, setCats] = useState<Record<Category, boolean>>(allCategoriesOn);
  const [customCards, setCustomCards] = useState<CardItem[]>([]);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [deck, setDeck] = useState<CardItem[]>([]);
  const [cursor, setCursor] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  const level: Level = LEVELS[levelIndex] ?? "spicy";

  // ---------- Persistência ----------
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      if (Array.isArray(saved.players) && saved.players.length) setPlayers(saved.players);
      if (saved.currentMode) setCurrentMode(saved.currentMode);
      if (typeof saved.levelIndex === "number") setLevelIndex(saved.levelIndex);
      // mescla com o padrão: categorias novas entram ligadas em vez de sumir
      if (saved.cats) setCats({ ...allCategoriesOn(), ...saved.cats });
      if (Array.isArray(saved.customCards)) setCustomCards(saved.customCards);
      if (Array.isArray(saved.hiddenIds)) setHiddenIds(saved.hiddenIds);
      if (saved.scores) setScores(saved.scores);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return; // não sobrescreve o salvo antes de terminar de ler
    saveState({ players, currentMode, levelIndex, cats, customCards, hiddenIds, scores });
  }, [hydrated, players, currentMode, levelIndex, cats, customCards, hiddenIds, scores]);

  // ---------- Baralho ----------
  const allCards = useMemo(() => [...ALL_BASE_CARDS, ...customCards], [customCards]);

  /** Cartas que passam por todos os filtros ativos. */
  const pool = useMemo(() => {
    const visible = allCards.filter((c) => !hiddenIds.includes(c.id));
    const byMode = visible.filter((c) => c.mode === currentMode);
    const byLevel = byMode.filter((c) => levelRank(c.level) <= levelIndex);
    const byCats = byLevel.filter((c) => c.cats.some((k) => cats[k]));
    // se o filtro de categoria zerou tudo, ainda vale jogar o que sobrou do nível
    if (byCats.length) return byCats;
    if (byLevel.length) return byLevel;
    return byMode;
  }, [allCards, hiddenIds, currentMode, levelIndex, cats]);

  const poolKey = useMemo(() => pool.map((c) => c.id).join("|"), [pool]);
  const lastPoolKey = useRef<string>("");

  useEffect(() => {
    if (poolKey === lastPoolKey.current) return;
    lastPoolKey.current = poolKey;
    setDeck(shuffle(pool));
    setCursor(0);
  }, [poolKey, pool]);

  const currentCard: CardItem | undefined = deck[cursor];

  const nextCard = useCallback(() => {
    if (cursor < deck.length - 1) {
      setCursor(cursor + 1);
      return;
    }
    setDeck(shuffle(pool)); // fim do baralho: reembaralha e recomeça
    setCursor(0);
  }, [cursor, deck.length, pool]);

  const previousCard = useCallback(() => {
    setCursor((c) => Math.max(0, c - 1));
  }, []);

  const reshuffle = useCallback(() => {
    setDeck(shuffle(pool));
    setCursor(0);
  }, [pool]);

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
    return JSON.stringify({ players, customCards, hiddenIds, scores }, null, 2);
  }, [players, customCards, hiddenIds, scores]);

  /** Importa um estado exportado. Devolve mensagem de erro, ou `null` se deu certo. */
  const importState = useCallback((json: string): string | null => {
    try {
      const obj = JSON.parse(json);
      if (Array.isArray(obj.players) && obj.players.length) setPlayers(obj.players);
      if (Array.isArray(obj.customCards)) setCustomCards(obj.customCards);
      if (Array.isArray(obj.hiddenIds)) setHiddenIds(obj.hiddenIds);
      if (obj.scores && typeof obj.scores === "object") setScores(obj.scores);
      return null;
    } catch {
      return "JSON inválido — confira se você colou o texto inteiro.";
    }
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
    setCurrentMode,
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
