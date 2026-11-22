// Tarefa F6 (Felipe): lacunas de cobertura achadas na auditoria (TC-DM-35 a TC-DM-53).
// Só pela interface (seção 3 do PLANEJAMENTO.md): abrirJogo, data-testid e user-event.
// Sem jest.mock e sem importar js/*.js. Nenhum teste depende de sorte: sempre j1, j2 e monte na URL.
import { abrirJogo, jogar, mesaComoTexto, peca, pecasEm, screen, within, MAOS_PADRAO } from './helpers.js';

const el = (id) => screen.getByTestId(id);

// ---------------------------------------------------------------------------------------------
// Bloco A — defeitos que a suíte anterior deixava passar
// ---------------------------------------------------------------------------------------------

test('TC-DM-35 o Jogador 2 também só abre com a peça obrigatória', async () => {
  // O J2 tem a maior carroça (6-6) e começa. Nos outros TCs de abertura só o J1 abria.
  const user = await abrirJogo({ j1: '1-6,0-4', j2: '6-6,5-6', monte: '' });
  expect(el('vez')).toHaveTextContent(/^Jogador 2$/);

  // Passo 1: o J2 tenta abrir com 5-6 (não é a carroça). Inválida, nada muda.
  await jogar(user, '5-6');
  expect(el('mensagem')).toHaveTextContent(/inválida/i);
  expect(pecasEm('mesa')).toHaveLength(0);
  expect(el('qtd-j2')).toHaveTextContent(/^2$/);
  expect(el('vez')).toHaveTextContent(/^Jogador 2$/);
  expect(within(el('mao-j2')).getByTestId('peca-5-6')).toBeInTheDocument();

  // Passo 2: o J2 abre com a carroça 6-6.
  await jogar(user, '6-6');
  expect(mesaComoTexto()).toBe('6-6');
  expect(el('qtd-j2')).toHaveTextContent(/^1$/);
  expect(el('vez')).toHaveTextContent(/^Jogador 1$/);
});

test('TC-DM-36 mão escondida não joga no meio da partida, nos dois sentidos', async () => {
  // MAOS_PADRAO: J1 abre com 6-6. A mesa não está vazia, então o que barra a jogada é a mão escondida.
  const user = await abrirJogo(MAOS_PADRAO);
  await jogar(user, '6-6');

  // Vez do J2: o 4-6 (mão escondida do J1) encaixaria no 6, mas não pode ser jogado.
  await user.click(peca('4-6'));
  await user.click(el('ponta-direita'));
  expect(mesaComoTexto()).toBe('6-6');
  expect(within(el('mao-j1')).getByTestId('peca-4-6')).toHaveAttribute('data-oculta', 'true');
  expect(el('qtd-j1')).toHaveTextContent(/^6$/);
  expect(el('vez')).toHaveTextContent(/^Jogador 2$/);

  // O J2 joga de verdade: 1-6 na direita. Agora a vez é do J1.
  await jogar(user, '1-6', 'direita');
  expect(mesaComoTexto()).toBe('6-6 6-1');

  // Vez do J1: o 2-6 (mão escondida do J2) encaixaria no 6 da esquerda, mas não pode ser jogado.
  await user.click(peca('2-6'));
  await user.click(el('ponta-esquerda'));
  expect(mesaComoTexto()).toBe('6-6 6-1');
  expect(within(el('mao-j2')).getByTestId('peca-2-6')).toHaveAttribute('data-oculta', 'true');
  expect(el('qtd-j2')).toHaveTextContent(/^6$/);
  expect(el('vez')).toHaveTextContent(/^Jogador 1$/);
});

test('TC-DM-37 peça clicada fica com data-selecionada', async () => {
  // MAOS_PADRAO: J1 abre com 6-6; na vez do J2 clicamos numa peça, sem escolher a ponta ainda.
  const user = await abrirJogo(MAOS_PADRAO);
  await jogar(user, '6-6');
  expect(peca('1-6')).not.toHaveAttribute('data-selecionada', 'true');

  await user.click(peca('1-6'));

  // A peça clicada está selecionada; outra peça da mão não.
  expect(peca('1-6')).toHaveAttribute('data-selecionada', 'true');
  expect(peca('2-6')).not.toHaveAttribute('data-selecionada', 'true');
  // Clicar só na peça não joga nada.
  expect(mesaComoTexto()).toBe('6-6');
  expect(el('vez')).toHaveTextContent(/^Jogador 2$/);
});

