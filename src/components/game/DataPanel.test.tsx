import { createElement } from "react";
import { act } from "react-test-renderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { button, click, dialog, field, mount, stubDocument, unmount } from "../../test-render";
import { DataPanel } from "./DataPanel";

// Os avisos e o download são vizinhos da tela: aqui se confere o que a tela
// pede a eles, não o que eles fazem.
const { notify, downloadJson } = vi.hoisted(() => ({ notify: vi.fn(), downloadJson: vi.fn() }));
vi.mock("../ui/Toast", () => ({ useToast: () => notify }));
vi.mock("../../lib/download", () => ({ downloadJson }));

const EXPORTED = '{\n  "version": 1,\n  "players": ["Ela", "Ele"]\n}';

type Props = Parameters<typeof DataPanel>[0];

function mountPanel(overrides: Partial<Props> = {}) {
  return mount(
    createElement(DataPanel, {
      onExport: () => EXPORTED,
      onImport: () => null,
      onReset() {},
      ...overrides,
    })
  );
}

beforeEach(stubDocument);

afterEach(() => {
  unmount();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("Seus dados — exportar", () => {
  it("baixar entrega o JSON num arquivo com a data de hoje no nome", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 26, 10, 0));
    const root = mountPanel();

    click(button(root, "Baixar"));

    expect(downloadJson).toHaveBeenCalledWith("spicy-game-2026-10-26.json", EXPORTED);
  });

  it("copiar usa a área de transferência e não abre o campo de texto quando dá certo", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const root = mountPanel();

    await act(async () => button(root, "Copiar").props.onClick());

    expect(writeText).toHaveBeenCalledWith(EXPORTED);
    expect(notify).toHaveBeenCalledWith(expect.stringContaining("copiado"), "success");
    expect(dialog(root)).toBeUndefined();
  });

  it.each([
    ["o navegador nega a cópia", { clipboard: { writeText: () => Promise.reject(new Error("negado")) } }],
    ["a página não tem área de transferência", {}],
  ])("quando %s, mostra o JSON num campo para selecionar", async (_caso, nav) => {
    vi.stubGlobal("navigator", nav);
    const root = mountPanel();

    await act(async () => button(root, "Copiar").props.onClick());

    const open = dialog(root);
    expect(open).toBeDefined();
    const box = field(open!, "JSON exportado");
    expect(box.props.value).toBe(EXPORTED);
    expect(box.props.readOnly).toBe(true);
    expect(notify).toHaveBeenCalledWith(expect.any(String), "error");
  });
});
