# Validação dos testes do Felipe (TC-DM-13 a 30)

Mesmo método da [validação do Henrique](VALIDACAO-TESTES-HENRIQUE.md). Num repositório "somente testes", **falhar pelo motivo certo não prova que o teste está correto**: um teste com o resultado esperado errado também falha. Esta validação confere os dois lados:

1. **O teste aceita um jogo certo:** todos passam contra uma implementação que segue a especificação.
2. **O teste recusa um jogo errado:** cada defeito plantado nessa implementação é pego por pelo menos um teste.

## Método

- O repositório foi copiado para um diretório temporário **fora do clone**. Nada dele foi commitado, e o diretório foi apagado no fim.
- Lá foi escrita uma **implementação de referência mínima** do jogo em `js/main.js`, seguindo só o PLANEJAMENTO.md (seções 1 e 3). **Ela não é entregável e não está no repositório.** O jogo continua não implementado: `js/main.js` segue vazio.
- Sanidade da referência: os 16 testes do Henrique (`tests/inicio.spec.js` e `tests/jogadas.spec.js`) também passaram contra ela, sem mudança.
- Contra ela foram rodados apenas `tests/compra.spec.js` e `tests/fim-de-jogo.spec.js`, sem mudar nenhum teste.
- **Mutação manual:** a referência tem chaves que ligam um defeito por vez (variável de ambiente). Para cada defeito, os dois arquivos foram rodados de novo e foram anotados os testes que falharam.
- Cada TC foi conferido contra a referência **antes do commit**, além de falhar pelo motivo certo no repositório (`npm run verificar`).

## Resultados

| Verificação | Resultado |
|---|---|
| `compra.spec.js` + `fim-de-jogo.spec.js` contra a referência | **18/18 passando** |
| Rodados 3 vezes seguidas | 18/18 nas 3, nenhum teste intermitente |
| TC-DM-29 (nova partida sorteada) rodado 50 vezes | **50/50 passando**: não depende de sorte |
| TC-DM-29 rodado 10 vezes com o mutante "nova partida não restaura" | 0/10 passando: pega o defeito em qualquer sorteio |
| Mutantes pedidos no plano da validação | **21/21 mortos** |
| Mutantes no total (com o extra) | 21/22 mortos (o sobrevivente está em "Achados") |

## Mutante → testes que o pegaram

| # | Defeito plantado | Pego por |
|---|---|---|
| 1 | Comprar habilitado mesmo com jogada | TC-DM-13, 14 |
| 2 | Um clique compra até encaixar (várias peças) | TC-DM-14, 23 |
| 3 | Peça comprada vai para a mão do outro jogador | TC-DM-14, 23, 24, 30 |
| 4 | Peça comprada entra escondida | TC-DM-14, 23, 24 |
| 5 | `qtd-monte` não diminui na compra | TC-DM-14, 23, 24, 30 |
| 6 | Comprar continua habilitado depois de conseguir jogada | TC-DM-14 |
| 7 | Passar habilitado com o monte não vazio | TC-DM-14, 24 |
| 8 | Passar habilitado mesmo com jogada (monte vazio) | **TC-DM-15** (só ele, depois do reforço; ver abaixo) |
| 9 | Passar não troca a vez | TC-DM-15, 24, 26 |
| 10 | Batida do J2 não é detectada | TC-DM-18, 21, 28 |
| 11 | Trancado verificado **antes** da batida | TC-DM-17, 18, 21, 28 |
| 12 | No trancado vence quem tem **mais** pontos | TC-DM-19, 25, 26, 27, 30 |
| 13 | Empate no trancado vira vitória do J1 | **TC-DM-20** (só ele) |
| 14 | Trancado só detectado depois de um passe | TC-DM-19, 20, 25, 26, 27, 30 |
| 15 | Trancado só detectado logo depois de uma jogada | **TC-DM-30** (só ele) |
| 16 | Trancado declarado quando o monte acaba, mesmo com alguém ainda podendo jogar | TC-DM-15, 24, 26 |
| 17 | Fim de jogo não bloqueia jogadas nem botões | TC-DM-21, 27, 30 |
| 18 | Nova partida não restaura mãos e monte | TC-DM-22, 28, 29 |
| 19 | Nova partida não limpa a mensagem | **TC-DM-28** (só ele) |
| 20 | Nova partida não volta a vez para quem começa | **TC-DM-28** (só ele) |
| 21 | Pontos = quantidade de peças, não a soma | TC-DM-19, 20, 25, 26, 27, 30 |
| 22 | *(extra)* Fim bloqueia os botões, mas ainda deixa jogar peça | **sobrevive** — ver "Achados" |

### O que a validação mudou nos testes

