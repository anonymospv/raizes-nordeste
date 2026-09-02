# Rede Raízes do Nordeste

Protótipo funcional dos três jeitos de atender numa rede de lanchonetes
nordestina: app, totem de autoatendimento e painel web (cozinha e gerência).
Projeto da disciplina de Projeto Multidisciplinar — trilha Front-End.

HTML, CSS e JavaScript puros. Sem framework, sem build, sem dependência
nenhuma.

## Como rodar

O projeto usa módulos ES (`type="module"`), e o navegador bloqueia isso
quando você abre direto pelo `file://`. Então precisa de um servidor local:

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

## Estrutura

```
.
├── index.html              seletor de canal (porta de entrada)
├── app/                    canal cliente, mobile-first
├── totem/                  canal de autoatendimento
├── painel/                 canal cozinha e gerência
└── assets/
    ├── css/
    │   ├── tokens.css      cor, tipografia, espaçamento — a fonte única de verdade
    │   ├── base.css        reset e componentes compartilhados
    │   ├── lgpd.css        banner e painel de privacidade
    │   ├── hub.css         seletor de canal
    │   └── app.css         canal APP
    └── js/
        ├── data/           dados mockados: unidades, cardápio, campanhas
        ├── core/           store, formatação, consentimento LGPD
        └── app/            telas do canal APP
```

## Decisões técnicas

**Preço em centavos inteiros.** Todo cálculo de carrinho, desconto e total
usa `Number` inteiro representando centavos. Ponto flutuante acumula erro de
arredondamento e o total sai errado por um centavo — chato de caçar depois. A
conversão pra `R$ 22,90` só acontece na hora de mostrar na tela, via
`Intl.NumberFormat`.

**Store com padrão observador.** Tem um módulo central guardando o estado e
avisando quem se inscreveu nele. Quem mexe no estado não sabe nada sobre o
DOM; quem desenha a tela não sabe de onde veio a mudança. Sem isso, em JS
puro, cada botão ia acabar mexendo no DOM direto e o estado ia se espalhar
pela aplicação inteira.

**Persistência depende do consentimento.** O `localStorage` só grava dado de
personalização se o titular autorizou. Unidade e carrinho são sempre
gravados, porque sem eles o pedido nem funciona — isso é execução de
contrato, não consentimento. Se a pessoa revogar a personalização, o
histórico já coletado é apagado.

**Disponibilidade é calculada, não listada.** A unidade diz o que ela tem
(formato da cozinha, região, estoque do dia). O produto diz o que ele precisa
(cozinha completa, região, temporada). O cardápio da loja é o cruzamento dos
dois. A outra opção — cada unidade listar os IDs que ela serve — foi
descartada: abrir a 40ª loja ia dar trabalho de editar 40 listas, e a regra
"baião de dois precisa de fogão" ia ficar repetida em todo canto.

**Trocar de unidade esvazia o carrinho.** Pode ser que o item nem exista na
loja nova. Isso é regra de negócio, não limitação do protótipo.

**Esgotado aparece, não some.** Item sem estoque continua visível, só fica
desabilitado, com o motivo escrito. Se sumisse da lista, a pessoa ia achar
que a busca deu problema.

**Um listener por tela.** Os eventos usam delegação a partir do `document`.
Como a tela inteira é redesenhada a cada mudança de estado, listener grudado
em elemento individual se perderia no redesenho.

**Alvos de toque.** 44px no app e no painel (o mínimo do WCAG 2.5.5), 72px no
totem, que é usado em pé e sem apoio da mão.

## Estado atual

Implementado:

- **Seletor de canal** (`/`) — a porta de entrada, com os três canais
- **App** (`/app/`) — unidade, cardápio por loja, filtros, campanhas,
  carrinho, pagamento, acompanhamento do pedido, conta e pontos
- **Totem** (`/totem/`) — as mesmas telas, alvos de 72px, sem login, sessão
  que expira em 60s e apaga o pedido do cliente anterior
- **Painel** (`/painel/`) — fila da cozinha em três colunas, indicadores por
  unidade e auditoria de cancelamentos
- **LGPD** — consentimento granular, revogação, relatório agregado sem dado
  pessoal, registro de operação sensível

Pensado e documentado, mas fora do escopo do protótipo por enquanto: estoque
em tempo real, relatórios consolidados da matriz, controle de acesso por
perfil, autenticação com senha, segmentação de campanha por perfil.

## Fluxo de pagamento

O sistema **pede** o pagamento, **recebe** confirmação ou negativa,
**registra** o resultado e **atualiza** o status. Não processa nada de
verdade aqui. `solicitarPagamento` simula o provedor externo com três
desfechos, e a tela de pagamento tem um seletor pra forçar cada um:

| Desfecho | O que a interface faz |
|---|---|
| Aprovado | Credita pontos, esvazia o carrinho, manda pra cozinha |
| Recusado | Mostra o código do emissor e **mantém os itens no carrinho** |
| Timeout | Avisa que nada foi cobrado e deixa tentar de novo |

O pedido já nasce com status `aguardando` antes da chamada. Se nascesse
depois, uma falha de rede deixaria o pagamento sem pedido correspondente.

## Deploy

GitHub Pages, branch `main`, pasta raiz. Sem build: o site publicado é o
próprio repositório.