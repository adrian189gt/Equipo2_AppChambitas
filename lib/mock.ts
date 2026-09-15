import type { Trabajador, Resena } from './tipos';

/** Zocalo de Oaxaca de Juarez: punto de referencia cuando no hay GPS. */
export const CENTRO_OAXACA = { lat: 17.0654, lng: -96.7237 };

/**
 * Datos de demo para probar la app sin backend.
 * Telefonos ficticios: se reemplazan por los reales al conectar Supabase.
 */
export const TRABAJADORES: Trabajador[] = [
  {
    id: 't1', nombre: 'Ruben Martinez', oficios: ['plomeria'],
    descripcion: 'Fugas, tinacos, bombas y calentadores. 14 anos de oficio, con garantia de 30 dias.',
    municipio: 'Oaxaca de Juarez', colonia: 'Centro', lat: 17.0661, lng: -96.7250,
    radioKm: 15, telefono: '5215515550101', fotoUrl: null,
    calificacion: 4.8, numResenas: 63, trabajosHechos: 210, minRespuesta: 8,
    precioDesde: 350, verificado: true, plan: 'pro', disponibleHoy: true,
  },
  {
    id: 't2', nombre: 'Lucia Ramirez', oficios: ['limpieza', 'cuidados'],
    descripcion: 'Limpieza profunda de casas y oficinas. Tambien acompanamiento a personas mayores.',
    municipio: 'Santa Lucia del Camino', colonia: 'Santa Lucia', lat: 17.0640, lng: -96.6920,
    radioKm: 12, telefono: '5215515550102', fotoUrl: null,
    calificacion: 4.9, numResenas: 94, trabajosHechos: 340, minRespuesta: 15,
    precioDesde: 400, verificado: true, plan: 'impulso', disponibleHoy: true,
  },
  {
    id: 't3', nombre: 'Joel Hernandez', oficios: ['electricidad', 'computo'],
    descripcion: 'Instalaciones electricas, cortos, centros de carga y cableado de redes.',
    municipio: 'Oaxaca de Juarez', colonia: 'Reforma', lat: 17.0810, lng: -96.7150,
    radioKm: 20, telefono: '5215515550103', fotoUrl: null,
    calificacion: 4.7, numResenas: 41, trabajosHechos: 128, minRespuesta: 22,
    precioDesde: 450, verificado: true, plan: 'gratis', disponibleHoy: true,
  },
  {
    id: 't4', nombre: 'Margarita Lopez', oficios: ['cocina'],
    descripcion: 'Banquetes para fiestas y bautizos. Mole negro, amarillo y coloradito por encargo.',
    municipio: 'Santa Maria Atzompa', colonia: 'Atzompa Centro', lat: 17.0930, lng: -96.7710,
    radioKm: 25, telefono: '5215515550104', fotoUrl: null,
    calificacion: 5.0, numResenas: 57, trabajosHechos: 88, minRespuesta: 35,
    precioDesde: 120, verificado: true, plan: 'pro', disponibleHoy: false,
  },
  {
    id: 't5', nombre: 'Pedro Cruz', oficios: ['albanileria', 'impermeabilizacion'],
    descripcion: 'Losas, castillos, aplanados e impermeabilizacion de azoteas antes de las lluvias.',
    municipio: 'Santa Cruz Xoxocotlan', colonia: 'Xoxo', lat: 17.0290, lng: -96.7370,
    radioKm: 18, telefono: '5215515550105', fotoUrl: null,
    calificacion: 4.6, numResenas: 38, trabajosHechos: 75, minRespuesta: 45,
    precioDesde: 600, verificado: false, plan: 'gratis', disponibleHoy: true,
  },
  {
    id: 't6', nombre: 'Ana Sofia Vasquez', oficios: ['costura'],
    descripcion: 'Arreglos de ropa, vestidos de fiesta y bordado tradicional a mano.',
    municipio: 'Oaxaca de Juarez', colonia: 'Jalatlaco', lat: 17.0630, lng: -96.7150,
    radioKm: 8, telefono: '5215515550106', fotoUrl: null,
    calificacion: 4.9, numResenas: 71, trabajosHechos: 260, minRespuesta: 18,
    precioDesde: 80, verificado: true, plan: 'impulso', disponibleHoy: true,
  },
  {
    id: 't7', nombre: 'Ismael Garcia', oficios: ['carpinteria', 'herreria'],
    descripcion: 'Closets, cocinas integrales, portones y proteccion para ventanas.',
    municipio: 'San Jacinto Amilpas', colonia: 'San Jacinto', lat: 17.0990, lng: -96.7480,
    radioKm: 22, telefono: '5215515550107', fotoUrl: null,
    calificacion: 4.5, numResenas: 29, trabajosHechos: 64, minRespuesta: 60,
    precioDesde: 900, verificado: false, plan: 'gratis', disponibleHoy: false,
  },
  {
    id: 't8', nombre: 'Fernando Diaz', oficios: ['plomeria', 'electricidad'],
    descripcion: 'Servicio de emergencia a cualquier hora. Fugas, apagones y drenajes tapados.',
    municipio: 'Oaxaca de Juarez', colonia: 'Volcanes', lat: 17.0760, lng: -96.7330,
    radioKm: 25, telefono: '5215515550108', fotoUrl: null,
    calificacion: 4.4, numResenas: 112, trabajosHechos: 430, minRespuesta: 5,
    precioDesde: 500, verificado: true, plan: 'impulso', disponibleHoy: true,
  },
  {
    id: 't9', nombre: 'Teresa Jimenez', oficios: ['jardineria'],
    descripcion: 'Poda, pasto, riego automatico y diseno de jardines con plantas de la region.',
    municipio: 'San Felipe del Agua', colonia: 'San Felipe', lat: 17.1080, lng: -96.7160,
    radioKm: 14, telefono: '5215515550109', fotoUrl: null,
    calificacion: 4.8, numResenas: 33, trabajosHechos: 91, minRespuesta: 28,
    precioDesde: 300, verificado: true, plan: 'gratis', disponibleHoy: true,
  },
  {
    id: 't10', nombre: 'Carlos Mendoza', oficios: ['mudanzas'],
    descripcion: 'Camioneta de 3.5 toneladas. Mudanzas locales y fletes a la costa y al istmo.',
    municipio: 'San Antonio de la Cal', colonia: 'La Cal', lat: 17.0290, lng: -96.6930,
    radioKm: 60, telefono: '5215515550110', fotoUrl: null,
    calificacion: 4.7, numResenas: 46, trabajosHechos: 132, minRespuesta: 12,
    precioDesde: 800, verificado: true, plan: 'pro', disponibleHoy: true,
  },
  {
    id: 't11', nombre: 'Alberto Santiago', oficios: ['pintura', 'albanileria'],
    descripcion: 'Pintura de interiores y fachadas. Texturizados y resanes.',
    municipio: 'Oaxaca de Juarez', colonia: 'Del Maestro', lat: 17.0720, lng: -96.7290,
    radioKm: 16, telefono: '5215515550111', fotoUrl: null,
    calificacion: 4.3, numResenas: 22, trabajosHechos: 51, minRespuesta: 40,
    precioDesde: 400, verificado: false, plan: 'gratis', disponibleHoy: true,
  },
  {
    id: 't12', nombre: 'Hugo Perez', oficios: ['mecanica'],
    descripcion: 'Mecanica general a domicilio. Afinaciones, frenos y diagnostico por computadora.',
    municipio: 'Santa Lucia del Camino', colonia: 'El Rosario', lat: 17.0590, lng: -96.6870,
    radioKm: 20, telefono: '5215515550112', fotoUrl: null,
    calificacion: 4.6, numResenas: 54, trabajosHechos: 178, minRespuesta: 20,
    precioDesde: 550, verificado: true, plan: 'gratis', disponibleHoy: false,
  },
  {
    id: 't13', nombre: 'Nicolas Aguilar', oficios: ['cerrajeria'],
    descripcion: 'Aperturas de emergencia, cambio de chapas y copias de llaves a domicilio.',
    municipio: 'Oaxaca de Juarez', colonia: 'Centro', lat: 17.0670, lng: -96.7210,
    radioKm: 25, telefono: '5215515550113', fotoUrl: null,
    calificacion: 4.7, numResenas: 68, trabajosHechos: 245, minRespuesta: 10,
    precioDesde: 250, verificado: true, plan: 'impulso', disponibleHoy: true,
  },
];

