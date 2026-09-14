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
  onLevelChange,
  onToggleCategory,
  onSetAllCategories,
}: {
  levelIndex: number;
  cats: Record<Category, boolean>;
  poolSize: number;
  onLevelChange: (index: number) => void;
  onToggleCategory: (cat: Category, value: boolean) => void;
  onSetAllCategories: (value: boolean) => void;
}) {
  const level = LEVELS[levelIndex] ?? "spicy";
  const hasInactiveCategory = CATEGORIES.some((category) => !cats[category]);

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
      {poolSize === 0 && (
        <CardContent className="pt-0">
          <div
            role="status"
            aria-live="polite"
            className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-3 py-3 text-sm text-amber-100"
          >
            <p className="font-medium">Nenhuma carta atende aos filtros atuais.</p>
            <p className="mt-1 text-xs text-amber-100/70">
              Ajuste o nível, as categorias ou reative cartas ocultas. O filtro não usa fallback.
            </p>
            {hasInactiveCategory && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => onSetAllCategories(true)}
              >
                Reativar todas as categorias
              </Button>
            )}
          </div>
        </CardContent>
      )}
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
            max={LEVELS.length - 1}
            step={1}
            onChange={onLevelChange}
          />
          <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wider text-rose-100/30">
            {LEVELS.map((l) => (
              <span key={l}>{LEVEL_LABELS[l]}</span>
            ))}
          </div>
          <p className="mt-2 text-xs text-rose-100/40">
            Entram no baralho todas as cartas até esse nível.
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
