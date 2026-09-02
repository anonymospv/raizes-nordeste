// tela de carrinho

import { buscarUnidade } from "../data/unidades.js";
import * as store from "../core/store.js";
import { iniciarLgpd } from "../core/lgpd.js";
import { campanhasAtivas, resumirCarrinho, itensIndisponiveis } from "../core/pedido.js";
import { reais, plural, escapar } from "../core/format.js";

function iniciar() {
  store.carregar();
  store.definirCanal("app");
  iniciarLgpd();
  store.assinar(renderizar);
  document.addEventListener("click", tratarClique);
  renderizar();
}

function tratarClique(evento) {
  const alvo = evento.target.closest("[data-acao]");
  if (!alvo) return;
  const { acao, valor } = alvo.dataset;

  if (acao === "mais") store.alterarQuantidade(valor, 1);
  if (acao === "menos") store.alterarQuantidade(valor, -1);
  if (acao === "esvaziar" && confirm("Remover todos os itens do carrinho?")) {
    store.esvaziarCarrinho();
  }
  if (acao === "pagar") window.location.href = "pagamento.html";
}

function renderizar() {
  const estado = store.obterEstado();
  const unidade = buscarUnidade(estado.unidadeId);
  const campanhas = campanhasAtivas(unidade);
  const resumo = resumirCarrinho(estado.carrinho, campanhas);
  const bloqueados = itensIndisponiveis(estado.carrinho, unidade);
  const alvo = document.getElementById("conteudo");

  if (!resumo.itens) {
    alvo.innerHTML = `
      <div class="vazio">
        <h3>Seu carrinho está vazio</h3>
        <p>Escolha alguma coisa no cardápio e ela aparece aqui.</p>
        <p style="margin-top:1rem"><a class="btn btn--primario" href="index.html">Ver o cardápio</a></p>
      </div>`;
    document.getElementById("barra").hidden = true;
    return;
  }

  alvo.innerHTML = `
    <div class="conteudo">
      ${bloqueados.length ? avisoBloqueio(bloqueados) : ""}
      <p class="aviso aviso--info">
        Retirada em <strong style="display:inline">${escapar(unidade.nome)}</strong>.
        Pronto em cerca de ${unidade.tempoMedioPreparoMin} min depois da confirmação.
      </p>
      ${resumo.linhas.map(linha).join("")}
      ${totais(resumo)}
      <p style="margin-top:1rem">
        <button class="btn btn--texto" data-acao="esvaziar">Esvaziar carrinho</button>
      </p>
    </div>`;

  const barra = document.getElementById("barra");
  barra.hidden = false;
  barra.innerHTML = `
    <button class="btn btn--primario btn--bloco" data-acao="pagar" ${bloqueados.length ? "disabled" : ""}>
      Ir para o pagamento · ${reais(resumo.total)}
    </button>
    <p class="lgpd-modal__nota" style="text-align:center">
      ${plural(resumo.itens, "item", "itens")} · você ganha ${resumo.pontos} pontos
    </p>`;
}

function avisoBloqueio(bloqueados) {
  const nomes = bloqueados.map((l) => escapar(l.produtoId)).join(", ");
  return `
    <div class="aviso aviso--erro">
      <span>
        <strong>Um item do carrinho saiu do cardápio</strong>
        Esgotou ou deixou de ser servido nesta unidade (${nomes}). Remova para continuar.
      </span>
    </div>`;
}

function linha(l) {
  const opcoes = Object.entries(l.opcoes ?? {})
    .map(([grupoId, escolhaId]) => {
      const grupo = l.produto.opcoes.find((o) => o.id === grupoId);
      const escolha = grupo?.escolhas.find((e) => e.id === escolhaId);
      return escolha ? `${grupo.rotulo}: ${escolha.rotulo}` : null;
    })
    .filter(Boolean)
    .join(" · ");

  return `
    <div class="linha">
      <span class="linha__nome">${escapar(l.produto.nome)}</span>
      <span class="linha__subtotal">${reais(l.subtotal)}</span>
      ${opcoes ? `<span class="linha__opcoes">${escapar(opcoes)}</span>` : ""}
      ${l.desconto ? `<span class="linha__opcoes resumo__economia">Promoção aplicada: -${reais(l.desconto)} por unidade</span>` : ""}
      <span class="quantidade">
        <button data-acao="menos" data-valor="${l.linhaId}" aria-label="Diminuir ${escapar(l.produto.nome)}">−</button>
        <output aria-live="polite">${l.quantidade}</output>
        <button data-acao="mais" data-valor="${l.linhaId}" aria-label="Aumentar ${escapar(l.produto.nome)}">+</button>
      </span>
    </div>`;
}

function totais(resumo) {
  return `
    <div class="resumo">
      <div class="resumo__linha">
        <span>Subtotal</span><span>${reais(resumo.total + resumo.economia)}</span>
      </div>
      ${resumo.economia ? `<div class="resumo__linha resumo__economia"><span>Promoções</span><span>−${reais(resumo.economia)}</span></div>` : ""}
      <div class="resumo__linha"><span>Retirada no balcão</span><span>Grátis</span></div>
      <div class="resumo__linha resumo__linha--total"><span>Total</span><span>${reais(resumo.total)}</span></div>
    </div>`;
}

iniciar();
