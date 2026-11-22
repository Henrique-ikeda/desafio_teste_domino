// Tarefas F4 e F5 (Felipe): bater, jogo trancado, fim de jogo e nova partida. Só pela interface (seção 3 do PLANEJAMENTO.md):
// abrirJogo, data-testid e user-event. Sem jest.mock e sem importar js/*.js.
import { abrirJogo, J1_PADRAO, J2_PADRAO, jogar, MAOS_PADRAO, mesaComoTexto, pecasEm, screen, within } from './helpers.js';

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

// O J1 abre com 6-6. O J2 (0-0) não tem 6 e o monte está vazio: passa. O jogo ainda não tranca, porque o J1 tem 3-6.
// O J1 joga 3-6 na direita (pontas 6 e 3) e aí ninguém encaixa (J1: 1-2; J2: 0-0): tranca.
// Pontos: J1 = 1+2 = 3; J2 = 0+0 = 0. Vence o J2.
const TRANCA_DEPOIS_DO_PASSE = { j1: '6-6,3-6,1-2', j2: '0-0', monte: '' };

test('TC-DM-26 trancado depois de um passe', async () => {
  // TRANCA_DEPOIS_DO_PASSE: o J1 tem 6-6, 3-6 e 1-2; o J2 tem 0-0; o monte está vazio. Abertura: basta clicar no 6-6.
  const user = await abrirJogo(TRANCA_DEPOIS_DO_PASSE);
  await jogar(user, '6-6');

  // Depois do 6-6, antes do passe: é a vez do J2, o botão de passar está habilitado e o J2 tem 1 peça (0-0).
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Jogador 2$/);
  expect(screen.getByTestId('btn-passar')).toBeEnabled();
  expect(screen.getByTestId('qtd-j2')).toHaveTextContent(/^1$/);

  // O J2 passa a vez: não tem 6 e o monte está vazio.
  await user.click(screen.getByTestId('btn-passar'));

  // Depois do passe: a vez voltou para o J1, a mensagem está vazia (o jogo não trancou) e a mesa segue com só o 6-6.
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Jogador 1$/);
  expect(screen.getByTestId('mensagem').textContent.trim()).toBe('');
  expect(mesaComoTexto()).toBe('6-6');
  // O J1 ainda tem as 2 peças dele (3-6 e 1-2) e pode jogar.
  expect(screen.getByTestId('qtd-j1')).toHaveTextContent(/^2$/);

  // O J1 joga 3-6 na ponta direita: a mesa fica 6-6 6-3, com as pontas 6 e 3.
  await jogar(user, '3-6', 'direita');

  // Trancado: a mesa tem 6-6 6-3, na ordem certa.
  expect(mesaComoTexto()).toBe('6-6 6-3');
  expect(screen.getByTestId('ponta-esquerda')).toHaveTextContent(/^6$/);
  expect(screen.getByTestId('ponta-direita')).toHaveTextContent(/^3$/);

  // A mensagem é a de jogo trancado com vitória do J2, exata.
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Jogo trancado! Jogador 2 venceu$/);

  // Pontos: o J1 soma 3 (1 + 2) e o J2 soma 0 (0 + 0). Menos pontos vence.
  expect(screen.getByTestId('pontos-j1')).toHaveTextContent(/^3$/);
  expect(screen.getByTestId('pontos-j2')).toHaveTextContent(/^0$/);

  // J1 ficou com 1 peça (1-2) e J2 segue com 1 peça (0-0).
  expect(screen.getByTestId('qtd-j1')).toHaveTextContent(/^1$/);
  expect(screen.getByTestId('qtd-j2')).toHaveTextContent(/^1$/);
});

// O J1 abre com 6-6 e fica com 0-1. O J2 (2-3) não tem 6 e compra a última peça do monte (4-5), que também não encaixa.
// O monte acaba e o J1 (0-1) também não tem 6: ninguém pode jogar, então tranca na hora, logo depois da COMPRA,
// sem o J2 precisar passar (o TC-DM-19 tranca depois de uma jogada; o TC-DM-24 é o contrário: o outro ainda joga).
// Pontos: J1 = 0+1 = 1; J2 = 2+3+4+5 = 14. Vence o J1.
const TRANCA_DEPOIS_DA_COMPRA = { j1: '6-6,0-1', j2: '2-3', monte: '4-5' };

