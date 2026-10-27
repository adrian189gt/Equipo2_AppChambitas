import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLoginGoogle } from './google';

export type Rol = 'cliente' | 'trabajador';

export type Usuario = {
  id: string;
  nombre: string;
  correo: string;
  fotoUrl: string | null;
  invitado: boolean;
  rol: Rol | null; // null = todavia no elige
};

const CLAVE = 'chambitas.sesion';

/** La sesion: quien entro, guardada en el telefono para no pedirla cada vez. */
function useSesionInterna() {
  const google = useLoginGoogle();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true); // leyendo la sesion guardada
  const [entrando, setEntrando] = useState(false); // ventana de Google abierta
  const [error, setError] = useState<string | null>(null);

  // Al abrir la app: si ya habia sesion guardada, entra directo.
  useEffect(() => {
    AsyncStorage.getItem(CLAVE)
      .then((g) => g && setUsuario(JSON.parse(g)))
      .finally(() => setCargando(false));
  }, []);

  const guardar = async (u: Usuario | null) => {
    setUsuario(u);
    setError(null);
    if (u) await AsyncStorage.setItem(CLAVE, JSON.stringify(u));
    else await AsyncStorage.removeItem(CLAVE);
  };

  return {
    usuario, cargando, entrando, error,

    entrarConGoogle: async () => {
      if (!google.disponible) return setError(google.motivo);
      setEntrando(true);
      try {
        const perfil = await google.iniciar();
        if (perfil) await guardar({ ...perfil, invitado: false, rol: null });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo entrar con Google.');
      } finally {
        setEntrando(false);
      }
    },

    entrarComoInvitado: () =>
      guardar({ id: 'invitado', nombre: 'Invitado', correo: '', fotoUrl: null, invitado: true, rol: null }),

    elegirRol: async (rol: Rol) => { if (usuario) await guardar({ ...usuario, rol }); },

    salir: async () => {
      if (!usuario?.invitado) await google.cerrar();
      await guardar(null);
    },
  };
}

// El Context comparte la sesion con todas las pantallas.
const Contexto = createContext<ReturnType<typeof useSesionInterna> | null>(null);

export function ProveedorSesion({ children }: { children: ReactNode }) {
  return <Contexto.Provider value={useSesionInterna()}>{children}</Contexto.Provider>;
}

export function useSesion() {
  return useContext(Contexto)!;
}
