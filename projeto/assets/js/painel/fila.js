// painel da cozinha e da gerência

import { UNIDADES, buscarUnidade } from "../data/unidades.js";
import * as store from "../core/store.js";
import { reais, duracao, escapar } from "../core/format.js";

const COLUNAS = [
  { id: "recebido", titulo: "Na fila", proximo: "em-preparo", rotulo: "Começar preparo" },
  { id: "em-preparo", titulo: "Em preparo", proximo: "pronto", rotulo: "Marcar pronto" },
  { id: "pronto", titulo: "Pronto para retirada", proximo: "retirado", rotulo: "Entregue" },
];

const OPERADOR = "gerente.recife"; // sessão simulada
let aba = "cozinha";

function iniciar() {
  store.carregar();
  store.definirCanal("web");
  store.assinar(renderizar);
  document.addEventListener("click", tratarClique);
  document.addEventListener("change", (e) => {
    if (e.target.id === "unidade") {
      store.definirUnidade(e.target.value);
    }
  });
  renderizar();
  setInterval(renderizar, 30000); // atualiza o tempo de espera
}

function tratarClique(evento) {
  const alvo = evento.target.closest("[data-acao]");
  if (!alvo) return;
  const { acao, valor, proximo } = alvo.dataset;

  if (acao === "aba") {
    aba = valor;
    renderizar();
  }
  if (acao === "avancar") store.mudarStatus(valor, proximo);
  if (acao === "cancelar") {
    const motivo = prompt("Motivo do cancelamento (obrigatório):");
    if (motivo && motivo.trim()) {
      store.cancelarPedido(valor, motivo.trim(), OPERADOR);
    } else if (motivo !== null) {
      alert("O cancelamento precisa de um motivo registrado.");
    }
  }
}

function minutosDesde(iso) {
  return Math.floor((Date.now() - new Date(iso)) / 60000);
}

function renderizar() {
  const estado = store.obterEstado();
  const unidade = buscarUnidade(estado.unidadeId) ?? UNIDADES[0];
  const doDia = estado.pedidos.filter((p) => p.unidadeId === unidade.id);

  document.getElementById("seletor").innerHTML = `
    <label class="sr-apenas" for="unidade">Unidade</label>
    <select class="aba" id="unidade">
      ${UNIDADES.map((u) => `<option value="${u.id}" ${u.id === unidade.id ? "selected" : ""}>${escapar(u.nome)}</option>`).join("")}
    </select>`;

  document.getElementById("abas").innerHTML = `
    <button class="aba" data-acao="aba" data-valor="cozinha" aria-selected="${aba === "cozinha"}">Cozinha</button>
    <button class="aba" data-acao="aba" data-valor="gerencia" aria-selected="${aba === "gerencia"}">Gerência</button>`;

  document.getElementById("conteudo").innerHTML =
    aba === "cozinha" ? telaCozinha(doDia, unidade) : telaGerencia(doDia, estado.auditoria);
}

function telaCozinha(pedidos, unidade) {
  const colunas = COLUNAS.map((coluna) => {
    const lista = pedidos.filter((p) => p.status === coluna.id);
    return `
      <section class="coluna">
        <h2>${escapar(coluna.titulo)} <span>(${lista.length})</span></h2>
        ${lista.length ? lista.map((p) => comanda(p, coluna, unidade)).join("") : '<p class="indicador__rotulo">Nada aqui.</p>'}
      </section>`;
  }).join("");

  return `<div class="fila">${colunas}</div>`;
}

function comanda(pedido, coluna, unidade) {
  const espera = minutosDesde(pedido.criadoEm);
  const atrasada = espera > unidade.tempoMedioPreparoMin && pedido.status !== "pronto";

  return `
    <article class="comanda ${atrasada ? "comanda--atrasada" : ""}">
      <div class="comanda__topo">
        <span class="comanda__senha">${escapar(pedido.senha)}</span>
        <span class="comanda__espera">${duracao(espera)} · ${escapar(pedido.canal)}</span>
      </div>
      <ul>${pedido.itens.map((i) => `<li>${i.quantidade}× ${escapar(i.nome)}</li>`).join("")}</ul>
      <div class="comanda__acoes">
        <button class="btn btn--primario" data-acao="avancar" data-valor="${pedido.id}" data-proximo="${coluna.proximo}">
          ${escapar(coluna.rotulo)}
        </button>
        <button class="btn btn--texto" data-acao="cancelar" data-valor="${pedido.id}">Cancelar</button>
      </div>
    </article>`;
}

function telaGerencia(pedidos, auditoria) {
  const pagos = pedidos.filter((p) => !["aguardando", "recusado", "cancelado"].includes(p.status));
  const faturamento = pagos.reduce((s, p) => s + p.total, 0);
  const ticket = pagos.length ? Math.round(faturamento / pagos.length) : 0;

  // mais vendidos, agregado e sem identificar cliente
  const contagem = {};
  pagos.forEach((p) => p.itens.forEach((i) => (contagem[i.nome] = (contagem[i.nome] ?? 0) + i.quantidade)));
  const ranking = Object.entries(contagem).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return `
    <div class="indicadores">
      <div class="indicador"><div class="indicador__valor">${pagos.length}</div><div class="indicador__rotulo">Pedidos pagos</div></div>
      <div class="indicador"><div class="indicador__valor">${reais(faturamento)}</div><div class="indicador__rotulo">Faturamento</div></div>
      <div class="indicador"><div class="indicador__valor">${reais(ticket)}</div><div class="indicador__rotulo">Ticket médio</div></div>
      <div class="indicador"><div class="indicador__valor">${pedidos.filter((p) => p.status === "cancelado").length}</div><div class="indicador__rotulo">Cancelamentos</div></div>
    </div>

    <h2 style="font-size:var(--txt-lg);margin-bottom:1rem">Mais vendidos</h2>
    <table class="tabela" style="margin-bottom:2rem">
      <thead><tr><th>Item</th><th>Unidades</th></tr></thead>
      <tbody>
        ${ranking.length ? ranking.map(([nome, qtd]) => `<tr><td>${escapar(nome)}</td><td>${qtd}</td></tr>`).join("")
          : '<tr><td colspan="2">Sem pedidos pagos ainda.</td></tr>'}
      </tbody>
    </table>

    <h2 style="font-size:var(--txt-lg);margin-bottom:0.5rem">Auditoria de operações sensíveis</h2>
    <p class="indicador__rotulo" style="margin-bottom:1rem">
      Cancelamentos e descontos registram operador, horário e motivo. O relatório é
      agregado: nenhum dado pessoal de cliente aparece aqui.
    </p>
    <table class="tabela">
      <thead><tr><th>Quando</th><th>Operação</th><th>Senha</th><th>Operador</th><th>Motivo</th></tr></thead>
      <tbody>
        ${auditoria.length ? auditoria.map((a) => `
          <tr>
            <td>${new Date(a.em).toLocaleString("pt-BR")}</td>
            <td>${escapar(a.operacao)}</td>
            <td>${escapar(a.senha)}</td>
            <td>${escapar(a.operador)}</td>
            <td>${escapar(a.motivo)}</td>
          </tr>`).join("")
          : '<tr><td colspan="5">Nenhuma operação sensível registrada.</td></tr>'}
      </tbody>
    </table>`;
}

iniciar();
