# 🤖 IA.md — Contexto operacional do SpicyGame

> Memória técnica do projeto, no formato do `TEMPLATE-CONTEXTO-IA.md` do
> [Felixo System Design](https://github.com/Felipe-Alcantara/Felixo-System-Design).
> Regra de preservação: registros antigos não são apagados nem reescritos —
> mudanças entram como uma nova entrada datada.

---

## 📊 ESTADO ATUAL (RESUMO VIVO)

Última atualização: [2026-07-31]

- **Fase**: v0.2.1 — easter egg devolvido ao propósito original; refatoração v0.2.0 concluída — app modularizado, baralho expandido para
  340 cartas, interface redesenhada. Build, typecheck e testes passando.
- **Em andamento**: nada obrigatório. Pendente de conteúdo: a mensagem do easter egg em `src/data/segredo.ts` ainda está com o texto de exemplo — só o Felipe pode escrevê-la.
- **Próximo passo sugerido**: jogar uma partida de verdade e ajustar o balanço
  do baralho (quais níveis pesam mais na prática).
- **Risco aberto**: nenhum conhecido.

---

## 🎯 OBJETIVO DO PROJETO

[2026-07-31] Jogo de cartas para casal (estilo jogo de bebida) rodando 100% no
navegador, sem servidor, sem anúncios e sem conta. Quatro modos — Eu Nunca,
Quem é Mais Provável, Verdade e Desafio — com filtro de intensidade e de
categoria. Público: uso pessoal do casal. Prioridade: clima e simplicidade
acima de qualquer sofisticação técnica.

---

## 🏁 METAS & MILESTONES

- [2026-07-31] ✅ Remover `node_modules` do versionamento e limpar o histórico do git.
- [2026-07-31] ✅ Refatorar o monolito em componentes, hooks e dados separados.
- [2026-07-31] ✅ Expandir o baralho de 126 → 340 cartas, com linguagem jovem/direta.
- [2026-07-31] ✅ Redesenhar a interface (fundo animado, carta arrastável, placar, gaveta mobile).
- [2026-07-31] ✅ Corrigir o caminho de deploy e republicar o site.

---

## 🛠️ STACK & DEPENDÊNCIAS

[2026-07-31] Front-end: React 18 + TypeScript 5 + Vite 5 + Tailwind CSS 3.
[2026-07-31] Animações: framer-motion 11. Ícones: lucide-react.
[2026-07-31] Testes: vitest 4 (`npm test`). Adicionado nesta refatoração — antes
não havia teste nenhum.
[2026-07-31] Deploy: GitHub Pages servindo `main:/docs`. A dependência
`gh-pages` foi removida — ver Resumos de Decisão.
[2026-07-31] `tsconfig.json` passou para `strict: true` + `noUnusedLocals` +
`noUnusedParameters`; o código novo já nasceu compatível e `npm run typecheck`
passa limpo. `npm run build` roda o typecheck antes do bundle.

---

## 📐 DECISÕES DE ARQUITETURA

[2026-07-31] O componente único `CoupleNightGame.tsx` (770 linhas, com dados,
estado, lógica e UI misturados) foi quebrado em:

```
src/
  data/taxonomy.ts        tipos, ordens canônicas e rótulos (fonte única)
  data/cards/*.ts         um arquivo de baralho por modo + index agregador
  lib/                    random, placeholders, storage, cn
  hooks/                  useGameSession (estado da partida), useTimer
  components/ui/          Button, Card, Field, Badge, Modal, Toast
  components/game/        SpicyGame, CardStage, ModeTabs, painéis
  components/layout/      AppHeader, BackgroundFX
```

[2026-07-31] Todo o estado da partida vive em `useGameSession`. Nenhum componente
visual toca em `localStorage` nem embaralha carta por conta própria — a UI só
consome o que o hook devolve. Motivo: era impossível testar ou mudar qualquer
regra sem reler o componente inteiro.

[2026-07-31] Baralho dividido por modo (`never/most/truth/dare`) em vez de um
`cards.ts` único: o conteúdo cresce muito mais que o código, e um arquivo por
modo mantém cada um revisável.

[2026-07-31] Chave de storage versionada (`spicy-game-state-v2`), com leitura de
fallback da chave antiga (`couple-night-state-v1`) para não perder as cartas
customizadas de quem já jogava.

---

## 🎨 DECISÕES DE DESIGN & CONVENÇÕES

[2026-07-31] Código em inglês para nomes técnicos; comentários, textos de UI e
commits em português. Commits em Conventional Commits.

[2026-07-31] Identidade visual própria (não a paleta roxa do FelixoVerse):
fundo `radial-gradient` rosa-escuro/preto, acento `rose/red`, cards de vidro
(`bg-white/[0.04]` + `backdrop-blur`) e cantos `rounded-3xl`. Cada nível tem
tema próprio (`LEVEL_THEME` em `taxonomy.ts`) que pinta o brilho da carta —
quanto mais pesado o nível, mais quente e forte o glow.

[2026-07-31] Estrutura universal do design system mantida: compound components
(`Card` + `CardHeader/Content/Footer`), variantes por prop no `Button`,
`components/ui` vs `components/game` vs `components/layout`, container com
`max-w-6xl` e grid 1 coluna → 2 colunas em `lg`.

[2026-07-31] Acessibilidade: `role="tablist"/"tab"` nas abas, `role="switch"`
com `aria-checked` no interruptor, `aria-label` em todo botão só-ícone, foco
visível (`focus-visible:ring`) em tudo que é clicável, modal com `aria-modal`,
fechamento por Esc e trava de scroll, e `prefers-reduced-motion` desligando o
fundo animado.

[2026-07-31] Todos os `alert()` foram substituídos por um sistema de toasts
(`components/ui/Toast.tsx`) e por modais de confirmação. `alert()` bloqueia a
página e destrói o clima de um jogo de casal.

---

## 🧪 TESTES IMPORTANTES

[2026-07-31] ✅ `src/data/cards/cards.test.ts` (8 testes, todos passando):

- ids únicos em todo o baralho base;
- cada carta está no arquivo do próprio modo;
- níveis e categorias sempre existem na taxonomia;
- pelo menos 5 cartas em cada combinação modo × nível (a partida não seca);
- texto não vazio e curinga bem formado;
- `{p}` e `{p2}` sorteiam pessoas diferentes, aguentam um jogador só e não
  quebram com a lista vazia.

---

## 🐛 BUGS & FIXES RELEVANTES

[2026-07-31] BUG: `node_modules` inteiro (8.519 arquivos) foi commitado.
CAUSA: `.gitignore` tinha só uma linha de cache do `gh-pages`, sem `node_modules/`.
FIX: `.gitignore` completo + `git rm -r --cached node_modules dist` (commit
`5b2bf2f`) e, em seguida, `git filter-repo --invert-paths` para tirar os blobs
de todo o histórico + `push --force`. O `.git` caiu de 23 MB para 568 KB.

[2026-07-31] BUG: `{p}` e `{p2}` podiam sortear a mesma pessoa, gerando frases
como "Ela beija Ela".
CAUSA: os dois curingas eram sorteados de forma independente sobre a mesma lista.
FIX: `lib/placeholders.ts` sorteia o segundo nome excluindo o primeiro; coberto
por teste.

[2026-07-31] BUG: a persistência gravava por cima do estado salvo antes de
terminar de lê-lo, e o `useEffect` de salvar não observava `hiddenIds`.
FIX: flag `hydrated` no `useGameSession` — só grava depois de hidratar — e a
lista de dependências passou a incluir tudo que é persistido.

[2026-07-31] BUG: o texto da carta era recalculado a cada render, então os nomes
sorteados trocavam sozinhos enquanto a carta estava na tela.
FIX: `useMemo` por `card.id` + posição no `CardStage`.

[2026-07-31] BUG: `npm run build` quebrava com `MODULE_NOT_FOUND` no
`rollup/dist/native.js`.
CAUSA: dependência opcional de plataforma do rollup faltando no `node_modules`
antigo (bug conhecido do npm com optional deps).
FIX: `rm -rf node_modules package-lock.json && npm install`.

---

## 🔗 INTEGRAÇÕES & SERVIÇOS EXTERNOS

[2026-07-31] GitHub Pages configurado (via `gh api repos/.../pages`) como
`source: { branch: "main", path: "/docs" }`. `npm run build` escreve direto em
`docs/`; commitar e dar push publica. Nenhuma API, nenhum backend, nenhum dado
sai do navegador.

---

## 📝 NOTAS GERAIS

[2026-07-31] O repositório versiona `docs/` porque é a pasta que o GitHub Pages
serve. `dist/` foi para o `.gitignore` e deixou de ser gerado (o Vite agora
escreve em `docs/`).

[2026-07-31] Easter egg da chama no cabeçalho: senha `novidade`, dica
"O que nos define?". Antes ele só exibia um `alert('Conteúdo desbloqueado!')` e
não fazia absolutamente nada. Agora ele libera o nível **Nuclear** no filtro de
intensidade (75 cartas), guardado em `localStorage` (`spicy-game-nuclear-unlocked`).
É brincadeira do casal, não segurança — a senha está no código-fonte.

[2026-07-31] Baralho: 340 cartas base (era 126). Por modo — Eu Nunca 105,
Mais Provável 80, Verdade 80, Desafio 75. Por nível, cada modo tem no mínimo
9 cartas nucleares e ~20 em cada um dos outros níveis. Os textos originais
foram todos preservados; o conteúdo novo usa linguagem jovem e direta, a pedido.

---

## 🧠 RESUMOS DE DECISÃO

[2026-07-31] CONTEXTO: `node_modules` estava no histórico do git; remover só do
estado atual deixaria os blobs pesando em todo clone.
ALTERNATIVAS: (a) só `git rm --cached` e conviver com o histórico sujo;
(b) `git filter-repo` reescrevendo o histórico e `push --force`.
DECISÃO: (b), autorizada explicitamente pelo dono do repositório. É repositório
pessoal, sem colaboradores, então reescrever hashes não quebra ninguém.
VALIDAÇÃO: `.git` de 23 MB → 568 KB; `git log` preservou os 16 commits com as
mensagens originais; push forçado aceito pelo remoto.

[2026-07-31] CONTEXTO: o pedido "melhorias diversas" era aberto; o Notion não
listava quais.
ALTERNATIVAS: adivinhar e entregar algo grande, ou perguntar antes.
DECISÃO: perguntar. O dono escolheu: mais cartas e categorias, refatoração de
arquitetura, melhorias visuais/UX e "deixe a quantidade de cards mais robusta
(pode usar linguagem jovem/chula)".
VALIDAÇÃO: as quatro frentes foram entregues neste ciclo; ver Metas.

[2026-07-31] CONTEXTO: validar a interface nova sem poder abrir navegador
gráfico.
ALTERNATIVAS: confiar no build, ou dirigir um Chromium headless.
DECISÃO: Playwright (instalação Python do usuário, apontando `executable_path`
para `chromium_headless_shell-1228`, porque a versão esperada pelo pacote
diverge da baixada).
VALIDAÇÃO: capturas em desktop (1280×900) e mobile (390×844), incluindo a
gaveta de ajustes, com `console errors == []`. Dois ajustes vieram daí:
legendas do slider desalinhadas com o Nuclear trancado e o subtítulo do
cabeçalho quebrando linha no celular.

[2026-07-31] CONTEXTO: o script `deploy` rodava `gh-pages -d dist`, mas a API do
GitHub mostrou que o Pages deste repositório serve `main:/docs` — ou seja, o
deploy publicava numa branch `gh-pages` que nem existe no remoto, e o site no ar
vinha de um `docs/` atualizado à mão.
ALTERNATIVAS: (a) reconfigurar o Pages para a branch `gh-pages`; (b) fazer o
build sair em `docs/` e apagar o `gh-pages`.
DECISÃO: (b). Uma pasta só, sem branch órfã e sem dependência extra —
`build.outDir: "docs"` no `vite.config.ts` e a dependência `gh-pages` removida.
VALIDAÇÃO: `npm run build` gerou `docs/index.html` + `docs/assets/*` com os
hashes novos; a configuração do Pages não precisou ser tocada.

[2026-07-31] CONTEXTO: o dev server subiu em `localhost:5174` porque a 5173
estava ocupada por outro app do canvas Felixo.
DECISÃO: não matar o processo da 5173 — ambiente multi-agente, a porta era de
outro agente. Apontei o Playwright para a 5174.
VALIDAÇÃO: a primeira captura veio da aplicação errada e foi descartada; a
segunda, na 5174, mostrou o SpicyGame.

---

> **Assinatura de Origem**
> Formato do arquivo: **Felixo System Design** — https://github.com/Felipe-Alcantara/Felixo-System-Design

---

## [2026-08-17] O segredo da pimenta voltou a ser um recado, não um desbloqueio

**O que estava errado.** O modal atrás da pimenta do cabeçalho pedia uma senha
e, ao acertar, **liberava o nível Nuclear**. Isso nunca foi a intenção: o
segredo sempre foi uma **mensagem para a namorada** — a funcionalidade estava
inacabada de propósito, esperando o texto ser escrito.

**Como o erro entrou.** Na refatoração v0.2.0, um agente encontrou o gancho —
que acertava a senha e só mostrava um alerta — e leu **vazio como quebrado**.
Preencheu com a primeira função plausível que tinha à mão: desbloquear o nível
mais quente. O próprio comentário que ele deixou no `SecretModal.tsx` registrava
o raciocínio: *"antes ele só mostrava um alerta e não fazia nada"*.

> **A lição, que vale além deste projeto:** código incompleto e código quebrado
> se parecem, e a diferença mora na **intenção**, que não está no arquivo. Um
> gancho sem conteúdo não é convite para inventar conteúdo. Quando um agente
> encontrar algo assim, o certo é **perguntar ou registrar**, não preencher.
> Este `IA.md` existe justamente para que a intenção deixe de ser invisível.

### O que mudou

- **`src/data/segredo.ts` (novo)** — o conteúdo do easter egg saiu do código:
  senha, dica, título, mensagem e assinatura. Mexer no recado não deveria exigir
  abrir um componente React. Traz também `senhaCorreta`, `temMensagem` e
  `paragrafos` como funções puras.
- **`SecretModal.tsx`** — deixou de conhecer o Nuclear. Pede a senha e, do outro
  lado, mostra a mensagem com animação. **Fechar e reabrir pede a senha de
  novo**: um segredo que fica destrancado depois da primeira vez deixa de ser
  segredo para quem pegar o aparelho.
- **`SpicyGame.tsx`** — o gate do Nuclear saiu inteiro. A chave
  `spicy-game-nuclear-unlocked` sobrevive apenas para ser **apagada** de quem já
  jogou; deixar lixo no `localStorage` de terceiro é sujeira que ninguém mais
  removeria.
- **`FiltersPanel.tsx`** — o slider vai até o Nuclear como qualquer outro nível,
  e o aviso "🔒 trancado" saiu.

### Decisões

- **O Nuclear não é mais gated.** A alternativa seria uma confirmação explícita
  no filtro, mas ele já é uma escolha consciente: o slider mostra o nome do
  nível e o texto diz que entram todas as cartas até ali.
- **Sem mensagem escrita, a tela diz isso** em vez de abrir um espaço em branco
  — que pareceria defeito e ainda estragaria a surpresa. `temMensagem()` também
  recusa o texto de exemplo que acompanha o arquivo, senão o easter egg
  "funcionaria" exibindo a instrução de preenchimento para quem deveria receber
  o recado.
- **Guarda de entrega**: há um teste afirmando que a mensagem ainda é a de
  exemplo. Quando o texto real entrar, ele falha de propósito — é o lembrete de
  apagá-lo e a prova de que o conteúdo chegou.

### Validação

`npm run typecheck` limpo, **21 testes** verdes (13 novos em `segredo.test.ts`)
e `npm run build` gerando `docs/`. **Não testado no navegador** nesta sessão.
