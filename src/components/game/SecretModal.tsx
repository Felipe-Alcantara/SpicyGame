import { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Field";

/** Senha do easter egg. É só uma brincadeira do casal — não protege nada. */
const SECRET = "novidade";
const HINT = "O que nos define?";

/**
 * Modal secreto atrás da chama do cabeçalho. Acertando a senha, o nível
 * Nuclear entra na roda — antes ele só mostrava um alerta e não fazia nada.
 */
export function SecretModal({
  open,
  onClose,
  onUnlock,
  alreadyUnlocked,
}: {
  open: boolean;
  onClose: () => void;
  onUnlock: () => void;
  alreadyUnlocked: boolean;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);

  function submit() {
    if (value.trim().toLowerCase() === SECRET) {
      setValue("");
      setError(false);
      onUnlock();
      return;
    }
    setError(true);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={alreadyUnlocked ? "Já tá liberado 🔥" : "Digite a senha"}
      description={
        alreadyUnlocked
          ? "O nível Nuclear está disponível no filtro de intensidade."
          : "Acerte e o nível Nuclear entra no baralho."
      }
      footer={
        alreadyUnlocked ? (
          <Button onClick={onClose}>Fechar</Button>
        ) : (
          <>
            <Button variant="ghost" onClick={() => setHintVisible(true)}>
              Dica
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={submit}>Desbloquear</Button>
          </>
        )
      }
    >
      {!alreadyUnlocked && (
        <div className="space-y-2">
          <Input
            type="password"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            aria-label="Senha secreta"
            autoFocus
          />
          {error && <p className="text-sm text-red-300">Não é essa. Tenta de novo.</p>}
          {hintVisible && <p className="text-sm text-rose-100/60">Dica: {HINT}</p>}
        </div>
      )}
    </Modal>
  );
}
