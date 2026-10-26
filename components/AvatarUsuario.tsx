import { Image, Text, View } from 'react-native';
import type { Usuario } from '../lib/auth';

/** Foto de la cuenta de Google, o la primera letra del nombre si no hay foto. */
export function AvatarUsuario({ usuario, tam, color, fondo }: { usuario: Usuario | null; tam: number; color: string; fondo: string }) {
  const redondo = { width: tam, height: tam, borderRadius: tam / 2 };
  if (usuario?.fotoUrl) return <Image source={{ uri: usuario.fotoUrl }} style={redondo} />;

  return (
    <View style={[redondo, { backgroundColor: fondo, alignItems: 'center', justifyContent: 'center' }]}>
      <Text style={{ color, fontWeight: '800', fontSize: tam * 0.4 }}>{usuario?.invitado ? '?' : usuario?.nombre[0]}</Text>
    </View>
  );
}