- **TC-DM-15:** o mutante 8 sobrevivia a tudo. O TC-DM-16 confere "passar desabilitado com jogada", mas com o monte cheio, e aí o botão já ficaria desabilitado por causa do monte. O teste foi reforçado (`test: reforça TC-DM-15 ...`): depois do passe, é a vez do J1, o monte está vazio e ele tem o 1-6, então `btn-passar` precisa estar desabilitado. Isso decorre da seção 1 e não muda o resultado esperado da seção 5.
- **TC-DM-30 (novo):** o plano previa que o TC-DM-26 pegaria o mutante 15 ("trancado só depois de uma jogada"). A simulação mostrou que **não pega**: no TC-DM-26 o jogo também tranca logo depois de uma jogada (o 3-6). Depois de um passe, a mesa não muda, então o único jeito de trancar sem ser logo depois de uma jogada é **logo depois de uma compra** que esvazia o monte. Por isso foi criado o TC-DM-30, que é o único teste que mata o mutante 15. O TC-DM-24 é o caso contrário: o monte acaba na compra, mas o outro ainda pode jogar, e o jogo não tranca.
- **TC-DM-24:** saiu uma conferência de `pontos-j1`/`pontos-j2` vazios antes do fim. A seção 3 só diz que os pontos aparecem quando o jogo tranca, e não diz que ficam vazios antes (ver ambiguidade 2).
- **TC-DM-30:** saiu uma conferência de `mensagem` vazia **antes** da compra, apontada pelo `revisor-tdd`. Nem a seção 1 nem a seção 5 dizem isso, e um jogo poderia mostrar, por exemplo, "compre do monte".
- **TC-DM-22:** a revisão apontou que só a mão do J1 era conferida depois da nova partida, mas a seção 1 diz "as mesmas mãos". O teste foi reforçado (`test: reforça TC-DM-22 ...`) para conferir também os 7 `data-testid` de `J2_PADRAO` na mão escondida.
- **TC-DM-28** é o único teste que pega os mutantes 19 e 20. No TC-DM-22 (nova partida no meio do jogo) a mensagem já está vazia e a vez já é do J1, então os defeitos não aparecem. Isso justifica o caso adicional.
- **TC-DM-20** é o único teste que pega o mutante 13, e o **TC-DM-25** é o único com vitória do J2 no trancado.

## Achados

- **Bloqueio de jogada depois do fim só é testado pelos botões.** Depois de trancar, ninguém tem jogada (é a definição de trancado). No TC-DM-21, depois da batida do J2, o J1 só tem o 0-0, que não encaixa no 6 nem no 1. Então um jogo que bloqueia comprar e passar no fim, mas ainda **deixa jogar peça**, passa em todos os testes (mutante 22). Para pegar isso é preciso um cenário em que o outro jogador ainda tem peça que encaixa quando alguém bate. Sugestão de caso para a dupla (virou o TC-DM-43 na F6, ver a seção abaixo):

  | ID | Cenário | Parâmetros / passos | Resultado esperado |
  |---|---|---|---|
  | TC-DM-43 | Depois de bater, o outro não joga nem peça que encaixa | `?j1=6-6&j2=1-6,0-0&monte=`. J1 joga 6-6 (bate); clicar `peca-1-6` e depois `ponta-direita` | `mensagem` = "Jogador 1 venceu!"; `mesa` = "6-6"; `peca-1-6` continua em `mao-j2`; `qtd-j2` = 2 |

## Lacunas fechadas (F6)

Depois da entrega dos 34 TCs, uma auditoria repetiu a validação com uma referência nova (só seções 1 e 3, fora do repositório) e um painel maior de defeitos plantados. A suíte antiga matava **40 de 62** mutantes. Os 22 sobreviventes eram lacunas reais (nenhum é equivalente: todos aparecem na tela). Os TC-DM-35 a 53 (`tests/lacunas-felipe.spec.js`) foram escritos para matar exatamente esses 22.

| Verificação | Antes (34 TCs) | Depois (53 TCs) |
|---|---|---|
| Suíte contra a referência | 34/34 | **54/54** (53 IDs; o TC-DM-41 tem 2 casos) |
| 3 rodadas seguidas | 34/34 nas 3 | 54/54 nas 3 |
| Variantes da referência (render com `setTimeout`, abertura `5-6` × `6-5`, desempate de soma J1 × J2, pontos sempre visíveis, e as quatro juntas) | 34/34 | 54/54 em todas |
| Mutantes mortos | **40/62** | **62/62** |

### Mutante → TCs novos que o matam

