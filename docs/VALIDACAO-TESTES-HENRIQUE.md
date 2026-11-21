# Validação dos testes do Henrique (TC-DM-01 a 12 e 31 a 34)

Num repositório "somente testes", **falhar pelo motivo certo não prova que o teste está correto**: um teste com o resultado esperado errado também falha. Esta validação confere os dois lados:

1. **O teste aceita um jogo certo:** todos passam contra uma implementação que segue a especificação.
2. **O teste recusa um jogo errado:** cada defeito plantado nessa implementação é pego por pelo menos um teste.

## Método

- O repositório foi copiado para um diretório temporário **fora do clone**. Nada dele foi commitado, e o diretório foi apagado no fim.
- Lá foi escrita uma **implementação de referência mínima** do jogo em `js/main.js`, seguindo só o PLANEJAMENTO.md (seções 1 e 3): parâmetros `j1`/`j2`/`monte`, `data-testid`, `data-oculta`, `data-selecionada`, quem começa, abertura obrigatória, encaixe, giro, vez, comprar, passar, bater e trancar. **A implementação não é entregável e não está no repositório.** O jogo continua não implementado: `js/main.js` segue vazio.
- Contra ela foram rodados apenas `tests/inicio.spec.js` e `tests/jogadas.spec.js`, sem mudar nenhum teste.
- **Mutação manual:** a referência tem chaves que ligam um defeito por vez (variável de ambiente). Para cada defeito, a suíte foi rodada de novo e foram anotados os testes que falharam.

## Resultados

| Verificação | Resultado |
|---|---|
| Suíte contra a referência | **16/16 passando** |
| Suíte rodada 3 vezes seguidas | 16/16 nas 3, nenhum teste intermitente |
| TC-DM-01 (distribuição sorteada) rodado 50 vezes | **50/50 passando**: não depende de sorte |
| Mutantes mortos | **16/16** |

## Mutante → testes que o pegaram

| # | Defeito plantado | Pego por |
|---|---|---|
| 1 | Distribui 6 peças por jogador | TC-DM-01 |
| 2 | Distribui 8 peças por jogador | TC-DM-01 |
| 3 | Distribuição aleatória com peça repetida | TC-DM-01 (50/50 depois do reforço; ver abaixo) |
| 4 | Mão do outro jogador mostra os números | TC-DM-01, 02, 03, 04, 06, 11, 31, 34 |
| 5 | Quem começa usa a soma antes da carroça | **TC-DM-31** (só ele) |
| 6 | Quem começa escolhe a menor carroça | TC-DM-02, 05, 06, 07, 08, 09, 10, 11, 12, 33, 34 |
| 7 | Aceita qualquer peça na abertura | TC-DM-05, 32 |
| 8 | Não gira a peça (mesa `6-6 1-6`) | TC-DM-07, 10, 12, 33, 34 |
| 9 | Peça jogada à esquerda entra à direita | TC-DM-08, 33 |
| 10 | Ponta não atualiza depois da jogada | TC-DM-07, 08, 10, 33, 34 |
| 11 | Aceita peça que não encaixa | TC-DM-09, 10 |
| 12 | Jogada inválida passa a vez | TC-DM-05, 09, 10, 32 |
| 13 | A vez não alterna depois de jogada válida | TC-DM-06, 07, 08, 09, 10, 12, 32, 33, 34 |
| 14 | Permite jogar peça da mão escondida | TC-DM-11 |
| 15 | `qtd-*` não diminui depois da jogada | TC-DM-05, 06, 07, 08, 10, 12, 32, 33, 34 |
| 16 | Recusa a jogada inválida sem mensagem | TC-DM-05, 09, 10, 32 |

### O que a validação mudou nos testes

- **TC-DM-01:** na primeira rodada, o mutante 3 (peça repetida) **sobreviveu** quando a vez era do Jogador 2, porque o teste só conferia peças distintas na mão visível. O teste foi reforçado (`test: reforça TC-DM-01 ...`): as 14 peças das duas mãos precisam ter `data-testid` válido e diferente. A mão escondida também tem `peca-A-B` (seção 3). Depois disso o mutante 3 morreu 50/50.
- **TC-DM-34:** a revisão apontou que faltava conferir as pontas depois de uma jogada válida (`test: reforça TC-DM-34 ...`).
- **TC-DM-31** é o único teste que pega o mutante 5. Isso justifica o caso adicional: os TCs 03 e 04 sozinhos não provam que a carroça tem prioridade sobre a soma.

## Ambiguidades da especificação (decisão pendente da dupla)

Nenhum teste depende delas. Para escrever a referência, foi preciso escolher; as escolhas abaixo **não** viraram regra.

1. **Orientação da peça de abertura que não é carroça:** a mesa mostra `5-6` ou `6-5`? O TC-DM-32 só confere que a peça está na mesa.
2. **Trocar a seleção:** clicar numa peça e depois em outra faz a seleção mudar? O `data-selecionada` sai da primeira?
3. **Clicar numa ponta sem peça selecionada:** não acontece nada, ou aparece mensagem?
4. **A mensagem "inválida" some depois de uma jogada válida?** Não há regra para o meio do jogo. O TC-DM-22 do Felipe espera a mensagem vazia só depois de "Nova partida".
5. **`data-selecionada` na abertura:** a abertura vai à mesa com um clique. A peça chega a ficar selecionada?
6. **Ordem das peças na mão:** é a ordem do parâmetro, ou ordenada? Os testes comparam conjuntos e não dependem disso.
7. **Empate em quem começa sem carroça:** duas peças diferentes podem ter a mesma maior soma. Exemplo: J1 com 3-6 e J2 com 4-5, as duas somando 9, e ninguém com peça maior. A spec não diz quem começa nesse caso.
