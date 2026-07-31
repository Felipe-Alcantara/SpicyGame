import { useState } from "react";
import { PlusCircle, Save } from "lucide-react";
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Select, Textarea } from "../ui/Field";
import { cn } from "../../lib/cn";

/** Formulário de carta nova. As cartas criadas ficam só neste navegador. */
export function AddCardPanel({
  onAdd,
}: {
  onAdd: (card: Omit<CardItem, "id">) => void;
}) {
  const [mode, setMode] = useState<Mode>("truth");
  const [level, setLevel] = useState<Level>("spicy");
  const [text, setText] = useState("");
  const [selected, setSelected] = useState<Category[]>(["spicy"]);

  const canSave = text.trim().length > 0 && selected.length > 0;

  function toggle(cat: Category) {
    setSelected((s) => (s.includes(cat) ? s.filter((c) => c !== cat) : [...s, cat]));
  }

  function submit() {
    if (!canSave) return;
    onAdd({ mode, level, text: text.trim(), cats: selected });
    setText("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <PlusCircle size={16} /> Carta nova
        </CardTitle>
        <CardDescription>
          Use <code className="text-rose-300">{"{p}"}</code> e{" "}
          <code className="text-rose-300">{"{p2}"}</code> para sortear nomes diferentes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Select
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
            aria-label="Modo da carta"
          >
            {MODES.map((m) => (
              <option key={m} value={m}>
                {MODE_LABELS[m]}
              </option>
            ))}
          </Select>
          <Select
            value={level}
            onChange={(e) => setLevel(e.target.value as Level)}
            aria-label="Intensidade da carta"
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {LEVEL_LABELS[l]}
              </option>
            ))}
          </Select>
        </div>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escreve aqui a pergunta ou o desafio…"
          aria-label="Texto da carta"
        />

        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={selected.includes(c)}
              onClick={() => toggle(c)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70",
                selected.includes(c)
                  ? "border-rose-400/50 bg-rose-500/20 text-rose-100"
                  : "border-white/10 bg-white/5 text-rose-100/50 hover:text-rose-100/80"
              )}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={submit} disabled={!canSave}>
          <Save size={16} /> Salvar carta
        </Button>
      </CardFooter>
    </Card>
  );
}
