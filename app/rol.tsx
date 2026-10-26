import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColores, radio, espacio } from '../lib/theme';
import { useSesion, type Rol } from '../lib/auth';

type Opcion = {
  rol: Rol;
  emoji: string;
  titulo: string;
  descripcion: string;
  puntos: string[];
};

const OPCIONES: Opcion[] = [
  {
    rol: 'cliente',
    emoji: '\u{1F50D}',
    titulo: 'Necesito un servicio',
    descripcion: 'Busco a alguien que me ayude',
    puntos: [
      'Describe tu problema como lo dirias normal',
      'La IA encuentra quien lo resuelve, cerca de ti',
      'Contactalo directo por WhatsApp',
    ],
  },
  {
    rol: 'trabajador',
    emoji: '\u{1F528}',
    titulo: 'Ofrezco mi trabajo',
    descripcion: 'Quiero que me contraten',
    puntos: [
      'Publica tu perfil gratis, sin comisiones',
      'Aparece cuando alguien busque tu oficio',
      'Recibe clientes por WhatsApp',
    ],
  },
];

export default function ElegirRol() {
  const c = useColores();
  const { usuario, elegirRol } = useSesion();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.fondo }}>
      <View style={e.contenedor}>

        <View style={{ gap: 6 }}>
          <Text style={{ color: c.texto, fontSize: 26, fontWeight: '900', letterSpacing: -0.5 }}>
            {usuario?.invitado ? 'Hola' : `Hola, ${usuario?.nombre?.split(' ')[0] ?? ''}`}
          </Text>
          <Text style={{ color: c.suave, fontSize: 16, lineHeight: 23 }}>
            {'¿'}Que te trae a Chambitas?
          </Text>
        </View>

        <View style={{ gap: espacio.md, flex: 1, justifyContent: 'center' }}>
          {OPCIONES.map((o) => (
            <Pressable
              key={o.rol}
              onPress={() => elegirRol(o.rol)}
              style={({ pressed }) => [
                e.tarjeta,
                {
                  backgroundColor: c.tarjeta,
                  borderColor: pressed ? c.primario : c.borde,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
            >
              <View style={[e.icono, { backgroundColor: o.rol === 'cliente' ? c.primarioSuave : c.jadeSuave }]}>
                <Text style={{ fontSize: 30 }}>{o.emoji}</Text>
              </View>

              <View style={{ gap: 3 }}>
                <Text style={{ color: c.texto, fontSize: 19, fontWeight: '800' }}>{o.titulo}</Text>
                <Text style={{ color: c.suave, fontSize: 14 }}>{o.descripcion}</Text>
              </View>

              <View style={{ gap: 7, marginTop: 4 }}>
                {o.puntos.map((p) => (
                  <View key={p} style={{ flexDirection: 'row', gap: 8 }}>
                    <Text style={{ color: o.rol === 'cliente' ? c.primario : c.jade, fontWeight: '800' }}>
                      {'•'}
                    </Text>
                    <Text style={{ color: c.suave, fontSize: 13, flex: 1, lineHeight: 19 }}>{p}</Text>
                  </View>
                ))}
              </View>
            </Pressable>
          ))}
        </View>

        {/* Nadie queda encerrado en un rol: un plomero tambien necesita
            un electricista cuando se le va la luz en su casa. */}
        <Text style={{ color: c.suave, fontSize: 12, textAlign: 'center', lineHeight: 18 }}>
          Puedes cambiar de opcion cuando quieras{'\n'}desde tu perfil.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const e = StyleSheet.create({
  contenedor: { flex: 1, padding: espacio.lg, gap: espacio.lg },
  tarjeta: {
    borderWidth: 2, borderRadius: radio.grande,
    padding: espacio.lg, gap: espacio.sm,
  },
  icono: {
    width: 58, height: 58, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
});
