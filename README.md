# Rede Raízes do Nordeste

Protótipo funcional dos três canais de atendimento de uma rede de lanchonetes
nordestina: aplicativo, totem de autoatendimento e painel web (cozinha e
gerência). Projeto acadêmico da disciplina de Projeto Multidisciplinar —
trilha Front-End.

HTML, CSS e JavaScript puros. Sem framework, sem build, sem dependências.

## Como rodar

O projeto usa módulos ES (`type="module"`), que o navegador bloqueia via
`file://`. Precisa de um servidor local:

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

## Estrutura

```
.
├── index.html              seletor de canal (porta de entrada)
├── app/                    canal cliente, mobile-first
├── totem/                  canal autoatendimento
├── painel/                 canal cozinha e gerência
└── assets/
    ├── css/
    │   ├── tokens.css      cor, tipografia, espaçamento — fonte única de verdade
    │   ├── base.css        reset e componentes compartilhados
    │   ├── lgpd.css        banner e painel de privacidade
    │   ├── hub.css         seletor de canal
    │   └── app.css         canal APP
    └── js/
        ├── data/           mock data: unidades, cardápio, campanhas
        ├── core/           store, formatação, consentimento LGPD
        └── app/            telas do canal APP
```

## Decisões técnicas

**Preço em centavos inteiros.** Todo cálculo de carrinho, desconto e total usa
`Number` inteiro representando centavos. Ponto flutuante acumula erro de
arredondamento e produz totais errados por um centavo. A conversão para
`R$ 22,90` acontece só na exibição, via `Intl.NumberFormat`.

**Store com padrão observador.** Um módulo central guarda o estado e notifica
assinantes. Quem altera estado não conhece o DOM; quem desenha tela não conhece
a origem da mudança. Sem isso, com JS puro, cada botão acabaria manipulando o
DOM direto e o estado se espalharia pela aplicação.

**Persistência subordinada ao consentimento.** `localStorage` só grava dados de
personalização se o titular autorizou. Unidade e carrinho são gravados sempre,
porque sem eles o pedido não funciona — base legal de execução de contrato, não
consentimento. Revogar a personalização apaga o histórico já coletado.

**Disponibilidade calculada, não listada.** A unidade declara o que ela é
(formato da cozinha, região, estoque do dia). O produto declara o que ele exige
(cozinha completa, região, temporada). O cardápio da loja é o cruzamento dos
dois. A alternativa — cada unidade listar os IDs que serve — foi descartada:
abrir a 40ª loja exigiria editar 40 listas, e a regra "baião de dois precisa de
fogão" ficaria repetida em todas elas.

**Trocar de unidade esvazia o carrinho.** Um item pode não existir na loja nova.
É restrição de negócio, não limitação do protótipo.

**Esgotado aparece, não some.** Item sem estoque fica visível e desabilitado,
com o motivo. Se sumisse da lista, o cliente concluiria que a busca falhou.

**Um listener por tela.** Eventos usam delegação a partir do `document`. Como a
tela é redesenhada inteira a cada mudança de estado, listeners presos a
elementos individuais seriam perdidos no redesenho.

**Alvos de toque.** 44px no app e no painel (mínimo da WCAG 2.5.5), 72px no
totem, que é operado em pé e sem apoio da mão.

## Estado atual

Pronto:

- Seletor de canal
- Canal APP: seleção de unidade, cardápio dinâmico por loja, filtro por
  categoria, campanhas promocionais com desconto aplicado, carrinho
- Regras do estudo de caso no modelo: formato de cozinha reduzida, produtos
  sazonais do período junino, variação regional de receita, estoque local
- `verificar.mjs`: 22 cenários automatizados sobre a camada de dados
  (`node verificar.mjs`)
- Consentimento LGPD granular, com revogação

Pendente:

- Carrinho, checkout e fluxo de pagamento externo
- Acompanhamento de status do pedido
- Cadastro, autenticação e programa de fidelidade
- Canal totem
- Canal painel (cozinha e gerência)

## Deploy

GitHub Pages, branch `main`, pasta raiz. Como não há build, o site publicado é
o próprio repositório.