test('TC-DM-38 o Jogador 1 também compra do monte', async () => {
  // J1 abre com 6-6 (única carroça); J2 joga 1-6 na direita (pontas 6 e 1). O J1 (0-3) não encaixa em nada.
  const user = await abrirJogo({ j1: '6-6,0-3', j2: '1-6,1-2', monte: '2-5' });
  await jogar(user, '6-6');
  await jogar(user, '1-6', 'direita');

  // Vez do J1, sem jogada e com monte: comprar habilitado, passar desabilitado.
  expect(el('vez')).toHaveTextContent(/^Jogador 1$/);
  expect(el('qtd-j1')).toHaveTextContent(/^1$/);
  expect(el('btn-comprar')).toBeEnabled();
  expect(el('btn-passar')).toBeDisabled();

  await user.click(el('btn-comprar'));

  // A peça de cima do monte (2-5) vai para a mão do J1, visível por ser a vez dele.
  const comprada = within(el('mao-j1')).getByTestId('peca-2-5');
  expect(comprada).toHaveTextContent(/^2-5$/);
  expect(comprada).not.toHaveAttribute('data-oculta', 'true');
  expect(el('qtd-j1')).toHaveTextContent(/^2$/);
  expect(el('qtd-j2')).toHaveTextContent(/^1$/);
  expect(el('qtd-monte')).toHaveTextContent(/^0$/);
  expect(within(el('mao-j2')).queryByTestId('peca-2-5')).toBeNull();
  // Comprar não passa a vez; com o monte vazio e sem jogada, agora é a hora de passar.
  expect(el('vez')).toHaveTextContent(/^Jogador 1$/);
  expect(el('btn-comprar')).toBeDisabled();
  expect(el('btn-passar')).toBeEnabled();
});

test('TC-DM-39 o Jogador 1 também passa a vez', async () => {
  // J1 abre com 6-6; J2 joga 6-1 na direita (pontas 6 e 1). O J1 só tem 0-0 e o monte está vazio.
  // O J2 ainda tem 1-2, que encaixa no 1: o jogo não tranca.
  const user = await abrirJogo({ j1: '6-6,0-0', j2: '1-6,1-2', monte: '' });
  await jogar(user, '6-6');
  await jogar(user, '1-6', 'direita');

  expect(el('vez')).toHaveTextContent(/^Jogador 1$/);
  expect(el('btn-comprar')).toBeDisabled();
  expect(el('btn-passar')).toBeEnabled();

  await user.click(el('btn-passar'));

  expect(el('vez')).toHaveTextContent(/^Jogador 2$/);
  expect(mesaComoTexto()).toBe('6-6 6-1');
  expect(el('qtd-j1')).toHaveTextContent(/^1$/);
  expect(el('mensagem')).not.toHaveTextContent(/venceu|trancado/i);
});

test('TC-DM-40 peça que encaixa numa ponta só já é jogada', async () => {
  // J1 abre com 6-6; J2 joga 1-6 na direita (pontas 6 e 1).
  const user = await abrirJogo({ j1: '6-6,4-6,0-3', j2: '1-6,0-1', monte: '2-5' });
  await jogar(user, '6-6');
  await jogar(user, '1-6', 'direita');

  // Vez do J1: o 4-6 só encaixa na esquerda (6). Tem jogada, então não compra nem passa.
  expect(el('vez')).toHaveTextContent(/^Jogador 1$/);
  expect(el('btn-comprar')).toBeDisabled();
  expect(el('btn-passar')).toBeDisabled();

  await jogar(user, '4-6', 'esquerda');
  expect(mesaComoTexto()).toBe('4-6 6-6 6-1');

  // Vez do J2: pontas 4 e 1. O 0-1 só encaixa na direita (1). Também tem jogada.
  expect(el('vez')).toHaveTextContent(/^Jogador 2$/);
  expect(el('btn-comprar')).toBeDisabled();
  expect(el('btn-passar')).toBeDisabled();
});

// J1 abre com 6-6 e ninguém mais tem 6; o monte está vazio: tranca. Os pontos diferem em só 1.
test.each([
  ['vence o J2 com 4 × 5', { j1: '6-6,2-3', j2: '0-4', monte: '' }, 'Jogador 2', '5', '4'],
  ['vence o J1 com 4 × 5', { j1: '6-6,1-3', j2: '0-5', monte: '' }, 'Jogador 1', '4', '5'],
])('TC-DM-41 trancado com diferença de 1 ponto (%s)', async (_nome, params, vencedor, pontosJ1, pontosJ2) => {
  const user = await abrirJogo(params);
  await jogar(user, '6-6');

  expect(el('mensagem')).toHaveTextContent(new RegExp(`^Jogo trancado! ${vencedor} venceu$`));
  expect(el('pontos-j1')).toHaveTextContent(new RegExp(`^${pontosJ1}$`));
  expect(el('pontos-j2')).toHaveTextContent(new RegExp(`^${pontosJ2}$`));
});

