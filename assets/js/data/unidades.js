// unidades da rede

export const UNIDADES = [
  {
    id: "rec-casa-amarela",
    nome: "Recife — Casa Amarela",
    cidade: "Recife",
    uf: "PE",
    regiao: "PE",
    endereco: "Rua Padre Lemos, 318",
    fundadora: true,
    formato: "completa",
    horario: { abre: "06:00", fecha: "20:00" },
    temTotem: true,
    tempoMedioPreparoMin: 14,
    // estoque local
    esgotados: ["bolo-rolo"],
    // receita regional
    variacoes: {
      "cuscuz-recheado": {
        descricao:
          "Cuscuz de milho no vapor com carne de sol, ovo e queijo de coalho. Vai manteiga de garrafa por cima.",
      },
    },
  },
  {
    id: "for-aldeota",
    nome: "Fortaleza — Aldeota",
    cidade: "Fortaleza",
    uf: "CE",
    regiao: "CE",
    endereco: "Rua Osvaldo Cruz, 880",
    fundadora: false,
    formato: "completa",
    horario: { abre: "06:30", fecha: "22:00" },
    temTotem: true,
    tempoMedioPreparoMin: 11,
    esgotados: [],
    variacoes: {
      "cuscuz-recheado": {
        descricao:
          "Cuscuz de milho no vapor com carne de sol, ovo e nata. No Ceará vai nata no lugar da manteiga de garrafa.",
      },
    },
  },
  {
    id: "cg-centro",
    nome: "Campina Grande — Centro",
    cidade: "Campina Grande",
    uf: "PB",
    regiao: "PB",
    endereco: "Rua Cardoso Vieira, 45",
    fundadora: false,
    formato: "completa",
    horario: { abre: "06:00", fecha: "23:00" }, // são joão
    temTotem: true,
    tempoMedioPreparoMin: 16,
    esgotados: [],
    variacoes: {},
  },
  {
    id: "pet-centro",
    nome: "Petrolina — Centro",
    cidade: "Petrolina",
    uf: "PE",
    regiao: "PE",
    endereco: "Av. Guararapes, 76",
    fundadora: false,
    // só chapa e forno
    formato: "reduzida",
    horario: { abre: "06:30", fecha: "19:00" },
    temTotem: false,
    tempoMedioPreparoMin: 8,
    esgotados: ["vitamina-umbu"],
    variacoes: {},
  },
];

export function buscarUnidade(id) {
  return UNIDADES.find((u) => u.id === id);
}

// aberta agora? ignora virada de meia-noite
export function estaAberta(unidade, agora = new Date()) {
  const minutos = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };
  const agoraMin = agora.getHours() * 60 + agora.getMinutes();
  return agoraMin >= minutos(unidade.horario.abre) && agoraMin < minutos(unidade.horario.fecha);
}
