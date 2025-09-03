// cards.ts — dados do baralho base (separado)
// Mantém todos os cards originais + seus novos cards, sem alterar textos.

export type Mode = "never" | "most" | "truth" | "dare";
export type Level = "cute" | "spicy" | "hot" | "nuclear";
export type Category =
  | "cute"
  | "funny"
  | "spicy"
  | "deep"
  | "kink"
  | "bdsm"
  | "esex"
  | "twitter"
  | "roleplay"
  | "relationship"
  | "life"
  | "romantic"
  | "confession"
  | "drink"
  | "sexual";

export interface CardItem {
  id: string;
  mode: Mode;
  text: string; // pode conter {p} e {p2}
  level: Level;
  cats: Category[];
}

// ----------- Cards base originais -----------
export const BASE_CARDS_ORIG: CardItem[] = [
  // Eu Nunca (never)
  { id: "n1", mode: "never", text: "Eu nunca beijei em público.", level: "cute", cats: ["cute", "funny"] },
  { id: "n2", mode: "never", text: "Eu nunca dormi abraçado(a) a noite toda.", level: "cute", cats: ["cute"] },
  { id: "n3", mode: "never", text: "Eu nunca mandei mensagem picante.", level: "spicy", cats: ["spicy", "funny"] },
  { id: "n4", mode: "never", text: "Eu nunca fantasi… sobre {p}.", level: "hot", cats: ["spicy", "deep"] },
  { id: "n5", mode: "never", text: "Eu nunca quis algo mais ousado no nosso próximo encontro.", level: "hot", cats: ["spicy", "deep"] },
  { id: "n6", mode: "never", text: "Eu nunca dei um beijo de cinema.", level: "cute", cats: ["cute"] },
  { id: "n7", mode: "never", text: "Eu nunca desejei que a noite durasse mais só pra ficar com {p}.", level: "cute", cats: ["cute", "deep"] },
  { id: "n8", mode: "never", text: "Eu nunca pensei em um apelido carinhoso novo pra {p}.", level: "cute", cats: ["cute", "funny"] },
  { id: "n9", mode: "never", text: "Eu nunca vi um filme romântico só pra ter desculpa de abraçar {p}.", level: "cute", cats: ["cute"] },
  { id: "n10", mode: "never", text: "Eu nunca fiquei com ciúmes por algo bobo.", level: "spicy", cats: ["funny"] },
  { id: "n11", mode: "never", text: "Eu nunca mandei indireta com música.", level: "cute", cats: ["cute", "funny"] },
  { id: "n12", mode: "never", text: "Eu nunca quis repetir um primeiro beijo.", level: "cute", cats: ["cute", "deep"] },
  { id: "n13", mode: "never", text: "Eu nunca pensei em uma surpresa romântica pra {p}.", level: "cute", cats: ["cute"] },
  { id: "n14", mode: "never", text: "Eu nunca fiquei com saudade minutos depois de me despedir.", level: "cute", cats: ["deep"] },
  { id: "n15", mode: "never", text: "Eu nunca desejei {p} do nada durante o dia.", level: "spicy", cats: ["spicy"] },

  // Quem é mais provável (most)
  { id: "m1", mode: "most", text: "Quem é mais provável de preparar um café da manhã romântico?", level: "cute", cats: ["cute"] },
  { id: "m2", mode: "most", text: "Quem é mais provável de começar as provocações?", level: "spicy", cats: ["spicy", "funny"] },
  { id: "m3", mode: "most", text: "Quem é mais provável de pedir um beijo no meio da rua?", level: "cute", cats: ["cute", "funny"] },
  { id: "m4", mode: "most", text: "Quem é mais provável de sugerir algo bem hot hoje?", level: "hot", cats: ["spicy"] },
  { id: "m5", mode: "most", text: "Quem é mais provável de planejar uma viagem surpresa?", level: "cute", cats: ["cute"] },
  { id: "m6", mode: "most", text: "Quem é mais provável de rir no meio do beijo?", level: "cute", cats: ["funny"] },
  { id: "m7", mode: "most", text: "Quem é mais provável de puxar assunto aleatório antes de dormir?", level: "cute", cats: ["funny"] },
  { id: "m8", mode: "most", text: "Quem é mais provável de escrever um bilhetinho fofo?", level: "cute", cats: ["cute"] },
  { id: "m9", mode: "most", text: "Quem é mais provável de provocar só pra ganhar carinho?", level: "spicy", cats: ["spicy", "funny"] },
  { id: "m10", mode: "most", text: "Quem é mais provável de sugerir um filme romântico?", level: "cute", cats: ["cute"] },
  { id: "m11", mode: "most", text: "Quem é mais provável de organizar um encontro temático?", level: "cute", cats: ["cute"] },
  { id: "m12", mode: "most", text: "Quem é mais provável de dar um beijo surpresa?", level: "cute", cats: ["cute"] },
  { id: "m13", mode: "most", text: "Quem é mais provável de mandar mensagem 'chega logo'?", level: "cute", cats: ["funny"] },
  { id: "m14", mode: "most", text: "Quem é mais provável de ficar corado com um elogio?", level: "cute", cats: ["cute"] },

  // Verdade (truth)
  { id: "t1", mode: "truth", text: "Qual foi o pensamento mais fofo que você teve sobre {p} hoje?", level: "cute", cats: ["cute", "deep"] },
  { id: "t2", mode: "truth", text: "Conte uma lembrança marcante que te deixou com borboletas no estômago.", level: "cute", cats: ["cute", "deep"] },
  { id: "t3", mode: "truth", text: "Qual é a sua maior curiosidade hot sobre nós?", level: "spicy", cats: ["spicy", "deep"] },
  { id: "t4", mode: "truth", text: "O que te deixa no mood imediatamente?", level: "hot", cats: ["spicy", "deep"] },
  { id: "t5", mode: "truth", text: "Qual detalhe do {p} você mais repara de perto?", level: "spicy", cats: ["spicy", "deep"] },
  { id: "t6", mode: "truth", text: "Que tipo de carinho te desmonta na hora?", level: "cute", cats: ["cute"] },
  { id: "t7", mode: "truth", text: "Qual foi a mensagem mais fofa que já recebeu de {p}?", level: "cute", cats: ["cute"] },
  { id: "t8", mode: "truth", text: "Que surpresa você faria se tivesse 24h e orçamento livre?", level: "cute", cats: ["deep"] },
  { id: "t9", mode: "truth", text: "O que você quer experimentar juntos pela primeira vez?", level: "spicy", cats: ["spicy", "deep"] },
  { id: "t10", mode: "truth", text: "Qual música combina com nosso clima hoje?", level: "cute", cats: ["cute", "funny"] },
  { id: "t11", mode: "truth", text: "Que elogio sincero você daria para {p} agora?", level: "cute", cats: ["cute"] },
  { id: "t12", mode: "truth", text: "Qual foi a melhor parte do nosso último encontro?", level: "cute", cats: ["cute"] },
  { id: "t13", mode: "truth", text: "Existe algo que você tem vontade de sugerir hoje?", level: "spicy", cats: ["spicy"] },
  { id: "t14", mode: "truth", text: "Qual toque te dá arrepios na medida certa?", level: "hot", cats: ["spicy"] },

  // Desafio (dare)
  { id: "d1", mode: "dare", text: "Dê um abraço bem demorado em {p}.", level: "cute", cats: ["cute"] },
  { id: "d2", mode: "dare", text: "Sussurre algo romântico no ouvido de {p}.", level: "cute", cats: ["cute", "funny"] },
  { id: "d3", mode: "dare", text: "Faça um elogio picante para {p} (sem censura).", level: "spicy", cats: ["spicy"] },
  { id: "d4", mode: "dare", text: "Escolha uma música e façam uma mini-dança juntinhos por 30s.", level: "spicy", cats: ["funny"] },
  { id: "d5", mode: "dare", text: "{p} escolhe: massagem de 1 minuto OU beijo cinematográfico.", level: "hot", cats: ["spicy"] },
  { id: "d6", mode: "dare", text: "Crie um código secreto com {p} para usar hoje à noite.", level: "cute", cats: ["deep"] },
  { id: "d7", mode: "dare", text: "Façam um brinde e digam uma qualidade do outro.", level: "cute", cats: ["cute"] },
  { id: "d8", mode: "dare", text: "Envie uma mensagem fofa para {p} agora (vale DM).", level: "cute", cats: ["cute"] },
  { id: "d9", mode: "dare", text: "Escolham um filme e comecem assistindo abraçados por 2 min.", level: "cute", cats: ["cute"] },
  { id: "d10", mode: "dare", text: "Desafio de carinho: {p} decide um tipo por 20s.", level: "spicy", cats: ["spicy"] },
  { id: "d11", mode: "dare", text: "Selfie juntos agora — a melhor vira wallpaper por hoje.", level: "cute", cats: ["funny"] },
  { id: "d12", mode: "dare", text: "Desafio de olhar: encarem-se sem rir por 15s.", level: "cute", cats: ["funny"] },
  { id: "d13", mode: "dare", text: "{p} descreve um date perfeito em 20 palavras.", level: "cute", cats: ["deep"] },
  { id: "d14", mode: "dare", text: "Ouçam 1 minuto de uma música que combine com a vibe e dancem coladinhos.", level: "spicy", cats: ["funny"] },
];