test('TC-DM-42 nova partida na vez do Jogador 2 devolve a vez ao Jogador 1', async () => {
  // MAOS_PADRAO: o J1 abre e a vez passa para o J2; é nessa vez que clicamos em "nova partida".
  const user = await abrirJogo(MAOS_PADRAO);
  await jogar(user, '6-6');
  expect(el('vez')).toHaveTextContent(/^Jogador 2$/);

  await user.click(el('btn-nova-partida'));

  expect(el('vez')).toHaveTextContent(/^Jogador 1$/);
  expect(pecasEm('mesa')).toHaveLength(0);
  expect(el('qtd-j1')).toHaveTextContent(/^7$/);
  expect(el('qtd-j2')).toHaveTextContent(/^7$/);
  expect(el('qtd-monte')).toHaveTextContent(/^14$/);
  expect(el('mensagem').textContent.trim()).toBe('');
  // A mão visível voltou a ser a do J1; a do J2 fica escondida.
  pecasEm('mao-j1').forEach((p) => expect(p).not.toHaveAttribute('data-oculta', 'true'));
  pecasEm('mao-j2').forEach((p) => expect(p).toHaveAttribute('data-oculta', 'true'));
});

test('TC-DM-43 depois do fim, nem a peça que encaixaria é jogada', async () => {
  // O J1 bate com o 6-6. O J2 ainda tem o 1-6, que encaixaria no 6 da mesa.
  const user = await abrirJogo({ j1: '6-6', j2: '1-6,0-0', monte: '' });
  await jogar(user, '6-6');
  expect(el('mensagem')).toHaveTextContent(/^Jogador 1 venceu!$/);

  await user.click(peca('1-6'));
  await user.click(el('ponta-direita'));

  // Nada mudou: a peça continua na mão do J2 e a mesa tem só o 6-6.
  expect(mesaComoTexto()).toBe('6-6');
  expect(within(el('mao-j2')).getByTestId('peca-1-6')).toBeInTheDocument();
  expect(el('qtd-j2')).toHaveTextContent(/^2$/);
  expect(el('mensagem')).toHaveTextContent(/^Jogador 1 venceu!$/);
});

test('TC-DM-44 nova partida depois de trancar reabre o jogo', async () => {
  // Cenário do TC-DM-19: o J1 joga 6-6 e o jogo tranca.
  const user = await abrirJogo({ j1: '6-6,0-1', j2: '2-3,4-5', monte: '' });
  await jogar(user, '6-6');
  expect(el('mensagem')).toHaveTextContent(/^Jogo trancado! Jogador 1 venceu$/);

  await user.click(el('btn-nova-partida'));

  expect(pecasEm('mesa')).toHaveLength(0);
  expect(el('qtd-j1')).toHaveTextContent(/^2$/);
  expect(el('qtd-j2')).toHaveTextContent(/^2$/);
  expect(el('qtd-monte')).toHaveTextContent(/^0$/);
  expect(el('vez')).toHaveTextContent(/^Jogador 1$/);
  expect(el('mensagem').textContent.trim()).toBe('');
  expect(within(el('mao-j1')).getByTestId('peca-6-6')).toHaveTextContent(/^6-6$/);

  // O jogo reabriu: o J1 joga o 6-6 de novo e o jogo tranca outra vez.
  await jogar(user, '6-6');
  expect(mesaComoTexto()).toBe('6-6');
  expect(el('mensagem')).toHaveTextContent(/^Jogo trancado! Jogador 1 venceu$/);
});

// ---------------------------------------------------------------------------------------------
// Bloco B — lacunas achadas lendo o código dos testes
// ---------------------------------------------------------------------------------------------

test('TC-DM-45 abertura recusa outra carroça que não é a maior', async () => {
  // O J1 tem 5-5 e 6-6: a maior carroça é a 6-6. A 5-5 também é carroça, mas não é a obrigatória.
  const user = await abrirJogo({ j1: '5-5,6-6,0-1', j2: '2-6,3-4', monte: '' });

  await jogar(user, '5-5');
  expect(el('mensagem')).toHaveTextContent(/inválida/i);
  expect(pecasEm('mesa')).toHaveLength(0);
  expect(el('qtd-j1')).toHaveTextContent(/^3$/);
  expect(el('vez')).toHaveTextContent(/^Jogador 1$/);

  await jogar(user, '6-6');
  expect(mesaComoTexto()).toBe('6-6');
  expect(el('qtd-j1')).toHaveTextContent(/^2$/);
});

