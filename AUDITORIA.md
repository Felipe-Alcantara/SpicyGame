# Auditoria geral do SpicyGame — segunda passada (27/09/2026)

Parecer da auditoria pedida antes de avançar no desenvolvimento e de avaliar
virar app. A primeira passada (14/09/2026) está registrada no [`IA.md`](IA.md);
esta segunda repete o roteiro usado no jogo irmão Histórias Sinistras, que
achava problemas que uma leitura por amostra não achava: **ler o baralho
inteiro, medir as regras com o código real, quebrar as regras de propósito para
ver se os testes acusam e medir o build no navegador**.

Base auditada: `main` em `3dd3c4a`. Correções desta rodada: `90fe9f1`,
`34f41eb`, `71dbb6d` e `abde24e`.

---

## Resumo executivo

O jogo roda bem para o uso de vocês, e a refatoração não perdeu nenhum recurso
do monolito antigo. Mas **duas regras centrais não entregam o que prometem**, e
as duas já vinham do monolito:

1. **Desligar uma categoria quase nunca tira as cartas dela.** Com "Sexo"
   desligado, 88 das 90 cartas de Sexo continuam entrando; com BDSM, Kink ou
   Sexting desligados, 100% continuam. O filtro serve para marcar limites, e
   hoje não marca.
2. **Alternar Verdade e Desafio repete carta.** Em 70% das partidas simuladas
   com 10 rodadas de cada, alguma carta de Verdade voltou. Sem trocar de modo,
   nenhuma repetição.

Também havia um problema de publicação: **o site estava duas semanas atrás do
código**. As correções de 14/09 nunca chegaram ao ar porque `docs/` não foi
regerado, e o deploy continuava verde. Isso foi corrigido nesta rodada, e o CI
agora impede que se repita.

Na leitura integral das 340 cartas, **5 estavam objetivamente quebradas** e foram
corrigidas; o restante do que merece revisão é gosto, nível ou consentimento, e
ficou listado para vocês decidirem (seção 5).

### Decisões do dono nesta rodada

| Pergunta | Decisão |
| --- | --- |
| Virar app? | **Não agora.** Se surgir demanda por instalar ou jogar offline, o caminho é **PWA** (sem loja). App nativo fica fora: Apple e Google recusam conteúdo sexual explícito. |
| Publicação do conteúdo adulto | **Continua público, com um aviso 18+ na primeira visita**, lembrado no próprio navegador. Implementação aberta como task. |
| Site defasado | **Publicar o build atual já** — feito e conferido no ar. |
| Cartas com defeito | **Corrigir o que está quebrado e listar o resto** — feito. |
| Conta e servidor | Continua 100% local e sem conta, como já estava escrito na task: é uma qualidade do produto, e só muda com motivo real. |

---

## 1. Método — o que foi medido, e como

| Frente | Como | Resultado |
| --- | --- | --- |
| Baralho | leitura das 340 cartas, uma a uma, contra o modo, o nível e as categorias | 5 quebradas corrigidas, ~40 itens editoriais listados |
| Premissa repetida | similaridade TF-IDF entre todas as cartas + leitura | 4 grupos repetidos dentro do mesmo modo |
| Sorteio | 500 partidas simuladas com o hook real (`useGameSession`) | repetição em 69,8% das partidas ao alternar modos |
| Filtros | todas as categorias, uma desligada por vez, sobre o baralho real e o hook | o filtro não exclui cartas com mais de uma categoria |
| Testes | 15 mutações nas regras críticas, uma por vez, com a suíte inteira | 10 mortas na base; 12 depois desta rodada; 3 sobrevivem |
| Regressões | recurso a recurso contra o monolito `CoupleNightGame.tsx` (`9c40328`) | nenhuma regressão |
| Navegador | Chromium headless no build, desktop 1280×900 e celular 390×844 | sem erro de console; tela branca com storage malformado |
| Deploy | bundle no ar × `docs/` commitado × build de `src/` | site defasado desde 17/08 — corrigido |

---

## 2. Achados priorizados

