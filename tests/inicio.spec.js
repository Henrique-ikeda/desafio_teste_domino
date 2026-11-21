// Tarefa A2 (Henrique): distribuição e mãos. Só pela interface (seção 3 do PLANEJAMENTO.md):
// abrirJogo, data-testid e user-event. Sem jest.mock e sem importar js/*.js.
import { abrirJogo, screen, pecasEm, jogar, mesaComoTexto, MAOS_PADRAO, J1_PADRAO } from './helpers.js';

test('TC-DM-01 distribuição sorteada', async () => {
  // Sem parâmetros: a distribuição é sorteada, então só conferimos regras que valem para qualquer mão.
  await abrirJogo();

  expect(screen.getByTestId('qtd-j1')).toHaveTextContent(/^7$/);
  expect(screen.getByTestId('qtd-j2')).toHaveTextContent(/^7$/);
  expect(screen.getByTestId('qtd-monte')).toHaveTextContent(/^14$/);

  // A mão visível é a de quem está na vez; a outra fica escondida.
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Jogador [12]$/);
  const jogadorDaVez = screen.getByTestId('vez').textContent.trim();
  const visivel = jogadorDaVez === 'Jogador 1' ? 'mao-j1' : 'mao-j2';
  const oculta = jogadorDaVez === 'Jogador 1' ? 'mao-j2' : 'mao-j1';

  // Mão visível: 7 peças diferentes, com os números na tela.
  const pecasVisiveis = pecasEm(visivel);
  expect(pecasVisiveis).toHaveLength(7);
  for (const p of pecasVisiveis) {
    expect(p.textContent.trim()).toMatch(/^[0-6]-[0-6]$/);
    const m = p.getAttribute('data-testid').match(/^peca-(\d)-(\d)$/);
    expect(m).not.toBeNull();
    expect(Number(m[1])).toBeLessThanOrEqual(Number(m[2]));
    expect(p).not.toHaveAttribute('data-oculta', 'true');
  }
  const idsVisiveis = pecasVisiveis.map((p) => p.getAttribute('data-testid'));
  expect(new Set(idsVisiveis).size).toBe(7);

  // Mão escondida: 7 peças viradas, sem os números.
  const pecasOcultas = pecasEm(oculta);
  expect(pecasOcultas).toHaveLength(7);
  for (const p of pecasOcultas) {
    expect(p).toHaveAttribute('data-oculta', 'true');
    expect(p.textContent.trim()).toBe('');
  }

  // Mesa vazia no início, sem pontas.
  expect(pecasEm('mesa')).toHaveLength(0);
  expect(screen.getByTestId('ponta-esquerda').textContent.trim()).toBe('');
  expect(screen.getByTestId('ponta-direita').textContent.trim()).toBe('');
});

test('TC-DM-02 mãos com os parâmetros', async () => {
  // MAOS_PADRAO: o J1 tem a maior carroça (6-6), então é ele quem está na vez.
  // A mão do J1 aparece com os números; a do J2 fica escondida; o monte tem 14 peças.
  await abrirJogo(MAOS_PADRAO);

  expect(screen.getByTestId('vez')).toHaveTextContent(/^Jogador 1$/);

  // Mão do J1: exatamente as 7 peças de J1_PADRAO, com o texto e o data-testid de cada uma.
  const esperadasJ1 = J1_PADRAO.split(',');
  const maoJ1 = pecasEm('mao-j1');
  expect(maoJ1).toHaveLength(7);
  expect(maoJ1.map((p) => p.textContent.trim()).sort()).toEqual([...esperadasJ1].sort());
  expect(maoJ1.map((p) => p.getAttribute('data-testid')).sort()).toEqual(
    esperadasJ1.map((ab) => `peca-${ab}`).sort(),
  );
  for (const p of maoJ1) {
    expect(p).not.toHaveAttribute('data-oculta', 'true');
  }

  // Mão do J2: 7 peças viradas, sem os números.
  const maoJ2 = pecasEm('mao-j2');
  expect(maoJ2).toHaveLength(7);
  for (const p of maoJ2) {
    expect(p).toHaveAttribute('data-oculta', 'true');
    expect(p.textContent.trim()).toBe('');
  }

  expect(screen.getByTestId('qtd-monte')).toHaveTextContent(/^14$/);
  expect(screen.getByTestId('qtd-j1')).toHaveTextContent(/^7$/);
  expect(screen.getByTestId('qtd-j2')).toHaveTextContent(/^7$/);
  expect(pecasEm('mesa')).toHaveLength(0);
});

