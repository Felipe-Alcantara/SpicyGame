import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Flame, Sparkles, Settings, Shuffle, Plus, Save, Upload, Download, Users, Wand2, Timer, ClipboardCopy, Edit3, Trash2, Eye, EyeOff, Filter, List } from "lucide-react";
import { ALL_BASE_CARDS, CardItem, Mode, Level, Category } from "./cards";
// Lista de todas as categorias definidas em cards.ts
const ALL_CATEGORIES: Category[] = ["cute","funny","spicy","deep","kink","bdsm","esex","twitter","roleplay","relationship","life","romantic","confession","drink","sexual"];

// --- UI primitives (inline) to run in canvas without shadcn ---
export function Button({variant = "default", size, className = "", ...props}: any){
  const base = "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition border";
  const variants: any = {
    default: "bg-red-600 text-white hover:opacity-90 border-transparent",
    secondary: "bg-rose-900 text-rose-50 hover:opacity-90 border-rose-800",
    outline: "bg-transparent text-rose-50 hover:bg-rose-950/20 border-rose-800",
  };
  const sizes: any = { sm: "px-3 py-1.5 text-sm", icon: "p-2 aspect-square" };
  return <button className={[base, variants[variant], size ? sizes[size] : "", className].join(" ")} {...props} />
}
export function Card({className = "", ...props}: any){ return <div className={"rounded-2xl border shadow "+className} {...props} /> }
export function CardHeader({className = "", ...props}: any){ return <div className={"p-4 border-b border-white/5 "+className} {...props} /> }
export function CardContent({className = "", ...props}: any){ return <div className={"p-4 "+className} {...props} /> }
export function CardFooter({className = "", ...props}: any){ return <div className={"p-4 border-t border-white/5 "+className} {...props} /> }
export function CardTitle({className = "", ...props}: any){ return <h3 className={"text-lg font-semibold "+className} {...props} /> }
export function CardDescription({className = "", ...props}: any){ return <p className={"text-sm text-zinc-400 "+className} {...props} /> }
export function Input(props: any){ return <input {...props} className={"w-full rounded-xl bg-rose-950/30 border border-rose-200/20 px-3 py-2 outline-none focus:ring-2 focus:ring-red-600/50 "+(props.className||"")} /> }
export function Textarea(props: any){ return <textarea {...props} className={"w-full rounded-xl bg-rose-950/30 border border-rose-200/20 px-3 py-2 outline-none focus:ring-2 focus:ring-red-600/50 "+(props.className||"")} /> }
export function Badge({className = "", ...props}: any){ return <span className={"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium "+className} {...props} /> }
export function Switch({checked, onCheckedChange}: any){ return <input type="checkbox" checked={checked} onChange={(e)=>onCheckedChange?.(e.target.checked)} className="h-5 w-5 accent-red-600" /> }
export function Slider({value=[0], min=0, max=100, step=1, onValueChange}: any){ return <input type="range" value={value[0]} min={min} max={max} step={step} onChange={(e)=>onValueChange?.([Number(e.target.value)])} className="w-full" /> }
// --- end primitives ---


/**
 * Couple Night – Game Kit (React)
 * - Modos: Eu Nunca, Quem é Mais Provável, Verdade ou Desafio
 * - Níveis: Fofo, Picante, Hot, Nuclear (filtro)
 * - Categorias: cute | funny | spicy | deep
 * - Recursos: nomes customizados, adicionar cartas, baralho embaralhado, exportar/importar
 * - Persistência: localStorage
 *
 * Como usar:
 * 1) Instale dependências: framer-motion, lucide-react, shadcn/ui (+ tailwind)
 * 2) Importe e use <CoupleNightGame /> numa página (Next.js app/page.tsx, por ex.)
 * 3) Deploy grátis: Vercel (recomendado) ou GitHub Pages (Vite)
 */

// ----------- Tipos -----------
const BASE_CARDS: CardItem[] = ALL_BASE_CARDS;

