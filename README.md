# desafio_teste_domino

[![Testes](https://github.com/Henrique-ikeda/desafio_teste_domino/actions/workflows/testes.yml/badge.svg)](https://github.com/Henrique-ikeda/desafio_teste_domino/actions/workflows/testes.yml)

Desafio de testes: casos de teste para testar uma **partida de dominó para 2 jogadores**, com **casos de teste em JavaScript para testar JavaScript** (Jest + Testing Library).

## Especificação do desafio

- 28 peças (0-0 a 6-6); cada jogador recebe 7 e as outras 14 formam o monte de compra.
- Começa quem tem a maior carroça (peça dupla), jogando com ela; sem carroças, a peça de maior soma.
- Na vez, o jogador encaixa uma peça numa das pontas da mesa (a peça gira sozinha); a vez passa para o outro.
- Sem peça que encaixe: compra do monte até poder jogar; com o monte vazio, passa a vez.
- Vence quem bater (ficar sem peças). Se ninguém puder jogar e o monte estiver vazio, o jogo tranca e vence quem tiver menos pontos na mão (soma das peças); pontos iguais = empate.
- A mão de quem não está na vez fica escondida; botão de nova partida.

Regras completas, contrato da tela e divisão das tarefas: [PLANEJAMENTO.md](PLANEJAMENTO.md).

## Colaboradores

| Nome | RA | GitHub | Parte no trabalho |
|---|---|---|---|
| Henrique Kendi Ikeda | 24039456-2 | [Henrique-ikeda](https://github.com/Henrique-ikeda) | Tarefas A1–A5: estrutura do projeto e 16 casos de teste: 01–12 e 31–34 (distribuição, quem começa e jogadas na mesa) |
| Felipe Galeti Gôngora | 24036480-2 | [FGaleti](https://github.com/FGaleti) | Tarefas F1–F5: CI, README e 18 casos de teste: 13–24 e os adicionais 25–30 (compra, passar, bater, jogo trancado e nova partida) |

As contribuições de cada um aparecem em **Insights → Contributors** e nos commits.

## Como rodar

Requisitos: Node.js 18 ou superior.

```bash
npm install
npm test                    # roda todos os casos de teste (Jest)
npm run verificar           # confere o motivo de cada falha e o ID de cada teste
npm run verificar:completo  # idem + confere que todo caso do plano tem teste
npx jest tests/<arquivo>.spec.js -t "TC-DM-NN"   # um caso só
```

## Funcionamento dos casos de teste

> **Aviso para o corretor:** `npm test` termina com falhas **de propósito** (o jogo não é implementado; a entrega são os casos de teste). O comando que valida a entrega é `npm run verificar`, que sai com código 0 quando todos os testes falham pelo motivo certo.

**Situação:** somente os casos de teste. O jogo não está implementado, então **todos os testes falham de propósito**, pelo motivo certo (o comportamento ainda não existe). O `npm run verificar` confere isso.

- **Ferramentas:** [Jest](https://jestjs.io) roda os testes; [Testing Library](https://testing-library.com) (`@testing-library/dom`, `user-event` e `jest-dom`) simula o jogador; o [jsdom](https://github.com/jsdom/jsdom) faz o papel do navegador, sem precisar abrir um.
- **Testes de interface:** cada teste abre o `index.html` do jogo pela função `abrirJogo(params)` de `tests/helpers.js`, clica como um jogador e confere o que aparece na tela. O `abrirJogo` carrega o `js/main.js` do mesmo jeito que o navegador carrega o `<script>` da página (com o jogo vazio, nada aparece na tela); os testes nunca chamam funções nem leem variáveis do jogo, só clicam e conferem a tela.
- **Elementos da tela:** encontrados pelo atributo `data-testid` (`mao-j1`, `mao-j2`, `mesa`, `peca-A-B`, `ponta-esquerda`, `ponta-direita`, `qtd-j1`, `qtd-j2`, `qtd-monte`, `vez`, `mensagem`, botões). Cada peça tem `data-testid` = `peca-<menor>-<maior>` e fica dentro da mão ou da mesa; na mesa, o texto mostra a peça já virada (ex.: `2-6` à esquerda de `6-6`).
- **Sem depender de sorte:** as mãos e o monte são passados pelos parâmetros de URL `j1`, `j2` e `monte`. Peças não listadas ficam fora da partida, então cada regra (comprar, passar, bater, trancar) é montada com mãos de 1 a 3 peças. A partida completa usa `J1_PADRAO`, `J2_PADRAO` e `MONTE_PADRAO` (7 + 7 + 14).
- **Rastreabilidade:** cada teste tem no título o ID do caso (`TC-DM-NN`), o mesmo da tabela abaixo e da seção 5 do PLANEJAMENTO.md. A [matriz de cobertura](docs/MATRIZ-COBERTURA.md) liga cada regra do jogo aos seus casos.
- **Metodologia:** TDD, um caso de teste por vez: escrever, rodar, ver falhar pelo motivo certo e fazer o commit `test:`. Uso de IA documentado em [docs/TDD-COM-IA.md](docs/TDD-COM-IA.md).
- **Integração contínua:** o GitHub Actions ([`.github/workflows/testes.yml`](.github/workflows/testes.yml)) roda `npm ci` e `npm run verificar` em todo push e Pull Request, numa matriz Node 18, 20 e 22 × Ubuntu e Windows. A saída do verificador e o relatório JSON do Jest ficam como artefatos de cada execução. O `npm run verificar:completo` (todo TC do plano tem teste) roda manualmente ou em PR com o rótulo `entrega`.
- **Validação dos testes:** falhar pelo motivo certo não prova que o teste está certo. Cada integrante rodou os seus testes contra uma implementação de referência temporária (fora do repositório) e contra defeitos plantados: [validação do Henrique](docs/VALIDACAO-TESTES-HENRIQUE.md) e [validação do Felipe](docs/VALIDACAO-TESTES-FELIPE.md).

## Casos de teste (28)

| ID | Cenário | Arquivo | Resultado esperado | Autor |
|---|---|---|---|---|
| TC-DM-01 | Distribuição sorteada | `tests/inicio.spec.js` | `qtd-j1` = 7, `qtd-j2` = 7, `qtd-monte` = 14; a mão de quem está na `vez` mostra 7 peças diferentes; a outra mão tem 7 peças com `data-oculta` = `true`; `mesa` sem peças | Henrique |
| TC-DM-02 | Mãos com os parâmetros | `tests/inicio.spec.js` | `vez` = "Jogador 1"; `mao-j1` tem exatamente as 7 peças de `J1_PADRAO`, com o texto de cada uma; `mao-j2` tem 7 peças, todas com `data-oculta` = `true`; `qtd-monte` = 14 | Henrique |
| TC-DM-03 | Começa a maior carroça | `tests/inicio.spec.js` | `vez` = "Jogador 2" (5-5 é maior que 3-3, mesmo o J2 tendo também 0-0) | Henrique |
| TC-DM-04 | Sem carroça, começa a maior soma | `tests/inicio.spec.js` | `vez` = "Jogador 1" (5-6 soma 11) | Henrique |
| TC-DM-05 | Abertura obrigatória com a carroça | `tests/inicio.spec.js` | Depois do 4-6: `mesa` vazia, `mensagem` contém "inválida", `qtd-j1` = 7, `vez` = "Jogador 1". Depois do 6-6: `mesa` = "6-6" | Henrique |
| TC-DM-06 | Primeira jogada | `tests/jogadas.spec.js` | `mesa` = "6-6"; `ponta-esquerda` = 6 e `ponta-direita` = 6; `qtd-j1` = 6; `vez` = "Jogador 2"; agora `mao-j1` fica escondida e `mao-j2` mostra as 7 peças | Henrique |
| TC-DM-07 | Encaixar na direita | `tests/jogadas.spec.js` | `mesa` = "6-6 6-1" (a peça girou); `ponta-direita` = 1; `ponta-esquerda` = 6; `qtd-j2` = 6; `vez` = "Jogador 1" | Henrique |
| TC-DM-08 | Encaixar na esquerda | `tests/jogadas.spec.js` | `mesa` = "2-6 6-6"; `ponta-esquerda` = 2 | Henrique |
| TC-DM-09 | Peça que não encaixa | `tests/jogadas.spec.js` | `peca-0-0` continua em `mao-j2`; `mesa` = "6-6"; `mensagem` contém "inválida"; `vez` continua "Jogador 2" | Henrique |
| TC-DM-10 | Ponta errada, depois a certa | `tests/jogadas.spec.js` | Na esquerda: inválida, `mesa` = "6-6 6-1". Na direita: `mesa` = "6-6 6-1 1-3"; `ponta-direita` = 3 | Henrique |
| TC-DM-11 | Mão escondida não joga | `tests/jogadas.spec.js` | `peca-1-6` continua em `mao-j2` com `data-oculta` = `true`; `mesa` vazia; `vez` = "Jogador 1" | Henrique |
| TC-DM-12 | Contadores durante a partida | `tests/inicio.spec.js` | `qtd-j1` = 5; `qtd-j2` = 6; `qtd-monte` = 14; `mesa` com 3 peças | Henrique |
| TC-DM-13 | Comprar só sem jogada | `tests/compra.spec.js` | `btn-comprar` desabilitado nas duas vezes (J1 tinha o 6-6; J2 tem 1-6 e 2-6); `qtd-monte` = 14 | Felipe |
| TC-DM-14 | Comprar até poder jogar | `tests/compra.spec.js` | 1ª compra: `peca-0-1` na `mao-j2`, `qtd-monte` = 2, `btn-comprar` continua habilitado. 2ª compra: `peca-2-6` na mão, `qtd-monte` = 1, `btn-comprar` desabilitado. Depois: `mesa` = "6-6 6-2", `vez` = "Jogador 1" | Felipe |
| TC-DM-15 | Passar com o monte vazio | `tests/compra.spec.js` | Antes de passar: `btn-comprar` desabilitado e `btn-passar` habilitado. Depois: `vez` = "Jogador 1"; `qtd-j2` = 2; `mensagem` sem "venceu" | Felipe |
| TC-DM-16 | Passar desabilitado com jogada | `tests/compra.spec.js` | `btn-passar` desabilitado (o J2 tem 1-6 e 2-6) | Felipe |
| TC-DM-17 | J1 bate | `tests/fim-de-jogo.spec.js` | `mensagem` = "Jogador 1 venceu!"; `qtd-j1` = 0 | Felipe |
| TC-DM-18 | J2 bate | `tests/fim-de-jogo.spec.js` | `mensagem` = "Jogador 2 venceu!"; `qtd-j2` = 0; `mesa` = "6-6 6-1" | Felipe |
| TC-DM-19 | Jogo trancado | `tests/fim-de-jogo.spec.js` | Ninguém tem 6 e o monte está vazio: `mensagem` = "Jogo trancado! Jogador 1 venceu"; `pontos-j1` = 1; `pontos-j2` = 14 | Felipe |
| TC-DM-20 | Jogo trancado empatado | `tests/fim-de-jogo.spec.js` | `mensagem` = "Jogo trancado! Empate"; `pontos-j1` = 5; `pontos-j2` = 5 | Felipe |
| TC-DM-21 | Nada funciona após o fim | `tests/fim-de-jogo.spec.js` | `btn-comprar` e `btn-passar` desabilitados; clicar `peca-0-0` e depois `ponta-direita` não muda nada (`peca-0-0` continua em `mao-j1`, `qtd-j1` = 1); `mensagem` continua "Jogador 2 venceu!" | Felipe |
| TC-DM-22 | Nova partida | `tests/fim-de-jogo.spec.js` | `mesa` sem peças; `qtd-j1` = 7, `qtd-j2` = 7, `qtd-monte` = 14; `vez` = "Jogador 1"; `mao-j1` com as peças de `J1_PADRAO`; `mensagem` vazia | Felipe |
| TC-DM-23 | Compra vai para a mão certa e fica visível | `tests/compra.spec.js` | `peca-0-1` dentro de `mao-j2`, com o texto "0-1" (mão visível, é a vez dele); `qtd-j2` = 3; `peca-0-1` não está em `mao-j1` | Felipe |
| TC-DM-24 | Monte acaba durante a compra | `tests/compra.spec.js` | `qtd-monte` = 0; `btn-comprar` desabilitado; `btn-passar` habilitado; o jogo **não** trancou (o J1 ainda pode jogar 3-6): `mensagem` vazia | Felipe |
| TC-DM-31 | Carroça vence a soma em quem começa | `tests/inicio.spec.js` | `vez` = "Jogador 2" (1-1 é a única carroça, mesmo somando menos que 5-6); `mao-j2` mostra as peças e `mao-j1` fica escondida | Henrique |
| TC-DM-32 | Abertura obrigatória sem carroça | `tests/inicio.spec.js` | Depois do 0-1: `mesa` vazia, `mensagem` contém "inválida", `qtd-j1` = 2, `vez` = "Jogador 1". Depois do 5-6: `peca-5-6` dentro da `mesa`, `qtd-j1` = 1, `vez` = "Jogador 2" | Henrique |
| TC-DM-33 | Peça gira na ponta esquerda | `tests/jogadas.spec.js` | Depois do J2: `mesa` = "1-6 6-6", `ponta-esquerda` = 1. Depois do J1: `mesa` = "3-1 1-6 6-6" (a peça girou), `ponta-esquerda` = 3, `ponta-direita` = 6 | Henrique |
| TC-DM-34 | Mão visível troca nos dois sentidos | `tests/jogadas.spec.js` | `vez` = "Jogador 1"; `mao-j2` com 6 peças, todas com `data-oculta` = `true` e sem texto; `mao-j1` mostra as 6 peças restantes de `J1_PADRAO` | Henrique |

## Estrutura

```
index.html                    esqueleto da tela (elementos da seção 3)
js/main.js                    ponto de entrada do jogo (vazio)
tests/helpers.js              abrirJogo(), MAOS_PADRAO e atalhos
tests/*.spec.js               casos de teste
scripts/verificar-testes.mjs  verificador (npm run verificar e CI)
PLANEJAMENTO.md               regras, contrato, tarefas e casos de teste
docs/                         matriz de cobertura e TDD com IA
```
