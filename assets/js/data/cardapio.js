// catálogo. preço sempre em centavos

export const CATEGORIAS = [
  { id: "cafe-manha", nome: "Café da manhã" },
  { id: "salgados", nome: "Salgados" },
  { id: "pratos", nome: "Pratos" },
  { id: "doces", nome: "Doces" },
  { id: "bebidas", nome: "Bebidas" },
];

export const PRODUTOS = [
  // café da manhã
  {
    id: "cafe-completo",
    nome: "Café da manhã completo",
    categoria: "cafe-manha",
    preco: 3290,
    descricao:
      "Cuscuz, ovo mexido, queijo coalho na chapa, tapioca simples, café passado e um suco regional.",
    pontosFidelidade: 32,
    alergenos: ["leite", "ovo"],
    requerCozinhaCompleta: false,
    opcoes: [
      {
        id: "suco",
        rotulo: "Suco que acompanha",
        obrigatoria: true,
        escolhas: [
          { id: "caja", rotulo: "Cajá", acrescimo: 0 },
          { id: "acerola", rotulo: "Acerola", acrescimo: 0 },
          { id: "umbu", rotulo: "Umbu", acrescimo: 0 },
        ],
      },
    ],
  },

  // salgados
  {
    id: "tapioca-carne-sol",
    nome: "Tapioca de carne de sol com coalho",
    categoria: "salgados",
    preco: 2290,
    descricao: "Goma fresca, carne de sol desfiada na manteiga de garrafa e queijo coalho.",
    pontosFidelidade: 22,
    alergenos: ["leite"],
    requerCozinhaCompleta: false,
    opcoes: [
      {
        id: "queijo",
        rotulo: "Queijo coalho",
        obrigatoria: true,
        escolhas: [
          { id: "normal", rotulo: "Normal", acrescimo: 0 },
          { id: "extra", rotulo: "Dobro de queijo", acrescimo: 500 },
        ],
      },
    ],
  },
  {
    id: "cuscuz-recheado",
    nome: "Cuscuz recheado",
    categoria: "salgados",
    preco: 1990,
    descricao: "Cuscuz de milho no vapor com carne de sol, ovo e queijo.",
    pontosFidelidade: 19,
    alergenos: ["leite", "ovo"],
    requerCozinhaCompleta: false,
    opcoes: [],
  },
  {
    id: "sanduiche-carne-sol",
    nome: "Sanduíche de carne de sol",
    categoria: "salgados",
    preco: 2690,
    descricao: "Pão na chapa, carne de sol, queijo manteiga e cebola caramelizada.",
    pontosFidelidade: 26,
    alergenos: ["glúten", "leite"],
    requerCozinhaCompleta: false,
    opcoes: [],
  },
  {
    id: "queijo-coalho",
    nome: "Queijo coalho na brasa",
    categoria: "salgados",
    preco: 1290,
    descricao: "Dois espetos com melaço de cana e orégano.",
    pontosFidelidade: 12,
    alergenos: ["leite"],
    requerCozinhaCompleta: false,
    opcoes: [],
  },
  {
    id: "pastel-camarao",
    nome: "Pastel de camarão",
    categoria: "salgados",
    preco: 1850,
    descricao: "Massa fina e crocante, recheio de camarão ao leite de coco.",
    pontosFidelidade: 18,
    alergenos: ["glúten", "crustáceos"],
    requerCozinhaCompleta: true, // fritadeira
    opcoes: [],
  },

  // pratos
  {
    id: "baiao-dois",
    nome: "Baião de dois",
    categoria: "pratos",
    preco: 3450,
    descricao: "Arroz, feijão de corda, queijo coalho e nata. Acompanha farofa e vinagrete.",
    pontosFidelidade: 34,
    alergenos: ["leite"],
    requerCozinhaCompleta: true,
    opcoes: [
      {
        id: "proteina",
        rotulo: "Proteína",
        obrigatoria: true,
        escolhas: [
          { id: "sem", rotulo: "Sem proteína", acrescimo: 0 },
          { id: "carne-sol", rotulo: "Carne de sol", acrescimo: 900 },
          { id: "frango", rotulo: "Frango grelhado", acrescimo: 700 },
        ],
      },
    ],
  },

  // doces
  {
    id: "bolo-macaxeira",
    nome: "Bolo de macaxeira",
    categoria: "doces",
    preco: 1290,
    descricao: "Massa úmida de macaxeira com coco ralado, assada no dia.",
    pontosFidelidade: 12,
    alergenos: ["leite", "ovo"],
    requerCozinhaCompleta: false,
    opcoes: [],
  },
  {
    id: "tapioca-coco",
    nome: "Tapioca de coco com leite condensado",
    categoria: "doces",
    preco: 1690,
    descricao: "Goma fresca, coco ralado na hora e leite condensado.",
    pontosFidelidade: 16,
    alergenos: ["leite"],
    requerCozinhaCompleta: false,
    opcoes: [],
  },
  {
    id: "bolo-rolo",
    nome: "Bolo de rolo",
    categoria: "doces",
    preco: 1450,
    descricao: "Fatia de massa fina enrolada em goiabada cascão.",
    pontosFidelidade: 14,
    alergenos: ["glúten", "ovo", "leite"],
    requerCozinhaCompleta: false,
    regioes: ["PE"],
    opcoes: [],
  },
  {
    id: "cartola",
    nome: "Cartola",
    categoria: "doces",
    preco: 1690,
    descricao: "Banana frita com queijo manteiga, açúcar e canela.",
    pontosFidelidade: 16,
    alergenos: ["leite"],
    requerCozinhaCompleta: true,
    regioes: ["PE"],
    opcoes: [],
  },

  // sazonais juninos
  {
    id: "canjica",
    nome: "Canjica",
    categoria: "doces",
    preco: 1390,
    descricao: "Milho branco cozido no leite de coco com canela em pau.",
    pontosFidelidade: 13,
    alergenos: ["leite"],
    requerCozinhaCompleta: true,
    sazonal: { de: "05-15", ate: "07-15", rotulo: "Festa junina" },
    opcoes: [],
  },
  {
    id: "pamonha",
    nome: "Pamonha",
    categoria: "doces",
    preco: 1190,
    descricao: "Milho verde ralado, cozido na própria palha.",
    pontosFidelidade: 11,
    alergenos: ["leite"],
    requerCozinhaCompleta: true,
    sazonal: { de: "05-15", ate: "07-15", rotulo: "Festa junina" },
    opcoes: [],
  },
  {
    id: "pe-de-moleque",
    nome: "Pé de moleque",
    categoria: "doces",
    preco: 690,
    descricao: "Amendoim torrado na rapadura.",
    pontosFidelidade: 6,
    alergenos: ["amendoim"],
    requerCozinhaCompleta: false,
    sazonal: { de: "05-15", ate: "07-15", rotulo: "Festa junina" },
    opcoes: [],
  },

  // bebidas
  {
    id: "cajuina",
    nome: "Cajuína gelada",
    categoria: "bebidas",
    preco: 890,
    descricao: "Garrafa 300 ml, servida bem gelada.",
    pontosFidelidade: 8,
    alergenos: [],
    requerCozinhaCompleta: false,
    opcoes: [],
  },
  {
    id: "suco-caja",
    nome: "Suco de cajá",
    categoria: "bebidas",
    preco: 1090,
    descricao: "Polpa batida na hora. 400 ml.",
    pontosFidelidade: 10,
    alergenos: [],
    requerCozinhaCompleta: false,
    opcoes: [
      {
        id: "base",
        rotulo: "Base",
        obrigatoria: true,
        escolhas: [
          { id: "agua", rotulo: "Com água", acrescimo: 0 },
          { id: "leite", rotulo: "Com leite", acrescimo: 300 },
        ],
      },
    ],
  },
  {
    id: "suco-acerola",
    nome: "Suco de acerola",
    categoria: "bebidas",
    preco: 990,
    descricao: "Polpa batida na hora. 400 ml.",
    pontosFidelidade: 9,
    alergenos: [],
    requerCozinhaCompleta: false,
    opcoes: [],
  },
  {
    id: "vitamina-umbu",
    nome: "Vitamina de umbu",
    categoria: "bebidas",
    preco: 1250,
    descricao: "Umbu, leite e um toque de mel. 400 ml.",
    pontosFidelidade: 12,
    alergenos: ["leite"],
    requerCozinhaCompleta: false,
    opcoes: [],
  },
  {
    id: "cafe-rapadura",
    nome: "Café com rapadura",
    categoria: "bebidas",
    preco: 690,
    descricao: "Coado na hora, adoçado com rapadura raspada.",
    pontosFidelidade: 6,
    alergenos: [],
    requerCozinhaCompleta: false,
    opcoes: [],
  },
];