test('TC-DM-46 sem carroça, o Jogador 2 começa pela maior soma e as pontas ficam certas', async () => {
  // Ninguém tem carroça. A maior soma é a do J2 (5-6 = 11), maior que o 4-6 do J1 (10).
  const user = await abrirJogo({ j1: '4-6,2-3', j2: '5-6,0-1', monte: '' });
  expect(el('vez')).toHaveTextContent(/^Jogador 2$/);

  // Abertura obrigatória: 0-1 é recusada.
  await jogar(user, '0-1');
  expect(el('mensagem')).toHaveTextContent(/inválida/i);
  expect(pecasEm('mesa')).toHaveLength(0);

  await jogar(user, '5-6');
  expect(within(el('mesa')).getByTestId('peca-5-6')).toBeInTheDocument();
  expect(el('qtd-j2')).toHaveTextContent(/^1$/);
  expect(el('vez')).toHaveTextContent(/^Jogador 1$/);

  // As duas pontas são o 5 e o 6, mesmo sem a spec dizer qual fica de cada lado (não conferimos a ordem).
  const pontas = [el('ponta-esquerda'), el('ponta-direita')].map((p) => p.textContent.trim()).sort();
  expect(pontas).toEqual(['5', '6']);
});

test('TC-DM-47 depois de bater, não se compra do monte, mesmo com o monte cheio', async () => {
  // O J1 bate com o 6-6. O J2 (0-0, 1-2) não encaixa no 6 e o monte ainda tem 0-1: sem o fim, comprar estaria habilitado.
  const user = await abrirJogo({ j1: '6-6', j2: '0-0,1-2', monte: '0-1' });
  await jogar(user, '6-6');
  expect(el('mensagem')).toHaveTextContent(/^Jogador 1 venceu!$/);

  expect(el('btn-comprar')).toBeDisabled();
  expect(el('btn-passar')).toBeDisabled();
  await user.click(el('btn-comprar'));

  expect(el('qtd-monte')).toHaveTextContent(/^1$/);
  expect(el('qtd-j2')).toHaveTextContent(/^2$/);
  expect(within(el('mao-j2')).queryByTestId('peca-0-1')).toBeNull();
  expect(el('mensagem')).toHaveTextContent(/^Jogador 1 venceu!$/);
});

test('TC-DM-48 o Jogador 1 bate no meio da partida, pela ponta esquerda', async () => {
  // J1 abre com 6-6; J2 joga 6-1 na direita; J1 joga o último 2-6 na esquerda e bate.
  const user = await abrirJogo({ j1: '6-6,2-6', j2: '1-6,0-0', monte: '' });
  await jogar(user, '6-6');
  await jogar(user, '1-6', 'direita');
  expect(mesaComoTexto()).toBe('6-6 6-1');

  await jogar(user, '2-6', 'esquerda');

  expect(mesaComoTexto()).toBe('2-6 6-6 6-1');
  expect(el('mensagem')).toHaveTextContent(/^Jogador 1 venceu!$/);
  expect(el('qtd-j1')).toHaveTextContent(/^0$/);
  expect(el('qtd-j2')).toHaveTextContent(/^1$/);
  expect(el('btn-comprar')).toBeDisabled();
  expect(el('btn-passar')).toBeDisabled();
});

test('TC-DM-49 trancado logo depois da compra do Jogador 2, com vitória do Jogador 2', async () => {
  // J1 abre com 6-6 e fica com 4-5. O J2 (0-1) compra o 2-3, que não encaixa; o monte acaba e ninguém joga.
  // Pontos: J1 = 4+5 = 9; J2 = 0+1+2+3 = 6. Vence o J2.
  const user = await abrirJogo({ j1: '6-6,4-5', j2: '0-1', monte: '2-3' });
  await jogar(user, '6-6');
  expect(el('btn-comprar')).toBeEnabled();

  await user.click(el('btn-comprar'));

  expect(el('qtd-monte')).toHaveTextContent(/^0$/);
  expect(el('qtd-j2')).toHaveTextContent(/^2$/);
  expect(el('mensagem')).toHaveTextContent(/^Jogo trancado! Jogador 2 venceu$/);
  expect(el('pontos-j1')).toHaveTextContent(/^9$/);
  expect(el('pontos-j2')).toHaveTextContent(/^6$/);
});