Escala: **P1** regra central quebrada ou risco para quem joga · **P2** robustez e
experiência · **P3** polimento.

### P1 — O filtro de categorias não exclui o assunto desligado

`useGameSession.ts` inclui a carta quando **qualquer** categoria dela está
ligada (`c.cats.some((k) => cats[k])`). Como só 51 das 340 cartas têm uma
categoria só, desligar um assunto quase não muda o baralho:

| Categoria desligada (as outras ligadas) | Cartas dela que continuam entrando |
| --- | ---: |
| Sexo | 88 de 90 |
| Kink | 51 de 51 |
| BDSM | 31 de 31 |
| Sexting | 22 de 22 |
| Confissão, Romance, Relação, Vida, Bebida, Internet, Roleplay | 100% |
| Picante | 66 de 79 |
| Zoeira | 91 de 104 |

No hook real, Eu Nunca até Nuclear com "Sexo" desligado ainda monta um baralho
com 29 cartas de Sexo (ex.: `n71`, `n74`, `n75`). O registro de 14/09 dizia que o
filtro estrito evitava "exibir assunto que o usuário desmarcou"; isso vale para
o caso de desligar **tudo**, não para o uso real, que é desligar um limite.
Hoje, o que realmente restringe conteúdo é o nível e ocultar carta por carta
na Biblioteca.

O painel também não explica a regra ("Categorias", só) e mostra ao usuário o
jargão "O filtro não usa fallback.".

**Encaminhamento:** task nova (Alta). Recomendação: tratar pelo menos Sexo,
Kink, BDSM e Sexting como limites — desligado, sai toda carta que tiver o
assunto — e explicar a regra no painel.

### P1 — Alternar modos desfaz o sorteio sem repetição

Trocar de modo muda o pool, e o efeito do hook reembaralha e volta o cursor
para zero. Quem joga "Verdade ou Desafio" alternando a cada rodada recebe, a
cada troca, uma carta sorteada **com** reposição:

| Cenário (500 partidas, pool de Verdade = 44 cartas) | Partidas com carta repetida |
| --- | ---: |
| 10 cartas de Verdade, alternando com Desafio | **349 (69,8%)** — média de 1,01 repetida por partida |
| 10 cartas de Verdade seguidas, sem trocar de modo | 0 |

O valor bate com o paradoxo do aniversário (≈67% teórico). Na virada do
baralho, a última carta pode voltar logo em seguida: 41 de 300 viradas num pool
de 8 cartas (13,7%; esperado 1/8). As duas coisas já existiam no monolito.

**Encaminhamento:** task nova (Alta): guardar baralho e cursor por modo e não
repetir a última carta na virada.

### P1 — Site publicado duas semanas atrás do código · **resolvido**

O Pages publica `main:/docs` do jeito que está. Os commits `1ffdcf8`, `05a0199`
e `3dd3c4a` (14/09) mudaram `src/` sem regerar `docs/`: o site seguiu servindo
`index-5GgAnkBF.js`, de 17/08, sem o filtro corrigido nem a exportação completa,
enquanto o deploy aparecia verde.

- `71dbb6d` publicou o build atual; o site no ar passou a servir
  `index-BgaRc73u.js`, idêntico byte a byte ao `docs/` commitado.
- `abde24e` faz o workflow `Quality` refazer o build e falhar se `docs/` mudar.
  O build foi conferido idêntico no Node 24.21.0 e no 25.9.0, e o passo passou
  no runner real (run `36298643727`).

### P1 — Cinco cartas quebradas · **resolvido**

Ver seção 5.1. Corrigidas por arquivo de revisão (`scripts/revisoes/`), com
três testes novos que falhavam antes da correção.

### P2 — Estado salvo malformado derruba o app em tela branca permanente

`loadState()` aceita qualquer objeto, e o hook hidrata `customCards` sem passar
pelo validador que a importação já usa (`parseGameState`). No navegador, uma
carta salva sem `cats` gera `Cannot read properties of undefined (reading
'some')` e a raiz fica vazia — em toda carga, até alguém limpar os dados do site
na mão. O gatilho é raro (dado de versão antiga ou edição manual), mas o dano é
total e não há saída pela interface.

