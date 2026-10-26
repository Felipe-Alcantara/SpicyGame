import { createElement } from "react";
import { act, type ReactTestInstance } from "react-test-renderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { button, click, dialog, field, mount, stubDocument, textOf, unmount } from "../../test-render";
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
      onMergeCards: () => ({ ok: true as const, added: 2, skipped: 1 }),
      onReset() {},
      customCardCount: 7,
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

describe("Seus dados — importar", () => {
  const FILE = '{ "version": 1 }';

  function mountImport(overrides: Partial<Props> = {}) {
    const root = mountPanel(overrides);
    click(button(root, "Importar"));
    return root;
  }

  function paste(root: ReactTestInstance, text: string) {
    act(() => field(dialog(root)!, "JSON do estado da partida").props.onChange({ target: { value: text } }));
  }

  it("diz o que cada caminho faz e quantas cartas próprias a pessoa tem hoje", () => {
    const text = textOf(dialog(mountImport())!);

    expect(text).toContain("Substituir tudo");
    expect(text).toContain("jogadores, placar");
    expect(text).toContain("7 cartas próprias");
    expect(text).toContain("Só somar cartas");
    expect(text).toContain("não apaga nada");
  });

  it("sem nada colado, nenhum dos dois caminhos fica disponível", () => {
    const root = mountImport();

    expect(button(root, "Substituir tudo").props.disabled).toBe(true);
    expect(button(root, "Só somar cartas").props.disabled).toBe(true);
  });

  it("Substituir tudo troca a partida inteira e não soma", () => {
    const onImport = vi.fn(() => null);
    const onMergeCards = vi.fn();
    const root = mountImport({ onImport, onMergeCards });

    paste(root, FILE);
    click(button(root, "Substituir tudo"));

    expect(onImport).toHaveBeenCalledWith(FILE);
    expect(onMergeCards).not.toHaveBeenCalled();
    expect(notify).toHaveBeenCalledWith("Estado importado com sucesso.", "success");
  });

  it("Só somar cartas não troca a partida e conta o que entrou", () => {
    const onImport = vi.fn();
    const onMergeCards = vi.fn(() => ({ ok: true as const, added: 2, skipped: 1 }));
    const root = mountImport({ onImport, onMergeCards });

    paste(root, FILE);
    click(button(root, "Só somar cartas"));

    expect(onMergeCards).toHaveBeenCalledWith(FILE);
    expect(onImport).not.toHaveBeenCalled();
    expect(notify).toHaveBeenCalledWith(
      "2 cartas somadas ao seu baralho; 1 já estava nele.",
      "success"
    );
  });

  it("arquivo inválido avisa o motivo e mantém o que foi colado", () => {
    const onMergeCards = vi.fn(() => ({ ok: false as const, error: "JSON inválido — confira." }));
    const root = mountImport({ onMergeCards });

    paste(root, "{ quebrado");
    click(button(root, "Só somar cartas"));

    expect(notify).toHaveBeenCalledWith("JSON inválido — confira.", "error");
    expect(field(dialog(root)!, "JSON do estado da partida").props.value).toBe("{ quebrado");
  });

  it("escolher um arquivo coloca o conteúdo dele no campo e deixa escolher o mesmo de novo", async () => {
    const root = mountImport();
    const picker = dialog(root)!.find((n) => n.type === "input" && n.props.type === "file");
    const target = { files: [{ text: async () => FILE }], value: "C:\\fakepath\\backup.json" };

    await act(async () => picker.props.onChange({ target }));

    expect(field(dialog(root)!, "JSON do estado da partida").props.value).toBe(FILE);
    expect(target.value).toBe("");
  });

  it("um arquivo que não abre vira aviso, não erro na tela", async () => {
    const root = mountImport();
    const picker = dialog(root)!.find((n) => n.type === "input" && n.props.type === "file");
    const failing = {
      text: async () => {
        throw new Error("sem permissão");
      },
    };

    await act(async () => picker.props.onChange({ target: { files: [failing], value: "x" } }));

    expect(notify).toHaveBeenCalledWith(expect.stringContaining("Não consegui ler"), "error");
    expect(button(root, "Substituir tudo")).toBeDefined();
  });
});
