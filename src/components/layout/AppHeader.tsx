import { Flame, Settings2 } from "lucide-react";
import { Button } from "../ui/Button";

/** Barra superior fixa: marca, atalho para os ajustes e o easter egg do coração. */
export function AppHeader({
  onOpenSettings,
  onSecretClick,
}: {
  onOpenSettings: () => void;
  onSecretClick: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-black/30 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <button
          onClick={onSecretClick}
          aria-label="Segredo"
          className="rounded-full p-1 text-rose-400 transition hover:scale-110 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70"
        >
          <Flame size={22} />
        </button>
        <div>
          <span className="text-base font-semibold tracking-tight">Spicy Game</span>
          <span className="ml-2 hidden text-xs text-rose-100/40 sm:inline">
            jogo de bebida pra dois
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onOpenSettings} className="lg:hidden">
            <Settings2 size={14} /> Ajustes
          </Button>
        </div>
      </div>
    </header>
  );
}
