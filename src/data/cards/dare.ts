/**
 * Baralho "Desafio".
 *
 * Regra: cumpre o desafio ou vira o copo. Nada aqui deve exigir sair de casa
 * nem envolver terceiros — o jogo é para o casal, no sofá.
 */

import { CardItem } from "../taxonomy";

export const DARE_CARDS: CardItem[] = [
  // ---------- Fofo ----------
  { id: "d1", mode: "dare", text: "Dê um abraço bem demorado em {p}.", level: "cute", cats: ["cute"] },
  { id: "d2", mode: "dare", text: "Sussurre algo romântico no ouvido de {p}.", level: "cute", cats: ["cute", "funny"] },
  { id: "d6", mode: "dare", text: "Crie um código secreto com {p} para usar hoje à noite.", level: "cute", cats: ["deep"] },
  { id: "d7", mode: "dare", text: "Façam um brinde e digam uma qualidade do outro.", level: "cute", cats: ["cute"] },
  { id: "d8", mode: "dare", text: "Envie uma mensagem fofa para {p} agora (vale DM).", level: "cute", cats: ["cute"] },
  { id: "d9", mode: "dare", text: "Escolham um filme e comecem assistindo abraçados por 2 min.", level: "cute", cats: ["cute"] },
  { id: "d11", mode: "dare", text: "Selfie juntos agora — a melhor vira wallpaper por hoje.", level: "cute", cats: ["funny"] },
  { id: "d12", mode: "dare", text: "Desafio de olhar: encarem-se sem rir por 15s.", level: "cute", cats: ["funny"] },
  { id: "d13", mode: "dare", text: "{p} descreve um date perfeito em 20 palavras.", level: "cute", cats: ["deep"] },
  { id: "d15", mode: "dare", text: "Conte uma história curta da vida sobre sua família pra {p}.", level: "cute", cats: ["life", "deep"] },
  { id: "d21", mode: "dare", text: "Dê um beijo fofo na testa de {p} e diga por quê.", level: "cute", cats: ["cute", "romantic"] },
  { id: "d23", mode: "dare", text: "Dance uma música romântica coladinhos sem rir.", level: "cute", cats: ["funny", "romantic"] },
  { id: "d28", mode: "dare", text: "Faça uma imitação ridícula de um meme de Twitter sobre amor.", level: "cute", cats: ["funny", "twitter"] },
  { id: "d30", mode: "dare", text: "Planeje uma viagem hipotética romântica juntos agora.", level: "cute", cats: ["romantic", "deep"] },
  { id: "d32", mode: "dare", text: "Confesse um segredo de hobby estranho pra {p}.", level: "cute", cats: ["funny", "life"] },
  { id: "d34", mode: "dare", text: "Compartilhe uma foto fofa antiga e explique a história.", level: "cute", cats: ["cute", "life"] },
  { id: "d36", mode: "dare", text: "Abra a galeria e mostre a última foto sem escolher qual.", level: "cute", cats: ["funny", "confession"] },
  { id: "d37", mode: "dare", text: "Imite {p} até ele(a) adivinhar o que você tá imitando.", level: "cute", cats: ["funny"] },
  { id: "d38", mode: "dare", text: "Deixe {p} escrever um story no seu perfil por 30 segundos.", level: "cute", cats: ["funny", "twitter"] },
  { id: "d39", mode: "dare", text: "Faça carinho na cabeça de {p} por um minuto inteiro, em silêncio.", level: "cute", cats: ["cute", "romantic"] },
  { id: "d40", mode: "dare", text: "Diga três coisas que você ama em {p} sem usar 'legal' nem 'bonito(a)'.", level: "cute", cats: ["romantic", "deep"] },
  { id: "d41", mode: "dare", text: "Deixe {p} escolher o próximo gole seu.", level: "cute", cats: ["drink", "funny"] },

  // ---------- Picante ----------
  { id: "d3", mode: "dare", text: "Faça um elogio picante para {p} (sem censura).", level: "spicy", cats: ["spicy"] },
  { id: "d4", mode: "dare", text: "Escolha uma música e façam uma mini-dança juntinhos por 30s.", level: "spicy", cats: ["funny"] },
  { id: "d10", mode: "dare", text: "Desafio de carinho: {p} decide um tipo por 20s.", level: "spicy", cats: ["spicy"] },
  { id: "d14", mode: "dare", text: "Ouçam 1 minuto de uma música que combine com a vibe e dancem coladinhos.", level: "spicy", cats: ["funny"] },
  { id: "d16", mode: "dare", text: "Inicie um sexting leve com {p} por 2 minutos.", level: "spicy", cats: ["esex", "funny"] },
  { id: "d18", mode: "dare", text: "Beba um shot e confesse algo picante.", level: "spicy", cats: ["drink", "confession"] },
  { id: "d20", mode: "dare", text: "Compartilhe uma confissão anônima como se fosse no Twitter.", level: "spicy", cats: ["confession", "twitter"] },
  { id: "d25", mode: "dare", text: "Conte uma história de bebida engraçada e atue ela.", level: "spicy", cats: ["drink", "funny"] },
  { id: "d27", mode: "dare", text: "Discuta limites de relacionamento abertamente com {p}.", level: "spicy", cats: ["relationship", "deep"] },
  { id: "d42", mode: "dare", text: "Beije {p} onde você mais tem vontade — sem falar nada antes.", level: "spicy", cats: ["spicy", "romantic"] },
  { id: "d43", mode: "dare", text: "Tire uma peça de roupa da sua escolha.", level: "spicy", cats: ["spicy", "funny"] },
  { id: "d44", mode: "dare", text: "Sente no colo de {p} até a próxima carta.", level: "spicy", cats: ["spicy"] },
  { id: "d45", mode: "dare", text: "Descreva com detalhe o que você faria com {p} em 30 segundos de liberdade total.", level: "spicy", cats: ["spicy", "sexual"] },
  { id: "d46", mode: "dare", text: "Mande um áudio safadinho pra {p} — mesmo estando do lado.", level: "spicy", cats: ["esex", "funny"] },
  { id: "d47", mode: "dare", text: "Faça uma massagem no pescoço de {p} por um minuto.", level: "spicy", cats: ["spicy", "romantic"] },
  { id: "d48", mode: "dare", text: "Deixe {p} desabotoar uma peça sua.", level: "spicy", cats: ["spicy"] },
  { id: "d49", mode: "dare", text: "Beije {p} por 15 segundos sem usar as mãos.", level: "spicy", cats: ["spicy", "funny"] },
  { id: "d50", mode: "dare", text: "Sussurre no ouvido de {p} a coisa mais safada que você pensou hoje.", level: "spicy", cats: ["spicy", "sexual"] },
  { id: "d51", mode: "dare", text: "Troque uma peça de roupa com {p} e fique assim por duas cartas.", level: "spicy", cats: ["funny", "spicy"] },
  { id: "d52", mode: "dare", text: "Deixe {p} escolher uma parte do seu corpo pra beijar.", level: "spicy", cats: ["spicy"] },
  { id: "d53", mode: "dare", text: "Encoste os lábios no pescoço de {p} sem beijar por 10 segundos.", level: "spicy", cats: ["spicy", "kink"] },

  // ---------- Hot ----------
  { id: "d5", mode: "dare", text: "{p} escolhe: massagem de 1 minuto OU beijo cinematográfico.", level: "hot", cats: ["spicy"] },
  { id: "d17", mode: "dare", text: "Roleplay uma cena de vampiro sedutor por 1 minuto.", level: "hot", cats: ["roleplay", "sexual"] },
  { id: "d19", mode: "dare", text: "Simule uma massagem erótica nos ombros de {p} por 30s.", level: "hot", cats: ["spicy", "kink"] },
  { id: "d22", mode: "dare", text: "Experimente um kink leve: segure as mãos de {p} como se fosse bondage.", level: "hot", cats: ["kink", "bdsm"] },
  { id: "d24", mode: "dare", text: "Envie uma mensagem de voz erótica pra {p}.", level: "hot", cats: ["esex", "spicy"] },
  { id: "d26", mode: "dare", text: "Roleplay uma cena de chefe/funcionário safado por 1 min.", level: "hot", cats: ["roleplay", "kink"] },
  { id: "d29", mode: "dare", text: "Simule voyeurismo: observe {p} dançando por 30s sem tocar.", level: "hot", cats: ["kink", "sexual"] },
  { id: "d31", mode: "dare", text: "Beba algo e sugira um jogo de strip poker leve.", level: "hot", cats: ["drink", "spicy"] },
  { id: "d33", mode: "dare", text: "Inicie um roleplay de super-herói erótico.", level: "hot", cats: ["roleplay", "funny"] },
  { id: "d35", mode: "dare", text: "Experimente dom/sub: dê uma ordem leve pra {p} seguir.", level: "hot", cats: ["kink", "bdsm"] },
  { id: "d54", mode: "dare", text: "Vende os olhos de {p} e faça carinho onde quiser por um minuto.", level: "hot", cats: ["bdsm", "kink"] },
  { id: "d55", mode: "dare", text: "Prenda as mãos de {p} e beije do jeito que quiser por 30 segundos.", level: "hot", cats: ["bdsm", "kink"] },
  { id: "d56", mode: "dare", text: "Faça {p} ficar completamente parado enquanto você provoca por um minuto.", level: "hot", cats: ["bdsm", "sexual"] },
  { id: "d57", mode: "dare", text: "Tire a roupa de {p} usando só uma mão.", level: "hot", cats: ["sexual", "spicy"] },
  { id: "d58", mode: "dare", text: "Fique de quatro cartas obedecendo tudo que {p} mandar.", level: "hot", cats: ["bdsm", "kink"] },
  { id: "d59", mode: "dare", text: "Mostre em {p} exatamente como você gosta de ser tocado.", level: "hot", cats: ["sexual", "deep"] },
  { id: "d60", mode: "dare", text: "Beije {p} descendo do pescoço até a cintura, sem pressa.", level: "hot", cats: ["sexual", "spicy"] },
  { id: "d61", mode: "dare", text: "Deixe {p} dar uma mordida onde quiser.", level: "hot", cats: ["kink", "spicy"] },
  { id: "d62", mode: "dare", text: "Provoque {p} por um minuto inteiro sem deixar ele(a) te tocar.", level: "hot", cats: ["bdsm", "sexual"] },
  { id: "d63", mode: "dare", text: "Escolha uma palavra de segurança com {p} agora e explique quando usaria.", level: "hot", cats: ["bdsm", "deep"] },
  { id: "d64", mode: "dare", text: "Faça um strip de 30 segundos com a música que {p} escolher.", level: "hot", cats: ["sexual", "funny"] },
  { id: "d65", mode: "dare", text: "Coloque a mão de {p} onde você mais quer ser tocado agora.", level: "hot", cats: ["sexual", "spicy"] },
  { id: "d66", mode: "dare", text: "Deixe uma marca visível em {p} — vocês decidem onde.", level: "hot", cats: ["kink", "spicy"] },

  // ---------- Nuclear ----------
  { id: "d67", mode: "dare", text: "Realize agora a última fantasia que você confessou nesta partida.", level: "nuclear", cats: ["sexual", "kink"] },
  { id: "d68", mode: "dare", text: "{p} manda em tudo pelos próximos cinco minutos. Sem discussão.", level: "nuclear", cats: ["bdsm", "sexual"] },
  { id: "d69", mode: "dare", text: "Fiquem completamente sem roupa até o fim da rodada.", level: "nuclear", cats: ["sexual", "spicy"] },
  { id: "d70", mode: "dare", text: "Provoque {p} até ele(a) pedir pra você parar de provocar.", level: "nuclear", cats: ["bdsm", "sexual"] },
  { id: "d71", mode: "dare", text: "Descreva em voz alta, sem pular detalhe, o que você quer que aconteça quando o jogo acabar.", level: "nuclear", cats: ["sexual", "deep"] },
  { id: "d72", mode: "dare", text: "Deixe {p} escolher qualquer carta nuclear já sorteada pra você repetir.", level: "nuclear", cats: ["kink", "sexual"] },
  { id: "d73", mode: "dare", text: "Aguente dois minutos de provocação sem reagir. Se reagir, vira o copo.", level: "nuclear", cats: ["bdsm", "sexual"] },
  { id: "d74", mode: "dare", text: "Peça algo que você nunca pediu antes — e peça direito.", level: "nuclear", cats: ["sexual", "deep"] },
  { id: "d75", mode: "dare", text: "O jogo para aqui se vocês quiserem. Decidam agora, olhando um pro outro.", level: "nuclear", cats: ["sexual", "relationship"] },
];
