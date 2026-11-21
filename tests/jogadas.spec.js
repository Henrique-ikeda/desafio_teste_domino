// Tarefas A4 e A5 (Henrique): jogadas na mesa. Só pela interface (seção 3 do PLANEJAMENTO.md).
import { abrirJogo, jogar, mesaComoTexto, pecasEm, screen, within, MAOS_PADRAO, J2_PADRAO } from './helpers.js';

test('TC-DM-06 primeira jogada', async () => {
  // MAOS_PADRAO: o J1 tem a carroça 6-6 e começa. Abertura: basta clicar na peça (sem ponta).
  const user = await abrirJogo(MAOS_PADRAO);
  await jogar(user, '6-6');

  // Mesa com só a carroça, e as duas pontas valendo 6.
  expect(mesaComoTexto()).toBe('6-6');
  expect(screen.getByTestId('ponta-esquerda')).toHaveTextContent(/^6$/);
  expect(screen.getByTestId('ponta-direita')).toHaveTextContent(/^6$/);

  // Contadores: J1 com 6 (7 - 1 jogada), J2 com 7, e a vez passou para o J2.
  expect(screen.getByTestId('qtd-j1')).toHaveTextContent(/^6$/);
  expect(screen.getByTestId('qtd-j2')).toHaveTextContent(/^7$/);
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Jogador 2$/);

  // Agora a mão do J1 fica escondida: 6 peças viradas, sem os números.
  const maoJ1 = pecasEm('mao-j1');
  expect(maoJ1).toHaveLength(6);
  for (const p of maoJ1) {
    expect(p).toHaveAttribute('data-oculta', 'true');
    expect(p.textContent.trim()).toBe('');
  }

  // A mão do J2 fica visível: as 7 peças de J2_PADRAO, com os números, nenhuma escondida.
  const maoJ2 = pecasEm('mao-j2');
  expect(maoJ2).toHaveLength(7);
  expect(maoJ2.map((p) => p.textContent.trim()).sort()).toEqual([...J2_PADRAO.split(',')].sort());
  for (const p of maoJ2) {
    expect(p).not.toHaveAttribute('data-oculta', 'true');
  }
});

test('TC-DM-07 encaixar na direita', async () => {
  // MAOS_PADRAO: J1 abre com 6-6; J2 encaixa 1-6 na ponta direita (o 6 da ponta).
  const user = await abrirJogo(MAOS_PADRAO);
  await jogar(user, '6-6');
  await jogar(user, '1-6', 'direita');

  // A peça 1-6 gira para 6-1, deixando o 1 na ponta direita.
  expect(mesaComoTexto()).toBe('6-6 6-1');
  expect(screen.getByTestId('ponta-esquerda')).toHaveTextContent(/^6$/);
  expect(screen.getByTestId('ponta-direita')).toHaveTextContent(/^1$/);

  // J2 ficou com 6 peças e a vez voltou para o J1.
  expect(screen.getByTestId('qtd-j2')).toHaveTextContent(/^6$/);
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Jogador 1$/);

  // A peça 1-6 está na mesa, mostrada já girada.
  expect(within(screen.getByTestId('mesa')).getByTestId('peca-1-6')).toHaveTextContent(/^6-1$/);
});
