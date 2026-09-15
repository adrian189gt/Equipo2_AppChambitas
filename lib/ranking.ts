import type { Coordenada, Trabajador } from './tipos';

/**
 * Distancia en kilometros entre dos puntos (formula de haversine).
 * En produccion esto lo hace Postgres con PostGIS; aqui va en el cliente
 * para que la demo funcione sin backend.
 */
export function distanciaKm(a: Coordenada, b: Coordenada): number {
  const R = 6371;
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export type Candidato = { trabajador: Trabajador; distanciaKm: number; puntaje: number };

export type OpcionesBusqueda = {
  oficio: string | null;
  origen: Coordenada;
  urgencia?: 'hoy' | 'esta_semana' | 'sin_prisa';
  limite?: number;
};

/**
 * Puntaje de relevancia, de 0 a 100.
 *
 * IMPORTANTE: el plan de suscripcion NO entra aqui a proposito. Si el dinero
 * moviera el ranking, la recomendacion dejaria de ser confiable y el
 * marketplace se cae. Lo que se paga es la etiqueta "Patrocinado", que se
 * marca visible y aparte (ver marcarPatrocinado).
 */
function puntaje(t: Trabajador, dist: number, urgencia?: string): number {
  // Cercania: 40 pts al lado, cae a 0 cuando sale de su radio de cobertura.
  const cercania = Math.max(0, 1 - dist / Math.max(t.radioKm, 1)) * 40;

  // Reputacion: 35 pts, moderada por cuantas resenas la respaldan.
  // Un 5.0 con 2 resenas vale menos que un 4.7 con 60.
  const confianza = Math.min(t.numResenas / 25, 1);
  const reputacion = (t.calificacion / 5) * 35 * (0.55 + 0.45 * confianza);

  // Respuesta: 15 pts. Contestar rapido importa mas si urge.
  const velocidad = Math.max(0, 1 - t.minRespuesta / 60) * (urgencia === 'hoy' ? 15 : 9);

  // Disponibilidad: 10 pts solo cuando el trabajo es para hoy.
  const dispo = t.disponibleHoy ? (urgencia === 'hoy' ? 10 : 4) : 0;

  return Math.round(cercania + reputacion + velocidad + dispo);
}

/**
 * Paso 2 del flujo: filtrar por oficio + cobertura y pre-rankear.
 * Devuelve una lista corta para que la IA solo tenga que explicar,
 * no buscar. Asi no puede inventarse trabajadores que no existen.
 */
export function buscarCandidatos(
  todos: Trabajador[],
  { oficio, origen, urgencia, limite = 12 }: OpcionesBusqueda,
): Candidato[] {
  return todos
    .filter((t) => (oficio ? t.oficios.includes(oficio) : true))
    .map((t) => {
      const d = distanciaKm(origen, { lat: t.lat, lng: t.lng });
      return { trabajador: t, distanciaKm: d, puntaje: puntaje(t, d, urgencia) };
    })
    // Fuera de su zona de cobertura: no le sirve al cliente ni al trabajador.
    .filter((c) => c.distanciaKm <= c.trabajador.radioKm * 1.15)
    .sort((a, b) => b.puntaje - a.puntaje)
    .slice(0, limite);
}

/**
 * Elige a lo mas UN patrocinado, y solo si ya era competitivo por si mismo
 * (esta dentro del top 60% del puntaje del primer lugar). Pagar te da
 * visibilidad, no te compra un lugar que no te toca.
 */
export function marcarPatrocinado(candidatos: Candidato[]): string | null {
  if (candidatos.length < 3) return null;
  const tope = candidatos[0].puntaje;
  const elegible = candidatos
    .slice(1)
    .filter((c) => c.trabajador.plan !== 'gratis' && c.puntaje >= tope * 0.6);
  return elegible.length ? elegible[0].trabajador.id : null;
}