test('TC-DM-30 trancado logo depois de uma compra', async () => {
  // TRANCA_DEPOIS_DA_COMPRA: o J1 tem 6-6 e 0-1, o J2 tem 2-3, o monte tem só 4-5. Abertura: o J1 clica no 6-6.
  const user = await abrirJogo(TRANCA_DEPOIS_DA_COMPRA);
  await jogar(user, '6-6');

  // Antes da compra: é a vez do J2, o monte tem 1 peça e o botão de comprar está habilitado (o J2 não tem 6).
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Jogador 2$/);
  expect(screen.getByTestId('qtd-monte')).toHaveTextContent(/^1$/);
  expect(screen.getByTestId('btn-comprar')).toBeEnabled();

  // O J2 compra uma vez: pega o 4-5, que não encaixa, e o monte acaba. Ninguém pode jogar: o jogo tranca na hora.
  await user.click(screen.getByTestId('btn-comprar'));

  // Depois da compra: o monte ficou vazio e o J2 tem 2 peças (2-3 e 4-5).
  expect(screen.getByTestId('qtd-monte')).toHaveTextContent(/^0$/);
  expect(screen.getByTestId('qtd-j2')).toHaveTextContent(/^2$/);

  // Trancado sem o J2 passar: a mensagem é a de jogo trancado com vitória do J1, exata.
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Jogo trancado! Jogador 1 venceu$/);

  // Pontos: o J1 soma 1 (0 + 1) e o J2 soma 14 (2 + 3 + 4 + 5). Menos pontos vence.
  expect(screen.getByTestId('pontos-j1')).toHaveTextContent(/^1$/);
  expect(screen.getByTestId('pontos-j2')).toHaveTextContent(/^14$/);

  // A mesa tem só a carroça 6-6.
  expect(mesaComoTexto()).toBe('6-6');

  // Fim de jogo: nada mais pode ser passado nem comprado.
  expect(screen.getByTestId('btn-passar')).toBeDisabled();
  expect(screen.getByTestId('btn-comprar')).toBeDisabled();
});

test('TC-DM-21 nada funciona após o fim', async () => {
  // J2_BATE: o J1 tem 6-6 e 0-0, o J2 tem só 1-6. Abertura: o J1 clica no 6-6.
  const user = await abrirJogo(J2_BATE);
  await jogar(user, '6-6');

  // O J2 joga 1-6 na ponta direita: encaixa e bate. A partir daqui o jogo acabou.
  await jogar(user, '1-6', 'direita');

  // Batida: a mensagem é a de vitória do J2, exata.
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Jogador 2 venceu!$/);

  // Depois da batida: os dois botões ficam desabilitados e a mesa tem 6-6 e 6-1.
  expect(screen.getByTestId('btn-comprar')).toBeDisabled();
  expect(screen.getByTestId('btn-passar')).toBeDisabled();
  expect(mesaComoTexto()).toBe('6-6 6-1');

  // O J1 tenta jogar o 0-0 (que não encaixa em nada) e clica na ponta direita. Nada muda.
  await user.click(screen.getByTestId('peca-0-0'));
  await user.click(screen.getByTestId('ponta-direita'));

  // A peça 0-0 continua na mão do J1, e o J1 segue com 1 peça.
  expect(within(screen.getByTestId('mao-j1')).getByTestId('peca-0-0')).toBeInTheDocument();
  expect(screen.getByTestId('qtd-j1')).toHaveTextContent(/^1$/);

  // A mesa continua 6-6 6-1 e a mensagem continua a de vitória do J2.
  expect(mesaComoTexto()).toBe('6-6 6-1');
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Jogador 2 venceu!$/);

  // Tenta comprar e passar depois do fim. Os botões estão desabilitados, então o clique não faz nada.
  await user.click(screen.getByTestId('btn-comprar'));
  await user.click(screen.getByTestId('btn-passar'));

  // O monte segue vazio, a mensagem segue a de vitória do J2, a mesa segue igual e os botões seguem desabilitados.
  expect(screen.getByTestId('qtd-monte')).toHaveTextContent(/^0$/);
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Jogador 2 venceu!$/);
  expect(mesaComoTexto()).toBe('6-6 6-1');
  expect(screen.getByTestId('btn-comprar')).toBeDisabled();
  expect(screen.getByTestId('btn-passar')).toBeDisabled();
});

