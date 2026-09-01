// sessão do totem: expira e limpa os dados do cliente anterior

import { encerrarSessaoTotem } from "./store.js";

const OCIOSO_MS = 60000;
const CONTAGEM_S = 15;

export function iniciarInatividade(paginaInicial = "index.html") {
  const caixa = document.createElement("div");
  caixa.className = "inatividade";
  caixa.hidden = true;
  caixa.setAttribute("role", "alertdialog");
  caixa.innerHTML = `
    <div>
      <h2>Ainda está aí?</h2>
      <p>Sem resposta, a sessão será encerrada e o pedido apagado.</p>
      <span class="inatividade__contagem" id="contagem">${CONTAGEM_S}</span>
      <button class="btn btn--primario" id="continuar">Continuar meu pedido</button>
    </div>`;
  document.body.appendChild(caixa);

  let ocioso = null;
  let regressiva = null;
  let restante = CONTAGEM_S;

  function encerrar() {
    encerrarSessaoTotem();
    window.location.href = paginaInicial;
  }

  function avisar() {
    restante = CONTAGEM_S;
    caixa.hidden = false;
    document.getElementById("contagem").textContent = restante;
    regressiva = setInterval(() => {
      restante -= 1;
      document.getElementById("contagem").textContent = restante;
      if (restante <= 0) encerrar();
    }, 1000);
  }

  function reiniciar() {
    clearTimeout(ocioso);
    clearInterval(regressiva);
    caixa.hidden = true;
    ocioso = setTimeout(avisar, OCIOSO_MS);
  }

  document.getElementById("continuar").addEventListener("click", reiniciar);
  ["click", "keydown", "touchstart"].forEach((e) =>
    document.addEventListener(e, () => {
      if (caixa.hidden) reiniciar();
    })
  );
  reiniciar();
}
