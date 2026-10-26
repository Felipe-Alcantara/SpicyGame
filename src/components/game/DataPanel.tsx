import { useState } from "react";
import { Copy, Download, Trash2, Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/Field";
import { Modal } from "../ui/Modal";
import { useToast } from "../ui/Toast";
import { downloadJson } from "../../lib/download";
import { exportFileName } from "../../lib/stateTransfer";

/** Exportar, importar e resetar o estado salvo neste navegador. */
export function DataPanel({
  onExport,
  onImport,
  onReset,
}: {
  onExport: () => string;
  onImport: (json: string) => string | null;
  onReset: () => void;
}) {
  const notify = useToast();
  const [importOpen, setImportOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [json, setJson] = useState("");
  const [manualJson, setManualJson] = useState<string | null>(null);

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

  function confirmImport() {
    const error = onImport(json);
    if (error) {
      notify(error, "error");
      return;
    }
    setImportOpen(false);
    setJson("");
    notify("Estado importado com sucesso.", "success");
  }

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
        description="Cole um JSON exportado pelo Spicy Game, atual ou legado."
        footer={
          <>
            <Button variant="secondary" onClick={() => setImportOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmImport} disabled={!json.trim()}>
              Importar
            </Button>
          </>
        }
      >
        <Textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          placeholder='{ "version": 1, "players": [...], "currentMode": "truth", ... }'
          aria-label="JSON do estado da partida"
        />
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
