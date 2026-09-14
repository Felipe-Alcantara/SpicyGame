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
- **Exportar e importar** a partida completa em JSON versionado: jogadores, modo,
  nível, categorias, cartas próprias, cartas ocultas e placar.
- **Funciona no celular**: carta arrastável, painel de ajustes em gaveta e
  atalhos de teclado (`←` `→` e espaço) no computador.

Tudo o que você configura fica salvo no `localStorage` do próprio navegador.

### Formato de exportação e importação

O arquivo atual usa `version: 1` e contém todos os campos configuráveis da
partida:

```json
{
  "version": 1,
  "players": ["Ela", "Ele"],
  "currentMode": "truth",
  "levelIndex": 1,
  "cats": {
    "cute": true,
    "funny": true,
    "spicy": true,
    "deep": true,
    "romantic": true,
    "relationship": true,
    "life": true,
    "confession": true,
    "drink": true,
    "twitter": true,
    "roleplay": true,
    "esex": true,
    "kink": true,
    "bdsm": true,
    "sexual": true
  },
  "customCards": [],
  "hiddenIds": [],
  "scores": {}
}
```

O baralho e o cursor não são exportados: eles são derivados novamente a partir
dos filtros e das cartas ao importar. O importador valida o documento inteiro
antes de alterar a partida, normaliza espaços e duplicatas e rejeita JSON,
versões, jogadores, filtros, cartas ou placares incompatíveis. IDs repetidos de
cartas próprias são rejeitados para evitar duas cartas com a mesma identidade.

Exportações antigas sem `version` continuam aceitas quando contêm os quatro
campos originais (`players`, `customCards`, `hiddenIds` e `scores`). Como esses
arquivos não conhecem modo, nível ou categorias, os filtros atuais são mantidos.

## Como rodar

Requisito: Node.js 24.x (LTS) e npm 11.x. As versões suportadas estão
declaradas em `package.json`.

```bash
npm ci           # instala exatamente o lockfile
npm run dev     # sobe em http://localhost:5173/
```

Outros comandos:

```bash
npm run build      # verifica os tipos e gera o build em docs/
npm run lint       # checa regras mínimas de JavaScript/TypeScript
npm run preview    # serve o build local
npm run typecheck  # só a checagem de tipos
npm test           # suíte completa de testes (vitest)
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
