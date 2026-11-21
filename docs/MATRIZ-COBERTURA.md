# Matriz regra → casos de teste — Dominó

Cada regra da seção 1 do PLANEJAMENTO.md tem pelo menos um caso de teste que obriga o jogo a cumpri-la.

| # | Regra (seção 1) | TCs |
|---|---|---|
| 1 | 7 peças para cada um, 14 no monte (sorteio ou parâmetros) | 01, 02 |
| 2 | Mão de quem não está na vez fica escondida e não joga | 01, 02, 06, 11, 34 |
| 3 | Começa a maior carroça; sem carroça, a maior soma | 03, 04, 31 |
| 4 | A abertura é obrigatoriamente essa peça | 05, 32 |
| 5 | Encaixar numa ponta; a peça gira sozinha; a vez passa | 06, 07, 08, 10, 33, 34 |
| 6 | Jogada inválida não muda nada e a vez continua | 05, 09, 10, 32 |
| 7 | Contadores de peças | 12, 14, 22, 23 |
| 8 | Comprar só sem jogada e com monte; uma por clique, até poder jogar | 13, 14, 23, 24 |
| 9 | Passar só sem jogada e com o monte vazio | 15, 16, 24 |
| 10 | Bater = vitória | 17, 18 |
| 11 | Jogo trancado: menos pontos vence; pontos iguais = empate | 19, 20, 24 |
| 12 | Nada funciona depois do fim | 21 |
| 13 | Nova partida | 22 |

**Para que serve:** se alguém fosse implementar o jogo só a partir destes testes, toda regra do jogo teria um teste exigindo que ela exista.
