import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useGameSession } from "../../hooks/useGameSession";
import { AppHeader } from "../layout/AppHeader";
import { BackgroundFX } from "../layout/BackgroundFX";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";
import { AddCardPanel } from "./AddCardPanel";
import { CardsManager } from "./CardsManager";
import { CardStage } from "./CardStage";
import { DataPanel } from "./DataPanel";
import { FiltersPanel } from "./FiltersPanel";
import { ModeTabs } from "./ModeTabs";
import { PlayersPanel } from "./PlayersPanel";
import { SecretModal } from "./SecretModal";
import { cn } from "../../lib/cn";

/**
 * Chave do desbloqueio do Nuclear por senha, que não existe mais.
 *
 * O Nuclear virou um nível como os outros, escolhido no filtro de intensidade —
 * a senha nunca teve a ver com isso (ver `data/segredo.ts`). A chave só
 * sobrevive aqui para ser APAGADA de quem já jogou: deixar lixo no
 * `localStorage` de terceiro é sujeira que ninguém mais vai saber remover.
 */
const CHAVE_NUCLEAR_ANTIGA = "spicy-game-nuclear-unlocked";

/**
 * Página do jogo: junta o palco da carta com o painel lateral de ajustes.
 *
 * Toda a lógica mora em `useGameSession`; aqui só existe composição e o que é
 * puramente de apresentação (painel lateral virar gaveta no celular).
 */
export function SpicyGame() {
  const game = useGameSession();
  const notify = useToast();
  const [panelOpen, setPanelOpen] = useState(false);
  const [secretOpen, setSecretOpen] = useState(false);

  // Limpeza única do desbloqueio que não existe mais. Sem isto, a chave ficaria
  // para sempre no navegador de quem já tinha acertado a senha.
  useEffect(() => {
    try {
      localStorage.removeItem(CHAVE_NUCLEAR_ANTIGA);
    } catch {
      /* storage indisponível: não há o que limpar */
    }
  }, []);

  const panel = (
    <div className="space-y-4">
      <PlayersPanel
        players={game.players}
        scores={game.scores}
        onAdd={game.addPlayer}
        onRemove={game.removePlayer}
        onAddPoint={game.addPoint}
        onResetScores={game.resetScores}
      />
      <FiltersPanel
        levelIndex={game.levelIndex}
        cats={game.cats}
        poolSize={game.poolSize}
        onLevelChange={game.setLevelIndex}
        onToggleCategory={game.toggleCategory}
        onSetAllCategories={game.setAllCategories}
      />
      <AddCardPanel
        onAdd={(card) => {
          game.addCustomCard(card);
          notify("Carta adicionada ao seu baralho.", "success");
        }}
      />
      <CardsManager
        allCards={game.allCards}
        customCards={game.customCards}
        hiddenIds={game.hiddenIds}
        onToggleHidden={game.toggleHidden}
        onDuplicate={game.duplicateCard}
        onEdit={game.updateCustomCard}
        onDelete={game.deleteCustomCard}
      />
      <DataPanel
        onExport={game.exportState}
        onImport={game.importState}
        onReset={game.resetAll}
      />
    </div>
  );

  return (
    <div className="min-h-screen text-rose-50 selection:bg-rose-500/40">
      <BackgroundFX />
      <AppHeader
        onOpenSettings={() => setPanelOpen(true)}
        onSecretClick={() => setSecretOpen(true)}
      />

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1fr_380px] lg:py-10">
        <div className="space-y-4">
          <ModeTabs currentMode={game.currentMode} onChange={game.setCurrentMode} />
          <CardStage
            card={game.currentCard}
            mode={game.currentMode}
            players={game.players}
            position={game.cursor}
            total={game.deck.length}
            onNext={game.nextCard}
            onPrevious={game.previousCard}
            onReshuffle={game.reshuffle}
          />
        </div>

        {/* Desktop: painel fixo na lateral. */}
        <aside className="hidden lg:block">{panel}</aside>
      </main>

      {/* Celular: o mesmo painel vira gaveta. */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            onClick={() => setPanelOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "spicy-scroll ml-auto h-full w-full max-w-md overflow-y-auto",
                "border-l border-white/10 bg-zinc-950/95 p-4"
              )}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold">Ajustes</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPanelOpen(false)}
                  aria-label="Fechar ajustes"
                >
                  <X size={16} />
                </Button>
              </div>
              {panel}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SecretModal open={secretOpen} onClose={() => setSecretOpen(false)} />

      <footer className="border-t border-white/5 py-8 text-center text-xs text-rose-100/30">
        Feito com <span className="text-rose-500">❤</span> para a noite de vocês — sem anúncios,
        sem servidor, sem julgamento.
      </footer>
    </div>
  );
}