test('TC-DM-12 contadores durante a partida', async () => {
  // MAOS_PADRAO: o J1 tem 6-6 e começa. Mesa: 6-6 -> 6-1 -> 1-3 (cada encaixe usa a ponta da direita).
  const user = await abrirJogo(MAOS_PADRAO);

  // J1 abre com 6-6 (mesa vazia: basta clicar na peça). Sobram 6 peças na mão dele.
  await jogar(user, '6-6');

  // J2 encaixa 1-6 na ponta direita (6): a peça gira para 6-1 e a ponta direita vira 1.
  await jogar(user, '1-6', 'direita');

  // J1 encaixa 1-3 na ponta direita (1): a mesa passa a ter 3 peças.
  await jogar(user, '1-3', 'direita');

  // Contadores: J1 com 5 (7 - 2 jogadas), J2 com 6 (7 - 1), monte intacto com 14.
  expect(screen.getByTestId('qtd-j1')).toHaveTextContent(/^5$/);
  expect(screen.getByTestId('qtd-j2')).toHaveTextContent(/^6$/);
  expect(screen.getByTestId('qtd-monte')).toHaveTextContent(/^14$/);

  // Mesa com 3 peças, na ordem da esquerda para a direita.
  expect(pecasEm('mesa')).toHaveLength(3);
  expect(mesaComoTexto()).toBe('6-6 6-1 1-3');
});

test('TC-DM-03 começa a maior carroça', async () => {
  // Cenário sem sorteio: J1 tem 3-3 (carroça) e 1-2; J2 tem 5-5 (a maior carroça) e 0-0; monte vazio.
  // Quem tem a maior carroça começa: é o J2 (5-5 > 3-3), mesmo ele tendo também 0-0.
  const CENARIO = { j1: '3-3,1-2', j2: '5-5,0-0', monte: '' };
  await abrirJogo(CENARIO);

  expect(screen.getByTestId('vez')).toHaveTextContent(/^Jogador 2$/);

  // Mão do J2 (na vez dele, visível): 2 peças com os números.
  const maoJ2 = pecasEm('mao-j2');
  expect(maoJ2).toHaveLength(2);
  expect(maoJ2.map((p) => p.textContent.trim()).sort()).toEqual(['0-0', '5-5']);
  for (const p of maoJ2) {
    expect(p).not.toHaveAttribute('data-oculta', 'true');
  }

  // Mão do J1 (fora da vez): 2 peças viradas, sem os números.
  const maoJ1 = pecasEm('mao-j1');
  expect(maoJ1).toHaveLength(2);
  for (const p of maoJ1) {
    expect(p).toHaveAttribute('data-oculta', 'true');
    expect(p.textContent.trim()).toBe('');
  }

  // Nada jogado ainda.
  expect(pecasEm('mesa')).toHaveLength(0);
});

test('TC-DM-04 sem carroça, começa a maior soma', async () => {
  // Cenário sem sorteio e sem carroça: J1 tem 5-6 (soma 11, a maior) e 0-1; J2 tem 4-6 (soma 10) e 2-3; monte vazio.
  // Ninguém tem carroça, então começa quem tem a peça de maior soma: o J1 (5-6).
  const CENARIO = { j1: '5-6,0-1', j2: '4-6,2-3', monte: '' };
  await abrirJogo(CENARIO);

  expect(screen.getByTestId('vez')).toHaveTextContent(/^Jogador 1$/);

  // Mão do J1 (na vez dele, visível): 2 peças com os números.
  const maoJ1 = pecasEm('mao-j1');
  expect(maoJ1).toHaveLength(2);
  expect(maoJ1.map((p) => p.textContent.trim()).sort()).toEqual(['0-1', '5-6']);
  for (const p of maoJ1) {
    expect(p).not.toHaveAttribute('data-oculta', 'true');
  }

  // Mão do J2 (fora da vez): 2 peças viradas, sem os números.
  const maoJ2 = pecasEm('mao-j2');
  expect(maoJ2).toHaveLength(2);
  for (const p of maoJ2) {
    expect(p).toHaveAttribute('data-oculta', 'true');
    expect(p.textContent.trim()).toBe('');
  }

  // Nada jogado ainda.
  expect(pecasEm('mesa')).toHaveLength(0);
});
