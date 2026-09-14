# 🤖 IA.md — Contexto operacional do SpicyGame

> Memória técnica do projeto, no formato do `TEMPLATE-CONTEXTO-IA.md` do
> [Felixo System Design](https://github.com/Felipe-Alcantara/Felixo-System-Design).
> Regra de preservação: registros antigos não são apagados nem reescritos —
> mudanças entram como uma nova entrada datada.

---

## 📊 ESTADO ATUAL (RESUMO VIVO)

Última atualização: [2026-09-14]

- **Fase**: v0.2.1 — easter egg devolvido ao propósito original; refatoração v0.2.0 concluída — app modularizado, baralho expandido para
  340 cartas, interface redesenhada. A auditoria geral desta rodada foi concluída sobre o `origin/main` em `8fedca2`.
- **Estado final desta rodada**: auditoria técnica registrada; o jogo continua sendo
  uma aplicação web local, sem conta, servidor ou sincronização entre aparelhos.
- **Próximo passo sugerido**: jogar partidas reais para medir o balanço e
  concluir a revisão editorial antes de ampliar o escopo.
- **Risco aberto**: há ao menos uma carta truncada (`n4`) e o conteúdo ainda
  precisa de revisão editorial. Exportação/importação, cobertura do hook,
  instalação, lint, CI e o filtro estrito de categorias foram corrigidos nos
  follow-ups de 2026-09-14.

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

[2026-08-17] ✅ O fluxo do easter egg foi corrigido: `SecretModal` agora valida a senha, mostra título, parágrafos e assinatura definidos em `src/data/segredo.ts`, e apresenta estado explícito enquanto o recado ainda não foi preenchido. O nível Nuclear voltou a ser independente do segredo. Validação: 21 testes, `npm run typecheck` e `npm run build` concluídos com sucesso.

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

## [2026-09-14] Auditoria geral antes de avançar o desenvolvimento

### Escopo e base de evidência

Esta auditoria atende à task de revisar o jogo antes de avançar o
desenvolvimento e avaliar uma possível transformação em app. A base de código
auditada foi o `origin/main` em `8fedca2`, que contém a refatoração modular e o
build publicado. O checkout local estava em uma revisão divergente e antiga;
por isso ele não foi usado como fonte de verdade.

Foram revisados o código de jogo, os 340 cards, a persistência, a exportação e
importação, os testes, o build, a configuração do GitHub Pages, o bundle
publicado e o histórico recente do repositório. A revisão de conteúdo foi
estática: não substitui uma leitura editorial humana nem uma validação em
aparelho físico.

### Parecer executivo

O produto está tecnicamente jogável e a refatoração não mostra uma regressão
estrutural que impeça o uso. O estado atual é adequado para uso pessoal no
navegador, mas ainda não está pronto para ser tratado como produto público ou
distribuído amplamente: há três riscos P1 de comportamento/conteúdo e pouca
proteção automatizada para o hook que concentra o estado da partida.

Recomendação registrada, ainda sujeita à confirmação do dono: manter o escopo
web/local por enquanto; corrigir os P1; fazer uma rodada real de partidas e
revisão editorial; e, caso surja demanda por “app”, avaliar PWA primeiro. Não
há justificativa técnica atual para começar por um app nativo. A decisão sobre
publicar ou restringir o conteúdo adulto continua sendo do dono.

### Achados priorizados

#### P1 — exportação/importação não preserva o estado anunciado

`useGameSession.ts` exporta apenas `players`, `customCards`, `hiddenIds` e
`scores`. Ficam de fora `currentMode`, `levelIndex` e `cats`, embora o README
prometa exportar/importar “tudo”. A importação também aceita arrays e objetos
sem validar o formato dos cards, jogadores ou placar; um JSON estruturalmente
válido, porém inválido para o jogo, pode entrar no estado em memória.

Evidência: `src/hooks/useGameSession.ts`, bloco de exportação/importação; o
contrato persistido completo está em `src/lib/storage.ts`.

#### P1 — filtro de categorias pode ignorar a escolha do usuário

Quando nenhuma carta atende simultaneamente ao modo, nível, visibilidade e
categorias escolhidas, o pool cai silenciosamente para `byLevel` e depois para
`byMode`. Assim, uma pessoa pode desmarcar assuntos e ainda receber cartas de
categorias não selecionadas. É preciso decidir entre mostrar pool vazio com
orientação, impedir a combinação impossível ou explicitar um fallback; o
comportamento silencioso atual não é seguro para um filtro.

Evidência: `src/hooks/useGameSession.ts:72-79`.

#### P1 — conteúdo precisa de revisão antes de distribuição ampla

Não há IDs duplicados nem textos exatamente repetidos, mas a inspeção encontrou
`n4` com texto truncado e um conjunto de desafios (`d55`, `d57`, `d68`, `d70`,
entre outros) cuja redação merece revisão explícita de consentimento, limites e
possibilidade de recusar. Também há cartas sobre nudez, vídeo íntimo, lugares
públicos e papéis de poder. O aviso do README ajuda no uso pessoal, mas não
substitui uma política editorial para um site/bundle público.

Evidência: `src/data/cards/never.ts` (`n4`) e `src/data/cards/dare.ts`; a
checagem foi estática e não é um veredito jurídico ou de segurança.

#### P2 — o núcleo da partida não tem testes dedicados

Os 21 testes passam, distribuídos em `src/data/cards/cards.test.ts` e
`src/data/segredo.test.ts`. Não existe teste para `useGameSession`, incluindo
pool, avanço sem repetição, fallback de categorias, persistência, reset,
exportação ou importação. Isso deixa os três achados acima sem uma barreira de
regressão.

#### P2 — instalação e qualidade de integração

`npm run typecheck`, `npm test` e `npm run build` passaram. `npm ci` falhou no
ambiente usado (Node 25.3.0/npm 11.6.2) porque o lockfile não contém vários
pacotes opcionais do esbuild esperados pelo npm; foi necessário usar
`npm install --no-audit` para concluir a validação. O repositório também não
tem script/dependência de lint nem workflow de CI próprio. A publicação Pages
gerenciada pelo GitHub teve execução verde, mas isso não substitui testes e
lint do projeto.

A varredura de dependências após a instalação registrou 0 vulnerabilidades de
produção e 5 no conjunto completo (3 moderadas e 2 altas). Esse resultado deve
ser repetido com o lockfile corrigido antes de usar o número como baseline.

#### P2 — outros comportamentos a proteger

- O `poolKey` usa somente IDs. Editar o texto de uma carta customizada sem
  alterar sua presença no pool pode deixar a carta antiga no deck até uma nova
  mudança de pool ou embaralhamento explícito.
- A carga do `localStorage` faz apenas uma checagem superficial de objeto; a
  versão da chave existe, mas não há validação/migração de schema completa.
- A cópia para a área de transferência tem toast de fallback, mas não oferece
  uma área de texto ou download quando `navigator.clipboard` falha.
- A validação anterior em Chromium headless cobriu desktop e viewport mobile;
  esta rodada não teve aparelho físico disponível.

### Balanço e qualidade do baralho

O baralho tem 340 cartas: Eu Nunca 105, Quem é Mais Provável 80, Verdade 80 e
Desafio 75. Por nível: Fofo 100, Picante 93, Hot 102 e Nuclear 45. A divisão
por modo e nível é:

| modo | Fofo | Picante | Hot | Nuclear |
| --- | ---: | ---: | ---: | ---: |
| Eu Nunca | 30 | 29 | 31 | 15 |
| Quem é Mais Provável | 26 | 21 | 23 | 10 |
| Verdade | 22 | 22 | 25 | 11 |
| Desafio | 22 | 21 | 23 | 9 |

Não há repetição exata de ID ou texto. A cobertura de categorias é desigual:
`funny` aparece em 104 cards, `sexual` em 90, `spicy` em 79, enquanto
`roleplay` aparece em 10 e `life`, `twitter` e `drink` em 16–17 cada. Isso
parece parcialmente intencional pela intensidade, mas precisa ser avaliado em
partidas reais, porque o fallback de categorias distorce qualquer conclusão.
Há 85 usos de `{p}` e nenhum uso de `{p2}` no baralho base; o suporte técnico ao
segundo participante existe, mas ainda não é exercitado pelos cards atuais.

### Publicação, privacidade e possibilidade de app

O repositório e o GitHub Pages são públicos. A aplicação não contém chamadas de
rede no código de `src/` e salva nomes, cartas próprias, cartas ocultas,
preferências e placar somente no `localStorage` do navegador; não há conta,
servidor ou sincronização. Isso é uma boa fronteira de privacidade para uso
pessoal, mas não impede que o conteúdo adulto fique visível no código-fonte e
no bundle público. A senha do easter egg não é uma proteção de conteúdo.

O Pages serve `main:/docs`, está com status `built`, e o bundle publicado
respondeu com status 200 contendo o build atual. Não foram encontrados
manifesto PWA, service worker, ícones de instalação ou infraestrutura de
backend. Portanto, PWA é uma possibilidade futura, não uma capacidade já
entregue; “virar app” não deve ser apresentado como concluído.

### Decisão registrada e perguntas para o dono

Registro provisório: continuar como web/local e não iniciar app nativo nesta
rodada; avaliar PWA primeiro somente depois dos P1 e de uma rodada de uso real.
Foram abertas tarefas de follow-up para os bugs, testes, conteúdo, validação
mobile, instalação/CI e decisão de produto. A conclusão desta task fica
delegada para confirmação das decisões abaixo:

1. O uso pessoal no navegador continua sendo o objetivo principal até existir
   demanda concreta por instalação ou compartilhamento?
2. Se houver demanda, PWA deve ser o primeiro caminho, deixando app nativo para
   uma necessidade que a web não cubra?
3. A política desejada continua sem conta, sem servidor e sem sincronização,
   aceitando exportar/importar como mecanismo de compartilhamento?
4. O repositório e o Pages devem continuar públicos com conteúdo adulto, ou o
   conteúdo precisa de restrição/revisão antes de qualquer divulgação?
5. Está autorizada uma rodada editorial completa para corrigir truncamentos e
   tornar consentimento, limites e recusa inequívocos?

### Validação reproduzível desta auditoria

- `npm run typecheck` — passou.
- `npm test` — passou: 2 arquivos, 21 testes.
- `npm run build` — passou; gerou `docs/` com os hashes publicados.
- `npm ci` — falhou por dessincronia do lockfile com pacotes opcionais do
  esbuild; `npm install --no-audit` permitiu a execução da suíte.
- `npm audit --omit=dev` — 0 vulnerabilidades de produção no snapshot avaliado.
- GitHub Pages — configuração `main:/docs`, último deploy observado verde e
  página/JS/CSS publicados respondendo 200.
- Navegador físico — não validado nesta rodada; a evidência headless anterior
  deve ser complementada por Android/iOS real.

## [2026-09-14] Instalação reproduzível e gate de qualidade

### O que mudou

- `package-lock.json` foi regenerado com npm 11 para incluir os pacotes
  opcionais de plataforma do esbuild que estavam ausentes e faziam `npm ci`
  falhar.
- `package.json` agora declara Node.js 24.x e npm 11.x como versões suportadas,
  e o README usa `npm ci` como caminho oficial de instalação.
- `eslint.config.js` adiciona um lint mínimo para JavaScript/TypeScript com
  regras recomendadas e globais de browser/Node, sem misturar lint com
  formatação.
- `.github/workflows/quality.yml` executa em push para `main` e pull request:
  `npm ci`, lint, typecheck, testes e build, sem fallback para `npm install`.

### Validação

No checkout limpo baseado nesta revisão, `npm ci --ignore-scripts --no-audit
--fund=false`, `npm run lint`, `npm run typecheck`, `npm test` (21 testes) e
`npm run build` passaram. A validação local usou Node 25.3.0/npm 11.6.2 e
emitiu o aviso esperado de engine porque Node 25 está fora da versão suportada;
o CI está fixado em Node 24.x LTS. A página oficial de releases do Node lista
Node 24 como LTS e Node 25 como EOL.

`npm audit --omit=dev` terminou sem vulnerabilidades de produção no lockfile
regenerado. Os avisos de depreciação do Vitest/Vite relacionados a opções do
esbuild não falharam os gates e permanecem separados desta correção.

### Decisão

O projeto passa a ter uma única instalação suportada e verificável: Node 24.x +
npm 11.x, com o workflow de qualidade como barreira mínima antes de aceitar
mudanças. A ausência de testes dedicados para `useGameSession` continua sendo
um follow-up separado da auditoria geral.

## [2026-09-14] Contrato completo de exportação e importação

### Decisão e formato

O export/import agora usa `version: 1` e transporta o estado configurável
completo: `players`, `currentMode`, `levelIndex`, `cats`, `customCards`,
`hiddenIds` e `scores`. `deck`, `cursor` e `currentCard` continuam fora do
arquivo porque são derivados novamente a partir do pool e dos filtros.

O importador faz parsing, validação e normalização antes de chamar qualquer
setter: exige enums válidos de modo/nível/categoria, índice de nível dentro da
taxonomia, todas as categorias booleanas, jogadores/IDs não vazios, cards com
shape válido e placares finitos não negativos. Espaços nas strings e duplicatas
de nomes, IDs ocultos e categorias dos cards são normalizados; IDs repetidos de
cards ou um erro estrutural rejeitam o documento inteiro sem alterar a partida.

Exportações antigas sem `version` continuam compatíveis quando contêm os
quatro campos originais. Nesse caso jogadores, cards, IDs ocultos e placar são
aplicados, enquanto modo, nível e categorias permanecem como estavam, pois
esses campos não existiam no formato antigo. Versões futuras desconhecidas são
recusadas explicitamente.

### Validação

A cobertura passou a incluir round-trip do formato atual, normalização,
compatibilidade legada, versão desconhecida, campos ausentes, cards
malformados, JSON inválido e garantia de que entradas rejeitadas não alteram o
estado. No checkout limpo, `npm ci`, `npm run lint`, `npm run typecheck`,
`npm test` (43 testes), `npm run build` e `npm audit --omit=dev` passaram.

## [2026-09-14] Filtro de categorias sem fallback silencioso

### Decisão

O pool agora é estrito: somente cartas que atendem simultaneamente a modo,
nível, visibilidade e categorias ativas entram no deck. Quando nenhuma carta
atende, o pool fica vazio; não existe fallback implícito para `byLevel` ou
`byMode`, evitando exibir assunto que o usuário desmarcou.

### Experiência e validação

O palco e o painel de filtros comunicam que não há cartas com a combinação
atual e o painel oferece `Reativar todas as categorias` quando há categorias
desligadas. Mudança de nível/categoria e cartas ocultas recalculam o pool
deterministicamente. A suíte cobre combinação sem cards, ocultação e mudanças
de nível/categoria.