export const RESENAS: Resena[] = [
  { id: 'r1', trabajadorId: 't1', autor: 'Karla M.', estrellas: 5, oficio: 'plomeria', fecha: '2026-08-22',
    comentario: 'Llego el mismo dia que le marque. Cambio la llave del bano y dejo todo limpio.' },
  { id: 'r2', trabajadorId: 't1', autor: 'Jose Luis R.', estrellas: 5, oficio: 'plomeria', fecha: '2026-07-30',
    comentario: 'Me arreglo una fuga que otros dos no pudieron encontrar. Muy recomendable.' },
  { id: 'r3', trabajadorId: 't1', autor: 'Beatriz H.', estrellas: 4, oficio: 'plomeria', fecha: '2026-07-11',
    comentario: 'Buen trabajo con el tinaco. Tardo un poco en llegar pero aviso antes.' },
  { id: 'r4', trabajadorId: 't2', autor: 'Monica S.', estrellas: 5, oficio: 'limpieza', fecha: '2026-09-01',
    comentario: 'Dejo la casa impecable. Muy honesta y puntual, ya la aparte cada quince dias.' },
  { id: 'r5', trabajadorId: 't2', autor: 'Raul T.', estrellas: 5, oficio: 'cuidados', fecha: '2026-08-14',
    comentario: 'Acompano a mi mama dos semanas. Muy paciente y atenta con ella.' },
  { id: 'r6', trabajadorId: 't8', autor: 'Diana P.', estrellas: 5, oficio: 'plomeria', fecha: '2026-09-03',
    comentario: 'Le marque a las once de la noche por una fuga y llego en media hora.' },
  { id: 'r7', trabajadorId: 't8', autor: 'Enrique V.', estrellas: 3, oficio: 'electricidad', fecha: '2026-06-19',
    comentario: 'Resolvio el corto pero me parecio algo caro para el tiempo que tardo.' },
  { id: 'r8', trabajadorId: 't4', autor: 'Familia Ortiz', estrellas: 5, oficio: 'cocina', fecha: '2026-08-09',
    comentario: 'El mole negro estuvo espectacular. Sirvio para 80 personas sin ningun problema.' },
  { id: 'r9', trabajadorId: 't5', autor: 'Gerardo N.', estrellas: 5, oficio: 'impermeabilizacion', fecha: '2026-05-28',
    comentario: 'Impermeabilizo la azotea antes de aguas y no se metio ni una gota.' },
  { id: 'r10', trabajadorId: 't6', autor: 'Paulina C.', estrellas: 5, oficio: 'costura', fecha: '2026-08-30',
    comentario: 'Me ajusto el vestido en dos dias y el bordado quedo precioso.' },
];
