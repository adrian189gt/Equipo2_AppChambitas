import type { PerfilGoogle } from './google/tipos';

const URL_SUPABASE = process.env.EXPO_PUBLIC_SUPABASE_URL;
const LLAVE_SUPABASE = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Avisa a la base de datos que esta persona entro con Google.
 * Llama a la funcion registrar_ingreso (supabase/registro_login.sql).
 * Si no hay base configurada o falla, la app sigue funcionando igual.
 */
export async function registrarIngreso(p: PerfilGoogle) {
  if (!URL_SUPABASE || !LLAVE_SUPABASE) return;
  try {
    await fetch(`${URL_SUPABASE}/rest/v1/rpc/registrar_ingreso`, {
      method: 'POST',
      headers: {
        apikey: LLAVE_SUPABASE,
        Authorization: `Bearer ${LLAVE_SUPABASE}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_google_id: p.id, p_nombre: p.nombre, p_correo: p.correo, p_foto_url: p.fotoUrl }),
    });
  } catch {
    console.warn('No se pudo registrar el ingreso en la base de datos');
  }
}