// campanhas. unidades null = rede toda
export const CAMPANHAS = [
  {
    id: "cafe-da-manha",
    titulo: "Começo de expediente",
    chamada: "Cuscuz recheado + café com rapadura por R$ 22,90 até as 10h",
    tipo: "combo",
    itens: ["cuscuz-recheado", "cafe-rapadura"],
    precoCombo: 2290,
    unidades: null,
    validoAte: "2026-12-31",
    janelaHorario: { inicio: "06:00", fim: "10:00" },
  },
  {
    id: "terca-do-coalho",
    titulo: "Terça do coalho",
    chamada: "Queijo coalho na brasa com 30% de desconto, toda terça",
    tipo: "desconto-percentual",
    itens: ["queijo-coalho"],
    percentual: 30,
    unidades: null,
    validoAte: "2026-12-31",
    diasSemana: [2], // domingo = 0
  },
  {
    id: "arraia-cg",
    titulo: "Arraiá de Campina",
    chamada: "Canjica e pamonha com 20% durante o São João",
    tipo: "desconto-percentual",
    itens: ["canjica", "pamonha"],
    percentual: 20,
    unidades: ["cg-centro"],
    validoAte: "2026-07-15",
  },
];

export function buscarProduto(id) {
  return PRODUTOS.find((p) => p.id === id);
}

// dentro da temporada?
export function naTemporada(produto, agora = new Date()) {
  if (!produto.sazonal) return true;
  const mmdd = `${String(agora.getMonth() + 1).padStart(2, "0")}-${String(
    agora.getDate()
  ).padStart(2, "0")}`;
  const { de, ate } = produto.sazonal;
  // janela que vira o ano
  return de <= ate ? mmdd >= de && mmdd <= ate : mmdd >= de || mmdd <= ate;
}

// cardápio da loja com disponibilidade resolvida
export function cardapioDaUnidade(unidade, agora = new Date()) {
  if (!unidade) return [];

  return PRODUTOS.filter((produto) => {
    if (produto.regioes && !produto.regioes.includes(unidade.regiao)) return false;
    if (!naTemporada(produto, agora)) return false;
    if (produto.requerCozinhaCompleta && unidade.formato !== "completa") return false;
    return true;
  }).map((produto) => {
    const variacao = unidade.variacoes?.[produto.id] ?? {};
    const esgotado = unidade.esgotados.includes(produto.id);
    return {
      ...produto,
      ...variacao,
      disponivel: !esgotado,
      motivoIndisponivel: esgotado ? "Esgotado hoje" : null,
      sazonalAgora: Boolean(produto.sazonal),
    };
  });
}
