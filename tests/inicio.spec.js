// Tarefa A2 (Henrique): distribuição e mãos. Só pela interface (seção 3 do PLANEJAMENTO.md):
// abrirJogo, data-testid e user-event. Sem jest.mock e sem importar js/*.js.
import { abrirJogo, screen, pecasEm } from './helpers.js';

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