export const EXTRA_BASE_CARDS: CardItem[] = [
  { id: "n16", mode: "never", text: "Eu nunca contei uma história embaraçosa da infância pra rir com {p}.", level: "cute", cats: ["cute", "funny"] },
  { id: "n17", mode: "never", text: "Eu nunca bebi algo alcoólico e fiquei mais falante sobre sentimentos.", level: "spicy", cats: ["funny", "deep"] },
  { id: "n18", mode: "never", text: "Eu nunca participei de um roleplay online com alguém.", level: "spicy", cats: ["spicy", "roleplay"] },
  { id: "n19", mode: "never", text: "Eu nunca enviei um nude pra {p} durante o dia.", level: "hot", cats: ["spicy", "esex"] },
  { id: "n20", mode: "never", text: "Eu nunca experimentei um kink como spanking com consentimento.", level: "hot", cats: ["kink", "sexual"] },
  { id: "n21", mode: "never", text: "Eu nunca confessei um crush antigo em uma rede social.", level: "cute", cats: ["funny", "confession"] },
  { id: "n22", mode: "never", text: "Eu nunca viajei sozinho e pensei em levar {p} na próxima.", level: "cute", cats: ["deep", "romantic"] },
  { id: "n23", mode: "never", text: "Eu nunca participei de uma thread no Twitter sobre fantasias sexuais.", level: "hot", cats: ["spicy", "twitter"] },
  { id: "n24", mode: "never", text: "Eu nunca quis ser dominado(a) em uma cena BDSM leve.", level: "hot", cats: ["kink", "bdsm"] },
  { id: "n25", mode: "never", text: "Eu nunca compartilhei uma confissão anônima sobre relacionamentos online.", level: "spicy", cats: ["confession", "deep"] },
  { id: "n26", mode: "never", text: "Eu nunca bebi e mandei mensagem bêbada pra ex.", level: "spicy", cats: ["funny", "drink"] },
  { id: "n27", mode: "never", text: "Eu nunca roleplayei como personagem de anime em uma conversa erótica.", level: "hot", cats: ["roleplay", "sexual"] },
  { id: "n28", mode: "never", text: "Eu nunca senti ciúmes de um amigo platônico de {p}.", level: "spicy", cats: ["romantic", "deep"] },
  { id: "n29", mode: "never", text: "Eu nunca explorei poliamor em pensamentos ou conversas.", level: "hot", cats: ["relationship", "deep"] },
  { id: "n30", mode: "never", text: "Eu nunca assisti pornô inspirado em kinks como voyeurismo.", level: "hot", cats: ["kink", "sexual"] },
  { id: "n31", mode: "never", text: "Eu nunca contei uma história de viagem maluca pra impressionar {p}.", level: "cute", cats: ["funny", "life"] },
  { id: "n32", mode: "never", text: "Eu nunca participei de um jogo de bebida que levou a beijos.", level: "spicy", cats: ["drink", "funny"] },
  { id: "n33", mode: "never", text: "Eu nunca fantasiei sobre sexo em público com {p}.", level: "hot", cats: ["sexual", "spicy"] },
  { id: "n34", mode: "never", text: "Eu nunca usei brinquedos sexuais sozinho pensando em {p}.", level: "hot", cats: ["sexual", "kink"] },
  { id: "n35", mode: "never", text: "Eu nunca confessei um segredo de trabalho em uma conversa íntima.", level: "cute", cats: ["deep", "life"] },
  { id: "m15", mode: "most", text: "Quem é mais provável de iniciar um sexting do nada?", level: "hot", cats: ["esex", "spicy"] },
  { id: "m16", mode: "most", text: "Quem é mais provável de sugerir um roleplay de professor/aluno?", level: "hot", cats: ["roleplay", "kink"] },
  { id: "m17", mode: "most", text: "Quem é mais provável de beber e contar confissões pessoais?", level: "spicy", cats: ["drink", "deep"] },
  { id: "m18", mode: "most", text: "Quem é mais provável de planejar uma noite de BDSM iniciante?", level: "hot", cats: ["bdsm", "kink"] },
  { id: "m19", mode: "most", text: "Quem é mais provável de compartilhar uma história de vida engraçada sobre família?", level: "cute", cats: ["funny", "life"] },
  { id: "m20", mode: "most", text: "Quem é mais provável de sugerir assistir algo erótico juntos?", level: "hot", cats: ["sexual", "spicy"] },
  { id: "m21", mode: "most", text: "Quem é mais provável de ficar obcecado com um hobby e arrastar {p}?", level: "cute", cats: ["funny", "romantic"] },
  { id: "m22", mode: "most", text: "Quem é mais provável de postar uma confissão anônima no Twitter?", level: "spicy", cats: ["confession", "twitter"] },
  { id: "m23", mode: "most", text: "Quem é mais provável de propor um threesome fictício em roleplay?", level: "hot", cats: ["roleplay", "sexual"] },
  { id: "m24", mode: "most", text: "Quem é mais provável de organizar uma festa com bebidas e jogos ousados?", level: "spicy", cats: ["drink", "funny"] },
  { id: "m25", mode: "most", text: "Quem é mais provável de explorar kinks como petplay?", level: "hot", cats: ["kink", "bdsm"] },
  { id: "m26", mode: "most", text: "Quem é mais provável de contar uma história de fantasma da infância?", level: "cute", cats: ["funny", "life"] },
  { id: "m27", mode: "most", text: "Quem é mais provável de iniciar uma conversa sobre limites sexuais?", level: "hot", cats: ["deep", "relationship"] },
  { id: "m28", mode: "most", text: "Quem é mais provável de sugerir um date com tema de fantasia?", level: "spicy", cats: ["roleplay", "romantic"] },
  { id: "m29", mode: "most", text: "Quem é mais provável de beber e dançar ridiculamente?", level: "cute", cats: ["funny", "drink"] },
  { id: "m30", mode: "most", text: "Quem é mais provável de fantasiar sobre dominação total?", level: "hot", cats: ["kink", "bdsm"] },
  { id: "m31", mode: "most", text: "Quem é mais provável de compartilhar memes de relacionamentos ruins?", level: "spicy", cats: ["funny", "twitter"] },
  { id: "m32", mode: "most", text: "Quem é mais provável de propor e-sex durante uma viagem?", level: "hot", cats: ["esex", "spicy"] },
  { id: "m33", mode: "most", text: "Quem é mais provável de contar uma confissão de crush online?", level: "cute", cats: ["confession", "romantic"] },
  { id: "m34", mode: "most", text: "Quem é mais provável de sugerir bondage como experimento?", level: "hot", cats: ["kink", "bdsm"] },
  { id: "m35", mode: "most", text: "Quem é mais provável de planejar uma noite de histórias da vida real?", level: "cute", cats: ["deep", "life"] },
  { id: "t15", mode: "truth", text: "Qual é o kink mais secreto que você já pesquisou no Twitter?", level: "hot", cats: ["kink", "twitter"] },
  { id: "t16", mode: "truth", text: "Conte uma história da vida sobre sua pior bebedeira.", level: "spicy", cats: ["drink", "funny"] },
  { id: "t17", mode: "truth", text: "Qual roleplay fictício você gostaria de tentar com {p}?", level: "hot", cats: ["roleplay", "sexual"] },
  { id: "t18", mode: "truth", text: "O que você mais curte em e-sex: palavras ou imagens?", level: "hot", cats: ["esex", "spicy"] },
  { id: "t19", mode: "truth", text: "Qual confissão anônima você faria sobre nosso relacionamento?", level: "spicy", cats: ["confession", "deep"] },
  { id: "t20", mode: "truth", text: "Descreva uma fantasia BDSM que te intriga.", level: "hot", cats: ["bdsm", "kink"] },
  { id: "t21", mode: "truth", text: "Qual é a história mais fofa da sua infância que envolve amor?", level: "cute", cats: ["cute", "life"] },
  { id: "t22", mode: "truth", text: "Você já participou de subcomunidades de kinks online? Conte.", level: "hot", cats: ["kink", "twitter"] },
  { id: "t23", mode: "truth", text: "Qual bebida te deixa mais ousado em conversas?", level: "spicy", cats: ["drink", "funny"] },
  { id: "t24", mode: "truth", text: "Qual é o maior arrependimento em um relacionamento passado?", level: "spicy", cats: ["relationship", "deep"] },
  { id: "t25", mode: "truth", text: "Descreva uma cena de voyeurismo que te excita em fantasia.", level: "hot", cats: ["kink", "sexual"] },
  { id: "t26", mode: "truth", text: "Conte uma confissão de internet que você viu e se identificou.", level: "cute", cats: ["confession", "funny"] },
  { id: "t27", mode: "truth", text: "Qual hobby você quer compartilhar romanticamente com {p}?", level: "cute", cats: ["romantic", "deep"] },
  { id: "t28", mode: "truth", text: "Você já fantasiou sobre sexo com elementos de poder?", level: "hot", cats: ["kink", "bdsm"] },
  { id: "t29", mode: "truth", text: "Qual história de viagem te marcou emocionalmente?", level: "cute", cats: ["life", "deep"] },
  { id: "t30", mode: "truth", text: "O que te atrai em roleplays de fantasia medieval erótica?", level: "hot", cats: ["roleplay", "sexual"] },
  { id: "t31", mode: "truth", text: "Qual é sua opinião sobre poliamor em relacionamentos?", level: "spicy", cats: ["relationship", "deep"] },
  { id: "t32", mode: "truth", text: "Conte sobre uma vez que bebida levou a algo inesperado.", level: "spicy", cats: ["drink", "funny"] },
  { id: "t33", mode: "truth", text: "Qual kink de submissão ou dominação te interessa mais?", level: "hot", cats: ["kink", "bdsm"] },
  { id: "t34", mode: "truth", text: "Qual é a confissão mais engraçada que você tem sobre trabalho?", level: "cute", cats: ["funny", "life"] },
  { id: "t35", mode: "truth", text: "Descreva sua experiência com e-sex mais memorável.", level: "hot", cats: ["esex", "spicy"] },
  { id: "d15", mode: "dare", text: "Conte uma história curta da vida sobre sua família pra {p}.", level: "cute", cats: ["life", "deep"] },
  { id: "d16", mode: "dare", text: "Inicie um sexting leve com {p} por 2 minutos.", level: "spicy", cats: ["esex", "funny"] },
  { id: "d17", mode: "dare", text: "Roleplay uma cena de vampiro sedutor por 1 minuto.", level: "hot", cats: ["roleplay", "sexual"] },
  { id: "d18", mode: "dare", text: "Beba um shot e confesse algo picante.", level: "spicy", cats: ["drink", "confession"] },
  { id: "d19", mode: "dare", text: "Simule uma massagem erótica nos ombros de {p} por 30s.", level: "hot", cats: ["spicy", "kink"] },
  { id: "d20", mode: "dare", text: "Compartilhe uma confissão anônima como se fosse no Twitter.", level: "spicy", cats: ["confession", "twitter"] },
  { id: "d21", mode: "dare", text: "Dê um beijo fofo na testa de {p} e diga por quê.", level: "cute", cats: ["cute", "romantic"] },
  { id: "d22", mode: "dare", text: "Experimente um kink leve: segure as mãos de {p} como se fosse bondage.", level: "hot", cats: ["kink", "bdsm"] },
  { id: "d23", mode: "dare", text: "Dance uma música romântica coladinhos sem rir.", level: "cute", cats: ["funny", "romantic"] },
  { id: "d24", mode: "dare", text: "Envie uma mensagem de voz erótica pra {p}.", level: "hot", cats: ["esex", "spicy"] },
  { id: "d25", mode: "dare", text: "Conte uma história de bebida engraçada e atue ela.", level: "spicy", cats: ["drink", "funny"] },
  { id: "d26", mode: "dare", text: "Roleplay uma cena de chefe/funcionário safado por 1 min.", level: "hot", cats: ["roleplay", "kink"] },
  { id: "d27", mode: "dare", text: "Discuta limites de relacionamento abertamente com {p}.", level: "spicy", cats: ["relationship", "deep"] },
  { id: "d28", mode: "dare", text: "Faça uma imitação ridícula de um meme de Twitter sobre amor.", level: "cute", cats: ["funny", "twitter"] },
  { id: "d29", mode: "dare", text: "Simule voyeurismo: observe {p} dançando por 30s sem tocar.", level: "hot", cats: ["kink", "sexual"] },
  { id: "d30", mode: "dare", text: "Planeje uma viagem hipotética romântica juntos agora.", level: "cute", cats: ["romantic", "deep"] },
  { id: "d31", mode: "dare", text: "Beba algo e sugira um jogo de strip poker leve.", level: "hot", cats: ["drink", "spicy"] },
  { id: "d32", mode: "dare", text: "Confesse um segredo de hobby estranho pra {p}.", level: "cute", cats: ["funny", "life"] },
  { id: "d33", mode: "dare", text: "Inicie um roleplay de super-herói erótico.", level: "hot", cats: ["roleplay", "funny"] },
  { id: "d34", mode: "dare", text: "Compartilhe uma foto fofa antiga e explique a história.", level: "cute", cats: ["cute", "life"] },
  { id: "d35", mode: "dare", text: "Experimente dom/sub: dê uma ordem leve pra {p} seguir.", level: "hot", cats: ["kink", "bdsm"] },
];

// Concat completo para uso no app
export const ALL_BASE_CARDS: CardItem[] = [...BASE_CARDS_ORIG, ...EXTRA_BASE_CARDS];
