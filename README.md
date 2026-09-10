# 🌵 Rede Raízes do Nordeste

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](#)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](#)
[![Deploy](https://img.shields.io/badge/GitHub_Pages-Active-brightgreen)](https://anonymospv.github.io/raizes-nordeste/)

> Protótipo funcional dos três canais de atendimento para uma rede de lanchonetes de culinária nordestina: **App Mobile**, **Totem de Autoatendimento** e **Painel Web (Cozinha e Gerência)**.

Projeto desenvolvido para a disciplina de **Projeto Multidisciplinar (Trilha Front-End)**.

---

## 🌐 Demonstração e Acesso

- 🔗 **Aplicação rodando no GitHub Pages:** [Acessar Projeto](https://anonymospv.github.io/raizes-nordeste/)
- 📄 **Documentação Acadêmica Completa:** `docs/4569469_Projeto_Front_End_2026_V2.docx`

---

## 🚀 Como Executar Localmente

O projeto utiliza **ES Modules** (`type="module"`). Devido às restrições de CORS do navegador em arquivos locais (`file://`), é necessário utilizar um servidor web simples.

```bash
# Clone este repositório
git clone [https://github.com/anonymospv/raizes-nordeste.git](https://github.com/anonymospv/raizes-nordeste.git)

# Acesse a pasta do projeto
cd raizes-nordeste

# Inicie um servidor HTTP local com Python
python3 -m http.server 8000

## Estrutura

.
├── index.html           # Seletor de canal (Hub de entrada)
├── app/                 # Canal Cliente (App Mobile-first)
├── totem/               # Canal Totem de Autoatendimento
├── painel/              # Canal Web (Cozinha e Gerência)
└── assets/
    ├── css/
    │   ├── tokens.css   # Cores, tipografia e espaçamentos (Fonte única de verdade)
    │   ├── base.css     # Reset CSS e componentes globais
    │   ├── lgpd.css     # Banner e modal de privacidade
    │   ├── hub.css      # Estilização do seletor de canal
    │   └── app.css      # Estilizações específicas do App
    └── js/
        ├── data/        # Mocks: unidades, cardápios e campanhas
        ├── core/        # Store (Observer), formatação e módulo LGPD
        └── app/         # Lógica e navegação das telas

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

🛠️ Arquitetura e Decisões Técnicas
Valores monetários em centavos inteiros: Todo cálculo financeiro utiliza inteiros para evitar inconsistências de ponto flutuante. A formatação para R$ ocorre apenas na renderização via Intl.NumberFormat.

Gerenciamento de Estado (Observer Pattern): Arquitetura sem frameworks. O estado centralizado notifica a interface sobre mudanças, garantindo o desacoplamento entre lógica e DOM.

Privacidade e LGPD por design: Persistência no localStorage sujeita à autorização prévia do usuário. Dados essenciais de navegação utilizam como base legal a execução de contrato.

Acessibilidade e Usabilidade:

Alvos de toque de 44px no App e Painel (Diretriz WCAG 2.5.5).

Alvos de toque expandidos para 72px no Totem.

Sessão temporizada no Totem (60s) com higienização de dados ao encerrar.

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

## Finalidade

Projeto acadêmico, sem fins lucrativos nem comerciais, serve apenas de aprendizado com a mão na massa e bastante documentação, integridade, estudo sobre LGPD e coding.

Resolvi desenvolver tudo no local e depois subir a build toda para o github, então não vai exibir todos os meus comits, Mas o desenvolvimento todo levou 5 dias, contando com a documentação e o arquivo PDF para entrega da faculdade.

Espero que gostem :)
