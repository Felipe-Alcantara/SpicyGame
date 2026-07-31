import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Flame, Shuffle, Timer } from "lucide-react";
import {
  CardItem,
  CATEGORY_LABELS,
  LEVEL_LABELS,
  LEVEL_THEME,
  Mode,
  MODE_DESCRIPTIONS,
  MODE_LABELS,
} from "../../data/taxonomy";
import { replacePlaceholders } from "../../lib/placeholders";
import { cn } from "../../lib/cn";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { useTimer } from "../../hooks/useTimer";

/**
 * O palco da carta atual.
 *
 * A carta é arrastável para o lado (swipe no celular) e responde às setas do
 * teclado, porque no meio do jogo ninguém quer procurar botão.
 */
export function CardStage({
  card,
  mode,
  players,
  position,
  total,
  onNext,
  onPrevious,
  onReshuffle,
}: {
  card: CardItem | undefined;
  mode: Mode;
  players: string[];
  position: number;
  total: number;
  onNext: () => void;
  onPrevious: () => void;
  onReshuffle: () => void;
}) {
  const timer = useTimer();

  // O texto é resolvido uma vez por carta: sem isso os nomes sorteados
  // mudariam a cada render e a frase trocaria de pessoa sozinha.
  const text = useMemo(
    () => (card ? replacePlaceholders(card.text, players) : ""),
    [card?.id, position, players]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(
        (e.target as HTMLElement)?.tagName ?? ""
      );
      if (typing) return;
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        onNext();
      }
      if (e.key === "ArrowLeft") onPrevious();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onNext, onPrevious]);

  const theme = LEVEL_THEME[card?.level ?? "spicy"];

  return (
    <section aria-label="Carta atual">
      <AnimatePresence mode="wait">
        <motion.article
          key={card ? `${card.id}-${position}` : "empty"}
          initial={{ opacity: 0, y: 24, rotate: -1.5, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, y: -24, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.x < -90) onNext();
            else if (info.offset.x > 90) onPrevious();
          }}
          className={cn(
            "relative flex min-h-[340px] cursor-grab flex-col justify-between overflow-hidden rounded-[28px]",
            "border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-6 backdrop-blur-xl active:cursor-grabbing",
            theme.glow
          )}
        >
          <header className="flex flex-wrap items-center gap-2">
            <Badge className={theme.chip}>
              <Flame size={11} /> {LEVEL_LABELS[card?.level ?? "spicy"]}
            </Badge>
            <Badge>{MODE_LABELS[mode]}</Badge>
            <span className="ml-auto text-xs tabular-nums text-rose-100/40">
              {total ? `${position + 1} / ${total}` : "0 / 0"}
            </span>
          </header>

          <p
            className={cn(
              "my-6 text-balance text-2xl font-semibold leading-snug sm:text-3xl",
              !card && "text-lg font-normal text-rose-100/50"
            )}
          >
            {card ? text : "Nenhuma carta com esses filtros. Solta um pouco o nível ou liga mais categorias."}
          </p>

          <footer className="space-y-3">
            <p className="text-xs text-rose-100/40">{MODE_DESCRIPTIONS[mode]}</p>
            <div className="flex flex-wrap items-center gap-1.5">
              {card?.cats.map((c) => (
                <Badge key={c}>{CATEGORY_LABELS[c]}</Badge>
              ))}
            </div>
          </footer>
        </motion.article>
      </AnimatePresence>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="icon" onClick={onPrevious} aria-label="Carta anterior">
          <ChevronLeft size={16} />
        </Button>
        <Button variant="secondary" onClick={timer.toggle}>
          <Timer size={16} />
          {timer.running ? `${timer.seconds}s` : "Cronômetro"}
        </Button>
        <Button variant="secondary" onClick={onReshuffle}>
          <Shuffle size={16} /> Embaralhar
        </Button>
        <Button size="lg" onClick={onNext} className="ml-auto flex-1 sm:flex-none">
          Próxima carta
        </Button>
      </div>
      <p className="mt-2 text-center text-[11px] text-rose-100/30">
        Arraste a carta ou use as setas ← → do teclado.
      </p>
    </section>
  );
}
