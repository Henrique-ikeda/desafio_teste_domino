# Matriz regra → casos de teste — Dominó

Cada regra da seção 1 do PLANEJAMENTO.md tem pelo menos um caso de teste que obriga o jogo a cumpri-la. "Obriga" quer dizer que o teste **falharia** contra um jogo que desrespeita a regra (confirmado com defeitos plantados numa referência: ver [VALIDACAO-TESTES-FELIPE.md](VALIDACAO-TESTES-FELIPE.md)).

| # | Regra (seção 1) | TCs |
|---|---|---|
| 1 | 7 peças para cada um, 14 no monte (sorteio ou parâmetros) | 01, 02, 29 |
| 2 | Mão de quem não está na vez fica escondida | 01, 02, 06, 34, 42, 53 |
| 3 | A mão escondida não joga (na abertura e no meio da partida, nos dois sentidos) | 11 (só na abertura), 36 |
| 4 | Começa a maior carroça; sem carroça, a maior soma (J1 e J2) | 03, 04, 31, 46 |
| 5 | A abertura é obrigatoriamente essa peça (J1 e J2; outra carroça não vale) | 05, 32, 35, 45 |
| 6 | Encaixar numa ponta; a peça gira sozinha; a vez passa | 06, 07, 08, 10, 33, 34 |
| 7 | Jogada inválida não muda nada e a vez continua | 05, 09, 10, 32, 35, 45 |
| 8 | Contadores de peças | 12, 14, 22, 23, 38 |
| 9 | Comprar só sem jogada e com monte; uma por clique, até poder jogar (J1 e J2) | 13, 14, 23, 24, 38, 51 |
| 10 | Passar só sem jogada e com o monte vazio (J1 e J2) | 15, 16, 24, 39 |
| 11 | Peça que encaixa em uma só das pontas já conta como jogada | 40 |
| 12 | Bater = vitória (a batida vale antes do trancado; vale também pela esquerda e no meio da partida) | 17, 18, 48 |
| 13 | Jogo trancado: menos pontos vence; pontos iguais = empate | 19, 20, 25, 26, 30, 41, 49, 50, 51 |
| 14 | Nada funciona depois do fim (bater ou trancar): botões e peças que encaixariam | 21, 27, 43, 47 |
| 15 | Nova partida (com parâmetros, depois do fim, depois de trancar, sorteada de novo, mesma ordem do monte, vez de quem começa) | 22, 28, 29, 42, 44, 52, 53 |
| 16 | Peça selecionada fica marcada (`data-selecionada`) | 37 |

O TC-DM-24 só confirma que o jogo **não** tranca quando o outro ainda joga (não prova a regra 13 sozinho).

## O que mudou na revisão (F6)

A auditoria rodou a suíte contra uma referência com defeitos plantados e mostrou que algumas ligações da versão anterior da matriz estavam "infladas". Elas foram corrigidas:

- **Mão escondida não joga:** o TC-DM-11 usa a mesa vazia, então a regra da abertura já recusaria a peça do outro jogador. Quem isola a regra é o **TC-DM-36**.
- **Abertura obrigatória:** os TC-DM-05 e 32 só testam o J1 e uma peça que não é carroça. Passam a valer também o **TC-DM-35** (J2) e o **TC-DM-45** (outra carroça que não é a maior).
- **Nada funciona depois do fim:** os TC-DM-21 e 27 tentam jogar peças que **não** encaixam, então só provam os botões. A peça que encaixaria é o **TC-DM-43**; comprar com monte cheio é o **TC-DM-47**.
- **Simetria:** comprar e passar eram testados só pelo J2 (TC-DM-38 e 39 cobrem o J1); a abertura só pelo J1 (TC-DM-35 e 46 cobrem o J2).

**Para que serve:** se alguém fosse implementar o jogo só a partir destes testes, toda regra do jogo teria um teste exigindo que ela exista.
