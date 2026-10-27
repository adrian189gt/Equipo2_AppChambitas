import type { Coordenada, Interpretacion, ResultadoBusqueda, Sugerencia } from './tipos';
import { TRABAJADORES } from './mock';
import { buscarCandidatos, marcarPatrocinado } from './ranking';
import { nombreOficio } from './oficios';

const URL_SUPABASE = process.env.EXPO_PUBLIC_SUPABASE_URL;
const LLAVE_SUPABASE = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const hayBackend = Boolean(URL_SUPABASE && LLAVE_SUPABASE);

/**
 * Busca trabajadores a partir de texto libre.
 *
 * Con backend: llama a la Edge Function, que usa Claude para entender y
 * explicar. Sin backend: cae al modo local de palabras clave, para que la
 * app se pueda probar hoy y para que siga sirviendo sin senal.
 */
export async function buscar(texto: string, origen: Coordenada): Promise<ResultadoBusqueda> {
  if (hayBackend) {
    try {
      return await buscarConIA(texto, origen);
    } catch (e) {
      console.warn('IA no disponible, uso modo local:', e);
    }
  }
  return buscarLocal(texto, origen);
}

async function buscarConIA(texto: string, origen: Coordenada): Promise<ResultadoBusqueda> {
  const resp = await fetch(`${URL_SUPABASE}/functions/v1/recomendar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LLAVE_SUPABASE}`,
    },
    body: JSON.stringify({ texto, lat: origen.lat, lng: origen.lng }),
  });

  if (!resp.ok) throw new Error(`Edge function respondio ${resp.status}`);
  const datos = await resp.json();

  const porId = new Map<string, any>((datos.candidatos ?? []).map((c: any) => [c.id, c]));
  const sugerencias: Sugerencia[] = (datos.sugerencias ?? [])
    .map((s: any) => {
      const c = porId.get(s.id);
      if (!c) return null;
      return {
        trabajador: aTrabajador(c),
        distanciaKm: c.distancia_km,
        razon: s.razon,
        patrocinado: false,
      };
    })
    .filter(Boolean);

  return { interpretacion: datos.interpretacion, sugerencias, modoLocal: false };
}

function aTrabajador(c: any) {
  return {
    id: c.id, nombre: c.nombre, oficios: c.oficios ?? [], descripcion: c.descripcion,
    municipio: c.municipio, colonia: c.colonia, lat: 0, lng: 0, radioKm: 0,
    telefono: c.telefono, fotoUrl: c.foto_url,
    calificacion: Number(c.calificacion), numResenas: c.num_resenas,
    trabajosHechos: c.trabajos_hechos ?? 0, minRespuesta: c.min_respuesta,
    precioDesde: c.precio_desde, verificado: c.verificado,
    plan: c.plan ?? 'gratis', disponibleHoy: c.disponible_hoy,
  };
}

/* =====================================================================
 *  Modo local: sin IA, sin internet.
 *  Reconoce como habla la gente, no nombres tecnicos. Es un respaldo
 *  honesto: cubre lo comun, no entiende matices. La IA si.
 * ===================================================================== */

