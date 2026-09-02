// cálculo do carrinho e gateway simulado

import { buscarProduto, cardapioDaUnidade, CAMPANHAS } from "../data/cardapio.js";

// campanhas válidas pra unidade e o momento
export function campanhasAtivas(unidade, agora = new Date()) {
  return CAMPANHAS.filter((c) => {
    if (c.unidades && !c.unidades.includes(unidade.id)) return false;
    if (c.diasSemana && !c.diasSemana.includes(agora.getDay())) return false;
    if (new Date(c.validoAte) < agora) return false;
    return true;
  });
}

// desconto em centavos
export function descontoDoProduto(produtoId, campanhas) {
  const campanha = campanhas.find(
    (c) => c.tipo === "desconto-percentual" && c.itens.includes(produtoId)
  );
  if (!campanha) return 0;
  return Math.round((buscarProduto(produtoId).preco * campanha.percentual) / 100);
}

// acréscimo das opções escolhidas
function acrescimoOpcoes(produto, opcoes) {
  return Object.entries(opcoes ?? {}).reduce((soma, [grupoId, escolhaId]) => {
    const grupo = produto.opcoes.find((o) => o.id === grupoId);
    const escolha = grupo?.escolhas.find((e) => e.id === escolhaId);
    return soma + (escolha?.acrescimo ?? 0);
  }, 0);
}

// detalha uma linha do carrinho
export function detalharLinha(linha, campanhas) {
  const produto = buscarProduto(linha.produtoId);
  const desconto = descontoDoProduto(produto.id, campanhas);
  const unitario = produto.preco + acrescimoOpcoes(produto, linha.opcoes) - desconto;
  return {
    ...linha,
    produto,
    desconto,
    unitario,
    subtotal: unitario * linha.quantidade,
    pontos: produto.pontosFidelidade * linha.quantidade,
  };
}

export function resumirCarrinho(carrinho, campanhas) {
  const linhas = carrinho.map((l) => detalharLinha(l, campanhas));
  return {
    linhas,
    itens: linhas.reduce((s, l) => s + l.quantidade, 0),
    economia: linhas.reduce((s, l) => s + l.desconto * l.quantidade, 0),
    total: linhas.reduce((s, l) => s + l.subtotal, 0),
    pontos: linhas.reduce((s, l) => s + l.pontos, 0),
  };
}

// itens do carrinho que saíram do cardápio ou esgotaram
export function itensIndisponiveis(carrinho, unidade, agora = new Date()) {
  const cardapio = cardapioDaUnidade(unidade, agora);
  return carrinho.filter((linha) => {
    const item = cardapio.find((p) => p.id === linha.produtoId);
    return !item || !item.disponivel;
  });
}

/*
 * Gateway externo simulado.
 * O sistema só solicita e registra o retorno; nada é processado aqui.
 * `forcar` existe pra demonstrar recusa e timeout sem depender de sorte.
 */
export function solicitarPagamento({ metodo, valor, forcar = null }) {
  const atraso = 1400 + Math.random() * 900;

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const resultado = forcar ?? (Math.random() < 0.85 ? "aprovado" : "recusado");

      if (resultado === "timeout") {
        reject({ tipo: "timeout", mensagem: "O provedor não respondeu a tempo." });
        return;
      }
      if (resultado === "recusado") {
        resolve({
          status: "recusado",
          codigo: "51",
          motivo: "Saldo insuficiente ou cartão bloqueado pelo emissor.",
          transacaoId: null,
        });
        return;
      }
      resolve({
        status: "aprovado",
        codigo: "00",
        motivo: null,
        metodo,
        valor,
        transacaoId: `tx_${Date.now().toString(36)}`,
      });
    }, atraso);
  });
}
