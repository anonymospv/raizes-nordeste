// tela de cardápio do app

import { UNIDADES, buscarUnidade, estaAberta } from "../data/unidades.js";
import { CATEGORIAS, CAMPANHAS, buscarProduto, cardapioDaUnidade } from "../data/cardapio.js";
import * as store from "../core/store.js";
import { iniciarLgpd } from "../core/lgpd.js";
import { reais, duracao, plural, escapar, iniciais } from "../core/format.js";

let categoriaAtiva = "todas";

// inicialização

function iniciar() {
  store.carregar();
  store.definirCanal(document.body.dataset.canal || "app");
  iniciarLgpd();

  // valida unidade salva
  const salva = store.obterEstado().unidadeId;
  if (!salva || !buscarUnidade(salva)) {
    store.definirUnidade(UNIDADES.find((u) => u.fundadora).id);
  }

  store.assinar(renderizar);
  document.addEventListener("click", tratarClique);
  renderizar();
}

// delegação de eventos

function tratarClique(evento) {
  const alvo = evento.target.closest("[data-acao]");
  if (!alvo) {
    if (evento.target.matches(".folha")) fecharFolha();
    return;
  }

  const { acao, valor } = alvo.dataset;

  switch (acao) {
    case "abrir-unidades":
      abrirFolha();
      break;
    case "escolher-unidade":
      store.definirUnidade(valor);
      fecharFolha();
      break;
    case "fechar-folha":
      fecharFolha();
      break;
    case "filtrar":
      categoriaAtiva = valor;
      renderizar();
      break;
    case "adicionar":
      store.adicionarAoCarrinho({ produtoId: valor });
      break;
    case "ir-carrinho":
      window.location.href = "carrinho.html";
      break;
  }
}

// campanhas

// campanhas válidas agora
function campanhasAtivas(unidade, agora = new Date()) {
  return CAMPANHAS.filter((c) => {
    if (c.unidades && !c.unidades.includes(unidade.id)) return false;
    if (c.diasSemana && !c.diasSemana.includes(agora.getDay())) return false;
    if (new Date(c.validoAte) < agora) return false;
    return true;
  });
}

// desconto em centavos
function descontoDoProduto(produtoId, campanhas) {
  const campanha = campanhas.find(
    (c) => c.tipo === "desconto-percentual" && c.itens.includes(produtoId)
  );
  if (!campanha) return 0;
  const produto = buscarProduto(produtoId);
  return Math.round((produto.preco * campanha.percentual) / 100);
}

// renderização

function renderizar() {
  const estado = store.obterEstado();
  const unidade = buscarUnidade(estado.unidadeId);
  const app = document.getElementById("app");

  const aberta = estaAberta(unidade);
  const campanhas = campanhasAtivas(unidade);
  const produtos = cardapioDaUnidade(unidade);

  app.innerHTML = `
    ${cabecalho(unidade, aberta, estado)}
    ${campanhas.length ? faixaCampanha(campanhas[0]) : ""}
    ${filtros(produtos)}
    <div class="cardapio">${listaCardapio(produtos, campanhas)}</div>
    ${barraCarrinho(estado, campanhas)}
  `;

  renderizarFolha(estado.unidadeId);
}

function cabecalho(unidade, aberta, estado) {
  const pontos = estado.usuario?.pontos ?? 0;
  return `
    <header class="app-cabecalho">
      <div class="app-cabecalho__topo">
        <span class="app-cabecalho__marca">Raízes do Nordeste</span>
        ${
          estado.canal === "totem"
            ? '<span class="app-cabecalho__pontos">Autoatendimento</span>'
            : `<a class="app-cabecalho__pontos" href="entrar.html">${pontos} pts</a>`
        }
      </div>
      <button class="seletor-unidade" data-acao="abrir-unidades">
        <span class="seletor-unidade__texto">
          <span class="seletor-unidade__rotulo">
            Retirar em ${aberta ? `· aberta até ${unidade.horario.fecha}` : "· fechada agora"}
          </span>
          <span class="seletor-unidade__nome">${escapar(unidade.nome)}</span>
        </span>
        <span class="seletor-unidade__seta">Trocar</span>
      </button>
    </header>
  `;
}

function faixaCampanha(campanha) {
  return `
    <div class="campanha">
      <span class="selo selo--promo">Promoção</span>
      <span class="campanha__texto">
        <strong>${escapar(campanha.titulo)}</strong>
        <span>${escapar(campanha.chamada)}</span>
      </span>
    </div>
  `;
}

function filtros(produtos) {
  const presentes = CATEGORIAS.filter((c) => produtos.some((p) => p.categoria === c.id));
  const botoes = [{ id: "todas", nome: "Tudo" }, ...presentes]
    .map(
      (c) => `
      <button
        class="filtro"
        data-acao="filtrar"
        data-valor="${c.id}"
        aria-pressed="${categoriaAtiva === c.id}"
      >${escapar(c.nome)}</button>`
    )
    .join("");
  return `<div class="filtros" role="group" aria-label="Filtrar por categoria">${botoes}</div>`;
}

