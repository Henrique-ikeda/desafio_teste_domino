// Tarefas F2 e F3 (Felipe): comprar do monte e passar a vez. Só pela interface (seção 3 do PLANEJAMENTO.md):
// abrirJogo, data-testid e user-event. Sem jest.mock e sem importar js/*.js.
import { abrirJogo, jogar, mesaComoTexto, screen, within, MAOS_PADRAO } from './helpers.js';

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
