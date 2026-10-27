import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { ID_CLIENTE_WEB, type LoginGoogle } from './tipos';

/** Login en el NAVEGADOR: abre la ventana de Google y pide nombre, correo y foto. */

// Si esta pagina es la ventanita de regreso de Google, la cierra.
WebBrowser.maybeCompleteAuthSession();

export function useLoginGoogle(): LoginGoogle {
  const [solicitud, , abrir] = AuthSession.useAuthRequest(
    {
      clientId: ID_CLIENTE_WEB,
      redirectUri: AuthSession.makeRedirectUri(), // http://localhost:8081
      responseType: AuthSession.ResponseType.Token, // Google nos da el token directo
      usePKCE: false,
      scopes: ['openid', 'profile', 'email'], // solo lo minimo
      prompt: AuthSession.Prompt.SelectAccount, // siempre muestra el selector
    },
    { authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth' },
  );

  const iniciar = async () => {
    const r = await abrir();
    if (r.type === 'error') throw new Error('Google no completo el inicio de sesion.');
    if (r.type !== 'success') return null; // cerro la ventana

    // Con el token le pedimos a Google el perfil.
    const resp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${r.params.access_token}` },
    });
    const d = await resp.json();
    return { id: d.sub, nombre: d.name, correo: d.email, fotoUrl: d.picture ?? null };
  };

  return {
    disponible: Boolean(ID_CLIENTE_WEB && solicitud),
    motivo: ID_CLIENTE_WEB ? null : 'Falta EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID en el archivo .env',
    iniciar,
    cerrar: async () => {}, // en web no queda sesion de Google guardada
  };
}
