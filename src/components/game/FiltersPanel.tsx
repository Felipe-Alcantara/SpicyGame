import { Flame, SlidersHorizontal } from "lucide-react";
import {
  Category,
  CATEGORIES,
  CATEGORY_LABELS,
  LEVELS,
  LEVEL_LABELS,
  LEVEL_THEME,
} from "../../data/taxonomy";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Slider, Switch } from "../ui/Field";
import { cn } from "../../lib/cn";

/** Nível de intensidade e categorias ativas — os dois filtros do baralho. */
export function FiltersPanel({
  levelIndex,
  cats,
  poolSize,
  maxLevelIndex,
  onLevelChange,
  onToggleCategory,
  onSetAllCategories,
}: {
  levelIndex: number;
  cats: Record<Category, boolean>;
  poolSize: number;
  /** Último nível liberado — o Nuclear só entra depois do easter egg. */
  maxLevelIndex: number;
  onLevelChange: (index: number) => void;
  onToggleCategory: (cat: Category, value: boolean) => void;
  onSetAllCategories: (value: boolean) => void;
}) {
  const level = LEVELS[levelIndex] ?? "spicy";

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <SlidersHorizontal size={16} /> Filtros
        </CardTitle>
        <CardDescription>
          {poolSize} carta{poolSize === 1 ? "" : "s"} no baralho atual.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Flame size={15} className={LEVEL_THEME[level].accent} /> Intensidade
            </span>
            <span className={cn("text-xs font-semibold uppercase tracking-wider", LEVEL_THEME[level].accent)}>
              {LEVEL_LABELS[level]}
            </span>
          </div>
          <Slider
            label="Intensidade máxima"
            value={levelIndex}
            min={0}
            max={maxLevelIndex}
            step={1}
            onChange={onLevelChange}
          />
          {/* Só as legendas dos níveis liberados: com o Nuclear trancado o
              slider termina antes, e mostrar a legenda dele desalinharia tudo. */}
          <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wider text-rose-100/30">
            {LEVELS.slice(0, maxLevelIndex + 1).map((l) => (
              <span key={l}>{LEVEL_LABELS[l]}</span>
            ))}
          </div>
          <p className="mt-2 text-xs text-rose-100/40">
            Entram no baralho todas as cartas até esse nível.
            {maxLevelIndex < LEVELS.length - 1 && " O Nuclear ainda está trancado 🔒"}
          </p>
        </div>

        <div>
          <div className="mb-2 text-sm">Categorias</div>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {CATEGORIES.map((c) => (
              <label
                key={c}
                className="flex cursor-pointer items-center justify-between gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
              >
                <span>{CATEGORY_LABELS[c]}</span>
                <Switch
                  label={CATEGORY_LABELS[c]}
                  checked={cats[c]}
                  onCheckedChange={(v) => onToggleCategory(c, v)}
                />
              </label>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => onSetAllCategories(false)}>
          Desmarcar tudo
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onSetAllCategories(true)}>
          Marcar tudo
        </Button>
      </CardFooter>
    </Card>
  );
}
