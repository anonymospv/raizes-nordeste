// checagem da camada de dados: node verificar.mjs
import { UNIDADES, buscarUnidade, estaAberta } from "./assets/js/data/unidades.js";
import { PRODUTOS, CAMPANHAS, buscarProduto, cardapioDaUnidade, naTemporada } from "./assets/js/data/cardapio.js";

let falhas = 0;
const checar = (condicao, descricao) => {
  if (condicao) console.log("  ok   " + descricao);
  else { falhas++; console.log("  FALHA " + descricao); }
};

const juninho = new Date("2026-06-20T12:00:00");
const marco = new Date("2026-03-10T12:00:00");

console.log("\nIntegridade do catálogo");
checar(new Set(PRODUTOS.map(p => p.id)).size === PRODUTOS.length, "nenhum id de produto duplicado");
checar(new Set(UNIDADES.map(u => u.id)).size === UNIDADES.length, "nenhum id de unidade duplicado");
checar(UNIDADES.filter(u => u.fundadora).length === 1, "existe exatamente uma unidade fundadora");
checar(UNIDADES.every(u => u.esgotados.every(id => buscarProduto(id))), "todo item esgotado existe no catálogo");
checar(CAMPANHAS.every(c => c.itens.every(id => buscarProduto(id))), "toda campanha aponta para produtos reais");
checar(CAMPANHAS.every(c => !c.unidades || c.unidades.every(id => buscarUnidade(id))), "toda campanha aponta para unidades reais");

console.log("\nFormato de cozinha reduzido");
const petrolina = buscarUnidade("pet-centro");
const recife = buscarUnidade("rec-casa-amarela");
const ids = (u, quando) => cardapioDaUnidade(u, quando).map(p => p.id);
checar(!ids(petrolina, marco).includes("baiao-dois"), "Petrolina (reduzida) não oferece baião de dois");
checar(ids(recife, marco).includes("baiao-dois"), "Recife (completa) oferece baião de dois");
checar(ids(petrolina, marco).includes("cuscuz-recheado"), "Petrolina oferece cuscuz recheado");

console.log("\nSazonalidade");
checar(naTemporada(buscarProduto("canjica"), juninho), "canjica disponível em junho");
checar(!naTemporada(buscarProduto("canjica"), marco), "canjica indisponível em março");
checar(naTemporada(buscarProduto("cajuina"), marco), "item não sazonal disponível o ano todo");
checar(ids(buscarUnidade("cg-centro"), juninho).includes("pamonha"), "Campina Grande oferece pamonha em junho");
checar(!ids(buscarUnidade("cg-centro"), marco).includes("pamonha"), "pamonha some do cardápio em março");

console.log("\nVariação regional");
checar(!ids(buscarUnidade("for-aldeota"), marco).includes("bolo-rolo"), "bolo de rolo não é servido no Ceará");
checar(ids(recife, marco).includes("bolo-rolo"), "bolo de rolo é servido em Pernambuco");
const cuscuzRec = cardapioDaUnidade(recife, marco).find(p => p.id === "cuscuz-recheado");
const cuscuzFor = cardapioDaUnidade(buscarUnidade("for-aldeota"), marco).find(p => p.id === "cuscuz-recheado");
checar(cuscuzRec.descricao !== cuscuzFor.descricao, "a receita do cuscuz varia entre PE e CE");
checar(cuscuzRec.preco === cuscuzFor.preco, "a variação regional não altera o preço");

console.log("\nEstoque local");
const boloRecife = cardapioDaUnidade(recife, marco).find(p => p.id === "bolo-rolo");
checar(boloRecife && boloRecife.disponivel === false, "bolo de rolo aparece esgotado em Recife");
checar(boloRecife.motivoIndisponivel === "Esgotado hoje", "o motivo da indisponibilidade é informado");

console.log("\nHorário");
checar(estaAberta(recife, new Date("2026-03-10T09:00:00")), "Recife aberta às 9h");
checar(!estaAberta(recife, new Date("2026-03-10T21:00:00")), "Recife fechada às 21h");

console.log(falhas === 0 ? "\nTodos os cenários passaram.\n" : `\n${falhas} falha(s).\n`);
process.exit(falhas ? 1 : 0);
