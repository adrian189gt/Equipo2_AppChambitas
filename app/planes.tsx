import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { useColores, radio, espacio } from '../lib/theme';

type Plan = {
  slug: string;
  nombre: string;
  precio: number;
  gancho: string;
  incluye: string[];
  destacado?: boolean;
};

/**
 * Precios de arranque para Oaxaca. Estan pensados para que un trabajador
 * recupere el mes con UN solo cliente: si el plomero cobra $350 por visita,
 * $99 al mes se paga solo con la primera chamba.
 */
const PLANES: Plan[] = [
  {
    slug: 'gratis', nombre: 'Gratis', precio: 0,
    gancho: 'Para empezar a recibir clientes hoy.',
    incluye: [
      'Tu perfil publico con oficio y zona',
      'Apareces en todas las busquedas',
      'Recibes resenas de tus clientes',
      'Hasta 3 fotos de tu trabajo',
    ],
  },
  {
    slug: 'impulso', nombre: 'Impulso', precio: 99, destacado: true,
    gancho: 'Para que te vean mas y te elijan mas.',
    incluye: [
      'Todo lo del plan Gratis',
      'Insignia de identidad verificada',
      'Hasta 15 fotos de tu trabajo',
      'Puedes salir como Patrocinado',
      'Ves cuantas personas te contactaron',
    ],
  },
  {
    slug: 'pro', nombre: 'Pro', precio: 199,
    gancho: 'Para quien vive de esto todos los dias.',
    incluye: [
      'Todo lo del plan Impulso',
      'Estadisticas de que buscan en tu zona',
      'Apoyo prioritario por WhatsApp',
      'Perfil con fotos de antes y despues',
    ],
  },
];

export default function Planes() {
  const c = useColores();

  return (
    <ScrollView contentContainerStyle={{ padding: espacio.md, gap: espacio.md }}>
      <View style={{ gap: 4 }}>
        <Text style={{ color: c.texto, fontSize: 22, fontWeight: '900' }}>
          Empieza gratis, crece cuando te convenga
        </Text>
        <Text style={{ color: c.suave, fontSize: 14, lineHeight: 20 }}>
          Nunca te cobramos comision por trabajo. Lo que cobres, es tuyo.
        </Text>
      </View>

      {PLANES.map((p) => (
        <View
          key={p.slug}
          style={[
            e.plan,
            {
              backgroundColor: c.tarjeta,
              borderColor: p.destacado ? c.primario : c.borde,
              borderWidth: p.destacado ? 2 : 1,
            },
          ]}
        >
          {p.destacado && (
            <View style={[e.cinta, { backgroundColor: c.primario }]}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>EL MAS ELEGIDO</Text>
            </View>
          )}

          <Text style={{ color: c.texto, fontSize: 19, fontWeight: '800' }}>{p.nombre}</Text>

          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
            <Text style={{ color: c.texto, fontSize: 30, fontWeight: '900' }}>
              ${p.precio}
            </Text>
            <Text style={{ color: c.suave, fontSize: 13 }}>
              {p.precio === 0 ? 'para siempre' : 'al mes'}
            </Text>
          </View>

          <Text style={{ color: c.suave, fontSize: 13 }}>{p.gancho}</Text>

          <View style={{ gap: 6, marginTop: 4 }}>
            {p.incluye.map((x) => (
              <View key={x} style={{ flexDirection: 'row', gap: 8 }}>
                <Text style={{ color: c.jade, fontWeight: '800' }}>{'✓'}</Text>
                <Text style={{ color: c.texto, fontSize: 13, flex: 1, lineHeight: 19 }}>{x}</Text>
              </View>
            ))}
          </View>

          <Pressable
            onPress={() =>
              Alert.alert(
                'Pagos pendientes',
                p.precio === 0
                  ? 'El plan gratis ya esta activo con solo darte de alta.'
                  : 'Falta conectar Mercado Pago. Podras pagar con tarjeta, OXXO o transferencia.',
              )
            }
            style={({ pressed }) => [
              e.boton,
              {
                backgroundColor: p.destacado ? c.primario : 'transparent',
                borderColor: p.destacado ? c.primario : c.borde,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={{ color: p.destacado ? '#fff' : c.texto, fontWeight: '800' }}>
              {p.precio === 0 ? 'Darme de alta gratis' : `Contratar ${p.nombre}`}
            </Text>
          </Pressable>
        </View>
      ))}

      <View style={[e.nota, { backgroundColor: c.jadeSuave }]}>
        <Text style={{ color: c.jade, fontSize: 12, lineHeight: 19 }}>
          Pagas con tarjeta, en OXXO o por transferencia. Puedes cancelar cuando
          quieras y tu perfil se queda en el plan gratis: no desapareces.
        </Text>
      </View>
    </ScrollView>
  );
}

const e = StyleSheet.create({
  plan: { borderRadius: radio.grande, padding: espacio.lg, gap: espacio.xs },
  cinta: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginBottom: 4 },
  boton: { borderWidth: 1, borderRadius: radio.chico, paddingVertical: 13, alignItems: 'center', marginTop: espacio.sm },
  nota: { padding: espacio.md, borderRadius: radio.medio },
});
