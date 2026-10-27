import type { Coordenada, Sugerencia } from '../../lib/tipos';

/** Lo que reciben los dos mapas (web y celular). Expo escoge el archivo segun la plataforma. */
export type PropsMapaBase = {
  origen: Coordenada; // la persona (punto azul)
  origenEsReal: boolean; // false = no dio GPS, es el centro de Oaxaca
  trabajadores: Sugerencia[];
  seleccionadoId: string | null;
  onSeleccionar: (id: string | null) => void;
};

/** Circulo de "zona": guardamos la colonia, no el domicilio. */
export const RADIO_ZONA_METROS = 600;

/** Rectangulo donde caben la persona y todos los trabajadores (+ ~1 km de margen). */
export function encuadre(origen: Coordenada, trabajadores: Sugerencia[]) {
  const lats = [origen.lat, ...trabajadores.map((s) => s.trabajador.lat)];
  const lngs = [origen.lng, ...trabajadores.map((s) => s.trabajador.lng)];
  return {
    north: Math.max(...lats) + 0.01, south: Math.min(...lats) - 0.01,
    east: Math.max(...lngs) + 0.01, west: Math.min(...lngs) - 0.01,
  };
}
