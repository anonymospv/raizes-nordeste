const MOEDA = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** 2290 -> "R$ 22,90" */
export function reais(centavos) {
  return MOEDA.format(centavos / 100);
}

/** 14 -> "14 min" | 75 -> "1 h 15 min" */
export function duracao(minutos) {
  if (minutos < 60) return `${minutos} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

/** plural(1, "item", "itens") -> "1 item" */
export function plural(n, singular, plural_) {
  return `${n} ${n === 1 ? singular : plural_}`;
}

/** Escapa texto antes de injetar em innerHTML. */
export function escapar(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}


export function iniciais(nome) {
  const irrelevantes = new Set(["de", "da", "do", "com", "e", "na", "no", "a", "o"]);
  return nome
    .split(/\s+/)
    .filter((p) => !irrelevantes.has(p.toLowerCase()))
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}
