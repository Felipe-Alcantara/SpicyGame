/**
 * Ajudas para testar componentes com o react-test-renderer, sem navegador:
 * montar, achar botões e campos e clicar. O estado do renderizador é do módulo,
 * então cada arquivo de teste chama `unmount` no `afterEach`.
 */

import { act, create, type ReactTestInstance, type ReactTestRenderer } from "react-test-renderer";
import { vi } from "vitest";

let renderer: ReactTestRenderer | undefined;

/** O Modal ouve o Esc e trava a rolagem do fundo; sem navegador, um `document` mínimo basta. */
export function stubDocument(): void {
  vi.stubGlobal("document", {
    addEventListener() {},
    removeEventListener() {},
    body: { style: {} },
  });
}

export function mount(element: Parameters<typeof create>[0]): ReactTestInstance {
  act(() => {
    renderer = create(element);
  });
  return renderer!.root;
}

export function unmount(): void {
  act(() => renderer?.unmount());
  renderer = undefined;
}

export function click(node: ReactTestInstance): void {
  act(() => node.props.onClick());
}

export function textOf(node: ReactTestInstance | string): string {
  return typeof node === "string" ? node : node.children.map(textOf).join("");
}

/** O botão pelo rótulo acessível ou, na falta dele, pelo texto inteiro. */
export function button(root: ReactTestInstance, name: string): ReactTestInstance {
  const found = root.findAll(
    (n) => n.type === "button" && (n.props["aria-label"] ?? textOf(n)).trim() === name
  );
  if (found.length !== 1) throw new Error(`Esperava 1 botão "${name}", achei ${found.length}`);
  return found[0]!;
}

/** O diálogo aberto, se houver (um `Modal` fechado não renderiza nada). */
export function dialog(root: ReactTestInstance): ReactTestInstance | undefined {
  return root.findAll((n) => n.type === "div" && n.props.role === "dialog")[0];
}

export function field(root: ReactTestInstance, label: string): ReactTestInstance {
  return root.findByProps({ "aria-label": label });
}
