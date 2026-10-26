import { ChangeEvent, useRef, useState } from "react";
import { Copy, Download, FileUp, Trash2, Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/Field";
import { Modal } from "../ui/Modal";
import { useToast } from "../ui/Toast";
import { downloadJson } from "../../lib/download";
import {
  describeMergeResult,
  exportFileName,
  type MergeCardsResult,
} from "../../lib/stateTransfer";

/** Exportar, importar e resetar o estado salvo neste navegador. */
export function DataPanel({
  onExport,
  onImport,
  onMergeCards,
  onReset,
  customCardCount,
}: {
  onExport: () => string;
  onImport: (json: string) => string | null;
  onMergeCards: (json: string) => MergeCardsResult;
  onReset: () => void;
  customCardCount: number;
}) {
  const notify = useToast();
  const [importOpen, setImportOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [json, setJson] = useState("");
  const [manualJson, setManualJson] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function copy() {
    const data = onExport();
    try {
      await navigator.clipboard.writeText(data);
      notify("Estado completo copiado para a área de transferência.", "success");
    } catch {
      // sem permissão ou sem área de transferência na página: o texto vai para a tela
      setManualJson(data);
      notify("O navegador bloqueou a cópia. O texto está na tela para você copiar.", "error");
    }
  }

  function download() {
    const name = exportFileName();
    downloadJson(name, onExport());
    notify(`Backup baixado: ${name}.`, "success");
  }

  async function pickFile(e: ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;
    try {
      setJson(await file.text());
    } catch {
      notify("Não consegui ler esse arquivo.", "error");
    } finally {
      input.value = ""; // sem isto, escolher o mesmo arquivo de novo não dispara nada
    }
  }

  function replaceAll() {
    const error = onImport(json);
    if (error) {
      notify(error, "error");
      return;
    }
    setImportOpen(false);
    setJson("");
    notify("Estado importado com sucesso.", "success");
  }

  function mergeCards() {
    const result = onMergeCards(json);
    if (!result.ok) {
      notify(result.error, "error");
      return;
    }
    setImportOpen(false);
    setJson("");
    notify(describeMergeResult(result), result.added > 0 ? "success" : "info");
  }

  const mine = customCardCount === 1 ? "1 carta própria" : `${customCardCount} cartas próprias`;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Seus dados</CardTitle>
          <CardDescription>
            O estado completo pode ser copiado ou baixado em JSON e fica salvo só neste navegador.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={copy}>
            <Copy size={14} /> Copiar
          </Button>
          <Button variant="secondary" size="sm" onClick={download}>
            <Download size={14} /> Baixar
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setImportOpen(true)}>
            <Upload size={14} /> Importar
          </Button>
          <Button variant="danger" size="sm" onClick={() => setResetOpen(true)}>
            <Trash2 size={14} /> Resetar tudo
          </Button>
        </CardContent>
      </Card>

      <Modal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Importar estado"
        description="Cole o JSON ou escolha o arquivo exportado pelo Spicy Game, atual ou legado."
        footer={
          <div className="flex w-full flex-wrap justify-end gap-2">
            <Button variant="secondary" onClick={() => setImportOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={replaceAll} disabled={!json.trim()}>
              Substituir tudo
            </Button>
            <Button onClick={mergeCards} disabled={!json.trim()}>
              Só somar cartas
            </Button>
          </div>
        }
      >
        <Textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          placeholder='{ "version": 1, "players": [...], "currentMode": "truth", ... }'
          aria-label="JSON do estado da partida"
        />
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          onChange={pickFile}
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
        />
        <Button
          variant="secondary"
          size="sm"
          className="mt-2"
          onClick={() => fileInput.current?.click()}
        >
          <FileUp size={14} /> Escolher arquivo
        </Button>
        <div className="mt-4 space-y-2 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs text-rose-100/60">
          <p>
            <strong className="text-rose-50">Substituir tudo</strong> apaga o que você tem hoje —
            jogadores, placar, nível, filtros, cartas ocultas e {mine} — e coloca no lugar o que
            está no arquivo.
          </p>
          <p>
            <strong className="text-rose-50">Só somar cartas</strong> acrescenta ao seu baralho as
            cartas próprias do arquivo e não apaga nada. Carta que você já tem (mesmo modo e mesmo
            texto) é ignorada.
          </p>
        </div>
      </Modal>

      <Modal
        open={manualJson !== null}
        onClose={() => setManualJson(null)}
        title="Copie o JSON"
        description="O navegador bloqueou a cópia automática. Toque no campo, selecione tudo e copie — ou baixe o arquivo."
        footer={
          <>
            <Button variant="secondary" onClick={download}>
              <Download size={14} /> Baixar
            </Button>
            <Button onClick={() => setManualJson(null)}>Fechar</Button>
          </>
        }
      >
        <Textarea
          readOnly
          autoFocus
          value={manualJson ?? ""}
          onFocus={(e) => e.currentTarget.select()}
          aria-label="JSON exportado"
          className="h-48 resize-none font-mono text-xs"
        />
      </Modal>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Apagar tudo?"
        description="Suas cartas criadas, nomes, placar e preferências somem deste navegador. Não dá para desfazer."
        footer={
          <>
            <Button variant="secondary" onClick={() => setResetOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                onReset();
                setResetOpen(false);
                notify("Tudo limpo. O jogo voltou ao estado inicial.", "success");
              }}
            >
              Apagar mesmo assim
            </Button>
          </>
        }
      />
    </>
  );
}