| Mutante (defeito plantado) | Antes | Pego por |
|---|---|---|
| J2 abre com qualquer peça | sobrevivia | TC-DM-35, 46 |
| Peça da mão escondida pode ser jogada (em qualquer momento) — é o mutante 14 do Henrique | sobrevivia | TC-DM-36 |
| Peça da mão escondida do J1 pode ser jogada | sobrevivia | TC-DM-36 |
| Peça da mão escondida pode ser jogada com a mesa não vazia | sobrevivia | TC-DM-36 |
| `data-selecionada` nunca é marcado | sobrevivia | TC-DM-37 |
| Só o J2 consegue comprar | sobrevivia | TC-DM-38 |
| Só o J2 consegue passar | sobrevivia | TC-DM-38, 39 |
| "Tem jogada" olha só a ponta direita | sobrevivia | TC-DM-40, 48 |
| "Tem jogada" olha só a ponta esquerda | sobrevivia | TC-DM-38, 39, 40 |
| Trancado com diferença de até 1 ponto vira empate | sobrevivia | TC-DM-41 |
| Depois do fim, a peça que encaixa ainda entra (sem aviso) — é o mutante 22 acima | sobrevivia | TC-DM-43 |
| Nova partida mantém a vez de quem estava jogando | sobrevivia | TC-DM-42, 44, 52, 53 |
| Nova partida não reabre o jogo depois de trancar | sobrevivia | TC-DM-44 |
| A abertura aceita qualquer carroça (não só a maior) | sobrevivia | TC-DM-45 |
| Sem carroça, começa sempre o J1 | sobrevivia | TC-DM-46 |
| Pontas erradas depois de abrir com peça que não é carroça | sobrevivia | TC-DM-46 |
| Depois de bater, ainda compra (monte com peças) | sobrevivia | TC-DM-47 |
| Batida pela ponta esquerda não conta | sobrevivia | TC-DM-48 |
| Trancado logo depois de uma compra dá sempre vitória ao J1 | sobrevivia | TC-DM-49 |
| Empate só reconhecido com 5 × 5 | sobrevivia | TC-DM-50 |
| Não tranca quando a 2ª compra seguida esvazia o monte | sobrevivia | TC-DM-51 |
| Nova partida devolve o monte em outra ordem | sobrevivia | TC-DM-52 |

Dois mutantes do painel já eram mortos pela suíte antiga e **não** ganharam TC: "trancado após compra inverte o vencedor" (TC-DM-30) e "clicar só na peça, com a mesa não vazia, já joga" (TC-DM-08, 10, 33).

### Atualização dos achados anteriores

- **Mutante 22 deste documento** (fim bloqueia os botões, mas ainda deixa jogar peça): **fechado** pelo TC-DM-43. Na referência da auditoria, o TC-DM-21 só o pegava quando o jogo mostrava "inválida" depois do fim (a mensagem de vitória era trocada); na versão silenciosa ele sobrevivia.
- **Mutante 14 do Henrique** (permite jogar peça da mão escondida): na referência da auditoria ele **sobrevivia** ao TC-DM-11, porque o TC-DM-11 usa a mesa vazia e a regra da abertura já recusa a peça do outro. **Fechado** pelo TC-DM-36, que tenta a jogada no meio da partida, nos dois sentidos.

### Ambiguidades que os TCs novos evitam de propósito

Nenhum TC novo confere: a orientação da abertura sem carroça (o TC-DM-46 compara as pontas sem ordem), a troca de seleção entre duas peças (o TC-DM-37 só confere a peça clicada), mensagens durante compra/passe ou depois do fim além das que a seção 5 já fixa, `vez` depois do fim, nem pontos antes de trancar.

## Ambiguidades da especificação (decisão pendente da dupla)

Nenhum teste depende delas. Para escrever a referência foi preciso escolher; as escolhas **não** viraram regra. Numeração continua a do Henrique.

8. **O que `vez` mostra depois do fim** (batida ou trancado): fica com quem jogou por último, passa para o outro ou fica vazio? Os TCs 17 a 21, 25 a 27 e 30 não conferem `vez` depois do fim.
9. **`pontos-j1`/`pontos-j2` antes de trancar e depois de "Nova partida":** a seção 3 diz que aparecem "quando o jogo tranca", mas não diz se ficam vazios antes, nem se somem na nova partida. Nenhum teste confere pontos fora do trancado.
10. **Comprar quando há jogada numa ponta só:** a seção 1 diz "nenhuma peça que encaixe", então ter jogada em qualquer ponta já bloqueia a compra. Os testes assumem isso, mas nenhum monta o caso de encaixe numa ponta só com a outra bloqueada.
11. **Quem começa a "Nova partida" sem parâmetros quando há empate de soma:** complementa a ambiguidade 7 do Henrique. O TC-DM-29 não confere quem começa a nova partida e, na abertura, tenta todas as peças empatadas da mão visível.
12. **Mensagem durante a compra e o passe:** a seção 1 não diz se comprar ou passar mostram aviso ("comprou 0-1", "Jogador 2 passou"). Os TCs 24 e 26 esperam `mensagem` vazia nesses momentos porque está na seção 5; se a dupla quiser avisos, essas duas linhas mudam.
13. **Precedência batida × trancado:** a seção 1 diz que quem bate "vence na hora". O TC-DM-17 lê isso como "a batida vale antes do trancado" (no momento em que o J1 bate, o J2 também não poderia jogar e o monte está vazio). Vale deixar isso escrito na seção 1.