**Encaminhamento:** task nova (Média): hidratar pelo mesmo normalizador da
importação e descartar só o que for inválido.

### P2 — Os dados do usuário têm pouca proteção

Exportar é o único backup que existe, e:

- **Excluir carta própria** é um toque, sem confirmação e sem desfazer.
- **Importar substitui tudo** — cartas, jogadores e placar — sem avisar. Para
  "baralhos compartilháveis", importar o baralho de alguém apagaria o seu.
- **Exportar só copia para a área de transferência.** Não há arquivo `.json`
  para baixar, e quando a cópia falha o aviso manda "selecionar e copiar
  manualmente" sem mostrar nada para selecionar.

**Encaminhamento:** task nova (Média).

### P2 — Alvos de toque e contraste no celular

Medido no build, no celular (390×844):

- **9 dos 10 alvos da tela inicial têm menos de 44 px** em algum lado: abas
  (40 px de altura), Segredo (30×30), Ajustes (87×30), Carta anterior (34×34),
  Cronômetro e Embaralhar (38 px).
- Na gaveta, 182 de 184 alvos ficam abaixo de 44 px, e 2 abaixo do mínimo AA de
  24 px: o slider de intensidade (16 px) e a caixa "Só ativas" (16×16).
- **25 trechos de texto ficam abaixo do contraste AA** (4,5:1) no desktop; o pior
  é 2,34:1 (rodapé e a dica "Arraste a carta…"). Os rótulos do slider estão em
  2,44:1 com 10 px, e os nomes das categorias em 4,45:1.

**Encaminhamento:** task nova (Média). O teste em aparelho físico continua na
task de Mobile já aberta.

### P2 — Três regras críticas sem teste que as proteja

Das 15 mutações, estas passam por toda a suíte:

| Mutação | Por que sobrevive |
| --- | --- |
| Nível máximo exclusivo (`<` no lugar de `<=`) | nenhum teste confere que o nível escolhido entra |
| Fim do baralho sem reembaralhar | o teste compara só o conjunto de cartas, não a ordem |
| Sem a trava `hydrated` | o teste "salva só depois da hidratação" passa sem ela |

As duas mutações de conteúdo (carta truncada, `{p}` no Mais Provável)
sobreviviam na base e morreram com os testes desta rodada.

**Encaminhamento:** task nova (Média).

### P3 — Polimento

- Nível e categoria usam os mesmos nomes ("Fofo" e "Picante" são as duas
  coisas); na Biblioteca aparece "Fofo · Fofo".
- A dica "use as setas ← → do teclado" aparece no celular.
- Editar o texto de uma carta própria que está no baralho deixa a versão antiga
  até o próximo embaralhar (o `poolKey` só olha os IDs) — já apontado em 14/09.
- `actions/checkout@v4` e `actions/setup-node@v4` rodam em Node 20, que o GitHub
  já marca como depreciado.
- O padrão Felixo pede um `start_app.py` com menu em todo programa; o projeto
  não tem.
- O template do `IA.md` manda arquivar histórico antigo em `docs/ia-archive/`,
  mas aqui `docs/` é a pasta publicada pelo Pages — arquivar ali publicaria o
  histórico. Se for compactar, use outra pasta.

---

## 3. Regressões da refatoração

Comparação recurso a recurso com `src/CoupleNightGame.tsx` em `9c40328`:

| Recurso do monolito | Hoje |
| --- | --- |
| Jogadores, modos, nível, categorias | presentes |
| Cartas próprias: criar, editar, duplicar, excluir, ocultar | presentes |
| Biblioteca com busca, filtro de modo e "só ativas" | presentes |
| Cronômetro | presente (`useTimer`) |
| Exportar, importar, resetar | presentes; reset ganhou confirmação, import ganhou validação |
| Easter egg do coração | virou o recado do `SecretModal`, como decidido em 17/08 |
| "Pack de sessão" (`importSessionPack`) | **não era regressão:** o monolito declarava a função, mas nenhum botão a chamava e o pool nunca lia `sessionPacks` — era código morto |

