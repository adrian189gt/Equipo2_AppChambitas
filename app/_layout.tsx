import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { useColores } from '../lib/theme';
import { ProveedorSesion, useSesion } from '../lib/auth';

/**
 * Portero de la aplicacion.
 *
 * Decide a donde mandar al usuario en tres pasos:
 *   1. sin sesion        -> pantalla de entrada (login)
 *   2. sin rol elegido   -> pantalla de "que te trae a Chambitas"
 *   3. con rol           -> buscador (cliente) o panel (trabajador)
 *
 * Vive aqui, en el layout raiz, para que la regla aplique a TODAS las
 * pantallas. Si la pusieramos en cada una, tarde o temprano se nos olvida
 * en alguna y se cuela una pantalla sin proteger.
 */
function Portero() {
  const c = useColores();
  const oscuro = useColorScheme() === 'dark';
  const { usuario, cargando } = useSesion();
  const segmentos = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (cargando) return;

    const pantalla = segmentos[0];
    const enLogin = pantalla === 'login';
    const enRol = pantalla === 'rol';

    if (!usuario) {
      if (!enLogin) router.replace('/login');
      return;
    }

    // Ya entro pero no ha dicho a que viene.
    if (!usuario.rol) {
      if (!enRol) router.replace('/rol');
      return;
    }

    // Ya eligio: sacarlo de las pantallas de entrada.
    if (enLogin || enRol) {
      router.replace(usuario.rol === 'trabajador' ? '/mi-trabajo' : '/');
    }
  }, [usuario, cargando, segmentos]);

  // Mientras revisamos si ya habia sesion guardada, no mostramos nada:
  // evita el parpadeo de ver el login un segundo y que luego se cambie.
  if (cargando) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.fondo }}>
        <ActivityIndicator size="large" color={c.primario} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={oscuro ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: c.fondo },
          headerTintColor: c.texto,
          headerTitleStyle: { fontWeight: '800' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: c.fondo },
        }}
      >
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="rol" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="mi-trabajo" options={{ headerShown: false }} />
        <Stack.Screen name="resultados" options={{ title: 'Resultados' }} />
        <Stack.Screen name="trabajador/[id]" options={{ title: '' }} />
        <Stack.Screen name="alta" options={{ title: 'Publicar mi perfil' }} />
        <Stack.Screen name="planes" options={{ title: 'Planes' }} />
      </Stack>
    </>
  );
}

export default function Layout() {
  return (
    <ProveedorSesion>
      <Portero />
    </ProveedorSesion>
  );
}
