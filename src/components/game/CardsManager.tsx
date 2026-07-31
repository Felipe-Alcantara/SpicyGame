import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Edit3, Eye, EyeOff, Library, Save, Trash2 } from "lucide-react";
import {
  CardItem,
  Category,
  CATEGORIES,
  CATEGORY_LABELS,
  Level,
  LEVELS,
  LEVEL_LABELS,
  Mode,
  MODES,
  MODE_LABELS,
} from "../../data/taxonomy";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input, Select, Textarea } from "../ui/Field";
import { Badge } from "../ui/Badge";
import { cn } from "../../lib/cn";

const PAGE_SIZE = 60;

/** Biblioteca do baralho: buscar, ocultar, duplicar, editar e excluir cartas. */
export function CardsManager({
  allCards,
  customCards,
  hiddenIds,
  onToggleHidden,
  onDuplicate,
  onEdit,
  onDelete,
}: {
  allCards: CardItem[];
  customCards: CardItem[];
  hiddenIds: string[];
  onToggleHidden: (id: string) => void;
  onDuplicate: (card: CardItem) => void;
  onEdit: (id: string, patch: Partial<Omit<CardItem, "id">>) => void;
  onDelete: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [modeFilter, setModeFilter] = useState<Mode | "all">("all");
  const [onlyActive, setOnlyActive] = useState(false);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [editingId, setEditingId] = useState<string | null>(null);

  const customIds = useMemo(() => new Set(customCards.map((c) => c.id)), [customCards]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allCards.filter((c) => {
      if (modeFilter !== "all" && c.mode !== modeFilter) return false;
      if (q && !c.text.toLowerCase().includes(q)) return false;
      if (onlyActive && hiddenIds.includes(c.id)) return false;
      return true;
    });
  }, [allCards, modeFilter, query, onlyActive, hiddenIds]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Library size={16} /> Biblioteca
        </CardTitle>
        <CardDescription>
          {rows.length} de {allCards.length} cartas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-[180px] flex-1">
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setLimit(PAGE_SIZE);
              }}
              placeholder="Buscar no texto…"
              aria-label="Buscar carta"
            />
          </div>
          <Select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value as Mode | "all")}
            aria-label="Filtrar por modo"
            className="w-auto"
          >
            <option value="all">Todos os modos</option>
            {MODES.map((m) => (
              <option key={m} value={m}>
                {MODE_LABELS[m]}
              </option>
            ))}
          </Select>
          <label className="flex items-center gap-2 text-xs text-rose-100/60">
            <input
              type="checkbox"
              className="h-4 w-4 accent-rose-500"
              checked={onlyActive}
              onChange={(e) => setOnlyActive(e.target.checked)}
            />
            Só ativas
          </label>
        </div>

        <div className="spicy-scroll max-h-[420px] space-y-2 overflow-auto pr-1">
          {rows.length === 0 && (
            <p className="text-sm text-rose-100/40">Nenhuma carta com esse filtro.</p>
          )}
          {rows.slice(0, limit).map((card) => {
            const isCustom = customIds.has(card.id);
            const hidden = hiddenIds.includes(card.id);
            return (
              <div
                key={card.id}
                className={cn(
                  "rounded-2xl border border-white/10 bg-black/20 p-3 transition",
                  hidden && "opacity-45"
                )}
              >
                <p className="text-sm">{card.text}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Badge className={isCustom ? "border-rose-400/40 bg-rose-500/20 text-rose-100" : ""}>
                    {isCustom ? "minha" : "base"}
                  </Badge>
                  <Badge>{MODE_LABELS[card.mode]}</Badge>
                  <Badge>{LEVEL_LABELS[card.level]}</Badge>
                  {card.cats.map((c) => (
                    <Badge key={c}>{CATEGORY_LABELS[c]}</Badge>
                  ))}
                  <div className="ml-auto flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onToggleHidden(card.id)}
                      aria-label={hidden ? "Reativar carta" : "Ocultar carta"}
                    >
                      {hidden ? <Eye size={14} /> : <EyeOff size={14} />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDuplicate(card)}
                      aria-label="Duplicar carta"
                    >
                      <Copy size={14} />
                    </Button>
                    {isCustom && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingId(editingId === card.id ? null : card.id)}
                          aria-label="Editar carta"
                        >
                          <Edit3 size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(card.id)}
                          aria-label="Excluir carta"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {editingId === card.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <CardEditor
                        card={card}
                        onCancel={() => setEditingId(null)}
                        onSave={(patch) => {
                          onEdit(card.id, patch);
                          setEditingId(null);
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {rows.length > limit && (
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setLimit((l) => l + PAGE_SIZE)}
            >
              Mostrar mais ({rows.length - limit} restantes)
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CardEditor({
  card,
  onSave,
  onCancel,
}: {
  card: CardItem;
  onSave: (patch: Partial<Omit<CardItem, "id">>) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(card.text);
  const [mode, setMode] = useState<Mode>(card.mode);
  const [level, setLevel] = useState<Level>(card.level);
  const [cats, setCats] = useState<Category[]>(card.cats);

  return (
    <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
      <Textarea value={text} onChange={(e) => setText(e.target.value)} aria-label="Texto da carta" />
      <div className="grid grid-cols-2 gap-2">
        <Select value={mode} onChange={(e) => setMode(e.target.value as Mode)} aria-label="Modo">
          {MODES.map((m) => (
            <option key={m} value={m}>
              {MODE_LABELS[m]}
            </option>
          ))}
        </Select>
        <Select
          value={level}
          onChange={(e) => setLevel(e.target.value as Level)}
          aria-label="Intensidade"
        >
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {LEVEL_LABELS[l]}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={cats.includes(c)}
            onClick={() =>
              setCats((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]))
            }
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11px] transition",
              cats.includes(c)
                ? "border-rose-400/50 bg-rose-500/20 text-rose-100"
                : "border-white/10 bg-white/5 text-rose-100/50"
            )}
          >
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          size="sm"
          onClick={() => onSave({ text: text.trim(), mode, level, cats })}
          disabled={!text.trim() || cats.length === 0}
        >
          <Save size={14} /> Salvar
        </Button>
      </div>
    </div>
  );
}
