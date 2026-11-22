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

// O J1 abre com 6-6 e fica com 0-0. O J2 só tem o 1-6: encaixa na direita e bate.
const J2_BATE = { j1: '6-6,0-0', j2: '1-6', monte: '' };

test('TC-DM-18 J2 bate', async () => {
  // J2_BATE: o J1 tem 6-6 e 0-0, o J2 tem só 1-6 e o monte está vazio. Abertura: o J1 clica no 6-6.
  const user = await abrirJogo(J2_BATE);
  await jogar(user, '6-6');

  // Antes da jogada do J2: é a vez dele, e o J1 ainda tem 0-0, então o jogo não acabou.
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Jogador 2$/);
  expect(screen.getByTestId('mensagem')).not.toHaveTextContent(/venceu/);

  // O J2 joga 1-6 na ponta direita: encaixa e bate, já que ficou sem peças.
  await jogar(user, '1-6', 'direita');

  // Batida: a mensagem é a de vitória do J2, exata.
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Jogador 2 venceu!$/);

  // J2 ficou sem peças na mão.
  expect(screen.getByTestId('qtd-j2')).toHaveTextContent(/^0$/);
  expect(pecasEm('mao-j2')).toHaveLength(0);

  // A mesa tem 6-6 e o 1-6 girado para 6-1 na direita.
  expect(mesaComoTexto()).toBe('6-6 6-1');

  // J1 continua com a peça 0-0 que não jogou.
  expect(screen.getByTestId('qtd-j1')).toHaveTextContent(/^1$/);
});
