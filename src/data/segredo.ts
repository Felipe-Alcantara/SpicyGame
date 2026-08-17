/**
 * O segredo atrás da pimenta do cabeçalho.
 *
 * Este arquivo existe para o conteúdo do easter egg viver **fora do código**:
 * mexer na mensagem não deveria exigir abrir um componente React, e quem
 * escreve aqui não precisa saber TSX.
 *
 * Nota de história, para ninguém "consertar" isto de novo: o modal da senha já
 * existiu ligado ao desbloqueio do nível Nuclear. Aquilo foi engano — um agente
 * leu o gancho vazio como bug e preencheu com a primeira função plausível. O
 * segredo nunca teve a ver com intensidade de carta: é um recado. O Nuclear
 * hoje é um nível como os outros, escolhido no filtro.
 */

/** A senha. Comparação ignora maiúsculas e espaços nas pontas. */
export const SENHA = "novidade";

/** Mostrada quando o botão "Dica" é clicado. */
export const DICA = "O que nos define?";

/** Título da tela do segredo, depois da senha certa. */
export const TITULO = "Você achou 💛";

/**
 * A mensagem.
 *
 * Escreva à vontade: linhas em branco viram parágrafos, e emoji funciona.
 * Enquanto estiver vazia, a tela avisa que o recado ainda está sendo escrito —
 * em vez de abrir um espaço em branco, que parece defeito.
 */
export const MENSAGEM = `
Escreva aqui o que você quer que ela leia.

Cada linha em branco começa um parágrafo novo.
`;

/** Assinatura no rodapé da mensagem. Deixe vazio para não mostrar nada. */
export const ASSINATURA = "";

/** O texto que a pessoa escreveu já foi preenchido de verdade? */
export function temMensagem(mensagem: string = MENSAGEM): boolean {
  const limpo = mensagem.trim();
  if (!limpo) return false;
  // O texto de exemplo que acompanha o arquivo não conta como mensagem: sem
  // isto, o easter egg "funcionaria" mostrando a instrução de preenchimento.
  return !limpo.startsWith("Escreva aqui o que você quer que ela leia.");
}

/** Quebra a mensagem em parágrafos, ignorando linhas em branco extras. */
export function paragrafos(mensagem: string = MENSAGEM): string[] {
  return mensagem
    .trim()
    .split(/\n\s*\n/)
    .map((bloco) => bloco.trim())
    .filter(Boolean);
}

/** A senha digitada está certa? Tolerante a espaço e caixa, como já era. */
export function senhaCorreta(tentativa: string, senha: string = SENHA): boolean {
  return tentativa.trim().toLowerCase() === senha.trim().toLowerCase();
}