Não há regressão. Três defeitos do monolito foram corrigidos na refatoração
(dependência de `hiddenIds` no pool, `{p}`/`{p2}` iguais, salvar antes de ler).
Os dois P1 de regra — filtro por "qualquer categoria" e reembaralhar ao trocar de
modo — foram **herdados** do monolito, não introduzidos.

---

## 4. Balanço do baralho

Distribuição igual à medida em 14/09: 340 cartas, Eu Nunca 105, Mais Provável
80, Verdade 80, Desafio 75; Nuclear é o nível mais magro (45). No nível padrão
(até Picante), os pools são Eu Nunca 59, Mais Provável 47, Verdade 44 e
Desafio 43 — pequenos o bastante para o paradoxo do aniversário aparecer cedo
quando o sorteio reinicia (P1 acima).

O curinga `{p}` aparece em 84 cartas (20 Eu Nunca, 14 Verdade, 50 Desafio; o Mais
Provável ficou sem nenhum) e `{p2}` em nenhuma. Num casal, a leitura que
funciona é "quem foi nomeado é o alvo, o outro joga". Isso vale em Verdade e
Desafio; no Eu Nunca, o nomeado fica sem responder a própria carta — é uma
escolha de design para registrar, não um defeito.

---

## 5. Qualidade das cartas — leitura integral

### 5.1 Corrigidas nesta rodada (objetivamente quebradas)

| Carta | Antes | Depois | Por quê |
| --- | --- | --- | --- |
| `n4` | Eu nunca fantasi… sobre {p}. | Eu nunca fantasiei sobre {p}. | cortada desde o baralho original (`9c40328:src/cards.ts:37`) |
| `m21` | …e arrastar {p}? | …e arrastar o outro junto? | no Mais Provável os dois são candidatos; com `{p}`, metade das vezes vira "Ela arrastaria a Ela" |
| `t5` | Qual detalhe do {p}… | Qual detalhe de {p}… | "do {p}" vira "do Ela" |
| `d17` | Roleplay uma cena de vampiro… | Faça um roleplay de vampiro… | "Roleplay" como verbo não existe em português |
| `d26` | Roleplay uma cena de chefe/funcionário… | Faça um roleplay de chefe/funcionário… | idem |

Arquivo: `scripts/revisoes/2026-09-27-cartas-quebradas.json`. Testes novos em
`src/data/cards/cards.test.ts`: texto cortado, nome no Mais Provável e artigo
com gênero antes de nome sorteado.

### 5.2 Para decisão editorial de vocês

Nada daqui foi alterado: é gosto, tom ou limite, e a decisão é do casal.

