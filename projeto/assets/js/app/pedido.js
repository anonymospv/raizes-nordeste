// acompanhamento do pedido

import { buscarUnidade } from "../data/unidades.js";
import * as store from "../core/store.js";
import { iniciarLgpd } from "../core/lgpd.js";
import { reais, escapar } from "../core/format.js";

const ETAPAS = [
  { id: "recebido", titulo: "Pedido recebido", nota: "Pagamento confirmado" },
  { id: "em-preparo", titulo: "Em preparo", nota: "A cozinha está fazendo" },
  { id: "pronto", titulo: "Pronto para retirada", nota: "Retire no balcão com a sua senha" },
  { id: "retirado", titulo: "Retirado", nota: "Bom apetite" },
];

let cronometro = null;

function idDaUrl() {
  return new URLSearchParams(location.search).get("id");
}

function iniciar() {
  store.carregar();
  store.definirCanal("app");
  iniciarLgpd();
  store.assinar(renderizar);
  document.addEventListener("click", (evento) => {
    const alvo = evento.target.closest("[data-acao]");
    if (alvo?.dataset.acao === "confirmar-retirada") {
      store.mudarStatus(idDaUrl(), "retirado");
    }
  });
  renderizar();
  simularCozinha();
}

// a cozinha avança o pedido sozinha, pra tela poder ser demonstrada
function simularCozinha() {
  clearInterval(cronometro);
  cronometro = setInterval(() => {
    const pedido = store.buscarPedido(idDaUrl());
    if (!pedido) return clearInterval(cronometro);
    if (pedido.status === "recebido") store.mudarStatus(pedido.id, "em-preparo");
    else if (pedido.status === "em-preparo") store.mudarStatus(pedido.id, "pronto");
    else clearInterval(cronometro);
  }, 9000);
}

function renderizar() {
  const pedido = store.buscarPedido(idDaUrl());
  const alvo = document.getElementById("conteudo");

  if (!pedido) {
    alvo.innerHTML = `<div class="vazio"><h3>Pedido não encontrado</h3>
      <p>Talvez ele tenha sido feito em outro dispositivo.</p>
      <p style="margin-top:1rem"><a class="btn btn--primario" href="index.html">Voltar ao cardápio</a></p></div>`;
    return;
  }

  const unidade = buscarUnidade(pedido.unidadeId);
  const atual = ETAPAS.findIndex((e) => e.id === pedido.status);

  alvo.innerHTML = `
    <div class="senha">
      <div class="senha__rotulo">Sua senha</div>
      <div class="senha__valor">${escapar(pedido.senha)}</div>
      <div class="senha__rotulo">${escapar(unidade.nome)}</div>
    </div>

    <div class="etapas" role="status" aria-live="polite">
      ${ETAPAS.map((etapa, i) => `
        <div class="etapa" data-feita="${i < atual}" data-atual="${i === atual}">
          <span class="etapa__marca" aria-hidden="true">${i < atual ? "✓" : i + 1}</span>
          <span>
            <span class="etapa__titulo">${escapar(etapa.titulo)}</span>
            <span class="etapa__hora">${i <= atual ? escapar(etapa.nota) : ""}</span>
          </span>
        </div>`).join("")}
    </div>

    <div class="conteudo">
      <div class="resumo" style="margin-top:0">
        ${pedido.itens.map((i) => `
          <div class="resumo__linha">
            <span>${i.quantidade}× ${escapar(i.nome)}</span><span>${reais(i.subtotal)}</span>
          </div>`).join("")}
        <div class="resumo__linha resumo__linha--total"><span>Total pago</span><span>${reais(pedido.total)}</span></div>
      </div>
      <p class="aviso aviso--info" style="margin-top:1rem">
        <span>Você acumulou <strong style="display:inline">${pedido.pontos} pontos</strong> com este pedido.</span>
      </p>
      ${pedido.status === "pronto" ? `
        <button class="btn btn--primario btn--bloco" data-acao="confirmar-retirada">Já retirei</button>` : ""}
    </div>`;
}

iniciar();
