export type Oficio = { slug: string; nombre: string; emoji: string };

/** Catalogo base. Los sinonimos viven en el prompt de la IA, no aqui. */
export const OFICIOS: Oficio[] = [
  { slug: 'plomeria', nombre: 'Plomeria', emoji: '\u{1F6BF}' },
  { slug: 'electricidad', nombre: 'Electricidad', emoji: '\u{26A1}' },
  { slug: 'albanileria', nombre: 'Albanileria', emoji: '\u{1F9F1}' },
  { slug: 'carpinteria', nombre: 'Carpinteria', emoji: '\u{1FA9A}' },
  { slug: 'pintura', nombre: 'Pintura', emoji: '\u{1F3A8}' },
  { slug: 'impermeabilizacion', nombre: 'Impermeabilizacion', emoji: '\u{1F327}' },
  { slug: 'herreria', nombre: 'Herreria', emoji: '\u{1F528}' },
  { slug: 'cerrajeria', nombre: 'Cerrajeria', emoji: '\u{1F511}' },
  { slug: 'jardineria', nombre: 'Jardineria', emoji: '\u{1F33F}' },
  { slug: 'limpieza', nombre: 'Limpieza', emoji: '\u{1F9F9}' },
  { slug: 'mudanzas', nombre: 'Mudanzas y fletes', emoji: '\u{1F69A}' },
  { slug: 'cocina', nombre: 'Cocina y banquetes', emoji: '\u{1F373}' },
  { slug: 'costura', nombre: 'Costura', emoji: '\u{1F9F5}' },
  { slug: 'mecanica', nombre: 'Mecanica', emoji: '\u{1F527}' },
  { slug: 'cuidados', nombre: 'Cuidado de personas', emoji: '\u{1F49B}' },
  { slug: 'computo', nombre: 'Computo y redes', emoji: '\u{1F4BB}' },
];

export function oficioPorSlug(slug: string): Oficio | undefined {
  return OFICIOS.find((o) => o.slug === slug);
}

export function nombreOficio(slug: string): string {
  return oficioPorSlug(slug)?.nombre ?? slug;
}
