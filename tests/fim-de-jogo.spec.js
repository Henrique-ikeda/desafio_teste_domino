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

// O J1 abre com 6-6. Depois ninguém tem 6 (J1: 0-1; J2: 2-3, 4-5) e o monte está vazio: tranca logo depois da jogada.
// Pontos: J1 = 0+1 = 1; J2 = 2+3+4+5 = 14. Vence quem tem menos: o J1.
const TRANCA_J1_VENCE = { j1: '6-6,0-1', j2: '2-3,4-5', monte: '' };

test('TC-DM-19 jogo trancado', async () => {
  // TRANCA_J1_VENCE: o J1 tem 6-6 e 0-1, o J2 tem 2-3 e 4-5, o monte está vazio. Abertura: basta clicar no 6-6.
  const user = await abrirJogo(TRANCA_J1_VENCE);
  await jogar(user, '6-6');

  // Trancado logo depois do 6-6: a mensagem é a de jogo trancado com vitória do J1, exata.
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Jogo trancado! Jogador 1 venceu$/);

  // Pontos: o J1 soma 1 (0 + 1) e o J2 soma 14 (2 + 3 + 4 + 5). Menos pontos vence.
  expect(screen.getByTestId('pontos-j1')).toHaveTextContent(/^1$/);
  expect(screen.getByTestId('pontos-j2')).toHaveTextContent(/^14$/);

  // Monte segue vazio: ninguém comprou.
  expect(screen.getByTestId('qtd-monte')).toHaveTextContent(/^0$/);

  // A mesa tem só a carroça 6-6.
  expect(mesaComoTexto()).toBe('6-6');

  // J1 ficou com a peça 0-1, e J2 segue com as 2 peças dele (2-3 e 4-5).
  expect(screen.getByTestId('qtd-j1')).toHaveTextContent(/^1$/);
  expect(screen.getByTestId('qtd-j2')).toHaveTextContent(/^2$/);
});

// O J1 abre com 6-6. Depois ninguém tem 6 (J1: 1-4; J2: 2-3) e o monte está vazio: tranca.
// Pontos: J1 = 1+4 = 5; J2 = 2+3 = 5. Pontos iguais: empate.
const TRANCA_EMPATE = { j1: '6-6,1-4', j2: '2-3', monte: '' };

test('TC-DM-20 jogo trancado empatado', async () => {
  // TRANCA_EMPATE: o J1 tem 6-6 e 1-4, o J2 tem 2-3, o monte está vazio. Abertura: basta clicar no 6-6.
  const user = await abrirJogo(TRANCA_EMPATE);
  await jogar(user, '6-6');

  // Trancado com pontos iguais: a mensagem é a de empate, exata.
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Jogo trancado! Empate$/);

  // Pontos: o J1 soma 5 (1 + 4) e o J2 soma 5 (2 + 3). Empate.
  expect(screen.getByTestId('pontos-j1')).toHaveTextContent(/^5$/);
  expect(screen.getByTestId('pontos-j2')).toHaveTextContent(/^5$/);

  // Monte segue vazio: ninguém comprou.
  expect(screen.getByTestId('qtd-monte')).toHaveTextContent(/^0$/);

  // A mesa tem só a carroça 6-6.
  expect(mesaComoTexto()).toBe('6-6');

  // J1 ficou com a peça 1-4, e J2 segue com a peça 2-3.
  expect(screen.getByTestId('qtd-j1')).toHaveTextContent(/^1$/);
  expect(screen.getByTestId('qtd-j2')).toHaveTextContent(/^1$/);
});

// O J1 abre com 6-6 (o J2 não tem carroça). Depois ninguém tem 6 (J1: 4-5; J2: 0-1) e o monte está vazio: tranca.
// Pontos: J1 = 4+5 = 9; J2 = 0+1 = 1. Vence quem tem menos: o J2 (o TC-DM-19 só cobre a vitória do J1).
const TRANCA_J2_VENCE = { j1: '6-6,4-5', j2: '0-1', monte: '' };

test('TC-DM-25 trancado com vitória do Jogador 2', async () => {
  // TRANCA_J2_VENCE: o J1 tem 6-6 e 4-5, o J2 tem 0-1, o monte está vazio. Abertura: basta clicar no 6-6.
  const user = await abrirJogo(TRANCA_J2_VENCE);
  await jogar(user, '6-6');

  // Trancado logo depois do 6-6: a mensagem é a de jogo trancado com vitória do J2, exata.
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Jogo trancado! Jogador 2 venceu$/);

  // Pontos: o J1 soma 9 (4 + 5) e o J2 soma 1 (0 + 1). Menos pontos vence.
  expect(screen.getByTestId('pontos-j1')).toHaveTextContent(/^9$/);
  expect(screen.getByTestId('pontos-j2')).toHaveTextContent(/^1$/);

  // Monte segue vazio: ninguém comprou.
  expect(screen.getByTestId('qtd-monte')).toHaveTextContent(/^0$/);

  // A mesa tem só a carroça 6-6.
  expect(mesaComoTexto()).toBe('6-6');

  // J1 jogou o 6-6 e ficou com a peça 4-5; J2 segue com a peça 0-1 que não jogou.
  expect(screen.getByTestId('qtd-j1')).toHaveTextContent(/^1$/);
  expect(screen.getByTestId('qtd-j2')).toHaveTextContent(/^1$/);
});
