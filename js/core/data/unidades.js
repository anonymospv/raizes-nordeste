/**
 * Unidades da Rede Raízes do Nordeste (mock data).
 *
 * Cada unidade tem cardápio próprio: `itensDisponiveis` lista os IDs
 * que aquela loja serve. É isso que sustenta o requisito de
 * "cardápio dinâmico por unidade" — o mesmo catálogo, filtrado por loja.
 */

export const UNIDADES = [
  {
    id: "rec-bv",
    nome: "Recife — Boa Viagem",
    cidade: "Recife",
    uf: "PE",
    endereco: "Av. Conselheiro Aguiar, 1420",
    horario: { abre: "07:00", fecha: "22:00" },
    temTotem: true,
    tempoMedioPreparoMin: 14,
    itensDisponiveis: [
      "tapioca-carne-sol",
      "cuscuz-completo",
      "baiao-dois",
      "sanduiche-carne-sol",
      "pastel-camarao",
      "queijo-coalho",
      "bolo-rolo",
      "cartola",
      "cajuina",
      "cafe-rapadura",
      "suco-caja",
    ],
  },
  {
    id: "for-ald",
    nome: "Fortaleza — Aldeota",
    cidade: "Fortaleza",
    uf: "CE",
    endereco: "Rua Osvaldo Cruz, 880",
    horario: { abre: "07:30", fecha: "23:00" },
    temTotem: true,
    tempoMedioPreparoMin: 11,
    itensDisponiveis: [
      "tapioca-carne-sol",
      "cuscuz-completo",
      "baiao-dois",
      "sanduiche-carne-sol",
      "queijo-coalho",
      "mungunza",
      "cartola",
      "cajuina",
      "cafe-rapadura",
      "vitamina-umbu",
    ],
  },
  {
    id: "ssa-rv",
    nome: "Salvador — Rio Vermelho",
    cidade: "Salvador",
    uf: "BA",
    endereco: "Rua da Paciência, 205",
    horario: { abre: "08:00", fecha: "23:30" },
    temTotem: false, // unidade menor: atendimento só por app e balcão
    tempoMedioPreparoMin: 18,
    itensDisponiveis: [
      "acaraje",
      "tapioca-carne-sol",
      "baiao-dois",
      "pastel-camarao",
      "queijo-coalho",
      "cartola",
      "cajuina",
      "suco-caja",
      "cafe-rapadura",
    ],
  },
  {
    id: "pet-cen",
    nome: "Petrolina — Centro",
    cidade: "Petrolina",
    uf: "PE",
    endereco: "Av. Guararapes, 76",
    horario: { abre: "06:30", fecha: "20:00" },
    temTotem: true,
    tempoMedioPreparoMin: 9,
    itensDisponiveis: [
      "cuscuz-completo",
      "tapioca-carne-sol",
      "sanduiche-carne-sol",
      "queijo-coalho",
      "bolo-rolo",
      "mungunza",
      "cafe-rapadura",
      "cajuina",
      "vitamina-umbu",
    ],
  },
];

/** busca pelo id */
export function buscarUnidade(id) {
  return UNIDADES.find((u) => u.id === id);
}

/**
 * informa se a unidade está aberta agora
 */
export function estaAberta(unidade, agora = new Date()) {
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
  const paraMinutos = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };
  return (
    minutosAgora >= paraMinutos(unidade.horario.abre) &&
    minutosAgora < paraMinutos(unidade.horario.fecha)
  );
}
