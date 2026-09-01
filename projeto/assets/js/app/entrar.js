// login e fidelidade

import * as store from "../core/store.js";
import { iniciarLgpd } from "../core/lgpd.js";
import { escapar } from "../core/format.js";

function iniciar() {
  store.carregar();
  iniciarLgpd();
  store.assinar(renderizar);
  document.addEventListener("click", (evento) => {
    const acao = evento.target.closest("[data-acao]")?.dataset.acao;
    if (acao === "entrar") tentarEntrar();
    if (acao === "sair") store.sair();
  });
  renderizar();
}

// validação simples, sem regex exótico
function validar(nome, email) {
  const erros = {};
  if (nome.trim().length < 2) erros.nome = "Informe seu nome.";
  if (!email.includes("@") || !email.includes(".")) erros.email = "E-mail inválido.";
  return erros;
}

function tentarEntrar() {
  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const erros = validar(nome, email);

  document.getElementById("erro-nome").textContent = erros.nome ?? "";
  document.getElementById("erro-email").textContent = erros.email ?? "";
  document.getElementById("nome").setAttribute("aria-invalid", Boolean(erros.nome));
  document.getElementById("email").setAttribute("aria-invalid", Boolean(erros.email));

  if (Object.keys(erros).length) {
    document.getElementById(erros.nome ? "nome" : "email").focus();
    return;
  }
  store.entrar({ nome: nome.trim(), email: email.trim() });
}

function renderizar() {
  const usuario = store.obterEstado().usuario;
  const alvo = document.getElementById("conteudo");

  if (usuario) {
    alvo.innerHTML = `
      <div class="conteudo">
        <div class="senha" style="border-radius:var(--raio-md)">
          <div class="senha__rotulo">Olá, ${escapar(usuario.nome)}</div>
          <div class="senha__valor">${usuario.pontos}</div>
          <div class="senha__rotulo">pontos acumulados</div>
        </div>
        <p class="aviso aviso--info" style="margin-top:1rem">
          <span>Cada real gasto vale um ponto. A partir de 300 pontos você troca por
          um item do cardápio no balcão.</span>
        </p>
        <a class="btn btn--primario btn--bloco" href="index.html">Ver o cardápio</a>
        <p style="margin-top:1rem;text-align:center">
          <button class="btn btn--texto" data-acao="sair">Sair da conta</button>
        </p>
      </div>`;
    return;
  }

  alvo.innerHTML = `
    <div class="conteudo">
      <p style="margin-bottom:1.5rem;color:var(--pedra)">
        Entre para acumular pontos. Não pedimos senha neste protótipo.
      </p>
      <label class="campo">
        <span class="campo__rotulo">Nome</span>
        <input id="nome" type="text" autocomplete="name" />
        <span class="campo__erro" id="erro-nome"></span>
      </label>
      <label class="campo">
        <span class="campo__rotulo">E-mail</span>
        <input id="email" type="email" autocomplete="email" />
        <span class="campo__erro" id="erro-email"></span>
      </label>
      <button class="btn btn--primario btn--bloco" data-acao="entrar">Entrar</button>
      <p class="lgpd-modal__nota" style="margin-top:1rem">
        Usamos seu e-mail só para identificar sua conta de fidelidade.
        <a href="#" data-abrir-privacidade>Ver preferências de privacidade</a>.
      </p>
    </div>`;
}

iniciar();