// ----------- Utils -----------
const uid = () => Math.random().toString(36).slice(2, 9);
const shuffle = <T,>(a: T[]) => {
  const arr = a.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const STORAGE_KEY = "couple-night-state-v1";

export default function CoupleNightGame() {
  const [players, setPlayers] = useState<string[]>(["Ela", "Ele"]);
  const [currentMode, setCurrentMode] = useState<Mode>("never");
  const [levelIndex, setLevelIndex] = useState(1); // 0..3
  const levels: Level[] = ["cute", "spicy", "hot", "nuclear"];
  const level = levels[levelIndex];
  const [cats, setCats] = useState<Record<Category, boolean>>(() =>
    ALL_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: true }), {} as Record<Category, boolean>)
  );
  const [customCards, setCustomCards] = useState<CardItem[]>([]);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [sessionPacks, setSessionPacks] = useState<CardItem[]>([]);
  const [deck, setDeck] = useState<CardItem[]>([]);
  const [cursor, setCursor] = useState(0);
  const [timerSec, setTimerSec] = useState(0);
  const [isTiming, setIsTiming] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Load persistência
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        setPlayers(s.players ?? players);
        setCurrentMode(s.currentMode ?? "never");
        setLevelIndex(s.levelIndex ?? 1);
        setCats(s.cats ?? { cute: true, funny: true, spicy: true, deep: true });
        setCustomCards(s.customCards ?? []);
        setHiddenIds(s.hiddenIds ?? []);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save persistência
  useEffect(() => {
    const s = { players, currentMode, levelIndex, cats, customCards, hiddenIds };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }, [players, currentMode, levelIndex, cats, customCards]);

  const pool = useMemo(() => {
    const all = [...BASE_CARDS, ...customCards];
    const active = all.filter((c) => !hiddenIds.includes(c.id));
    const filtered = active.filter((c) => c.mode === currentMode);
    const withLevel = filtered.filter((c) => {
      const idx = levels.indexOf(c.level);
      return idx <= levelIndex; // permite até o nível escolhido
    });
    const withCats = withLevel.filter((c) => c.cats.some((k) => cats[k]));
    return withCats.length ? withCats : filtered; // fallback se filtrou demais
  }, [currentMode, levelIndex, cats, customCards]);

  // (Re)monta baralho quando pool muda
  useEffect(() => {
    const newDeck = shuffle(pool);
    setDeck(newDeck);
    setCursor(0);
  }, [pool]);

  const currentCard = deck[cursor];

  function nextCard() {
    if (cursor < deck.length - 1) setCursor((c) => c + 1);
    else {
      // reshuffle
      setDeck(shuffle(pool));
      setCursor(0);
    }
  }

  function replacePlaceholders(text: string) {
    const rnd = () => players[Math.floor(Math.random() * players.length)] ?? "Parceirx";
    let res = text.split("{p}").join(rnd());
    res = res.split("{p2}").join(rnd());
    return res;
  }

  function addPlayer(name: string) {
    const v = name.trim();
    if (!v) return;
    setPlayers((ps) => Array.from(new Set([...ps, v])));
  }

  function removePlayer(name: string) {
    setPlayers((ps) => ps.filter((p) => p !== name));
  }

  function exportState() {
    const data = JSON.stringify({ players, customCards, hiddenIds }, null, 2);
    navigator.clipboard.writeText(data).catch(() => {});
    alert("Configurações copiadas para a área de transferência!");
  }

  function importState(json: string) {
    try {
      const obj = JSON.parse(json);
      if (Array.isArray(obj.players)) setPlayers(obj.players);
      if (Array.isArray(obj.customCards)) setCustomCards(obj.customCards);
      if (Array.isArray(obj.hiddenIds)) setHiddenIds(obj.hiddenIds);
      alert("Importado com sucesso!");
    } catch (e) {
      alert("JSON inválido.");
    }
  }

  function resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    setCustomCards([]);
    setHiddenIds([]);
    setPlayers(["Ela","Ele"]);
    setCurrentMode("never");
    setLevelIndex(1);
    setCats(() => ALL_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: true }), {} as Record<Category, boolean>));
    alert("Reset feito! Suas cartas personalizadas e preferências locais foram limpas.");
  }

  function addCustomCard(partial: Omit<CardItem, "id">) {
    setCustomCards((cc) => [...cc, { id: uid(), ...partial }]);
  }

  function toggleHidden(id: string) {
    setHiddenIds((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]));
  }
  function updateCustomCard(id: string, patch: Partial<Omit<CardItem, "id">>) {
    setCustomCards((cc) => cc.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }
  function deleteCustomCard(id: string) {
    setCustomCards((cc) => cc.filter((c) => c.id !== id));
  }
  function duplicateFromBase(card: CardItem) {
    const { id, ...rest } = card;
    setCustomCards((cc) => [...cc, { id: uid(), ...rest }]);
  }
  function importSessionPack(json: string) {
    try {
      const obj = JSON.parse(json);
      const arr: any[] = Array.isArray(obj) ? obj : obj?.cards;
      if (!Array.isArray(arr)) throw new Error("JSON deve ser um array ou { cards: [] }");
      const norm: CardItem[] = arr.map((raw: any) => ({
        id: raw.id ?? `pack-${uid()}`,
        mode: raw.mode as Mode,
        text: String(raw.text ?? ""),
        level: (raw.level ?? "spicy") as Level,
        cats: (raw.cats ?? ["spicy"]) as Category[],
      }));
      setSessionPacks(norm);
      alert(`Pack carregado: ${norm.length} cartas (somente nesta sessão)`);
    } catch (e: any) {
      alert("Falha ao importar pack: " + (e?.message || "JSON inválido"));
    }
  }
  function clearSessionPack(){
    setSessionPacks([]);
  }

  // Timer simples (opcional por carta)
  useEffect(() => {
    if (!isTiming) return;
    timerRef.current = window.setInterval(() => setTimerSec((s) => s + 1), 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [isTiming]);

  function resetTimer() {
    setTimerSec(0);
  }

  function handleHeartClick() {
    setUnlockPromptOpen(true);
  }

  const [unlockPromptOpen, setUnlockPromptOpen] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState("");

  function handleUnlockSubmit() {
    // substituir 'senha123' pela senha desejada
    if (unlockPassword === 'Novidade') {
      // desbloquear funcionalidade adicional
      alert('Conteúdo desbloqueado!');
      setUnlockPromptOpen(false);
    } else {
      alert('Senha inválida');
    }
  }

  function handleUnlockCancel() {
    setUnlockPromptOpen(false);
  }

  // UI
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-800 via-rose-900 to-rose-950 text-zinc-50 selection:bg-red-500/40">
      {/* Topbar */}
      <header className="sticky top-0 z-30 border-b border-rose-200/20 backdrop-blur supports-[backdrop-filter]:bg-rose-950/40">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-3">
          <Heart className="text-red-400 cursor-pointer" size={24} onClick={handleHeartClick} />
          <span className="font-semibold">Spicy Game 🌶️</span>
          <div className="ml-auto flex items-center gap-2 text-xs">
            <Badge className="bg-red-600/80">Sem anúncios</Badge>
            <Badge className="bg-zinc-800">Personalizável</Badge>
            <Badge className="bg-zinc-800">Feito com carinho</Badge>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="mx-auto max-w-5xl px-4 py-8 grid lg:grid-cols-[1fr,360px] gap-6">
        {/* Carta atual */}
        <section>
          <GameTabs currentMode={currentMode} onModeChange={setCurrentMode} />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard ? currentCard.id + cursor : "empty"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mt-4"
            >
              <Card className="bg-zinc-900/50 border-white/10 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ModeBadge mode={currentMode} />
                    <span className="capitalize">{currentModeLabel(currentMode)}</span>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 text-xs">
                    <Flame size={14} className={levelIndex >= 1 ? "text-orange-400" : "text-zinc-500"} />
                    <span className="uppercase tracking-wider">{level.toUpperCase()}</span>
                    <span>• {cursor + 1}/{deck.length}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentCard ? (
                    <div className="text-2xl md:text-3xl leading-snug">
                      {replacePlaceholders(currentCard.text)}
                    </div>
                  ) : (
                    <div className="text-zinc-400">Nenhuma carta — ajuste os filtros.</div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2 justify-between">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    {currentCard?.cats.map((c) => (
                      <Badge key={c} className="bg-zinc-800 capitalize">{c}</Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => { resetTimer(); setIsTiming((v) => !v); }}>
                      <Timer size={16} className="mr-2" /> {isTiming ? `${timerSec}s` : "Timer"}
                    </Button>
                    <Button onClick={nextCard}>
                      <Shuffle size={16} className="mr-2" /> Próxima
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Most Likely quick‑pick */}
          {currentMode === "most" && (
            <div className="mt-4 flex flex-wrap gap-2">
              {players.map((p) => (
                <Button key={p} variant="outline" className="border-red-500/50 hover:bg-red-500/10">
                  <Users size={16} className="mr-2" /> {p}
                </Button>
              ))}
            </div>
          )}
        </section>

        {/* Painel lateral */}
        <aside className="space-y-6">
          <Card className="bg-zinc-900/50 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Settings size={18}/> Configurações</CardTitle>
              <CardDescription>Personalize tudo do jeitinho de vocês.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Players */}
              <div>
                <div className="text-sm mb-2">Jogadores</div>
                <div className="flex gap-2 flex-wrap">
                  {players.map((p) => (
                    <Badge key={p} className="bg-zinc-800">
                      {p}
                      <button className="ml-2 text-zinc-400 hover:text-zinc-200" onClick={() => removePlayer(p)}>×</button>
                    </Badge>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <Input placeholder="Adicionar nome" onKeyDown={(e) => {
                    if (e.key === "Enter") addPlayer((e.target as HTMLInputElement).value);
                  }}/>
                  <Button onClick={() => {
                    const el = document.querySelector<HTMLInputElement>("input[placeholder='Adicionar nome']");
                    if (el) { addPlayer(el.value); el.value = ""; }
                  }}>
                    <Plus size={16} className="mr-1"/> Add
                  </Button>
                </div>
              </div>

              {/* Level */}
              <div>
                <div className="text-sm mb-2 flex items-center gap-2">
                  Nível (Fofo → Nuclear)
                  <Flame size={16} className={levelIndex >= 1 ? "text-orange-400" : "text-zinc-500"}/>
                </div>
                <Slider value={[levelIndex]} min={0} max={3} step={1} onValueChange={(v) => setLevelIndex(v[0])} />
                <div className="mt-1 text-xs text-zinc-400 uppercase tracking-wider">{level}</div>
              </div>

              {/* Categories */}
              <div>
                <div className="text-sm mb-2">Categorias</div>
                <div className="grid grid-cols-2 gap-2">
                  {(["cute","funny","spicy","deep"] as Category[]).map((c) => (
                    <label key={c} className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-sm bg-zinc-950/40">
                      <span className="capitalize">{c}</span>
                      <Switch checked={cats[c]} onCheckedChange={(v) => setCats((cs) => ({ ...cs, [c]: v }))} />
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 justify-end">
              <Button variant="outline" onClick={resetAll}>Resetar</Button>
              <Button variant="secondary" onClick={exportState}><Download size={16} className="mr-2"/>Exportar</Button>
              <ImportDialog onImport={importState} />
            </CardFooter>
          </Card>

          {/* Add card */}
          <AddCardPanel onAdd={addCustomCard} />

          <CardsManager
            baseCards={BASE_CARDS}
            customCards={customCards}
            hiddenIds={hiddenIds}
            onToggleHidden={toggleHidden}
            onDuplicate={duplicateFromBase}
            onEdit={updateCustomCard}
            onDelete={deleteCustomCard}
          />

          {/* Dica */}
          <Card className="bg-gradient-to-br from-red-600/10 to-rose-700/10 border-red-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Wand2 size={18}/> Dica rápida</CardTitle>
              <CardDescription>Use {"{p}"} e {"{p2}"} para inserir nomes aleatórios.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-zinc-300 space-y-2">
              <p>Ex.: "Beije {"{p}"} como em um filme" ou "{"{p}"} escolhe uma música para {"{p2}"}".</p>
              <p className="text-zinc-400">Tudo fica salvo no seu navegador (localStorage).</p>
            </CardContent>
          </Card>
        </aside>
      </main>

      <footer className="py-10 text-center text-xs text-zinc-400 border-t border-white/10">
        Feito com <span className="text-red-500">❤</span> para a noite de vocês — sem anúncios.
      </footer>

      {/* Modal de senha */}
      <AnimatePresence>
        {unlockPromptOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="bg-zinc-900 text-zinc-50 rounded-xl p-6 w-full max-w-sm"
            >
              <h2 className="text-lg font-semibold mb-4">Digite a senha</h2>
              <input
                type="password"
                value={unlockPassword}
                onChange={(e) => setUnlockPassword(e.target.value)}
                className="w-full rounded-lg p-2 mb-4 bg-zinc-800 border border-white/20 focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleUnlockCancel}
                  className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600"
                >Cancelar</button>
                <button
                  onClick={handleUnlockSubmit}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500"
                >OK</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function currentModeLabel(m: Mode) {
  return m === "never" ? "Eu Nunca" : m === "most" ? "Quem é Mais Provável" : m === "truth" ? "Verdade" : "Desafio";
}

function ModeBadge({ mode }: { mode: Mode }) {
  const map: Record<Mode, string> = {
    never: "bg-rose-600/20 text-rose-300",
    most: "bg-red-600/20 text-red-300",
    truth: "bg-rose-500/20 text-rose-300",
    dare: "bg-red-700/25 text-red-300",
  };
  return <Badge className={"border-0 " + map[mode]}>{currentModeLabel(mode)}</Badge>;
}

function GameTabs({ currentMode, onModeChange }: { currentMode: Mode; onModeChange: (m: Mode) => void }) {
  const tabs: { id: Mode; label: string; icon: JSX.Element }[] = [
    { id: "never", label: "Eu Nunca", icon: <Sparkles size={16} /> },
    { id: "most", label: "Mais Provável", icon: <Users size={16} /> },
    { id: "truth", label: "Verdade", icon: <ClipboardCopy size={16} /> },
    { id: "dare", label: "Desafio", icon: <Flame size={16} /> },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((t) => (
        <Button
          key={t.id}
          onClick={() => onModeChange(t.id)}
          variant={currentMode === t.id ? "default" : "secondary"}
          className={currentMode === t.id ? "bg-red-600 hover:bg-red-600" : "bg-zinc-800"}
        >
          <span className="mr-2">{t.icon}</span>{t.label}
        </Button>
      ))}
    </div>
  );
}

function ImportDialog({ onImport }: { onImport: (json: string) => void }) {
  const [open, setOpen] = useState(false);
  const [txt, setTxt] = useState("");
  return (
    <>
      <Button variant="outline" onClick={() => setOpen((o) => !o)}><Upload size={16} className="mr-2"/>Importar</Button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-2xl border border-white/10 p-3 bg-zinc-900/90 space-y-2">
            <Textarea value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="Cole aqui o JSON exportado…"/>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setOpen(false)}>Fechar</Button>
              <Button onClick={() => { onImport(txt); setOpen(false); }}>Importar</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function AddCardPanel({ onAdd }: { onAdd: (c: Omit<CardItem, "id">) => void }) {
  const [mode, setMode] = useState<Mode>("truth");
  const [text, setText] = useState("");
  const [lvl, setLvl] = useState<Level>("spicy");
  const [cat, setCat] = useState<Record<Category, boolean>>(() =>
    ALL_CATEGORIES.reduce(
      (acc, c) => ({ ...acc, [c]: c === 'cute' || c === 'spicy' }),
      {} as Record<Category, boolean>
    )
  );

  function submit() {
    const cats: Category[] = (Object.keys(cat) as Category[]).filter((k) => cat[k]);
    if (!text.trim()) return;
    onAdd({ mode, text, level: lvl, cats });
    setText("");
  }

  return (
    <Card className="bg-zinc-900/50 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Plus size={18}/> Nova carta</CardTitle>
        <CardDescription>Crie perguntas/desafios do seu jeitinho (use {"{p}"} e {"{p2}"}).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          {(["never","most","truth","dare"] as Mode[]).map((m) => (
            <Button key={m} variant={mode === m ? "default" : "secondary"} onClick={() => setMode(m)} className={mode === m ? "bg-red-600" : "bg-zinc-800"}>
              {currentModeLabel(m)}
            </Button>
          ))}
        </div>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Escreva aqui…" />
        <div>
          <div className="text-sm mb-1">Intensidade</div>
          <div className="flex gap-2 flex-wrap">
            {(["cute","spicy","hot","nuclear"] as Level[]).map((x) => (
              <Button key={x} variant={lvl === x ? "default" : "secondary"} onClick={() => setLvl(x)} className={lvl === x ? "bg-red-600" : "bg-zinc-800"}>
                {x}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-sm mb-1">Categorias</div>
          <div className="grid grid-cols-2 gap-2">
            {(["cute","funny","spicy","deep"] as Category[]).map((c) => (
              <label key={c} className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-sm bg-zinc-950/40">
                <span className="capitalize">{c}</span>
                <Switch checked={cat[c]} onCheckedChange={(v) => setCat((cs) => ({ ...cs, [c]: v }))} />
              </label>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button onClick={submit}><Save size={16} className="mr-2"/>Salvar carta</Button>
      </CardFooter>
    </Card>
  );
}


function CardsManager({ baseCards, customCards, hiddenIds, onToggleHidden, onDuplicate, onEdit, onDelete }:{ baseCards: CardItem[]; customCards: CardItem[]; hiddenIds: string[]; onToggleHidden:(id:string)=>void; onDuplicate:(c: CardItem)=>void; onEdit:(id:string, patch: Partial<Omit<CardItem,"id">>)=>void; onDelete:(id:string)=>void; }){
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<Mode | "all">("all");
  const [onlyActive, setOnlyActive] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editMode, setEditMode] = useState<Mode>("truth");
  const [editLevel, setEditLevel] = useState<Level>("spicy");
  const [editCats, setEditCats] = useState<Record<Category, boolean>>(() =>
    ALL_CATEGORIES.reduce(
      (acc, c) => ({ ...acc, [c]: c === 'cute' || c === 'spicy' }),
      {} as Record<Category, boolean>
    )
  );

  type Row = CardItem & { origin: "base" | "custom" };
  let rows: Row[] = [
    ...baseCards.map((c) => ({ ...c, origin: "base" as const })),
    ...customCards.map((c) => ({ ...c, origin: "custom" as const })),
  ];
  if (mode !== "all") rows = rows.filter((r) => r.mode === mode);
  if (q.trim()) rows = rows.filter((r) => r.text.toLowerCase().includes(q.toLowerCase()));
  if (onlyActive) rows = rows.filter((r) => !hiddenIds.includes(r.id));

  function startEdit(r: Row){
    setEditingId(r.id);
    setEditText(r.text);
    setEditMode(r.mode);
    setEditLevel(r.level);
    const cats = { cute:false, funny:false, spicy:false, deep:false } as Record<Category, boolean>;
    r.cats.forEach((c)=> (cats[c]=true));
    setEditCats(cats);
  }
  function saveEdit(){
    if (!editingId) return;
    const cats: Category[] = (Object.keys(editCats) as Category[]).filter((k)=> editCats[k]);
    onEdit(editingId, { text: editText, mode: editMode, level: editLevel, cats });
    setEditingId(null);
  }

  const ModeSel = (
    <select value={mode} onChange={(e)=> setMode(e.target.value as any)} className="rounded-xl bg-rose-950/30 border border-rose-200/20 px-3 py-2">
      <option value="all">Todos os modos</option>
      <option value="never">Eu Nunca</option>
      <option value="most">Mais Provável</option>
      <option value="truth">Verdade</option>
      <option value="dare">Desafio</option>
    </select>
  );

  return (
    <Card className="bg-zinc-900/50 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><List size={18}/> Cartas (ver/editar)</CardTitle>
        <CardDescription>Gerencie o baralho: ocultar, duplicar base, editar e excluir custom.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2 flex-wrap items-center">
          <div className="flex-1 min-w-[220px]"><Input placeholder="Buscar texto…" value={q} onChange={(e)=> setQ(e.target.value)} /></div>
          {ModeSel}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-red-600" checked={onlyActive} onChange={(e)=> setOnlyActive(e.target.checked)} />
            Mostrar apenas ativas
          </label>
        </div>

        <div className="space-y-2 max-h-[360px] overflow-auto pr-1">
          {rows.length === 0 && <div className="text-sm text-zinc-400">Nenhuma carta encontrada.</div>}
          {rows.slice(0, 200).map((r) => (
            <div key={r.id} className="rounded-xl border border-white/10 p-3 bg-zinc-950/40">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm flex-1 mr-2">
                  <div className="mb-1 font-medium">{r.text}</div>
                  <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
                    <Badge className={r.origin === "base" ? "bg-rose-900" : "bg-red-600/80"}>{r.origin === "base" ? "base" : "custom"}</Badge>
                    <Badge className="bg-rose-900 capitalize">{r.mode}</Badge>
                    <Badge className="bg-rose-900 uppercase">{r.level}</Badge>
                    {r.cats.map((c)=> <Badge key={c} className="bg-zinc-800 capitalize">{c}</Badge>)}
                    {hiddenIds.includes(r.id) && <Badge className="bg-zinc-800">oculta</Badge>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={()=> onToggleHidden(r.id)}>{hiddenIds.includes(r.id) ? <><Eye size={16} className="mr-1"/>Mostrar</> : <><EyeOff size={16} className="mr-1"/>Ocultar</>}</Button>
                  {r.origin === "base" ? (
                    <Button variant="secondary" onClick={()=> onDuplicate(r)}><Plus size={16} className="mr-1"/>Duplicar</Button>
                  ) : (
                    <>
                      <Button variant="secondary" onClick={()=> startEdit(r)}><Edit3 size={16} className="mr-1"/>Editar</Button>
                      <Button variant="outline" onClick={()=> onDelete(r.id)}><Trash2 size={16} className="mr-1"/>Excluir</Button>
                    </>
                  )}
                </div>
              </div>

              {/* Editor inline */}
              <AnimatePresence>
                {editingId === r.id && (
                  <motion.div initial={{opacity:0, y:-6}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-6}} className="mt-3 space-y-2">
                    <Textarea value={editText} onChange={(e)=> setEditText(e.target.value)} />
                    <div className="grid sm:grid-cols-3 gap-2">
                      <select value={editMode} onChange={(e)=> setEditMode(e.target.value as Mode)} className="rounded-xl bg-rose-950/30 border border-rose-200/20 px-3 py-2">
                        <option value="never">Eu Nunca</option>
                        <option value="most">Mais Provável</option>
                        <option value="truth">Verdade</option>
                        <option value="dare">Desafio</option>
                      </select>
                      <select value={editLevel} onChange={(e)=> setEditLevel(e.target.value as Level)} className="rounded-xl bg-rose-950/30 border border-rose-200/20 px-3 py-2">
                        <option value="cute">cute</option>
                        <option value="spicy">spicy</option>
                        <option value="hot">hot</option>
                        <option value="nuclear">nuclear</option>
                      </select>
                      <div className="flex items-center gap-3 text-sm">
                        {(["cute","funny","spicy","deep"] as Category[]).map((c)=> (
                          <label key={c} className="flex items-center gap-1">
                            <input type="checkbox" className="h-4 w-4 accent-red-600" checked={editCats[c]} onChange={(e)=> setEditCats((cs)=> ({...cs, [c]: e.target.checked}))} />
                            <span className="capitalize">{c}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="secondary" onClick={()=> setEditingId(null)}>Cancelar</Button>
                      <Button onClick={saveEdit}><Save size={16} className="mr-1"/>Salvar</Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
