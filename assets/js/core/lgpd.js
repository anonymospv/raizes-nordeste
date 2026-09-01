// banner e painel de privacidade

import {
  CATEGORIAS_DADOS,
  lerConsentimento,
  precisaDecidirConsentimento,
  salvarConsentimento,
  revogarConsentimento,
} from "./store.js";

let banner = null;
let modal = null;
let focoAnterior = null;

export function iniciarLgpd() {
  montarBanner();
  montarModal();

  if (precisaDecidirConsentimento()) {
    banner.hidden = false;
  }

  // abre pelo rodapé
  document.addEventListener("click", (evento) => {
    const gatilho = evento.target.closest("[data-abrir-privacidade]");
    if (gatilho) {
      evento.preventDefault();
      abrirModal();
    }
  });
}

// banner

function montarBanner() {
  banner = document.createElement("aside");
  banner.className = "lgpd-banner";
  banner.hidden = true;
  banner.setAttribute("role", "region");
  banner.setAttribute("aria-label", "Aviso de privacidade");
  banner.innerHTML = `
    <div class="lgpd-banner__interno">
      <h2>Antes de pedir, um aviso rápido</h2>
      <p>
        Guardamos sua unidade e seu carrinho porque sem isso o pedido não
        funciona. Histórico de pedidos e envio de promoções são opcionais e
        dependem de você autorizar. Você pode mudar essa escolha quando quiser.
      </p>
      <div class="lgpd-banner__acoes">
        <button class="btn btn--primario" data-lgpd="aceitar-tudo">
          Aceitar tudo
        </button>
        <button class="btn btn--secundario" data-lgpd="so-essenciais">
          Só o essencial
        </button>
        <button class="btn btn--texto lgpd-banner__ajustar" data-lgpd="ajustar">
          Escolher o que autorizo
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(banner);

  banner.addEventListener("click", (evento) => {
    const acao = evento.target.closest("[data-lgpd]")?.dataset.lgpd;
    if (acao === "aceitar-tudo") {
      salvarConsentimento({ personalizacao: true, marketing: true });
      fecharBanner();
    } else if (acao === "so-essenciais") {
      salvarConsentimento({ personalizacao: false, marketing: false });
      fecharBanner();
    } else if (acao === "ajustar") {
      abrirModal();
    }
  });
}

function fecharBanner() {
  banner.hidden = true;
}

// painel

function montarModal() {
  modal = document.createElement("div");
  modal.className = "lgpd-modal";
  modal.hidden = true;
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "lgpd-titulo");

  const categorias = Object.entries(CATEGORIAS_DADOS)
    .map(
      ([chave, cat]) => `
      <div class="lgpd-categoria">
        <h3 id="lgpd-cat-${chave}">${cat.rotulo}</h3>
        <label class="interruptor">
          <input
            type="checkbox"
            data-categoria="${chave}"
            ${cat.obrigatoria ? "checked disabled" : ""}
            aria-labelledby="lgpd-cat-${chave}"
          />
          <span class="interruptor__trilho" aria-hidden="true"></span>
        </label>
        <p>${cat.descricao}${cat.obrigatoria ? " Não pode ser desativado." : ""}</p>
      </div>`
    )
    .join("");

  modal.innerHTML = `
    <div class="lgpd-modal__caixa">
      <h2 id="lgpd-titulo">Suas preferências de privacidade</h2>
      <p class="lgpd-modal__intro">
        Escolha o que autoriza. As opções valem para este navegador e podem ser
        alteradas a qualquer momento.
      </p>
      ${categorias}
      <div class="lgpd-modal__rodape">
        <button class="btn btn--primario btn--bloco" data-lgpd="salvar">
          Salvar preferências
        </button>
        <button class="btn btn--texto" data-lgpd="revogar">
          Revogar consentimento e apagar meus dados deste dispositivo
        </button>
        <p class="lgpd-modal__nota">
          Protótipo acadêmico: os dados ficam apenas no seu navegador
          (localStorage) e não são enviados a nenhum servidor.
        </p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.addEventListener("click", (evento) => {
    if (evento.target === modal) return fecharModal();
    const acao = evento.target.closest("[data-lgpd]")?.dataset.lgpd;
    if (acao === "salvar") {
      salvarConsentimento({
        personalizacao: modal.querySelector('[data-categoria="personalizacao"]').checked,
        marketing: modal.querySelector('[data-categoria="marketing"]').checked,
      });
      fecharModal();
      fecharBanner();
      anunciar("Preferências de privacidade salvas.");
    } else if (acao === "revogar") {
      revogarConsentimento();
      fecharModal();
      banner.hidden = false;
      anunciar("Consentimento revogado e dados apagados deste dispositivo.");
    }
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && !modal.hidden) fecharModal();
  });
}

function abrirModal() {
  const atual = lerConsentimento();
  modal.querySelector('[data-categoria="personalizacao"]').checked = Boolean(
    atual?.personalizacao
  );
  modal.querySelector('[data-categoria="marketing"]').checked = Boolean(atual?.marketing);

  focoAnterior = document.activeElement;
  modal.hidden = false;
  modal.querySelector("[data-lgpd='salvar']").focus();
}

function fecharModal() {
  modal.hidden = true;
  focoAnterior?.focus();
}

// aria-live

function anunciar(mensagem) {
  let regiao = document.getElementById("anuncio-vivo");
  if (!regiao) {
    regiao = document.createElement("div");
    regiao.id = "anuncio-vivo";
    regiao.className = "sr-apenas";
    regiao.setAttribute("role", "status");
    regiao.setAttribute("aria-live", "polite");
    document.body.appendChild(regiao);
  }
  regiao.textContent = mensagem;
}
