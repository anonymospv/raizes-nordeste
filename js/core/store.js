

const CHAVE_ESTADO = "rrn:estado";
const CHAVE_CONSENTIMENTO = "rrn:consentimento";

/** Categorias de tratamento apresentadas ao titular no banner. */
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
  canal: null, // "app" | "totem" | "web"
  carrinho: [], // { linhaId, produtoId, quantidade, opcoes:{}, observacao }
  usuario: null, // { nome, email, pontos } — null = visitante
  pedidos: [],
};

let estado = { ...ESTADO_INICIAL };
let consentimento = null; // null = titular ainda não decidiu
const ouvintes = new Set();

/* consentimento */

export function lerConsentimento() {
  if (consentimento) return consentimento;
  try {
    const bruto = localStorage.getItem(CHAVE_CONSENTIMENTO);
    consentimento = bruto ? JSON.parse(bruto) : null;
  } catch {
    consentimento = null; // storage bloqueado: segue como visitante
  }
  return consentimento;
}

export function precisaDecidirConsentimento() {
  return lerConsentimento() === null;
}

/**
 * registra a decisao
 * @param {{personalizacao:boolean, marketing:boolean}} escolhas
 */
export function salvarConsentimento(escolhas) {
  consentimento = {
    essenciais: true, // não é opcional e o banner deixa isso explícito
    personalizacao: Boolean(escolhas.personalizacao),
    marketing: Boolean(escolhas.marketing),
    versaoAviso: "1.0",
    decididoEm: new Date().toISOString(),
  };
  try {
    localStorage.setItem(CHAVE_CONSENTIMENTO, JSON.stringify(consentimento));
  } catch {
    /* sem storage: a decisão vale só para esta sessão */
  }
  // revogar personalização
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
    /* nada a fazer */
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

/* persist */

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
    /* modo privado ou storage cheio: a sessão continua em memória */
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

/* leitura e escrita de estado */

export function obterEstado() {
  return estado;
}

export function assinar(ouvinte) {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte); // função de cancelamento
}

function notificar() {
  ouvintes.forEach((o) => o(estado));
}

export function definirUnidade(unidadeId) {
  if (estado.unidadeId === unidadeId) return;
  // trocar unidade (cardapio unico por loja)
  estado.unidadeId = unidadeId;
  estado.carrinho = [];
  gravar();
  notificar();
}

export function definirCanal(canal) {
  estado.canal = canal;
}

/* ---- Carrinho ---- */

let contadorLinha = 0;

export function adicionarAoCarrinho({ produtoId, quantidade = 1, opcoes = {}, observacao = "" }) {
  
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

/** reinicia a sessao atual no totem */
export function encerrarSessaoTotem() {
  estado.carrinho = [];
  estado.usuario = null;
  notificar();
}
