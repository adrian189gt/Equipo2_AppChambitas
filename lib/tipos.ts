/** Plan de suscripcion del trabajador (modelo freemium). */
export type Plan = 'gratis' | 'impulso' | 'pro';

export type Trabajador = {
  id: string;
  nombre: string;
  /** Slugs de oficios, ej. ['plomeria', 'albanileria'] */
  oficios: string[];
  descripcion: string;
  municipio: string;
  colonia: string;
  /** Ubicacion APROXIMADA (centro de colonia), nunca el domicilio exacto. */
  lat: number;
  lng: number;
  /** Hasta cuantos km se traslada a trabajar. */
  radioKm: number;
  telefono: string;
  fotoUrl: string | null;
  calificacion: number;
  numResenas: number;
  trabajosHechos: number;
  /** Minutos promedio en contestar. */
  minRespuesta: number;
  precioDesde: number | null;
  verificado: boolean;
  plan: Plan;
  disponibleHoy: boolean;
};

export type Resena = {
  id: string;
  trabajadorId: string;
  autor: string;
  estrellas: number;
  comentario: string;
  fecha: string;
  oficio: string;
};

/** Lo que Claude entendio del texto libre del cliente. */
export type Interpretacion = {
  oficio: string | null;
  tipoTrabajo: string;
  urgencia: 'hoy' | 'esta_semana' | 'sin_prisa';
  presupuesto: 'bajo' | 'medio' | 'alto' | 'no_dijo';
  resumen: string;
};

/** Un trabajador ya rankeado, con el porque en lenguaje humano. */
export type Sugerencia = {
  trabajador: Trabajador;
  distanciaKm: number;
  razon: string;
  patrocinado: boolean;
};

export type ResultadoBusqueda = {
  interpretacion: Interpretacion;
  sugerencias: Sugerencia[];
  /** true cuando se resolvio sin IA (sin conexion o sin API key). */
  modoLocal: boolean;
};

export type Coordenada = { lat: number; lng: number };