function listaCardapio(produtos, campanhas) {
  const visiveis =
    categoriaAtiva === "todas"
      ? produtos
      : produtos.filter((p) => p.categoria === categoriaAtiva);

  if (!visiveis.length) {
    return `
      <div class="vazio">
        <h3>Nada nessa categoria por aqui</h3>
        <p>Esta unidade não serve itens desse tipo. Toque em "Tudo" para ver o cardápio completo.</p>
      </div>`;
  }

  const categoriasVisiveis = CATEGORIAS.filter((c) => visiveis.some((p) => p.categoria === c.id));

  return categoriasVisiveis
    .map(
      (cat) => `
      <section class="cardapio__grupo">
        <h2 class="cardapio__titulo">${escapar(cat.nome)}</h2>
        ${visiveis
          .filter((p) => p.categoria === cat.id)
          .map((p) => cartaoProduto(p, campanhas))
          .join("")}
      </section>`
    )
    .join("");
}

function cartaoProduto(produto, campanhas) {
  const desconto = descontoDoProduto(produto.id, campanhas);
  const precoFinal = produto.preco - desconto;

  const preco = desconto
    ? `<span class="produto__preco">${reais(precoFinal)}</span>
       <span class="produto__preco--riscado">${reais(produto.preco)}</span>
       <span class="selo selo--promo">-${Math.round((desconto / produto.preco) * 100)}%</span>`
    : `<span class="produto__preco">${reais(produto.preco)}</span>`;

  // esgotado fica visível e inoperante
  const selos = [
    produto.sazonalAgora
      ? `<span class="selo selo--sazonal">${escapar(produto.sazonal.rotulo)}</span>`
      : "",
    produto.disponivel
      ? `<span class="selo selo--fidelidade">+${produto.pontosFidelidade} pts</span>`
      : `<span class="selo selo--neutro">${escapar(produto.motivoIndisponivel)}</span>`,
  ].join("");

  return `
    <button
      class="produto"
      data-acao="adicionar"
      data-valor="${produto.id}"
      ${produto.disponivel ? "" : "disabled aria-disabled='true'"}
    >
      <span class="miniatura" data-categoria="${produto.categoria}" aria-hidden="true">
        ${iniciais(produto.nome)}
      </span>
      <span>
        <span class="produto__nome">${escapar(produto.nome)}</span>
        <span class="produto__descricao">${escapar(produto.descricao)}</span>
        <span class="produto__rodape">
          ${produto.disponivel ? preco : `<span class="produto__preco--riscado">${reais(produto.preco)}</span>`}
          ${selos}
        </span>
      </span>
    </button>
  `;
}

function barraCarrinho(estado, campanhas) {
  const itens = estado.carrinho.reduce((soma, l) => soma + l.quantidade, 0);
  if (!itens) return "";

  const total = estado.carrinho.reduce((soma, linha) => {
    const produto = buscarProduto(linha.produtoId);
    const desconto = descontoDoProduto(linha.produtoId, campanhas);
    return soma + (produto.preco - desconto) * linha.quantidade;
  }, 0);

  return `
    <div class="barra-carrinho">
      <button class="btn btn--primario" data-acao="ir-carrinho">
        <span class="barra-carrinho__contagem">${plural(itens, "item", "itens")}</span>
        <span>Ver carrinho · ${reais(total)}</span>
      </button>
    </div>
  `;
}

// folha de unidades

function renderizarFolha(unidadeAtualId) {
  const folha = document.getElementById("folha-unidades");
  folha.innerHTML = `
    <div class="folha__caixa" role="dialog" aria-modal="true" aria-labelledby="folha-titulo">
      <h2 class="folha__titulo" id="folha-titulo">Onde você vai retirar?</h2>
      ${UNIDADES.map((u) => opcaoUnidade(u, u.id === unidadeAtualId)).join("")}
      <button class="btn btn--texto btn--bloco" data-acao="fechar-folha">Cancelar</button>
    </div>
  `;
}

function opcaoUnidade(unidade, atual) {
  const aberta = estaAberta(unidade);
  return `
    <button
      class="unidade-opcao"
      data-acao="escolher-unidade"
      data-valor="${unidade.id}"
      aria-current="${atual}"
    >
      <span class="unidade-opcao__nome">${escapar(unidade.nome)}</span>
      <span class="selo ${aberta ? "selo--sucesso" : "selo--neutro"}">
        ${aberta ? "Aberta" : "Fechada"}
      </span>
      <span class="unidade-opcao__endereco">${escapar(unidade.endereco)}</span>
      <span class="unidade-opcao__meta">
        <span class="selo selo--neutro">Preparo ~${duracao(unidade.tempoMedioPreparoMin)}</span>
        ${unidade.temTotem ? '<span class="selo selo--neutro">Tem totem</span>' : ""}
        ${
          unidade.formato === "reduzida"
            ? '<span class="selo selo--neutro" title="Sem cozinha completa: cardápio menor">Cardápio reduzido</span>'
            : ""
        }
      </span>
    </button>
  `;
}

function abrirFolha() {
  const folha = document.getElementById("folha-unidades");
  folha.hidden = false;
  folha.querySelector(".unidade-opcao")?.focus();
}

function fecharFolha() {
  document.getElementById("folha-unidades").hidden = true;
}

document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape") fecharFolha();
});

iniciar();
