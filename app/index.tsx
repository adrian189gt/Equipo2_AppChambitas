import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColores, radio, espacio } from '../lib/theme';
import { OFICIOS } from '../lib/oficios';
import { useUbicacion } from '../lib/ubicacion';
import { hayBackend } from '../lib/ia';
import { useSesion } from '../lib/auth';
import { MenuSesion } from '../components/MenuSesion';
import { AvatarUsuario } from '../components/AvatarUsuario';

/** Ejemplos de como habla la gente, no de nombres de oficio. */
const EJEMPLOS = [
  'Se me esta goteando la llave del bano y urge',
  'Necesito quien me haga el mole para un bautizo de 50',
  'Se mete el agua por el techo cuando llueve',
  'Busco quien me arregle un closet de madera',
];

export default function Inicio() {
  const c = useColores();
  const router = useRouter();
  const [texto, setTexto] = useState('');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { esReal, cargando } = useUbicacion();
  const { usuario, salir, elegirRol } = useSesion();

  const buscar = (q: string) => {
    const limpio = q.trim();
    if (limpio.length < 3) return;
    router.push({ pathname: '/resultados', params: { q: limpio } });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.fondo }} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ padding: espacio.lg, gap: espacio.lg }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[e.fila, { justifyContent: 'space-between' }]}>
            <View style={{ gap: 4, flex: 1 }}>
              <Text style={[e.marca, { color: c.primario }]}>Chambitas</Text>
              <Text style={{ color: c.suave, fontSize: 15 }}>
                {usuario?.invitado
                  ? 'Trabajadores de Oaxaca, cerca de ti.'
                  : `Hola, ${usuario?.nombre?.split(' ')[0] ?? ''}`}
              </Text>
            </View>

            {/* La sesion se ve siempre: el usuario debe saber con que
                cuenta entro y poder salirse sin buscarle. */}
            <Pressable
              onPress={() => setMenuAbierto(true)}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <AvatarUsuario usuario={usuario} tam={42} color={c.primario} fondo={c.primarioSuave} />
            </Pressable>
          </View>

          {/* El buscador es el corazon: la gente describe su problema,
              no adivina como se llama el oficio. */}
          <View style={[e.buscador, { backgroundColor: c.tarjeta, borderColor: c.borde }]}>
            <Text style={{ color: c.texto, fontWeight: '700', fontSize: 15 }}>
              {'¿'}Que necesitas?
            </Text>
            <Text style={{ color: c.suave, fontSize: 13 }}>
              Escribelo como se lo dirias a un vecino.
            </Text>

            <TextInput
              value={texto}
              onChangeText={setTexto}
              placeholder="Ej. se tapo el drenaje del patio y huele feo"
              placeholderTextColor={c.suave}
              multiline
              style={[e.input, { color: c.texto, backgroundColor: c.fondo, borderColor: c.borde }]}
              onSubmitEditing={() => buscar(texto)}
              returnKeyType="search"
            />

            <Pressable
              onPress={() => buscar(texto)}
              disabled={texto.trim().length < 3}
              style={({ pressed }) => [
                e.boton,
                {
                  backgroundColor: texto.trim().length < 3 ? c.borde : c.primario,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>
                Buscar quien me ayude
              </Text>
            </Pressable>

            <View style={[e.fila, { gap: 6 }]}>
              {cargando ? (
                <ActivityIndicator size="small" color={c.suave} />
              ) : (
                <Text style={{ color: c.suave, fontSize: 11 }}>
                  {esReal
                    ? 'Usando tu ubicacion para medir distancias'
                    : 'Sin GPS: midiendo desde el centro de Oaxaca'}
                </Text>
              )}
            </View>
          </View>

          <View style={{ gap: espacio.sm }}>
            <Text style={[e.titulo, { color: c.texto }]}>Prueba con algo asi</Text>
            {EJEMPLOS.map((ej) => (
              <Pressable
                key={ej}
                onPress={() => { setTexto(ej); buscar(ej); }}
                style={({ pressed }) => [
                  e.ejemplo,
                  { borderColor: c.borde, backgroundColor: pressed ? c.primarioSuave : 'transparent' },
                ]}
              >
                <Text style={{ color: c.suave, fontSize: 13 }}>{'"'}{ej}{'"'}</Text>
              </Pressable>
            ))}
          </View>

          <View style={{ gap: espacio.sm }}>
            <Text style={[e.titulo, { color: c.texto }]}>O busca por oficio</Text>
            <View style={e.chips}>
              {OFICIOS.map((o) => (
                <Pressable
                  key={o.slug}
                  onPress={() => router.push({ pathname: '/resultados', params: { oficio: o.slug } })}
                  style={({ pressed }) => [
                    e.chip,
                    { backgroundColor: pressed ? c.primarioSuave : c.tarjeta, borderColor: c.borde },
                  ]}
                >
                  <Text style={{ fontSize: 13 }}>{o.emoji}</Text>
                  <Text style={{ color: c.texto, fontSize: 12, fontWeight: '600' }}>{o.nombre}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable
            onPress={() => router.push('/alta')}
            style={({ pressed }) => [
              e.cta,
              { backgroundColor: c.jadeSuave, borderColor: c.jade, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={{ color: c.jade, fontWeight: '800', fontSize: 15 }}>
              {'¿'}Tienes un oficio? Date de alta gratis
            </Text>
            <Text style={{ color: c.jade, fontSize: 12 }}>
              Aparece en las busquedas sin pagar nada.
            </Text>
          </Pressable>

          {!hayBackend && (
            <Text style={{ color: c.suave, fontSize: 11, textAlign: 'center' }}>
              Modo demo: datos de ejemplo y busqueda por palabras clave.
              {'\n'}Conecta Supabase para activar la IA.
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <MenuSesion
        visible={menuAbierto}
        usuario={usuario}
        onCerrar={() => setMenuAbierto(false)}
        onSalir={async () => { setMenuAbierto(false); await salir(); }}
        onCambiarLado={async () => { setMenuAbierto(false); await elegirRol('trabajador'); }}
      />
    </SafeAreaView>
  );
}

const e = StyleSheet.create({
  marca: { fontSize: 34, fontWeight: '900', letterSpacing: -1 },
  titulo: { fontSize: 15, fontWeight: '800' },
  fila: { flexDirection: 'row', alignItems: 'center' },
  buscador: { borderWidth: 1, borderRadius: radio.grande, padding: espacio.md, gap: espacio.sm },
  input: {
    borderWidth: 1, borderRadius: radio.chico, padding: espacio.sm,
    minHeight: 76, fontSize: 15, textAlignVertical: 'top',
  },
  boton: { borderRadius: radio.chico, paddingVertical: 14, alignItems: 'center' },
  ejemplo: { borderWidth: 1, borderRadius: radio.chico, padding: espacio.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: espacio.xs },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 11,
  },
  cta: { borderWidth: 1, borderRadius: radio.medio, padding: espacio.md, gap: 3, alignItems: 'center' },
});
