import { View, Text, Pressable } from 'react-native';
import { useColores, espacio } from '../lib/theme';
import { useSesion } from '../lib/auth';

/** Pantalla de entrada. */
export default function Login() {
  const c = useColores();
  const { entrarComoInvitado } = useSesion();

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: espacio.lg, gap: espacio.md, backgroundColor: c.fondo }}>
      <Text style={{ fontSize: 56, textAlign: 'center' }}>🛠</Text>
      <Text style={{ color: c.primario, fontSize: 36, fontWeight: '900', textAlign: 'center' }}>Chambitas</Text>
      <Text style={{ color: c.suave, fontSize: 15, textAlign: 'center', marginBottom: espacio.lg }}>
        Encuentra trabajadores de oficio cerca de ti, en Oaxaca.
      </Text>

      <Pressable onPress={entrarComoInvitado} style={{ padding: espacio.sm }}>
        <Text style={{ color: c.suave, fontWeight: '600', textAlign: 'center' }}>Entrar sin cuenta y solo mirar</Text>
      </Pressable>
    </View>
  );
}