const PISTAS: Record<string, string[]> = {
  plomeria: ['fuga', 'agua', 'llave', 'tuberia', 'tuberia', 'tinaco', 'bomba', 'drenaje', 'wc', 'bano', 'gotea', 'gotear', 'calentador', 'boiler', 'destapar', 'tapado', 'coladera'],
  electricidad: ['luz', 'corto', 'apagon', 'cable', 'contacto', 'foco', 'electrico', 'electricidad', 'chispas', 'pastilla', 'medidor', 'instalacion electrica'],
  impermeabilizacion: ['gotera', 'techo', 'azotea', 'filtra', 'filtracion', 'llueve', 'lluvia', 'humedad', 'impermeabiliza', 'se mete el agua'],
  albanileria: ['muro', 'pared', 'cemento', 'losa', 'castillo', 'aplanado', 'ladrillo', 'construir', 'barda', 'piso', 'obra'],
  carpinteria: ['closet', 'madera', 'mueble', 'puerta', 'cocina integral', 'repisa', 'carpintero', 'librero'],
  pintura: ['pintar', 'pintura', 'fachada', 'brocha', 'resane', 'texturizado'],
  herreria: ['porton', 'reja', 'herreria', 'soldar', 'soldadura', 'proteccion', 'fierro', 'barandal'],
  cerrajeria: ['chapa', 'llave perdida', 'cerradura', 'candado', 'me quede afuera', 'cerrajero', 'trabo'],
  jardineria: ['jardin', 'pasto', 'podar', 'poda', 'arbol', 'planta', 'riego', 'maleza'],
  limpieza: ['limpieza', 'limpiar', 'aseo', 'trapear', 'sucia', 'sucio', 'muda', 'domestica'],
  mudanzas: ['mudanza', 'flete', 'camioneta', 'cargar', 'mover mis cosas', 'transportar'],
  cocina: ['comida', 'banquete', 'mole', 'fiesta', 'cocinar', 'bautizo', 'boda', 'taquiza', 'cumpleanos', 'catering'],
  costura: ['coser', 'costura', 'vestido', 'ropa', 'bordado', 'ajustar', 'dobladillo', 'sastre'],
  mecanica: ['carro', 'coche', 'auto', 'motor', 'frenos', 'afinacion', 'mecanico', 'bateria', 'llanta'],
  cuidados: ['cuidar', 'abuelo', 'abuela', 'enfermo', 'ninos', 'bebe', 'acompanar', 'adulto mayor'],
  computo: ['computadora', 'laptop', 'internet', 'wifi', 'red', 'impresora', 'pc', 'virus'],
};

const URGENTE = ['urge', 'urgente', 'ahorita', 'ahora', 'hoy', 'ya', 'emergencia', 'inunda', 'de inmediato'];
const BARATO = ['barato', 'economico', 'poco dinero', 'no tengo mucho', 'corto de', 'accesible', 'lo mas barato'];

/** Quita acentos y baja a minusculas para comparar sin sorpresas. */
function normalizar(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function detectarOficio(texto: string): string | null {
  const t = normalizar(texto);
  let mejor: { slug: string; hits: number } | null = null;

  for (const [slug, palabras] of Object.entries(PISTAS)) {
    const hits = palabras.filter((p) => t.includes(normalizar(p))).length;
    if (hits > 0 && (!mejor || hits > mejor.hits)) mejor = { slug, hits };
  }
  return mejor?.slug ?? null;
}

function buscarLocal(texto: string, origen: Coordenada): ResultadoBusqueda {
  const t = normalizar(texto);
  const oficio = detectarOficio(texto);
  const urgencia: Interpretacion['urgencia'] = URGENTE.some((p) => t.includes(p)) ? 'hoy' : 'esta_semana';
  const presupuesto: Interpretacion['presupuesto'] = BARATO.some((p) => t.includes(p)) ? 'bajo' : 'no_dijo';

  const candidatos = buscarCandidatos(TRABAJADORES, { oficio, origen, urgencia, limite: 8 });
  const idPatrocinado = marcarPatrocinado(candidatos);

  const sugerencias: Sugerencia[] = candidatos.slice(0, 5).map((c) => ({
    trabajador: c.trabajador,
    distanciaKm: c.distanciaKm,
    razon: razonLocal(c.trabajador, c.distanciaKm, urgencia),
    patrocinado: c.trabajador.id === idPatrocinado,
  }));

  return {
    interpretacion: {
      oficio,
      tipoTrabajo: oficio ? nombreOficio(oficio).toLowerCase() : texto.slice(0, 40),
      urgencia,
      presupuesto,
      resumen: oficio
        ? `Buscas ${nombreOficio(oficio).toLowerCase()}${urgencia === 'hoy' ? ' para hoy' : ''}.`
        : 'No identifique bien el oficio, te muestro lo mas cercano.',
    },
    sugerencias,
    modoLocal: true,
  };
}

/** Razon armada con plantillas. Cumple, pero se nota rigida al lado de la IA. */
function razonLocal(t: any, dist: number, urgencia: string): string {
  const partes: string[] = [`A ${dist.toFixed(1)} km de ti`];
  if (t.numResenas >= 10) partes.push(`${t.calificacion} de calificacion con ${t.numResenas} resenas`);
  if (urgencia === 'hoy' && t.disponibleHoy) partes.push(`disponible hoy y contesta en ${t.minRespuesta} min`);
  else if (t.minRespuesta <= 20) partes.push(`contesta en ${t.minRespuesta} min`);
  if (t.precioDesde) partes.push(`desde $${t.precioDesde}`);
  return partes.slice(0, 3).join(', ') + '.';
}
