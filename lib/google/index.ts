import Constants, { ExecutionEnvironment } from 'expo-constants';
import { ID_CLIENTE_WEB, type LoginGoogle } from './tipos';

/** Login en ANDROID con la libreria oficial de Google. No existe en Expo Go. */
const enExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// require y no import: en Expo Go un import tumbaria la app al abrir.
const google: typeof import('@react-native-google-signin/google-signin') | null =
  enExpoGo ? null : require('@react-native-google-signin/google-signin');
google?.GoogleSignin.configure({ webClientId: ID_CLIENTE_WEB });

export function useLoginGoogle(): LoginGoogle {
  return {
    disponible: google !== null,
    motivo: google ? null : 'En Expo Go no se puede: hay que compilar la app.',
    iniciar: async () => {
      if (!google) return null;
      const r = await google.GoogleSignin.signIn();
      if (!google.isSuccessResponse(r)) return null; // cerro el selector
      const u = r.data.user;
      return { id: u.id, nombre: u.name ?? '', correo: u.email, fotoUrl: u.photo };
    },
    // Para que la proxima vez vuelva a preguntar que cuenta usar.
    cerrar: async () => { await google?.GoogleSignin.signOut(); },
  };
}
