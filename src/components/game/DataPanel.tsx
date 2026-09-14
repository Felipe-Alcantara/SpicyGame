import { useState } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/Field";
import { Modal } from "../ui/Modal";
import { useToast } from "../ui/Toast";

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

  async function copy() {
    const data = onExport();
    try {
      await navigator.clipboard.writeText(data);
    notify("Estado completo copiado para a área de transferência.", "success");
    } catch {
      notify("O navegador bloqueou a cópia. Selecione e copie manualmente.", "error");
    }
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
            O estado completo pode ser exportado em JSON e fica salvo só neste navegador.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={copy}>
            <Download size={14} /> Exportar
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
