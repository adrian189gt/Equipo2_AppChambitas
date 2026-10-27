/** Lo que la app necesita de la cuenta de Google. */
export type PerfilGoogle = { id: string; nombre: string; correo: string; fotoUrl: string | null };

/** Lo que entrega el login. Web y celular devuelven esto mismo. */
export type LoginGoogle = {
  disponible: boolean;
  motivo: string | null; // por que no esta disponible
  iniciar: () => Promise<PerfilGoogle | null>; // null = cerro la ventana
  cerrar: () => Promise<void>;
};

/** ID de cliente "Aplicacion web" de Google Cloud. No es secreto. */
export const ID_CLIENTE_WEB = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
