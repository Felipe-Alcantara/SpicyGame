import { motion } from "framer-motion";
import { Flame, MessageCircleQuestion, Sparkles, Users } from "lucide-react";
import { Mode, MODES, MODE_LABELS } from "../../data/taxonomy";
import { cn } from "../../lib/cn";

const ICONS: Record<Mode, JSX.Element> = {
  never: <Sparkles size={15} />,
  most: <Users size={15} />,
  truth: <MessageCircleQuestion size={15} />,
  dare: <Flame size={15} />,
};

/** Abas de modo, com o indicador deslizando entre elas. */
export function ModeTabs({
  currentMode,
  onChange,
}: {
  currentMode: Mode;
  onChange: (mode: Mode) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Modos de jogo"
      className="grid grid-cols-2 gap-1.5 rounded-3xl border border-white/10 bg-black/30 p-1.5 sm:grid-cols-4"
    >
      {MODES.map((mode) => {
        const active = mode === currentMode;
        return (
          <button
            key={mode}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(mode)}
            className={cn(
              "relative flex items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-medium transition",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70",
              active ? "text-white" : "text-rose-100/50 hover:text-rose-100/80"
            )}
          >
            {active && (
              <motion.span
                layoutId="mode-tab-active"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 shadow-lg shadow-rose-900/40"
              />
            )}
            <span className="relative flex items-center gap-2">
              {ICONS[mode]}
              {MODE_LABELS[mode]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
