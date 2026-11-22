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
