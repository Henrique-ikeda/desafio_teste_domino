// Tarefas F2 e F3 (Felipe): comprar do monte e passar a vez. Só pela interface (seção 3 do PLANEJAMENTO.md):
// abrirJogo, data-testid e user-event. Sem jest.mock e sem importar js/*.js.
import { abrirJogo, jogar, mesaComoTexto, pecasEm, screen, within, MAOS_PADRAO } from './helpers.js';

test('TC-DM-13 comprar só sem jogada', async () => {
  // MAOS_PADRAO: J1 tem a carroça 6-6 e começa. Comprar só vale sem jogada: com o 6-6 (J1) e com 1-6/2-6 (J2), fica desabilitado.
  const user = await abrirJogo(MAOS_PADRAO);

  // Início: vez do J1, 7 peças em cada mão, 14 no monte, e a peça 6-6 visível na mão dele.
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Jogador 1$/);
  expect(screen.getByTestId('qtd-monte')).toHaveTextContent(/^14$/);
  expect(screen.getByTestId('qtd-j1')).toHaveTextContent(/^7$/);
  expect(within(screen.getByTestId('mao-j1')).getByTestId('peca-6-6')).toHaveTextContent(/^6-6$/);

  // Com o 6-6 o J1 pode jogar, então não pode comprar.
  expect(screen.getByTestId('btn-comprar')).toBeDisabled();

  // J1 joga 6-6 (abertura, sem ponta). Agora é a vez do J2.
  await jogar(user, '6-6');

  // Depois do 6-6: mesa com a carroça, vez do J2, nada comprado do monte.
  expect(mesaComoTexto()).toBe('6-6');
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Jogador 2$/);
  expect(screen.getByTestId('qtd-monte')).toHaveTextContent(/^14$/);
  expect(screen.getByTestId('qtd-j2')).toHaveTextContent(/^7$/);

  // Mão do J2 visível (é a vez dele): 1-6 e 2-6 são as peças que encaixam no 6.
  expect(within(screen.getByTestId('mao-j2')).getByTestId('peca-1-6')).toHaveTextContent(/^1-6$/);
  expect(within(screen.getByTestId('mao-j2')).getByTestId('peca-2-6')).toHaveTextContent(/^2-6$/);

  // J2 tem jogada, então o botão de comprar continua desabilitado.
  expect(screen.getByTestId('btn-comprar')).toBeDisabled();
});

// J1 abre com 6-6 (maior carroça). O J2 (0-0, 1-2) não tem 6: compra 0-1 (ainda sem 6) e depois 2-6 (encaixa).
const COMPRA_ATE_JOGAR = { j1: '6-6,1-1', j2: '0-0,1-2', monte: '0-1,2-6,3-4' };

test('TC-DM-14 comprar até poder jogar', async () => {
  // COMPRA_ATE_JOGAR: depois do 6-6 o J2 não tem jogada, então compra do monte até sair o 2-6.
  const user = await abrirJogo(COMPRA_ATE_JOGAR);

  // J1 joga 6-6 (abertura, sem ponta). Agora é a vez do J2.
  await jogar(user, '6-6');

  // Depois do 6-6, antes da 1ª compra: vez do J2, 2 peças na mão dele, 3 no monte.
  // Sem jogada, então comprar está habilitado; há monte, então passar está desabilitado.
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Jogador 2$/);
  expect(screen.getByTestId('qtd-j2')).toHaveTextContent(/^2$/);
  expect(screen.getByTestId('qtd-monte')).toHaveTextContent(/^3$/);
  expect(screen.getByTestId('btn-comprar')).toBeEnabled();
  expect(screen.getByTestId('btn-passar')).toBeDisabled();

  // 1ª compra: sai o 0-1 (topo do monte) e vai para a mão do J2, visível por ser a vez dele.
  await user.click(screen.getByTestId('btn-comprar'));

  // Depois da 1ª compra: 0-1 na mão do J2, 3 peças na mão, 2 no monte.
  // Ainda sem 6 na mão, então comprar continua habilitado e a vez segue com o J2.
  expect(within(screen.getByTestId('mao-j2')).getByTestId('peca-0-1')).toHaveTextContent(/^0-1$/);
  expect(screen.getByTestId('qtd-j2')).toHaveTextContent(/^3$/);
  expect(screen.getByTestId('qtd-monte')).toHaveTextContent(/^2$/);
  expect(screen.getByTestId('btn-comprar')).toBeEnabled();
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Jogador 2$/);

  // 2ª compra: sai o 2-6, que encaixa no 6 da mesa.
  await user.click(screen.getByTestId('btn-comprar'));

  // Depois da 2ª compra: 2-6 na mão do J2, 4 peças na mão, 1 no monte.
  // Agora há jogada, então comprar fica desabilitado.
  expect(within(screen.getByTestId('mao-j2')).getByTestId('peca-2-6')).toHaveTextContent(/^2-6$/);
  expect(screen.getByTestId('qtd-j2')).toHaveTextContent(/^4$/);
  expect(screen.getByTestId('qtd-monte')).toHaveTextContent(/^1$/);
  expect(screen.getByTestId('btn-comprar')).toBeDisabled();

  // J2 joga 2-6 na direita (a peça gira para 6-2).
  await jogar(user, '2-6', 'direita');

  // Depois de jogar 2-6 na direita: mesa com 6-6 e 6-2, ponta direita = 2, J2 com 3 peças, vez do J1.
  expect(mesaComoTexto()).toBe('6-6 6-2');
  expect(screen.getByTestId('ponta-direita')).toHaveTextContent(/^2$/);
  expect(screen.getByTestId('qtd-j2')).toHaveTextContent(/^3$/);
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Jogador 1$/);
});