// MAOS_PADRAO (seção 3): J1 = J1_PADRAO (7 peças, começa com 6-6), J2 = J2_PADRAO, monte = MONTE_PADRAO (14 peças).
test('TC-DM-22 nova partida', async () => {
  // MAOS_PADRAO: distribuição fixa. Abertura: o J1 clica no 6-6.
  const user = await abrirJogo(MAOS_PADRAO);
  await jogar(user, '6-6');

  // O J2 joga 1-6 na ponta direita, então a partida andou: mesa 6-6 6-1, contagens 6 e 6, e é a vez do J1.
  await jogar(user, '1-6', 'direita');

  // Antes da nova partida: prova de que a partida andou.
  expect(mesaComoTexto()).toBe('6-6 6-1');
  expect(screen.getByTestId('qtd-j1')).toHaveTextContent(/^6$/);
  expect(screen.getByTestId('qtd-j2')).toHaveTextContent(/^6$/);
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Jogador 1$/);

  // Clica em "nova partida": o jogo volta à distribuição inicial.
  await user.click(screen.getByTestId('btn-nova-partida'));

  // Mesa zerada: nenhuma peça na mesa e as duas pontas vazias.
  expect(pecasEm('mesa')).toHaveLength(0);
  expect(screen.getByTestId('ponta-esquerda').textContent.trim()).toBe('');
  expect(screen.getByTestId('ponta-direita').textContent.trim()).toBe('');

  // Contagens da partida nova: 7 na mão de cada jogador, 14 no monte, e é a vez do J1.
  expect(screen.getByTestId('qtd-j1')).toHaveTextContent(/^7$/);
  expect(screen.getByTestId('qtd-j2')).toHaveTextContent(/^7$/);
  expect(screen.getByTestId('qtd-monte')).toHaveTextContent(/^14$/);
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Jogador 1$/);

  // A mão do J1 é a de J1_PADRAO de novo: mesmos textos e mesmos data-testid, todas visíveis.
  const maoJ1 = pecasEm('mao-j1');
  expect(maoJ1.map((p) => p.textContent.trim()).sort()).toEqual(J1_PADRAO.split(',').sort());
  expect(maoJ1.map((p) => p.getAttribute('data-testid')).sort()).toEqual(
    J1_PADRAO.split(',').map((ab) => `peca-${ab}`).sort(),
  );
  maoJ1.forEach((p) => expect(p).not.toHaveAttribute('data-oculta', 'true'));

  // A mão do J2 tem 7 peças, todas viradas (data-oculta="true") e sem texto.
  const maoJ2 = pecasEm('mao-j2');
  expect(maoJ2).toHaveLength(7);
  maoJ2.forEach((p) => {
    expect(p).toHaveAttribute('data-oculta', 'true');
    expect(p.textContent.trim()).toBe('');
  });
  // E são as mesmas 7 peças de J2_PADRAO (seção 1: "as mesmas mãos"); o data-testid existe mesmo escondida (seção 3).
  expect(maoJ2.map((p) => p.getAttribute('data-testid')).sort()).toEqual(
    J2_PADRAO.split(',').map((ab) => `peca-${ab}`).sort(),
  );

  // Sem mensagem: a partida nova começou sem vencedor nem trancamento.
  expect(screen.getByTestId('mensagem').textContent.trim()).toBe('');

  // O J1 consegue abrir de novo: joga o 6-6 na mesa vazia e passa a vez para o J2.
  await jogar(user, '6-6');
  expect(mesaComoTexto()).toBe('6-6');
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Jogador 2$/);
});

