// estado global

const CHAVE_ESTADO = "rrn:estado";
const CHAVE_CONSENTIMENTO = "rrn:consentimento";

// categorias do banner
export const CATEGORIAS_DADOS = {
  essenciais: {
    rotulo: "Essenciais",
    descricao:
      "Guardam sua unidade, seu carrinho e seu pedido em andamento. Sem eles o pedido não funciona.",
    obrigatoria: true,
  },
  personalizacao: {
    rotulo: "Personalização",
    descricao:
      "Guardam seu histórico de pedidos para sugerir seus itens frequentes e acumular pontos.",
    obrigatoria: false,
  },
  marketing: {
    rotulo: "Comunicações e ofertas",
    descricao:
      "Permitem enviar promoções por e-mail e push, e medir quais campanhas funcionaram.",
    obrigatoria: false,
  },
};

const ESTADO_INICIAL = {
  unidadeId: null,
  canal: null,
  carrinho: [],
  usuario: null,
  pedidos: [],
};

let estado = { ...ESTADO_INICIAL };
let consentimento = null;
const ouvintes = new Set();

// consentimento

export function lerConsentimento() {
  if (consentimento) return consentimento;
  try {
    const bruto = localStorage.getItem(CHAVE_CONSENTIMENTO);
    consentimento = bruto ? JSON.parse(bruto) : null;
  } catch {
    consentimento = null;
  }
  return consentimento;
}

export function precisaDecidirConsentimento() {
  return lerConsentimento() === null;
}

// grava decisão
export function salvarConsentimento(escolhas) {
  consentimento = {
    essenciais: true,
    personalizacao: Boolean(escolhas.personalizacao),
    marketing: Boolean(escolhas.marketing),
    versaoAviso: "1.0",
    decididoEm: new Date().toISOString(),
  };
  try {
    localStorage.setItem(CHAVE_CONSENTIMENTO, JSON.stringify(consentimento));
  } catch {
    // só nesta sessão
  }
  // revogar apaga histórico
  if (!consentimento.personalizacao) {
    estado.pedidos = [];
    gravar();
  }
  notificar();
  return consentimento;
}

export function revogarConsentimento() {
  try {
    localStorage.removeItem(CHAVE_CONSENTIMENTO);
    localStorage.removeItem(CHAVE_ESTADO);
  } catch {
    // ignora
  }
  consentimento = null;
  estado = { ...ESTADO_INICIAL, carrinho: [] };
  notificar();
}

function permitido(categoria) {
  if (categoria === "essenciais") return true;
  const c = lerConsentimento();
  return Boolean(c && c[categoria]);
}

// persistência

function gravar() {
  const paraGravar = {
    unidadeId: estado.unidadeId,
    carrinho: estado.carrinho,
  };
  if (permitido("personalizacao")) {
    paraGravar.usuario = estado.usuario;
    paraGravar.pedidos = estado.pedidos;
  }
  try {
    localStorage.setItem(CHAVE_ESTADO, JSON.stringify(paraGravar));
  } catch {
    // segue em memória
  }
}

export function carregar() {
  try {
    const bruto = localStorage.getItem(CHAVE_ESTADO);
    if (bruto) estado = { ...ESTADO_INICIAL, ...JSON.parse(bruto) };
  } catch {
    estado = { ...ESTADO_INICIAL };
  }
  return estado;
}

// leitura e escrita

export function obterEstado() {
  return estado;
}

export function assinar(ouvinte) {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}

function notificar() {
  ouvintes.forEach((o) => o(estado));
}

export function definirUnidade(unidadeId) {
  if (estado.unidadeId === unidadeId) return;
  // troca de loja zera carrinho
  estado.unidadeId = unidadeId;
  estado.carrinho = [];
  gravar();
  notificar();
}

export function definirCanal(canal) {
  estado.canal = canal;
}

// carrinho

let contadorLinha = 0;

export function adicionarAoCarrinho({ produtoId, quantidade = 1, opcoes = {}, observacao = "" }) {
  // agrupa linha idêntica
  const assinatura = JSON.stringify(opcoes);
  const existente = estado.carrinho.find(
    (l) =>
      l.produtoId === produtoId &&
      JSON.stringify(l.opcoes) === assinatura &&
      l.observacao === observacao
  );

  if (existente) {
    existente.quantidade += quantidade;
  } else {
    estado.carrinho.push({
      linhaId: `l${++contadorLinha}-${Date.now()}`,
      produtoId,
      quantidade,
      opcoes,
      observacao,
    });
  }
  gravar();
  notificar();
}

export function alterarQuantidade(linhaId, delta) {
  const linha = estado.carrinho.find((l) => l.linhaId === linhaId);
  if (!linha) return;
  linha.quantidade += delta;
  if (linha.quantidade <= 0) {
    estado.carrinho = estado.carrinho.filter((l) => l.linhaId !== linhaId);
  }
  gravar();
  notificar();
}

export function esvaziarCarrinho() {
  estado.carrinho = [];
  gravar();
  notificar();
}

// limpa sessão do totem
export function encerrarSessaoTotem() {
  estado.carrinho = [];
  estado.usuario = null;
  notificar();
}