**Consentimento e limites.** Desafios que agem sobre o outro sem checagem
explícita: `d54` (vendar e tocar "onde quiser"), `d55` (prender as mãos e beijar
"do jeito que quiser"), `d56` (manter o outro parado), `d57` (tirar a roupa do
outro), `d58` ("obedecendo tudo"), `d62`, `d68` ("Sem discussão"), `d67`
(realizar "agora" a última fantasia confessada) e a pergunta `t72` ("qual limite
seu cairia na noite certa"). Já existem boas âncoras: `d27` e `m27` (conversar
sobre limites), `d63` (escolher palavra de segurança — faria mais sentido vir
antes das cartas de BDSM do que cair ao acaso) e `d75` ("o jogo para aqui se
vocês quiserem").

**Premissa repetida no mesmo modo.** `n19` ≈ `n74` (nude no horário de
trabalho) · `d24` ≈ `d46` (áudio erótico para o outro) · `d56` ≈ `d62` (provocar
sem deixar tocar) · `d4` ≈ `d14` ≈ `d23` (dançar colados). Os ecos entre modos
(ex.: "gravei um vídeo íntimo" no Eu Nunca e no Mais Provável) parecem
intencionais.

**Nível possivelmente trocado.** Suaves demais para o nível: `n10` (Picante),
`m79` (Nuclear), `d5` (Hot), `d4` e `d14` (Picante). Explícitas para Picante:
`n67` e `n69`.

**Categoria incoerente** (pesa mais quando o filtro virar limite): `n17` fala de
bebida sem ter "Bebida"; `n54` e `n58` são "Sexting" sem ter nada de sexting;
`m54` tem "Bebida" sem bebida; `n60` tem "Bebida" por ser em festa.

**Linguagem.** Gênero sem padrão: 6 cartas usam "(a)" e 24 fixam o masculino
(ex.: `n44` "acordado", `n78` "amordaçado ou vendado", `d59` "tocado").
Imperativo misto: "Descreva" (`t20`, `t25`, `t35`) e "Descreve" (`t79`),
"Responde" (`t58`). `t26` "que você viu e se identificou" (falta "com a qual").
`t43` "maior clichê romântico favorito". `d58` "Fique de quatro cartas" é
ambígua — pode ser trocadilho proposital. `d69` fala em "fim da rodada", e o app
não tem rodada.

**Dependem de histórico que o app não guarda.** `d67` e `d72` pedem a última
fantasia confessada ou uma carta nuclear já sorteada; podem cair antes de isso
existir.

---

## 6. Publicação, privacidade e futuro

- **Exposição:** repositório e Pages públicos (confirmado pela API em 27/09).
  Nenhuma chamada de rede em `src/`; as URLs do bundle são só namespaces XML e o
  link de erro do React. Nomes, cartas e placar ficam no `localStorage`.
- **Repositório privado não esconderia o site:** Pages de repositório privado
  exige plano pago e, fora do Enterprise Cloud, o site continua público
  ([o que é o GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages),
  [visibilidade do site](https://docs.github.com/en/enterprise-cloud@latest/pages/getting-started-with-github-pages/changing-the-visibility-of-your-github-pages-site)).
  Por isso a decisão foi manter público com aviso 18+.
- **App:** decisão "não agora; PWA se surgir demanda". A análise de 14/09 na task
  de Produto continua válida (Apple 1.1.4 e Google Play recusam conteúdo
  sexual explícito). Se o gatilho vier, o PWA precisa de manifesto, ícones,
  service worker com cache versionado e teste offline em Android e iOS.
- **Baralhos compartilháveis:** o export/import leva o estado inteiro e
  **substitui** o do outro lado. Para compartilhar baralho sem apagar o de quem
  recebe, falta um "importar como pacote" que só acrescente cartas.

---

## 7. Validação reproduzível

- `npm ci`, `npm run lint`, `npm run typecheck`: limpos.
- `npm test`: 51 testes (43 na base + 3 do baralho + 5 do script de revisão).
  Os 3 testes do baralho falharam antes da correção (acusando `n4`, `m21` e `t5`)
  e passaram depois.
- Script de revisão: a simulação não grava; `--aplicar` grava; a segunda
  aplicação só diz "já estava".
- Build em `docs/` idêntico no Node 24.21.0 e no 25.9.0.
- Trava de `docs/`: passa com o build em dia; falha quando `src/` muda sem
  rebuild (testado localmente e no run `36298643727`).
- GitHub Actions: `Quality` 36298643727 e `pages-build-deployment` 36298643330,
  ambos com sucesso em 27/09.
- Site no ar: `index-BgaRc73u.js` com HTTP 200, igual ao `docs/` commitado e já
  contendo "Reativar todas as categorias" e a `n4` corrigida.

## 8. Limitações declaradas

- **Não foi testado em aparelho físico.** O celular foi emulado no Chromium
  headless; toque real, teclado virtual e viewport dinâmica continuam na task de
  Mobile.
- O contraste foi calculado sobre as cores de fundo sólidas, sem os gradientes e
  o desfoque — é uma aproximação, boa para achar os piores casos.
- A leitura das cartas é de um revisor externo ao casal; o que é gosto ou limite
  foi listado, não decidido.
- Os dois P1 de regra (filtro e sorteio) foram **medidos e encaminhados, não
  corrigidos**: mudam o comportamento central e ficaram em tasks próprias.
