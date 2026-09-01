// formatação de exibição

const MOEDA = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

// centavos -> real
export function reais(centavos) {
  return MOEDA.format(centavos / 100);
}

// minutos legíveis
export function duracao(minutos) {
  if (minutos < 60) return `${minutos} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

// concorda número
export function plural(n, singular, plural_) {
  return `${n} ${n === 1 ? singular : plural_}`;
}

// escapa html
export function escapar(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// monograma do nome
export function iniciais(nome) {
  const irrelevantes = new Set(["de", "da", "do", "com", "e", "na", "no", "a", "o"]);
  return nome
    .split(/\s+/)
    .filter((p) => !irrelevantes.has(p.toLowerCase()))
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}
