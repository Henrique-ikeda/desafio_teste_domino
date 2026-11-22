# Planejamento — desafio_teste_domino

Dominó (28 peças, de 0-0 a 6-6) para **2 jogadores** no mesmo computador: **Casos de teste de interface em JavaScript**. O jogo em si não é implementado (a entrega são só os testes); os testes ficam falhando pelo motivo certo.

| Integrante | GitHub | Papel neste repositório |
|---|---|---|
| Henrique Kendi Ikeda (RA 24039456-2) | Henrique-ikeda | Setup do projeto e testes de: distribuição, quem começa e jogadas na mesa (tarefas A1–A5) |
| Felipe Galeti Gôngora (RA 24036480-2) | FGaleti | CI, README e testes de: compra, passar, bater, jogo trancado e nova partida (tarefas F1–F5) |

---

## 1. Regras do jogo (o que os testes verificam)

- **28 peças**, de 0-0 a 6-6. Cada peça tem duas pontas; **carroça** é a peça com as duas pontas iguais (0-0, 1-1, …, 6-6). Os **pontos** de uma peça são a soma das pontas.
- **2 jogadores** no mesmo computador: Jogador 1 e Jogador 2. Cada um recebe **7 peças**; as outras **14** formam o **monte** de compra.
- Só a mão de quem está na vez aparece; a mão do outro fica **escondida** (peças viradas, sem os números).
- **Quem começa:** quem tem a **maior carroça**, e a primeira peça jogada é obrigatoriamente essa carroça. Se ninguém tiver carroça, começa quem tem a peça de **maior soma**, jogando com ela.
- **Jogar:** na sua vez, o jogador clica numa peça da mão e depois numa das pontas da mesa (esquerda ou direita). A peça precisa ter um número igual ao da ponta escolhida; ela **gira sozinha** para encaixar. A primeira peça vai direto para a mesa, com um clique. Depois de jogar, a vez passa para o outro.
- **Jogada inválida** (peça que não encaixa na ponta escolhida, ou outra peça que não a obrigatória na abertura): nada muda na mesa nem na mão, a mensagem avisa com a palavra "inválida" e a vez continua com o mesmo jogador.
- **Comprar:** se o jogador da vez não tem nenhuma peça que encaixe e o monte tem peças, ele compra **uma peça por clique** (a de cima do monte), até ter uma que encaixe. O botão de comprar só fica habilitado nessa situação.
- **Passar:** se o jogador da vez não tem peça que encaixe e o monte está **vazio**, ele passa a vez. O botão de passar só fica habilitado nessa situação.
- **Bater:** quem ficar sem peças na mão **vence** na hora: "Jogador 1 venceu!" ou "Jogador 2 venceu!".
- **Jogo trancado:** se em algum momento **nenhum dos dois** puder jogar e o monte estiver vazio, o jogo acaba. Vence quem tiver **menos pontos** na mão: "Jogo trancado! Jogador 1 venceu". Pontos iguais: "Jogo trancado! Empate". Os pontos de cada um aparecem na tela.
- **Fim de jogo:** depois de bater ou trancar, nada mais pode ser jogado, comprado ou passado.
- **Nova partida:** recomeça a partida (com os parâmetros, as mesmas mãos e o mesmo monte).

## 2. Stack, comandos e estrutura

