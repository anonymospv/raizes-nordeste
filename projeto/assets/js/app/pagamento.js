// tela de pagamento

import { buscarUnidade } from "../data/unidades.js";
import * as store from "../core/store.js";
import { iniciarLgpd } from "../core/lgpd.js";
import { campanhasAtivas, resumirCarrinho, solicitarPagamento } from "../core/pedido.js";
import { reais, escapar } from "../core/format.js";

const METODOS = [
  { id: "pix", rotulo: "Pix", nota: "Confirmação imediata" },
  { id: "credito", rotulo: "Cartão de crédito", nota: "Processado pelo provedor" },
  { id: "debito", rotulo: "Cartão de débito", nota: "Processado pelo provedor" },
];

let metodo = "pix";
let simular = null; // null | "recusado" | "timeout"
let etapa = "escolha"; // escolha | processando | aprovado | recusado | falha
let retorno = null;
let pedidoId = null;

function iniciar() {
  store.carregar();
  store.definirCanal("app");
  iniciarLgpd();
  document.addEventListener("click", tratarClique);
  document.addEventListener("change", (e) => {
    if (e.target.id === "simular") {
      simular = e.target.value || null;
    }
  });
  renderizar();
}

function tratarClique(evento) {
  const alvo = evento.target.closest("[data-acao]");
  if (!alvo) return;
  const { acao, valor } = alvo.dataset;

  if (acao === "metodo") {
    metodo = valor;
    renderizar();
  }
  if (acao === "confirmar") confirmar();
  if (acao === "tentar-novamente") {
    etapa = "escolha";
    renderizar();
  }
  if (acao === "acompanhar") window.location.href = `pedido.html?id=${pedidoId}`;
}

async function confirmar() {
  const estado = store.obterEstado();
  const unidade = buscarUnidade(estado.unidadeId);
  const resumo = resumirCarrinho(estado.carrinho, campanhasAtivas(unidade));

  // pedido nasce aguardando; o retorno do provedor é que decide
  const pedido = store.criarPedido({
    unidadeId: unidade.id,
    canal: estado.canal,
    itens: resumo.linhas.map((l) => ({
      produtoId: l.produtoId,
      nome: l.produto.nome,
      quantidade: l.quantidade,
      subtotal: l.subtotal,
    })),
    total: resumo.total,
    pontos: resumo.pontos,
  });
  pedidoId = pedido.id;

  etapa = "processando";
  renderizar();

  try {
    retorno = await solicitarPagamento({ metodo, valor: resumo.total, forcar: simular });
    if (retorno.status === "aprovado") {
      store.mudarStatus(pedido.id, "recebido", { transacaoId: retorno.transacaoId });
      store.esvaziarCarrinho();
      etapa = "aprovado";
    } else {
      store.mudarStatus(pedido.id, "recusado", { codigo: retorno.codigo });
      etapa = "recusado";
    }
  } catch (erro) {
    // timeout: o pedido fica pendente, o carrinho não é esvaziado
    retorno = erro;
    etapa = "falha";
  }
  renderizar();
}

function renderizar() {
  const estado = store.obterEstado();
  const unidade = buscarUnidade(estado.unidadeId);
  const resumo = resumirCarrinho(estado.carrinho, campanhasAtivas(unidade));
  const alvo = document.getElementById("conteudo");
  const barra = document.getElementById("barra");

  if (etapa === "escolha" && !resumo.itens) {
    alvo.innerHTML = `<div class="vazio"><h3>Não há nada para pagar</h3>
      <p style="margin-top:1rem"><a class="btn btn--primario" href="index.html">Ver o cardápio</a></p></div>`;
    barra.hidden = true;
    return;
  }

  if (etapa === "escolha") {
    alvo.innerHTML = `
      <div class="conteudo">
        <div class="resumo" style="margin-top:0">
          <div class="resumo__linha resumo__linha--total"><span>Total</span><span>${reais(resumo.total)}</span></div>
        </div>
        <h2 style="margin:1.5rem 0 1rem;font-size:var(--txt-lg)">Como você quer pagar?</h2>
        <div class="metodos">${METODOS.map(cartaoMetodo).join("")}</div>
        <div class="aviso aviso--info">
          <span>
            <strong>Pagamento processado por provedor externo</strong>
            A Raízes do Nordeste não armazena dados do seu cartão. Recebemos apenas
            a confirmação ou a recusa da transação.
          </span>
        </div>
        <label class="campo">
          <span class="campo__rotulo">Simulação do provedor (só neste protótipo)</span>
          <select id="simular" class="metodo" style="width:100%">
            <option value="">Comportamento normal</option>
            <option value="recusado">Forçar recusa</option>
            <option value="timeout">Forçar timeout</option>
          </select>
        </label>
      </div>`;
    barra.hidden = false;
    barra.innerHTML = `<button class="btn btn--primario btn--bloco" data-acao="confirmar">
      Pagar ${reais(resumo.total)}</button>`;
    return;
  }

  barra.hidden = true;

  if (etapa === "processando") {
    alvo.innerHTML = `
      <div class="pagamento-estado" role="status" aria-live="polite">
        <div class="girador"></div>
        <h2>Aguardando o provedor</h2>
        <p>Não feche esta tela. A confirmação costuma levar poucos segundos.</p>
      </div>`;
    return;
  }

  if (etapa === "aprovado") {
    alvo.innerHTML = `
      <div class="pagamento-estado" role="status">
        <div class="marca-estado marca-estado--ok" aria-hidden="true">✓</div>
        <h2>Pagamento aprovado</h2>
        <p>Transação ${escapar(retorno.transacaoId)}. Seu pedido já foi para a cozinha.</p>
        <button class="btn btn--primario" data-acao="acompanhar">Acompanhar o pedido</button>
      </div>`;
    return;
  }

  if (etapa === "recusado") {
    alvo.innerHTML = `
      <div class="pagamento-estado" role="alert">
        <div class="marca-estado marca-estado--erro" aria-hidden="true">×</div>
        <h2>Pagamento recusado</h2>
        <p>${escapar(retorno.motivo)} (código ${escapar(retorno.codigo)})</p>
        <p>Seus itens continuam no carrinho. Tente outro método de pagamento.</p>
        <button class="btn btn--primario" data-acao="tentar-novamente">Escolher outro método</button>
      </div>`;
    return;
  }

  alvo.innerHTML = `
    <div class="pagamento-estado" role="alert">
      <div class="marca-estado marca-estado--erro" aria-hidden="true">!</div>
      <h2>Não recebemos resposta</h2>
      <p>${escapar(retorno.mensagem)}</p>
      <p>Nada foi cobrado. Se o valor aparecer na sua fatura, ele é estornado automaticamente.</p>
      <button class="btn btn--primario" data-acao="tentar-novamente">Tentar de novo</button>
    </div>`;
}

function cartaoMetodo(m) {
  return `
    <button class="metodo" data-acao="metodo" data-valor="${m.id}" aria-pressed="${metodo === m.id}">
      <span>
        <strong style="display:block">${escapar(m.rotulo)}</strong>
        <span style="font-size:var(--txt-sm);color:var(--pedra)">${escapar(m.nota)}</span>
      </span>
    </button>`;
}

iniciar();
