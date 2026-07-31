# Spicy Game 🔥

Jogo de cartas para casal — no estilo jogo de bebida — que roda inteiro no
navegador. Sem servidor, sem conta, sem anúncio e sem nada saindo do seu
aparelho.

## O que dá pra fazer

- **Quatro modos**: Eu Nunca, Quem é Mais Provável, Verdade e Desafio.
- **340 cartas** no baralho base, divididas em quatro níveis de intensidade
  (Fofo → Picante → Hot → Nuclear) e 15 categorias.
- **Filtros**: escolha até que nível quer ir e quais assuntos entram na roda.
- **Placar de goles** por jogador.
- **Cartas suas**: criar, editar, duplicar as do baralho base e ocultar as que
  não têm a ver com vocês.
- **Exportar e importar** tudo em JSON, para levar o baralho para outro aparelho.
- **Funciona no celular**: carta arrastável, painel de ajustes em gaveta e
  atalhos de teclado (`←` `→` e espaço) no computador.

Tudo o que você configura fica salvo no `localStorage` do próprio navegador.

## Como rodar

Requisito: Node.js 18+.

```bash
npm install     # instala as dependências
npm run dev     # sobe em http://localhost:5173/
```

Outros comandos:

```bash
npm run build      # verifica os tipos e gera o build em docs/
npm run preview    # serve o build local
npm run typecheck  # só a checagem de tipos
npm test           # testes do baralho (vitest)
```

### Publicar

O GitHub Pages deste repositório serve a pasta `docs/` da branch `main`. Ou
seja: `npm run build` já escreve no lugar certo — basta commitar `docs/` e dar
push que o site atualiza.

## Estrutura

```
src/
  data/taxonomy.ts     modos, níveis, categorias e seus rótulos
  data/cards/          um arquivo de baralho por modo (+ testes)
  lib/                 utilitários puros (sorteio, curingas, storage)
  hooks/               useGameSession (todo o estado da partida), useTimer
  components/ui/       Button, Card, Field, Badge, Modal, Toast
  components/game/     tela do jogo, carta, abas e painéis
  components/layout/   cabeçalho e fundo animado
```

A regra: toda a lógica de partida mora em `hooks/useGameSession.ts`. Componente
nenhum mexe em `localStorage` nem embaralha carta por conta própria.

## Escrevendo cartas

Cada carta é um objeto em `src/data/cards/<modo>.ts`:

```ts
{ id: "d42", mode: "dare", text: "Beije {p} onde você mais tem vontade.",
  level: "spicy", cats: ["spicy", "romantic"] }
```

- `{p}` e `{p2}` viram nomes de jogadores sorteados — e nunca a mesma pessoa,
  quando há gente suficiente na mesa.
- `id` precisa ser único no baralho inteiro; o teste reclama se repetir.
- `level` e `cats` só aceitam valores declarados em `data/taxonomy.ts`.

Depois de mexer no baralho, rode `npm test`.

## Aviso

Conteúdo adulto, escrito para duas pessoas que já se conhecem e estão de acordo.
Regra da casa: qualquer um pode passar a vez a qualquer momento — vira o copo e
segue o jogo.

---

Projeto pessoal, mantido no padrão do
[Felixo System Design](https://github.com/Felipe-Alcantara/Felixo-System-Design).
O contexto técnico completo está no [`IA.md`](IA.md).