| Item | Escolha |
|---|---|
| Entrega | **Somente os casos de teste** (`tests/`). O código do jogo não é implementado |
| Executor dos testes | [Jest](https://jestjs.io) 29, com `babel-jest` (converte os ES Modules para CommonJS só nos testes) |
| Testes de interface | [Testing Library](https://testing-library.com) (`@testing-library/dom` + `@testing-library/user-event` + `@testing-library/jest-dom`), em JavaScript |
| "Navegador" dos testes | [jsdom](https://github.com/jsdom/jsdom) (`testEnvironment: 'jsdom'`). Não precisa baixar navegador |
| Esqueleto da tela | `index.html` com os elementos fixos da seção 3 **vazios** + `js/main.js` vazio. É só o "molde" que os testes abrem |
| Node | 18 ou superior |
| CI | GitHub Actions rodando `npm ci` e `npm run verificar` em todo push e Pull Request |

```bash
npm install                 # instala dependências (não baixa navegador)
npm test                    # roda os testes (jest) — TODOS falham, de propósito
npm run verificar           # confere se cada teste falha pelo motivo certo e tem um ID do plano
npm run verificar:completo  # idem + acusa TCs do plano que ainda não têm teste (usar na entrega)
```

### Por que os testes ficam falhando

O jogo não existe. Cada teste é escrito a partir da especificação (seções 1, 3 e 5) e precisa **falhar pelo motivo certo**:

- ✅ **Motivo certo:** a asserção não bate ou o elemento não existe, porque o jogo ainda não faz aquilo. Por exemplo, `Unable to find an element by: [data-testid="..."]` ou `expect(element).toHaveTextContent()`.
- ❌ **Motivo errado:** erro no próprio teste, como `TypeError`, `ReferenceError`, import quebrado ou arquivo que não carrega.
- ❌ **Teste passando:** se passa com a tela vazia, ele não testa nada. Reescreva-o para conferir o comportamento da seção 5.

O `scripts/verificar-testes.mjs` faz essa conferência sozinho; o CI e o hook dos agentes usam ele.

### Esqueleto da tela (`index.html`)

- Tem os elementos **fixos** da seção 3, cada um com seu `data-testid`, **sem texto, sem valor e sem atributos de estado** (`data-*` de estado, `disabled`, `hidden`). Senão algum teste passaria sem o jogo existir.
- As peças (`peca-A-B`) são criados pelo jogo e **não** entram no esqueleto.
- Carrega `<script type="module" src="js/main.js"></script>`; `js/main.js` fica só com um comentário.

### Como um teste abre o jogo — `tests/helpers.js`

`abrirJogo(params)` põe os parâmetros na URL, carrega o `index.html`, importa o `js/main.js` de novo (cada teste começa um jogo novo) e devolve o `user` do user-event para clicar como um jogador.

```js
import { abrirJogo, jogar, mesaComoTexto, screen, MAOS_PADRAO } from './helpers.js';

test('TC-DM-07 encaixar na direita', async () => {
  const user = await abrirJogo(MAOS_PADRAO);
  await jogar(user, '6-6');              // abertura: só clicar na peça
  await jogar(user, '1-6', 'direita');
  expect(mesaComoTexto()).toBe('6-6 6-1');
});
```

### Regras para os testes

- Os testes **só** acessam o jogo pelo que o usuário vê e clica: `screen.getByTestId(...)`, os atalhos do `helpers.js` e `user.click`/`user.dblClick`/`cliqueDireito(user, el)`. Nada de importar `js/*.js` ou chamar funções internas.
- Todo elemento que um teste usa tem `data-testid` (lista na seção 3). Se precisar de um novo, adicione na seção 3 no mesmo PR.
- A distribuição é controlada pelos **parâmetros de URL `j1`, `j2` e `monte`** (seção 3). Um teste nunca depende de sorte; sem os parâmetros, o teste só pode conferir regras que valem para qualquer distribuição.
- Cada caso de teste da seção 5 vira um `test('TC-DM-NN ...')` com o **mesmo ID no título** (o verificador exige). Caso parametrizado → `test.each`, que conta como um caso só.
- Proibido `test.skip`, `test.todo` e `.only` (o verificador acusa).

### Arquivos para agentes de IA (ver [docs/TDD-COM-IA.md](docs/TDD-COM-IA.md))

```
AGENTS.md                        instruções para qualquer agente (Codex lê sozinho)
CLAUDE.md                        Claude Code: carrega o AGENTS.md + sub-agentes
.claude/skills/tdd/SKILL.md      skill tdd para o Claude Code  (/tdd A2)
.agents/skills/tdd/SKILL.md      skill tdd para o Codex        ($tdd A2) — cópia idêntica
.claude/agents/                  sub-agentes: escritor-de-testes, revisor-tdd
.claude/settings.json            hook do Claude Code
.codex/hooks.json                hook do Codex (aprovar uma vez com /hooks)
scripts/verificar-testes.mjs     verificador (npm run verificar, CI e hook)
scripts/hooks/rodar-testes.mjs   o hook: roda o verificador após editar tests/
docs/TDD-COM-IA.md               técnicas de TDD com IA usadas aqui e fontes
docs/MATRIZ-COBERTURA.md         cada regra da seção 1 → casos de teste que a cobrem
```

### Estrutura e dono de cada arquivo

```
desafio_teste_domino/
├── index.html                    A1  esqueleto: elementos fixos da seção 3, vazios
├── js/main.js                    A1  vazio (o jogo não é implementado)
├── tests/helpers.js              A1  abrirJogo(), MAOS_PADRAO e atalhos
├── tests/inicio.spec.js          Henrique  (A2, A3)
├── tests/jogadas.spec.js         Henrique  (A4, A5)
├── tests/compra.spec.js          Felipe    (F2, F3)
├── tests/fim-de-jogo.spec.js     Felipe    (F4, F5)
├── tests/lacunas-felipe.spec.js  Felipe    (F6)
├── .github/workflows/testes.yml  Felipe    (F1)
├── README.md                     Felipe    (F1; cada um atualiza a sua parte da tabela)
├── babel.config.cjs              A1  só para os testes (Jest): ESM → CommonJS
└── package.json                  A1
```

## 3. Contrato de interface (o que os testes usam)

### Elementos (`data-testid`)

| data-testid | O que é |
|---|---|
| `mao-j1` / `mao-j2` | Mão de cada jogador (contém as peças dele) |
| `mesa` | A mesa: as peças jogadas, em ordem da esquerda para a direita |
| `peca-A-B` | Uma peça, com `A` ≤ `B` (ex.: `peca-2-6`). Fica dentro de `mao-j1`, `mao-j2` ou `mesa`. Na mão visível, o texto é `A-B`; na mão escondida, `data-oculta` = `true` e sem texto; na mesa, o texto é a peça **já virada** (ex.: `6-2`). Peça selecionada: `data-selecionada` = `true` |
| `ponta-esquerda` / `ponta-direita` | Botões das pontas da mesa; o texto é o número da ponta (vazio com a mesa vazia) |
| `qtd-j1` / `qtd-j2` / `qtd-monte` | Quantidade de peças (número) |
| `vez` | "Jogador 1" ou "Jogador 2" |
| `mensagem` | Avisos ("Jogada inválida…") e o resultado ("Jogador 1 venceu!", "Jogo trancado! Jogador 2 venceu", "Jogo trancado! Empate") |
| `pontos-j1` / `pontos-j2` | Pontos na mão de cada um, mostrados quando o jogo tranca |
| `btn-comprar` / `btn-passar` | Comprar do monte / passar a vez (`disabled` quando não podem ser usados) |
| `btn-nova-partida` | Recomeça a partida |

### Parâmetros de URL

| Parâmetro | Exemplo | Efeito |
|---|---|---|
| `j1` | `?j1=6-6,4-6,2-4` | Mão do Jogador 1 |
| `j2` | `?j2=1-6,0-0` | Mão do Jogador 2 |
| `monte` | `?monte=0-1,2-6` | Monte, na ordem de compra (a primeira é comprada primeiro). `monte=` (vazio) = monte vazio |

Com os parâmetros, as mãos e o monte são **exatamente** os dados (podem ter menos de 7 peças) e as peças não listadas ficam fora da partida. Assim cada regra é testada com poucas peças. Continuam os mesmos depois de "Nova partida".

### Distribuição fixa usada nos testes

| Constante | Peças |
|---|---|
| `J1_PADRAO` | 6-6, 4-6, 2-4, 1-3, 0-5, 2-5, 3-3 |
| `J2_PADRAO` | 1-6, 2-6, 1-1, 0-0, 0-4, 4-5, 2-3 |
| `MONTE_PADRAO` | 0-1, 0-2, 0-3, 0-6, 1-2, 1-4, 1-5, 2-2, 3-4, 3-5, 3-6, 4-4, 5-5, 5-6 |

`MAOS_PADRAO` = `{ j1: J1_PADRAO, j2: J2_PADRAO, monte: MONTE_PADRAO }`: as 28 peças, 7 + 7 + 14. O Jogador 1 tem a maior carroça (6-6), então começa com ela. Depois disso o Jogador 2 pode jogar 1-6 ou 2-6.

## 4. Divisão de tarefas

Cada tarefa segue o mesmo ciclo, **um caso de teste por vez**:

1. Escrever o teste do TC só a partir da especificação (seções 1, 3 e 5), sem código do jogo.
2. Rodar só ele (`npx jest tests/<arquivo>.spec.js -t "TC-DM-NN"`) e conferir que **falha pelo motivo certo**: asserção ou elemento não encontrado, e não erro do próprio teste.
3. `npm run verificar` sem problemas → commit `test: TC-DM-NN <cenário>`.
4. No fim da tarefa: revisão, atualizar a tabela de testes do README e abrir o Pull Request; o outro integrante revisa.

Cada integrante é **dono de arquivos de teste diferentes** (coluna "Arquivos"). Assim, depois da A1, os dois trabalham em paralelo sem conflito. `tests/helpers.js` é da A1: se precisar mudar, combinem antes e façam um commit pequeno e separado. Tarefas que usam o mesmo arquivo: faça o merge de uma antes de começar a outra.

**Usando agentes de IA (Claude Code ou Codex):** os dois seguem a skill `tdd` (lida pelo [`AGENTS.md`](AGENTS.md)). Para começar uma tarefa: `/tdd A2` no Claude Code ou `$tdd A2` no Codex; depois, "go" escreve o próximo TC. Cada integrante roda o agente na própria máquina, com o próprio `git config`, para os commits saírem no nome de quem fez.

### Henrique (tarefas A)

| Tarefa | Branch | Arquivos | Casos de teste |
|---|---|---|---|
| **A1** Setup: `package.json`, `babel.config.cjs`, `js/main.js` vazio, `.gitignore`, `index.html` esqueleto, `tests/helpers.js`, verificador, skill, sub-agentes e hooks, PLANEJAMENTO e docs | `main` (repositório vazio, commit direto) | tudo | — |
| **A2** Distribuição e mãos | `henrique/a2-distribuicao` | tests/inicio.spec.js | 01, 02, 12 |
| **A3** Quem começa | `henrique/a3-quem-comeca` | tests/inicio.spec.js | 03, 04, 05, 31, 32 |
| **A4** Jogar nas pontas | `henrique/a4-jogar` | tests/jogadas.spec.js | 06, 07, 08, 33, 34 |
| **A5** Jogadas inválidas | `henrique/a5-invalidas` | tests/jogadas.spec.js | 09, 10, 11 |

### Felipe (tarefas F)

| Tarefa | Branch | Arquivos | Casos de teste |
|---|---|---|---|
| **F1** CI no GitHub Actions + README (conferir e completar) | `felipe/f1-ci-readme` | .github/workflows, README.md | — |
| **F2** Comprar do monte | `felipe/f2-comprar` | tests/compra.spec.js | 13, 14, 23 |
| **F3** Passar a vez | `felipe/f3-passar` | tests/compra.spec.js | 15, 16, 24 |
| **F4** Bater e jogo trancado | `felipe/f4-fim` | tests/fim-de-jogo.spec.js | 17, 18, 19, 20, 25, 26, 30 |
| **F5** Fim bloqueia e nova partida | `felipe/f5-nova-partida` | tests/fim-de-jogo.spec.js | 21, 22, 27, 28, 29 |
| **F6** Lacunas de cobertura (casos adicionais) | `felipe/f6-lacunas` | tests/lacunas-felipe.spec.js | 35 a 53 |

### IDs para casos de teste adicionais

Para os dois não criarem o mesmo ID: **TC-DM-25 a TC-DM-30** ficam reservados para o Felipe e os casos adicionais do Henrique começam em **TC-DM-31**. **TC-DM-35 a TC-DM-54** ficam reservados para o Felipe (tarefa F6, lacunas de cobertura; a F6 usou 35 a 53 e o 54 fica livre); casos novos do Henrique passam a usar **TC-DM-55** em diante. Todo TC novo entra na seção 5, na [matriz](docs/MATRIZ-COBERTURA.md) e na tabela do README, no mesmo PR do teste.

## 5. Casos de teste (interface)

`MAOS_PADRAO` = `?j1=J1_PADRAO&j2=J2_PADRAO&monte=MONTE_PADRAO` (seção 3). "Jogar X na direita" = clicar a peça e depois `ponta-direita`.

### Henrique — distribuição, quem começa e jogadas

| ID | Cenário | Parâmetros / passos | Resultado esperado |
|---|---|---|---|
| TC-DM-01 | Distribuição sorteada | Sem parâmetros. Abrir a página | `qtd-j1` = 7, `qtd-j2` = 7, `qtd-monte` = 14; a mão de quem está na `vez` mostra 7 peças diferentes; a outra mão tem 7 peças com `data-oculta` = `true`; `mesa` sem peças |
| TC-DM-02 | Mãos com os parâmetros | `MAOS_PADRAO` | `vez` = "Jogador 1"; `mao-j1` tem exatamente as 7 peças de `J1_PADRAO`, com o texto de cada uma; `mao-j2` tem 7 peças, todas com `data-oculta` = `true`; `qtd-monte` = 14 |
| TC-DM-03 | Começa a maior carroça | `?j1=3-3,1-2&j2=5-5,0-0&monte=` | `vez` = "Jogador 2" (5-5 é maior que 3-3, mesmo o J2 tendo também 0-0) |
| TC-DM-04 | Sem carroça, começa a maior soma | `?j1=5-6,0-1&j2=4-6,2-3&monte=` | `vez` = "Jogador 1" (5-6 soma 11) |
| TC-DM-05 | Abertura obrigatória com a carroça | `MAOS_PADRAO`. Jogador 1 clica `peca-4-6`; depois clica `peca-6-6` | Depois do 4-6: `mesa` vazia, `mensagem` contém "inválida", `qtd-j1` = 7, `vez` = "Jogador 1". Depois do 6-6: `mesa` = "6-6" |
| TC-DM-06 | Primeira jogada | `MAOS_PADRAO`. Jogador 1 clica `peca-6-6` | `mesa` = "6-6"; `ponta-esquerda` = 6 e `ponta-direita` = 6; `qtd-j1` = 6; `vez` = "Jogador 2"; agora `mao-j1` fica escondida e `mao-j2` mostra as 7 peças |
| TC-DM-07 | Encaixar na direita | `MAOS_PADRAO`. J1 joga 6-6; J2 joga 1-6 na direita | `mesa` = "6-6 6-1" (a peça girou); `ponta-direita` = 1; `ponta-esquerda` = 6; `qtd-j2` = 6; `vez` = "Jogador 1" |
| TC-DM-08 | Encaixar na esquerda | `MAOS_PADRAO`. J1 joga 6-6; J2 joga 2-6 na esquerda | `mesa` = "2-6 6-6"; `ponta-esquerda` = 2 |
| TC-DM-09 | Peça que não encaixa | `MAOS_PADRAO`. J1 joga 6-6; J2 tenta 0-0 na direita | `peca-0-0` continua em `mao-j2`; `mesa` = "6-6"; `mensagem` contém "inválida"; `vez` continua "Jogador 2" |
| TC-DM-10 | Ponta errada, depois a certa | `MAOS_PADRAO`. J1 joga 6-6; J2 joga 1-6 na direita; J1 tenta 1-3 na esquerda (6); depois 1-3 na direita (1) | Na esquerda: inválida, `mesa` = "6-6 6-1". Na direita: `mesa` = "6-6 6-1 1-3"; `ponta-direita` = 3 |
| TC-DM-11 | Mão escondida não joga | `MAOS_PADRAO`. Na vez do J1, clicar `peca-1-6` (mão do J2) e depois `ponta-direita` | `peca-1-6` continua em `mao-j2` com `data-oculta` = `true`; `mesa` vazia; `vez` = "Jogador 1" |
| TC-DM-12 | Contadores durante a partida | `MAOS_PADRAO`. J1 joga 6-6; J2 joga 1-6 na direita; J1 joga 1-3 na direita | `qtd-j1` = 5; `qtd-j2` = 6; `qtd-monte` = 14; `mesa` com 3 peças |
| TC-DM-31 | Carroça vence a soma em quem começa | `?j1=5-6,0-2&j2=1-1,0-3&monte=` | `vez` = "Jogador 2" (1-1 é a única carroça, mesmo somando menos que 5-6); `mao-j2` mostra as peças e `mao-j1` fica escondida |
| TC-DM-32 | Abertura obrigatória sem carroça | `?j1=5-6,0-1&j2=4-6,2-3&monte=`. Jogador 1 clica `peca-0-1`; depois clica `peca-5-6` | Depois do 0-1: `mesa` vazia, `mensagem` contém "inválida", `qtd-j1` = 2, `vez` = "Jogador 1". Depois do 5-6: `peca-5-6` dentro da `mesa`, `qtd-j1` = 1, `vez` = "Jogador 2" |
| TC-DM-33 | Peça gira na ponta esquerda | `MAOS_PADRAO`. J1 joga 6-6; J2 joga 1-6 na esquerda; J1 joga 1-3 na esquerda | Depois do J2: `mesa` = "1-6 6-6", `ponta-esquerda` = 1. Depois do J1: `mesa` = "3-1 1-6 6-6" (a peça girou), `ponta-esquerda` = 3, `ponta-direita` = 6 |
| TC-DM-34 | Mão visível troca nos dois sentidos | `MAOS_PADRAO`. J1 joga 6-6; J2 joga 1-6 na direita | `vez` = "Jogador 1"; `mao-j2` com 6 peças, todas com `data-oculta` = `true` e sem texto; `mao-j1` mostra as 6 peças restantes de `J1_PADRAO` |

### Felipe — comprar, passar e fim de jogo

| ID | Cenário | Parâmetros / passos | Resultado esperado |
|---|---|---|---|
| TC-DM-13 | Comprar só sem jogada | `MAOS_PADRAO`. Conferir no início; J1 joga 6-6; conferir de novo | `btn-comprar` desabilitado nas duas vezes (J1 tinha o 6-6; J2 tem 1-6 e 2-6); `qtd-monte` = 14 |
| TC-DM-14 | Comprar até poder jogar | `?j1=6-6,1-1&j2=0-0,1-2&monte=0-1,2-6,3-4`. J1 joga 6-6; J2 clica `btn-comprar` duas vezes; depois joga 2-6 na direita | 1ª compra: `peca-0-1` na `mao-j2`, `qtd-monte` = 2, `btn-comprar` continua habilitado. 2ª compra: `peca-2-6` na mão, `qtd-monte` = 1, `btn-comprar` desabilitado. Depois: `mesa` = "6-6 6-2", `vez` = "Jogador 1" |
| TC-DM-15 | Passar com o monte vazio | `?j1=6-6,1-6,3-3&j2=0-0,1-2&monte=`. J1 joga 6-6; J2 clica `btn-passar` | Antes de passar: `btn-comprar` desabilitado e `btn-passar` habilitado. Depois: `vez` = "Jogador 1"; `qtd-j2` = 2; `mensagem` sem "venceu" |
| TC-DM-16 | Passar desabilitado com jogada | `MAOS_PADRAO`. J1 joga 6-6 | `btn-passar` desabilitado (o J2 tem 1-6 e 2-6) |
| TC-DM-17 | J1 bate | `?j1=6-6&j2=0-0,1-2&monte=`. J1 joga 6-6 | `mensagem` = "Jogador 1 venceu!"; `qtd-j1` = 0 |
| TC-DM-18 | J2 bate | `?j1=6-6,0-0&j2=1-6&monte=`. J1 joga 6-6; J2 joga 1-6 na direita | `mensagem` = "Jogador 2 venceu!"; `qtd-j2` = 0; `mesa` = "6-6 6-1" |
| TC-DM-19 | Jogo trancado | `?j1=6-6,0-1&j2=2-3,4-5&monte=`. J1 joga 6-6 | Ninguém tem 6 e o monte está vazio: `mensagem` = "Jogo trancado! Jogador 1 venceu"; `pontos-j1` = 1; `pontos-j2` = 14 |
| TC-DM-20 | Jogo trancado empatado | `?j1=6-6,1-4&j2=2-3&monte=`. J1 joga 6-6 | `mensagem` = "Jogo trancado! Empate"; `pontos-j1` = 5; `pontos-j2` = 5 |
| TC-DM-21 | Nada funciona após o fim | Depois do TC-DM-18 (J2 bateu) | `btn-comprar` e `btn-passar` desabilitados; clicar `peca-0-0` e depois `ponta-direita` não muda nada (`peca-0-0` continua em `mao-j1`, `qtd-j1` = 1); `mensagem` continua "Jogador 2 venceu!" |
| TC-DM-22 | Nova partida | `MAOS_PADRAO`. J1 joga 6-6; J2 joga 1-6 na direita; clicar `btn-nova-partida` | `mesa` sem peças; `qtd-j1` = 7, `qtd-j2` = 7, `qtd-monte` = 14; `vez` = "Jogador 1"; `mao-j1` com as peças de `J1_PADRAO`; `mensagem` vazia |
| TC-DM-23 | Compra vai para a mão certa e fica visível | `?j1=6-6,1-1&j2=0-0,1-2&monte=0-1,2-6,3-4`. J1 joga 6-6; J2 compra uma vez | `peca-0-1` dentro de `mao-j2`, com o texto "0-1" (mão visível, é a vez dele); `qtd-j2` = 3; `peca-0-1` não está em `mao-j1` |
| TC-DM-24 | Monte acaba durante a compra | `?j1=6-6,3-6&j2=0-0&monte=1-2`. J1 joga 6-6; J2 compra uma vez | `qtd-monte` = 0; `btn-comprar` desabilitado; `btn-passar` habilitado; o jogo **não** trancou (o J1 ainda pode jogar 3-6): `mensagem` vazia |
| TC-DM-25 | Trancado com vitória do Jogador 2 | `?j1=6-6,4-5&j2=0-1&monte=`. J1 joga 6-6 | `mensagem` = "Jogo trancado! Jogador 2 venceu"; `pontos-j1` = 9; `pontos-j2` = 1 |
| TC-DM-26 | Trancado depois de um passe | `?j1=6-6,3-6,1-2&j2=0-0&monte=`. J1 joga 6-6; J2 clica `btn-passar` (o J1 ainda tem 3-6, não tranca); J1 joga 3-6 na direita | Depois do passe: `mensagem` vazia, `vez` = "Jogador 1". Depois do 3-6: `mesa` = "6-6 6-3"; nenhum dos dois encaixa (J1: 1-2; J2: 0-0; pontas 6 e 3) → `mensagem` = "Jogo trancado! Jogador 2 venceu"; `pontos-j1` = 3; `pontos-j2` = 0 |
| TC-DM-30 | Trancado logo depois de uma compra | `?j1=6-6,0-1&j2=2-3&monte=4-5`. J1 joga 6-6; J2 compra uma vez (4-5 não encaixa e o monte acaba; o J1 também não tem 6) | `qtd-monte` = 0; `qtd-j2` = 2; `mensagem` = "Jogo trancado! Jogador 1 venceu" sem o J2 precisar passar; `pontos-j1` = 1; `pontos-j2` = 14 |
| TC-DM-27 | Nada funciona depois de trancar | Cenário do TC-DM-19 (`?j1=6-6,0-1&j2=2-3,4-5&monte=`): J1 joga 6-6 e o jogo tranca; clicar `peca-0-1` e depois `ponta-direita`; clicar `btn-comprar` e `btn-passar` | `btn-comprar` e `btn-passar` desabilitados; `peca-0-1` continua em `mao-j1`; `qtd-j1` = 1; `mesa` = "6-6"; `mensagem` continua "Jogo trancado! Jogador 1 venceu" |
| TC-DM-28 | Nova partida depois do fim reabre o jogo | Cenário do TC-DM-18 (`?j1=6-6,0-0&j2=1-6&monte=`): J1 joga 6-6; J2 joga 1-6 na direita e bate; clicar `btn-nova-partida`; J1 joga 6-6 | Antes do 6-6: `mesa` sem peças, `qtd-j1` = 2, `qtd-j2` = 1, `qtd-monte` = 0, `vez` = "Jogador 1", `mensagem` vazia. Depois: `mesa` = "6-6" e `vez` = "Jogador 2" |
| TC-DM-29 | Nova partida sem parâmetros | Sem parâmetros. Jogar a peça obrigatória da vez (lida na mão visível: a maior carroça ou, sem carroça, a maior soma); clicar `btn-nova-partida` | `qtd-j1` = 7, `qtd-j2` = 7, `qtd-monte` = 14; `mesa` sem peças; `mensagem` vazia; as 14 peças das mãos com `data-testid` válidos e diferentes |

### Felipe — lacunas de cobertura (F6)

Casos adicionais que fecham lacunas apontadas pela auditoria (defeitos plantados na referência que a suíte anterior deixava passar). Mesmas convenções da seção 5.

| ID | Cenário | Parâmetros / passos | Resultado esperado |
|---|---|---|---|
| TC-DM-35 | O J2 também só abre com a peça obrigatória | `?j1=1-6,0-4&j2=6-6,5-6&monte=`. J2 clica `peca-5-6`; depois clica `peca-6-6` | Depois do 5-6: `mesa` vazia, `mensagem` contém "inválida", `qtd-j2` = 2, `vez` = "Jogador 2". Depois do 6-6: `mesa` = "6-6", `qtd-j2` = 1, `vez` = "Jogador 1" |
| TC-DM-36 | Mão escondida não joga no meio da partida, nos dois sentidos | `MAOS_PADRAO`. J1 joga 6-6; J2 clica `peca-4-6` (mão do J1) e `ponta-direita`; J2 joga 1-6 na direita; J1 clica `peca-2-6` (mão do J2) e `ponta-esquerda` | Depois do 1º clique: `mesa` = "6-6", `peca-4-6` continua em `mao-j1` com `data-oculta` = `true`, `qtd-j1` = 6, `vez` = "Jogador 2". Depois do 1-6 e do 2º clique: `mesa` = "6-6 6-1", `peca-2-6` continua em `mao-j2` com `data-oculta` = `true`, `qtd-j2` = 6, `vez` = "Jogador 1" |
| TC-DM-37 | Peça clicada fica com data-selecionada | `MAOS_PADRAO`. J1 joga 6-6; J2 clica só `peca-1-6` (sem clicar na ponta) | `peca-1-6` com `data-selecionada` = `true`; `peca-2-6` sem; `mesa` = "6-6"; `vez` = "Jogador 2" |
| TC-DM-38 | O J1 também compra do monte | `?j1=6-6,0-3&j2=1-6,1-2&monte=2-5`. J1 joga 6-6; J2 joga 1-6 na direita; J1 clica `btn-comprar` | Antes: `btn-comprar` habilitado e `btn-passar` desabilitado. Depois: `peca-2-5` em `mao-j1` com o texto "2-5" (visível), `qtd-j1` = 2, `qtd-j2` = 1, `qtd-monte` = 0, `vez` = "Jogador 1", `btn-comprar` desabilitado e `btn-passar` habilitado |
| TC-DM-39 | O J1 também passa a vez | `?j1=6-6,0-0&j2=1-6,1-2&monte=`. J1 joga 6-6; J2 joga 1-6 na direita; J1 clica `btn-passar` | Antes: `btn-comprar` desabilitado e `btn-passar` habilitado. Depois: `vez` = "Jogador 2"; `mesa` = "6-6 6-1"; `qtd-j1` = 1; `mensagem` sem "venceu" nem "trancado" |
| TC-DM-40 | Peça que encaixa numa ponta só já é jogada | `?j1=6-6,4-6,0-3&j2=1-6,0-1&monte=2-5`. J1 joga 6-6; J2 joga 1-6 na direita (pontas 6 e 1); conferir os botões do J1; J1 joga 4-6 na esquerda; conferir os botões do J2 | Vez do J1 (o 4-6 só encaixa na esquerda): `btn-comprar` e `btn-passar` desabilitados. Depois do 4-6: `mesa` = "4-6 6-6 6-1". Vez do J2 (o 0-1 só encaixa na direita): `btn-comprar` e `btn-passar` desabilitados |
| TC-DM-41 | Trancado com diferença de 1 ponto | `?j1=6-6,2-3&j2=0-4&monte=` e `?j1=6-6,1-3&j2=0-5&monte=`. J1 joga 6-6 | 1º: "Jogo trancado! Jogador 2 venceu"; `pontos-j1` = 5; `pontos-j2` = 4. 2º: "Jogo trancado! Jogador 1 venceu"; `pontos-j1` = 4; `pontos-j2` = 5 |
| TC-DM-42 | Nova partida na vez do J2 devolve a vez ao J1 | `MAOS_PADRAO`. J1 joga 6-6; na vez do J2, clicar `btn-nova-partida` | `vez` = "Jogador 1"; `mesa` sem peças; `qtd-j1` = 7, `qtd-j2` = 7, `qtd-monte` = 14; `mensagem` vazia; `mao-j1` visível e `mao-j2` toda com `data-oculta` = `true` |
| TC-DM-43 | Depois do fim, nem a peça que encaixaria é jogada | `?j1=6-6&j2=1-6,0-0&monte=`. J1 joga 6-6 (bate); J2 clica `peca-1-6` e `ponta-direita` | `mensagem` continua "Jogador 1 venceu!"; `mesa` = "6-6"; `peca-1-6` continua em `mao-j2`; `qtd-j2` = 2 |
| TC-DM-44 | Nova partida depois de trancar reabre o jogo | Cenário do TC-DM-19 (`?j1=6-6,0-1&j2=2-3,4-5&monte=`): J1 joga 6-6 e o jogo tranca; clicar `btn-nova-partida`; J1 joga 6-6 | Depois da nova partida: `mesa` sem peças, `qtd-j1` = 2, `qtd-j2` = 2, `qtd-monte` = 0, `vez` = "Jogador 1", `mensagem` vazia, `peca-6-6` em `mao-j1`. Depois do 6-6: `mesa` = "6-6" e "Jogo trancado! Jogador 1 venceu" |
| TC-DM-45 | Abertura recusa outra carroça que não é a maior | `?j1=5-5,6-6,0-1&j2=2-6,3-4&monte=`. J1 clica `peca-5-5`; depois clica `peca-6-6` | Depois do 5-5: `mesa` vazia, `mensagem` contém "inválida", `qtd-j1` = 3, `vez` = "Jogador 1". Depois do 6-6: `mesa` = "6-6", `qtd-j1` = 2 |
| TC-DM-46 | Sem carroça, o J2 começa pela maior soma; pontas certas | `?j1=4-6,2-3&j2=5-6,0-1&monte=`. J2 clica `peca-0-1`; depois clica `peca-5-6` | `vez` = "Jogador 2" no início (5-6 soma 11 contra 10 do 4-6). Depois do 0-1: `mesa` vazia e "inválida". Depois do 5-6: `peca-5-6` dentro da `mesa`, `qtd-j2` = 1, `vez` = "Jogador 1"; as duas pontas são 5 e 6 (em qualquer ordem) |
| TC-DM-47 | Depois de bater, não se compra, mesmo com monte cheio | `?j1=6-6&j2=0-0,1-2&monte=0-1`. J1 joga 6-6 (bate); J2 clica `btn-comprar` | `mensagem` = "Jogador 1 venceu!"; `btn-comprar` e `btn-passar` desabilitados; `qtd-monte` = 1; `qtd-j2` = 2; `peca-0-1` não está em `mao-j2` |
| TC-DM-48 | O J1 bate no meio, pela ponta esquerda | `?j1=6-6,2-6&j2=1-6,0-0&monte=`. J1 joga 6-6; J2 joga 1-6 na direita; J1 joga 2-6 na esquerda | `mesa` = "2-6 6-6 6-1"; `mensagem` = "Jogador 1 venceu!"; `qtd-j1` = 0; `qtd-j2` = 1; `btn-comprar` e `btn-passar` desabilitados |
| TC-DM-49 | Trancado depois da compra do J2, com vitória do J2 | `?j1=6-6,4-5&j2=0-1&monte=2-3`. J1 joga 6-6; J2 clica `btn-comprar` | Antes: `btn-comprar` habilitado. Depois: `qtd-monte` = 0; `qtd-j2` = 2; `mensagem` = "Jogo trancado! Jogador 2 venceu"; `pontos-j1` = 9; `pontos-j2` = 6 |
| TC-DM-50 | Empate no trancado com pontos diferentes de 5 | `?j1=6-6,1-2&j2=0-3&monte=`. J1 joga 6-6 | `mensagem` = "Jogo trancado! Empate"; `pontos-j1` = 3; `pontos-j2` = 3 |
| TC-DM-51 | Duas compras esvaziam o monte e trancam na última | `?j1=6-6,0-3&j2=2-3&monte=4-5,1-2`. J1 joga 6-6; J2 clica `btn-comprar` duas vezes | Depois da 1ª: `qtd-monte` = 1, `qtd-j2` = 2, `mensagem` sem "trancado", `btn-comprar` habilitado. Depois da 2ª: `qtd-monte` = 0, `qtd-j2` = 3, "Jogo trancado! Jogador 1 venceu", `pontos-j1` = 3, `pontos-j2` = 17 |
| TC-DM-52 | Nova partida devolve o monte na mesma ordem | `?j1=6-6,1-1&j2=0-0,1-2&monte=0-1,2-6,3-4`. J1 joga 6-6; J2 compra; `btn-nova-partida`; J1 joga 6-6; J2 compra de novo | 1ª compra: `peca-0-1` em `mao-j2`. Depois da nova partida: `qtd-monte` = 3. 2ª compra: `peca-0-1` em `mao-j2` e `peca-3-4` fora dela, `qtd-monte` = 2, `qtd-j2` = 3 |
| TC-DM-53 | Nova partida devolve a vez a quem começa, também o J2 | `?j1=1-5,0-3&j2=5-5,0-0&monte=`. J2 começa e joga 5-5 (vez do J1); clicar `btn-nova-partida`; J2 joga 5-5 | `vez` = "Jogador 2" no início e depois da nova partida; `mesa` sem peças; `qtd-j1` = 2, `qtd-j2` = 2; `mensagem` vazia; `mao-j2` visível e `mao-j1` toda com `data-oculta` = `true`. Depois do 5-5: `mesa` = "5-5" e `vez` = "Jogador 1" |

## 6. Fluxo de trabalho no Git

Para o professor enxergar a contribuição dos dois, **cada um commita da própria conta**:

1. **Henrique** cria o repositório e adiciona `FGaleti` como colaborador (Settings → Collaborators). **Felipe** aceita o convite.
2. Cada um configura o Git com o e-mail **cadastrado na própria conta do GitHub** (senão o commit não conta como contribuição):
   ```bash
   git config user.name "Seu Nome"
   git config user.email "email-da-sua-conta@exemplo.com"
   ```
3. Ninguém commita direto na `main` (fora o setup inicial, com o repositório vazio). Uma branch por tarefa: `henrique/a2-...`, `felipe/f2-...`, etc.
4. Mensagens no padrão Conventional Commits, em português: `test:`, `docs:`, `chore:`, `ci:`. Commits pequenos: um caso de teste por commit.
5. Pull Request para `main` → o **outro** integrante revisa e aprova → merge com **"Create a merge commit"** (não usar *squash*, para manter todos os commits de cada autor no histórico).
6. Antes de abrir o PR: `git pull origin main` e `npm run verificar` sem problemas. O CI precisa estar verde no PR.
7. Ordem: **A1 entra primeiro** (estrutura do projeto). Depois disso as tarefas A e F andam em paralelo.

Conferir no fim: aba **Insights → Contributors** do repositório deve mostrar os dois.

## 7. Definição de pronto

- [ ] Todos os casos de teste da seção 5 escritos em `tests/`, com o ID no título
- [ ] `npm run verificar:completo` sem problemas: todos os TCs têm teste, e todos **falham pelo motivo certo**
- [ ] Nenhum código do jogo em `js/` (só o `js/main.js` vazio)
- [ ] README com: especificação, colaboradores, como rodar, **funcionamento dos casos de teste** (tabela ID → arquivo → resultado esperado)
- [ ] CI (GitHub Actions rodando `npm run verificar`) verde na `main`
- [ ] Commits dos dois integrantes aparecendo em Insights → Contributors
- [ ] Nome do repositório exatamente `desafio_teste_domino`
