// Tarefas F4 e F5 (Felipe): bater, jogo trancado, fim de jogo e nova partida. Só pela interface (seção 3 do PLANEJAMENTO.md):
// abrirJogo, data-testid e user-event. Sem jest.mock e sem importar js/*.js.
import { abrirJogo, jogar, mesaComoTexto, pecasEm, screen } from './helpers.js';

// O J1 só tem o 6-6 e abre com ele: bate na hora. Ao mesmo tempo o J2 (0-0, 1-2) não encaixa no 6 e o monte
// está vazio, ou seja, o jogo também estaria trancado. A batida vale primeiro: a mensagem é a de vitória, não a de trancado.
const J1_BATE = { j1: '6-6', j2: '0-0,1-2', monte: '' };

test('TC-DM-17 J1 bate', async () => {
  // J1_BATE: o J1 tem só o 6-6 e começa. Abertura: basta clicar na peça (sem ponta).
  const user = await abrirJogo(J1_BATE);
  await jogar(user, '6-6');

  // Batida: a mensagem é a de vitória, exata. Isso prova que a batida ganhou do trancado.
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Jogador 1 venceu!$/);

  // J1 ficou sem peças na mão.
  expect(screen.getByTestId('qtd-j1')).toHaveTextContent(/^0$/);
  expect(pecasEm('mao-j1')).toHaveLength(0);

  // A mesa tem só a carroça 6-6.
  expect(mesaComoTexto()).toBe('6-6');

  // J2 continua com as 2 peças dele (0-0 e 1-2), e o monte segue vazio.
  expect(screen.getByTestId('qtd-j2')).toHaveTextContent(/^2$/);
  expect(screen.getByTestId('qtd-monte')).toHaveTextContent(/^0$/);
});