// O cenário é o do TC-DM-19 (TRANCA_J1_VENCE): o J1 joga 6-6 e o jogo tranca. Depois do fim, nada pode ser jogado, comprado ou passado.
test('TC-DM-27 nada funciona depois de trancar', async () => {
  // TRANCA_J1_VENCE: o J1 tem 6-6 e 0-1, o J2 tem 2-3 e 4-5, o monte está vazio. Abertura: o J1 clica no 6-6.
  const user = await abrirJogo(TRANCA_J1_VENCE);
  await jogar(user, '6-6');

  // Logo depois do 6-6 o jogo tranca: a mensagem é a de vitória do J1 por trancamento, exata.
  // Os dois botões ficam desabilitados: ninguém tem jogada e o monte está vazio (sem o fim, o passar estaria habilitado).
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Jogo trancado! Jogador 1 venceu$/);
  expect(screen.getByTestId('btn-comprar')).toBeDisabled();
  expect(screen.getByTestId('btn-passar')).toBeDisabled();

  // O J1 tenta jogar a peça 0-1 na ponta direita. Nada pode mudar.
  await user.click(screen.getByTestId('peca-0-1'));
  await user.click(screen.getByTestId('ponta-direita'));

  // A peça 0-1 continua na mão do J1, o J1 segue com 1 peça, a mesa segue só com o 6-6 e a mensagem é a mesma.
  expect(within(screen.getByTestId('mao-j1')).getByTestId('peca-0-1')).toBeInTheDocument();
  expect(screen.getByTestId('qtd-j1')).toHaveTextContent(/^1$/);
  expect(mesaComoTexto()).toBe('6-6');
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Jogo trancado! Jogador 1 venceu$/);

  // Tenta comprar e passar depois do fim. Os botões estão desabilitados, então o clique não faz nada.
  await user.click(screen.getByTestId('btn-comprar'));
  await user.click(screen.getByTestId('btn-passar'));

  // O monte segue vazio, o J2 segue com 2 peças, os pontos seguem os mesmos, a mensagem segue a mesma e os botões seguem desabilitados.
  expect(screen.getByTestId('qtd-monte')).toHaveTextContent(/^0$/);
  expect(screen.getByTestId('qtd-j2')).toHaveTextContent(/^2$/);
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Jogo trancado! Jogador 1 venceu$/);
  expect(screen.getByTestId('pontos-j1')).toHaveTextContent(/^1$/);
  expect(screen.getByTestId('pontos-j2')).toHaveTextContent(/^14$/);
  expect(screen.getByTestId('btn-comprar')).toBeDisabled();
  expect(screen.getByTestId('btn-passar')).toBeDisabled();
});

// O cenário é o do TC-DM-18 (J2_BATE): o J2 bate e a partida acaba. Ao clicar em "nova partida", o jogo volta às mãos da URL (J2_BATE), e o jogo reabre.
test('TC-DM-28 nova partida depois do fim reabre o jogo', async () => {
  // J2_BATE: o J1 tem 6-6 e 0-0, o J2 tem só 1-6, o monte está vazio. Abertura: o J1 clica no 6-6.
  const user = await abrirJogo(J2_BATE);
  await jogar(user, '6-6');

  // O J2 joga 1-6 na ponta direita: encaixa e bate. O jogo acaba aqui.
  await jogar(user, '1-6', 'direita');

  // Depois da batida (prova de que o jogo acabou): a mensagem é a de vitória do J2, exata.
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Jogador 2 venceu!$/);
  expect(screen.getByTestId('qtd-j2')).toHaveTextContent(/^0$/);

  // Clica em "nova partida": o jogo volta às mãos iniciais de J2_BATE.
  await user.click(screen.getByTestId('btn-nova-partida'));

  // Antes do 6-6: mesa sem peças, contagens da distribuição inicial, é a vez do J1 e a mensagem está vazia.
  expect(pecasEm('mesa')).toHaveLength(0);
  expect(screen.getByTestId('qtd-j1')).toHaveTextContent(/^2$/);
  expect(screen.getByTestId('qtd-j2')).toHaveTextContent(/^1$/);
  expect(screen.getByTestId('qtd-monte')).toHaveTextContent(/^0$/);
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Jogador 1$/);
  expect(screen.getByTestId('mensagem').textContent.trim()).toBe('');

  // As mãos voltaram: o J1 tem o 6-6 e o 0-0 de novo, e o J2 tem o 1-6 de novo, virado (oculto).
  expect(within(screen.getByTestId('mao-j1')).getByTestId('peca-6-6')).toHaveTextContent(/^6-6$/);
  expect(within(screen.getByTestId('mao-j1')).getByTestId('peca-0-0')).toHaveTextContent(/^0-0$/);
  expect(within(screen.getByTestId('mao-j2')).getByTestId('peca-1-6')).toHaveAttribute('data-oculta', 'true');

  // O J1 joga o 6-6 de novo: a partida reabriu e a mesa recebe a carroça.
  await jogar(user, '6-6');

  // Depois do 6-6: a mesa tem só o 6-6, é a vez do J2 e o J1 ficou com 1 peça (o 0-0).
  expect(mesaComoTexto()).toBe('6-6');
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Jogador 2$/);
  expect(screen.getByTestId('qtd-j1')).toHaveTextContent(/^1$/);
});

// TC-DM-29 (seção 5): sem parâmetros, a distribuição é sorteada. Não dá para saber de antemão quem começa nem quais peças
// saíram, então o teste lê a mão visível de quem está na vez, joga a peça obrigatória da abertura (seção 1) e confere a
// nova partida só com o que vale para qualquer sorteio.

