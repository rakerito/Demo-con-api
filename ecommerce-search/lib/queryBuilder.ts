export interface SearchSpec {
  tipo: string;
  marca: string;
  modelo: string;
  specs: string[];
  presupuesto_max: number | null;
}

export function buildQueryLadder(spec: SearchSpec): string[] {
  const baseParts = [spec.tipo, spec.marca, spec.modelo].map(value => value.trim()).filter(Boolean);
  const base = baseParts.join(" ");
  const specs = spec.specs.map(value => value.trim()).filter(Boolean);
  const ladder = [
    [...baseParts, ...specs].join(" "),
    [...baseParts, ...specs.slice(0, 2)].join(" "),
    base,
    [spec.tipo.trim(), spec.marca.trim()].filter(Boolean).join(" "),
  ];
  return [...new Set(ladder.filter(Boolean))];
}