test('TC-DM-50 empate no trancado com pontos diferentes de 5', async () => {
  // J1 abre com 6-6 e fica com 1-2; o J2 só tem 0-3. Pontos: 3 × 3.
  const user = await abrirJogo({ j1: '6-6,1-2', j2: '0-3', monte: '' });
  await jogar(user, '6-6');

  expect(el('mensagem')).toHaveTextContent(/^Jogo trancado! Empate$/);
  expect(el('pontos-j1')).toHaveTextContent(/^3$/);
  expect(el('pontos-j2')).toHaveTextContent(/^3$/);
});

test('TC-DM-51 comprar duas peças até esvaziar o monte tranca na última compra', async () => {
  // J1 abre com 6-6 e fica com 0-3. O J2 (2-3) compra 4-5 e depois 1-2: nenhuma encaixa no 6.
  // Pontos: J1 = 3; J2 = 2+3+4+5+1+2 = 17. Vence o J1.
  const user = await abrirJogo({ j1: '6-6,0-3', j2: '2-3', monte: '4-5,1-2' });
  await jogar(user, '6-6');

  await user.click(el('btn-comprar'));
  // Depois da 1ª compra o monte ainda tem uma peça: o jogo segue.
  expect(el('qtd-monte')).toHaveTextContent(/^1$/);
  expect(el('qtd-j2')).toHaveTextContent(/^2$/);
  expect(el('mensagem')).not.toHaveTextContent(/trancado/i);
  expect(el('btn-comprar')).toBeEnabled();

  await user.click(el('btn-comprar'));
  expect(el('qtd-monte')).toHaveTextContent(/^0$/);
  expect(el('qtd-j2')).toHaveTextContent(/^3$/);
  expect(el('mensagem')).toHaveTextContent(/^Jogo trancado! Jogador 1 venceu$/);
  expect(el('pontos-j1')).toHaveTextContent(/^3$/);
  expect(el('pontos-j2')).toHaveTextContent(/^17$/);
});

test('TC-DM-52 nova partida devolve o monte na mesma ordem', async () => {
  // O J2 (0-0, 1-2) não encaixa no 6, então compra o topo do monte: o 0-1.
  const user = await abrirJogo({ j1: '6-6,1-1', j2: '0-0,1-2', monte: '0-1,2-6,3-4' });
  await jogar(user, '6-6');
  await user.click(el('btn-comprar'));
  expect(within(el('mao-j2')).getByTestId('peca-0-1')).toBeInTheDocument();

  await user.click(el('btn-nova-partida'));
  expect(el('qtd-monte')).toHaveTextContent(/^3$/);

  // Mesma partida, mesma ordem: o J2 compra o 0-1 de novo (e não o 3-4).
  await jogar(user, '6-6');
  await user.click(el('btn-comprar'));
  expect(within(el('mao-j2')).getByTestId('peca-0-1')).toBeInTheDocument();
  expect(within(el('mao-j2')).queryByTestId('peca-3-4')).toBeNull();
  expect(el('qtd-monte')).toHaveTextContent(/^2$/);
  expect(el('qtd-j2')).toHaveTextContent(/^3$/);
});

test('TC-DM-53 nova partida devolve a vez a quem começa, também quando é o Jogador 2', async () => {
  // O J2 tem a maior carroça (5-5) e começa. Depois de abrir, a vez é do J1; é aí que clicamos em "nova partida".
  const user = await abrirJogo({ j1: '1-5,0-3', j2: '5-5,0-0', monte: '' });
  expect(el('vez')).toHaveTextContent(/^Jogador 2$/);
  await jogar(user, '5-5');
  expect(el('vez')).toHaveTextContent(/^Jogador 1$/);

  await user.click(el('btn-nova-partida'));

  expect(el('vez')).toHaveTextContent(/^Jogador 2$/);
  expect(pecasEm('mesa')).toHaveLength(0);
  expect(el('qtd-j1')).toHaveTextContent(/^2$/);
  expect(el('qtd-j2')).toHaveTextContent(/^2$/);
  expect(el('mensagem').textContent.trim()).toBe('');
  pecasEm('mao-j2').forEach((p) => expect(p).not.toHaveAttribute('data-oculta', 'true'));
  pecasEm('mao-j1').forEach((p) => expect(p).toHaveAttribute('data-oculta', 'true'));

  // O J2 consegue abrir de novo.
  await jogar(user, '5-5');
  expect(mesaComoTexto()).toBe('5-5');
  expect(el('vez')).toHaveTextContent(/^Jogador 1$/);
});
