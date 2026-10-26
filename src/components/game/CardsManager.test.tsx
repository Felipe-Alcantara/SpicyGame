import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactTestInstance } from "react-test-renderer";

import type { CardItem } from "../../data/taxonomy";
import { button, click, dialog, mount, stubDocument, textOf, unmount } from "../../test-render";
import { CardsManager } from "./CardsManager";

function makeCard(id: string, text: string): CardItem {
  return { id, mode: "truth", text, level: "cute", cats: ["cute"] };
}

/** As lixeiras da lista, uma por carta própria (só elementos de botão, sem o componente que os envolve). */
const trashButtons = (root: ReactTestInstance) =>
  root.findAll((n) => n.type === "button" && n.props["aria-label"] === "Excluir carta");

beforeEach(stubDocument);

afterEach(() => {
  unmount();
  vi.unstubAllGlobals();
});

describe("Biblioteca — excluir carta própria", () => {
  const mine = makeCard("custom-1", "Qual foi a nossa melhor noite?");
  const other = makeCard("custom-2", "Outra carta minha");

  function mountLibrary(onDelete: (id: string) => void) {
    return mount(
      createElement(CardsManager, {
        allCards: [mine, other],
        customCards: [mine, other],
        hiddenIds: [],
        onToggleHidden() {},
        onDuplicate() {},
        onEdit() {},
        onDelete,
      })
    );
  }

  it("um toque na lixeira só pergunta: a carta segue no baralho e a pergunta mostra qual é", () => {
    const onDelete = vi.fn();
    const root = mountLibrary(onDelete);

    click(trashButtons(root)[0]!);

    expect(onDelete).not.toHaveBeenCalled();
    const open = dialog(root);
    expect(open).toBeDefined();
    expect(textOf(open!)).toContain("Excluir esta carta?");
    expect(textOf(open!)).toContain(mine.text);
  });

  it("cancelar não apaga nada", () => {
    const onDelete = vi.fn();
    const root = mountLibrary(onDelete);

    click(trashButtons(root)[0]!);
    click(button(root, "Cancelar"));

    expect(onDelete).not.toHaveBeenCalled();
  });

  it("confirmar apaga só a carta em que se tocou", () => {
    const onDelete = vi.fn();
    const root = mountLibrary(onDelete);

    click(trashButtons(root)[1]!);
    click(button(root, "Excluir"));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(other.id);
  });
});
