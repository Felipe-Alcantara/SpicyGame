/** Entrega um JSON ao navegador como arquivo para baixar. */
export function downloadJson(fileName: string, json: string): void {
  const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // o navegador já pegou o arquivo; soltar a URL depois evita vazar o Blob
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