// Lê as peças de um lugar como [a, b], a partir do data-testid peca-A-B.
function pecasComValores(lugar) {
  return pecasEm(lugar).map((p) => {
    const m = p.getAttribute('data-testid').match(/^peca-(\d)-(\d)$/);
    return [Number(m[1]), Number(m[2])];
  });
}

// Peça obrigatória da abertura (seção 1): a maior carroça da mão; sem carroça, as peças de maior soma (pode haver empate).
function candidatasDaAbertura(mao) {
  const carrocas = mao.filter(([a, b]) => a === b);
  if (carrocas.length > 0) {
    const maior = Math.max(...carrocas.map(([a]) => a));
    return [[maior, maior]];
  }
  const maiorSoma = Math.max(...mao.map(([a, b]) => a + b));
  return mao.filter(([a, b]) => a + b === maiorSoma);
}

test('TC-DM-29 nova partida sem parâmetros', async () => {
  // Sem parâmetros: distribuição sorteada. Só conferimos o que vale para qualquer sorteio.
  const user = await abrirJogo();

  // Quem está na vez é quem começa, então a peça obrigatória está na mão visível dele.
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Jogador [12]$/);
  const quemComeca = screen.getByTestId('vez').textContent.trim();
  const maoVisivel = quemComeca === 'Jogador 1' ? 'mao-j1' : 'mao-j2';
  const contadorDeQuemComeca = quemComeca === 'Jogador 1' ? 'qtd-j1' : 'qtd-j2';

  // Tenta cada candidata da abertura até uma ir para a mesa. Uma candidata inválida não muda nada, então a próxima é tentada.
  for (const [a, b] of candidatasDaAbertura(pecasComValores(maoVisivel))) {
    await user.click(screen.getByTestId(`peca-${a}-${b}`));
    if (pecasEm('mesa').length === 1) break;
  }

  // Prova de que a partida andou: a abertura foi para a mesa e quem começou ficou com 6 peças.
  expect(pecasEm('mesa')).toHaveLength(1);
  expect(screen.getByTestId(contadorDeQuemComeca)).toHaveTextContent(/^6$/);

  // Clica em "nova partida".
  await user.click(screen.getByTestId('btn-nova-partida'));

  // Contagens da partida nova: 7 na mão de cada jogador e 14 no monte.
  expect(screen.getByTestId('qtd-j1')).toHaveTextContent(/^7$/);
  expect(screen.getByTestId('qtd-j2')).toHaveTextContent(/^7$/);
  expect(screen.getByTestId('qtd-monte')).toHaveTextContent(/^14$/);

  // Mesa zerada e mensagem vazia.
  expect(pecasEm('mesa')).toHaveLength(0);
  expect(screen.getByTestId('mensagem').textContent.trim()).toBe('');

  // Sem parâmetros não dá para saber quem está na vez: a mão visível é a de quem a `vez` mostrar (sem conferir quem é).
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Jogador [12]$/);
  const novaVez = screen.getByTestId('vez').textContent.trim();
  const novaVisivel = novaVez === 'Jogador 1' ? 'mao-j1' : 'mao-j2';
  const novaOculta = novaVez === 'Jogador 1' ? 'mao-j2' : 'mao-j1';

  // Mão de quem está na vez: 7 peças visíveis, com os números na tela.
  const visiveis = pecasEm(novaVisivel);
  expect(visiveis).toHaveLength(7);
  visiveis.forEach((p) => {
    expect(p).not.toHaveAttribute('data-oculta', 'true');
    expect(p.textContent.trim()).toMatch(/^[0-6]-[0-6]$/);
  });

  // Mão do outro jogador: 7 peças viradas (data-oculta="true") e sem texto.
  const ocultas = pecasEm(novaOculta);
  expect(ocultas).toHaveLength(7);
  ocultas.forEach((p) => {
    expect(p).toHaveAttribute('data-oculta', 'true');
    expect(p.textContent.trim()).toBe('');
  });

  // As 14 peças das duas mãos: data-testid válidos (A ≤ B) e todas diferentes.
  const ids = [...visiveis, ...ocultas].map((p) => p.getAttribute('data-testid'));
  for (const id of ids) {
    const m = id.match(/^peca-([0-6])-([0-6])$/);
    expect(m).not.toBeNull();
    expect(Number(m[1])).toBeLessThanOrEqual(Number(m[2]));
  }
  expect(new Set(ids).size).toBe(14);
});
