// Helpers dos testes de interface (tarefa A1). Contrato: seção 3 do PLANEJAMENTO.md.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { screen, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Caminho a partir da raiz (no ambiente jsdom, `new URL(..., import.meta.url)` não funciona com o fs).
const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
const corpo = html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];

/**
 * Abre o jogo como um jogador abriria a página.
 * @param {Record<string,string>} params parâmetros de URL da seção 3 (ex.: MAOS_PADRAO)
 * @param {object} opcoesUser repassado a userEvent.setup
 * @returns user do user-event, para clicar como o jogador
 */
export async function abrirJogo(params = {}, opcoesUser = {}) {
  window.history.replaceState({}, '', '/?' + new URLSearchParams(params));
  document.body.innerHTML = corpo;
  jest.resetModules();
  await import('../js/main.js');
  return userEvent.setup(opcoesUser);
}

/** Clique direito como o jogador faria. */
export async function cliqueDireito(user, elemento) {
  await user.pointer({ keys: '[MouseRight]', target: elemento });
}

export { screen, within };

/** Distribuição fixa (seção 3): 7 + 7 + 14 = as 28 peças. O J1 tem a maior carroça (6-6) e começa. */
export const J1_PADRAO = '6-6,4-6,2-4,1-3,0-5,2-5,3-3';
export const J2_PADRAO = '1-6,2-6,1-1,0-0,0-4,4-5,2-3';
export const MONTE_PADRAO = '0-1,0-2,0-3,0-6,1-2,1-4,1-5,2-2,3-4,3-5,3-6,4-4,5-5,5-6';
export const MAOS_PADRAO = { j1: J1_PADRAO, j2: J2_PADRAO, monte: MONTE_PADRAO };

/** A peça `A-B` (com A ≤ B), onde quer que esteja: peca('2-6'). */
export const peca = (ab) => screen.getByTestId(`peca-${ab}`);
/** Peças dentro de um lugar: pecasEm('mao-j1'), pecasEm('mesa'). */
export const pecasEm = (lugar) => within(screen.getByTestId(lugar)).queryAllByTestId(/^peca-\d-\d$/);
/** A mesa como texto, da esquerda para a direita: "2-6 6-6 6-1". */
export const mesaComoTexto = () => pecasEm('mesa').map((p) => p.textContent.trim()).join(' ');

/**
 * Joga uma peça: clica nela e, se a mesa não estiver vazia, clica na ponta ('esquerda' ou 'direita').
 * Na abertura (mesa vazia) basta clicar na peça: chame sem `ponta`.
 */
export async function jogar(user, ab, ponta) {
  await user.click(peca(ab));
  if (ponta) await user.click(screen.getByTestId(`ponta-${ponta}`));
}