test('TC-DM-23 compra vai para a mão certa e fica visível', async () => {
  // COMPRA_ATE_JOGAR: J1 abre com 6-6; o J2 (0-0, 1-2) compra uma vez e recebe o topo do monte (0-1).
  const user = await abrirJogo(COMPRA_ATE_JOGAR);

  // J1 joga 6-6 (abertura, sem ponta). Agora é a vez do J2.
  await jogar(user, '6-6');

  // Antes da compra: vez do J2, 3 peças no monte, 1 peça na mão do J1.
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Jogador 2$/);
  expect(screen.getByTestId('qtd-monte')).toHaveTextContent(/^3$/);
  expect(screen.getByTestId('qtd-j1')).toHaveTextContent(/^1$/);

  // J2 compra uma vez: sai o 0-1 (topo do monte).
  await user.click(screen.getByTestId('btn-comprar'));

  // Depois da compra: 0-1 na mão do J2 e visível (não oculta), por ser a vez dele.
  const comprada = within(screen.getByTestId('mao-j2')).getByTestId('peca-0-1');
  expect(comprada).toHaveTextContent(/^0-1$/);
  expect(comprada).not.toHaveAttribute('data-oculta', 'true');

  // Contagens: J2 com 3 peças na mão, 2 no monte. Comprar não passa a vez.
  expect(screen.getByTestId('qtd-j2')).toHaveTextContent(/^3$/);
  expect(screen.getByTestId('qtd-monte')).toHaveTextContent(/^2$/);
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Jogador 2$/);

  // A peça não foi para a mão do J1: sem 0-1 nela, e a contagem dele continua 1.
  expect(within(screen.getByTestId('mao-j1')).queryByTestId('peca-0-1')).toBeNull();
  expect(screen.getByTestId('qtd-j1')).toHaveTextContent(/^1$/);
  expect(pecasEm('mao-j1')).toHaveLength(1);

  // A mão visível do J2 tem exatamente as 3 peças: 0-0, 0-1 e 1-2.
  expect(pecasEm('mao-j2').map((p) => p.textContent.trim()).sort()).toEqual(['0-0', '0-1', '1-2']);
});

// J1 abre com 6-6. O J2 (0-0, 1-2) não tem 6 e o monte está vazio: só pode passar.
// O jogo não tranca, porque o J1 ainda tem 1-6.
const PASSAR_MONTE_VAZIO = { j1: '6-6,1-6,3-3', j2: '0-0,1-2', monte: '' };

test('TC-DM-15 passar com o monte vazio', async () => {
  // PASSAR_MONTE_VAZIO: monte vazio e o J2 sem 6, então passar habilita e comprar não.
  const user = await abrirJogo(PASSAR_MONTE_VAZIO);

  // J1 joga 6-6 (abertura, sem ponta). Agora é a vez do J2.
  await jogar(user, '6-6');

  // Antes de passar: mesa com 6-6, vez do J2, monte vazio, 2 peças na mão do J2.
  // Sem jogada e sem monte: comprar desabilitado, passar habilitado.
  expect(mesaComoTexto()).toBe('6-6');
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Jogador 2$/);
  expect(screen.getByTestId('qtd-monte')).toHaveTextContent(/^0$/);
  expect(screen.getByTestId('qtd-j2')).toHaveTextContent(/^2$/);
  expect(screen.getByTestId('btn-comprar')).toBeDisabled();
  expect(screen.getByTestId('btn-passar')).toBeEnabled();

  // J2 passa a vez.
  await user.click(screen.getByTestId('btn-passar'));

  // Depois de passar: vez volta para o J1, J2 continua com 2 peças, ninguém venceu.
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Jogador 1$/);
  expect(screen.getByTestId('qtd-j2')).toHaveTextContent(/^2$/);
  expect(screen.getByTestId('mensagem')).not.toHaveTextContent(/venceu/);

  // Mesa continua 6-6 e o J1 ainda tem 2 peças (1-6 e 3-3).
  expect(mesaComoTexto()).toBe('6-6');
  expect(screen.getByTestId('qtd-j1')).toHaveTextContent(/^2$/);

  // Prova de que não trancou: o J1 ainda joga o 1-6 na direita.
  await jogar(user, '1-6', 'direita');

  // Depois de jogar 1-6: mesa "6-6 6-1", J1 com 1 peça, vez do J2.
  expect(mesaComoTexto()).toBe('6-6 6-1');
  expect(screen.getByTestId('qtd-j1')).toHaveTextContent(/^1$/);
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Jogador 2$/);
});
