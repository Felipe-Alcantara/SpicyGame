import { useState } from "react";
import { Minus, Plus, RotateCcw, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Field";

/**
 * Jogadores e placar de goles.
 *
 * O placar é novo: antes o jogo não guardava nada de quem bebeu o quê, e no
 * meio da noite ninguém lembra.
 */
export function PlayersPanel({
  players,
  scores,
  onAdd,
  onRemove,
  onAddPoint,
  onResetScores,
}: {
  players: string[];
  scores: Record<string, number>;
  onAdd: (name: string) => void;
  onRemove: (name: string) => void;
  onAddPoint: (name: string, delta?: number) => void;
  onResetScores: () => void;
}) {
  const [draft, setDraft] = useState("");

  function submit() {
    onAdd(draft);
    setDraft("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Users size={16} /> Jogadores e goles
        </CardTitle>
        <CardDescription>Marque um gole em quem pagou a rodada.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {players.length === 0 && (
          <p className="text-sm text-rose-100/40">Adicione pelo menos um nome.</p>
        )}
        {players.map((p) => (
          <div
            key={p}
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2"
          >
            <span className="flex-1 truncate text-sm font-medium">{p}</span>
            <span className="w-8 text-center text-sm tabular-nums text-rose-200">
              {scores[p] ?? 0}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onAddPoint(p, -1)}
              aria-label={`Tirar um gole de ${p}`}
            >
              <Minus size={14} />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => onAddPoint(p, 1)}
              aria-label={`Marcar um gole para ${p}`}
            >
              <Plus size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(p)}
              aria-label={`Remover ${p}`}
            >
              ×
            </Button>
          </div>
        ))}

        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Adicionar nome"
            aria-label="Nome do jogador"
          />
          <Button onClick={submit} aria-label="Adicionar jogador">
            <Plus size={16} />
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={onResetScores}>
          <RotateCcw size={14} /> Zerar placar
        </Button>
      </CardFooter>
    </Card>
  );
}
