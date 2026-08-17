import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Field";
import {
  ASSINATURA,
  DICA,
  MENSAGEM,
  TITULO,
  paragrafos,
  senhaCorreta,
  temMensagem,
} from "../../data/segredo";

/**
 * O segredo atrás da pimenta do cabeçalho: uma senha e, do outro lado, um
 * recado.
 *
 * Este modal já esteve ligado ao desbloqueio do nível Nuclear. Era engano — o
 * gancho estava vazio porque a mensagem ainda não tinha sido escrita, e alguém
 * leu vazio como quebrado. O conteúdo mora em `data/segredo.ts`; aqui só existe
 * a porta.
 */
export function SecretModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [valor, setValor] = useState("");
  const [erro, setErro] = useState(false);
  const [dicaVisivel, setDicaVisivel] = useState(false);
  const [aberto, setAberto] = useState(false);

  // Fechar e reabrir pede a senha de novo: um segredo que fica destrancado
  // depois da primeira vez deixa de ser segredo para quem pegar o aparelho.
  useEffect(() => {
    if (!open) {
      setValor("");
      setErro(false);
      setDicaVisivel(false);
      setAberto(false);
    }
  }, [open]);

  function enviar() {
    if (senhaCorreta(valor)) {
      setValor("");
      setErro(false);
      setAberto(true);
      return;
    }
    setErro(true);
  }

  if (aberto) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title={TITULO}
        footer={<Button onClick={onClose}>Fechar</Button>}
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="space-y-3"
        >
          {temMensagem() ? (
            <>
              {paragrafos(MENSAGEM).map((texto, indice) => (
                <p
                  key={indice}
                  className="whitespace-pre-line text-sm leading-relaxed text-rose-50"
                >
                  {texto}
                </p>
              ))}
              {ASSINATURA.trim() && (
                <p className="pt-1 text-right text-sm italic text-rose-200/70">
                  {ASSINATURA.trim()}
                </p>
              )}
            </>
          ) : (
            // Sem mensagem escrita, dizer isso é melhor do que abrir um espaço
            // em branco — que pareceria defeito e ainda estragaria a surpresa.
            <p className="text-sm leading-relaxed text-rose-100/60">
              A senha está certa 💛 — o recado ainda está sendo escrito.
            </p>
          )}
        </motion.div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Digite a senha"
      description="Tem algo escondido aqui."
      footer={
        <>
          <Button variant="ghost" onClick={() => setDicaVisivel(true)}>
            Dica
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={enviar}>Abrir</Button>
        </>
      }
    >
      <div className="space-y-2">
        <Input
          type="password"
          value={valor}
          onChange={(e) => {
            setValor(e.target.value);
            setErro(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && enviar()}
          aria-label="Senha secreta"
          autoFocus
        />
        {erro && <p className="text-sm text-red-300">Não é essa. Tenta de novo.</p>}
        {dicaVisivel && <p className="text-sm text-rose-100/60">Dica: {DICA}</p>}
      </div>
    </Modal>
  );
}
