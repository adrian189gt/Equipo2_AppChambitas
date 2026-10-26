import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColores, radio, espacio } from '../lib/theme';
import { OFICIOS } from '../lib/oficios';

export default function Alta() {
  const c = useColores();
  const router = useRouter();

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [colonia, setColonia] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [radioKm, setRadioKm] = useState('15');
  const [elegidos, setElegidos] = useState<string[]>([]);

  const alternar = (slug: string) =>
    setElegidos((prev) =>
      prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug],
    );

  const completo =
    nombre.trim().length > 2 &&
    telefono.replace(/\D/g, '').length >= 10 &&
    colonia.trim().length > 2 &&
    elegidos.length > 0;

  const guardar = () => {
    // TODO: insertar en Supabase (tabla trabajadores + trabajador_oficios).
    Alert.alert(
      'Falta conectar el backend',
      'El formulario esta completo y validado. Al conectar Supabase, aqui se guarda tu perfil y ya apareces en las busquedas.',
      [{ text: 'Entendido', onPress: () => router.back() }],
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{ padding: espacio.md, gap: espacio.md, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: 4 }}>
          <Text style={{ color: c.texto, fontSize: 21, fontWeight: '900' }}>
            Que la gente te encuentre
          </Text>
          <Text style={{ color: c.suave, fontSize: 14, lineHeight: 20 }}>
            Darte de alta es gratis y no te cobramos comision por tus trabajos.
          </Text>
        </View>

        <Campo etiqueta="Tu nombre" valor={nombre} alCambiar={setNombre} placeholder="Ej. Ruben Martinez" />

        <Campo
          etiqueta="WhatsApp"
          valor={telefono}
          alCambiar={setTelefono}
          placeholder="951 123 4567"
          teclado="phone-pad"
          ayuda="Aqui te van a escribir los clientes."
        />

        <View style={{ gap: espacio.xs }}>
          <Text style={[e.etiqueta, { color: c.texto }]}>{'¿'}Que sabes hacer?</Text>
          <Text style={{ color: c.suave, fontSize: 12 }}>Puedes elegir varios.</Text>
          <View style={e.chips}>
            {OFICIOS.map((o) => {
              const activo = elegidos.includes(o.slug);
              return (
                <Pressable
                  key={o.slug}
                  onPress={() => alternar(o.slug)}
                  style={[
                    e.chip,
                    {
                      backgroundColor: activo ? c.primario : c.tarjeta,
                      borderColor: activo ? c.primario : c.borde,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 13 }}>{o.emoji}</Text>
                  <Text style={{ color: activo ? '#fff' : c.texto, fontSize: 12, fontWeight: '600' }}>
                    {o.nombre}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Campo
          etiqueta="Tu colonia y municipio"
          valor={colonia}
          alCambiar={setColonia}
          placeholder="Ej. Centro, Oaxaca de Juarez"
          ayuda="Solo la colonia, nunca tu domicilio exacto. Tu lista es publica."
        />

        <Campo
          etiqueta="Hasta cuantos km te trasladas"
          valor={radioKm}
          alCambiar={setRadioKm}
          placeholder="15"
          teclado="number-pad"
          ayuda="Asi no te marcan de lugares a los que no llegas."
        />

        <Campo
          etiqueta="Cuentanos de tu trabajo"
          valor={descripcion}
          alCambiar={setDescripcion}
          placeholder="Ej. Fugas, tinacos y calentadores. 14 anos de oficio, doy garantia."
          multilinea
          ayuda="Entre mas claro, mas te busca la IA cuando alguien describe ese problema."
        />

        <Pressable
          onPress={guardar}
          disabled={!completo}
          style={({ pressed }) => [
            e.boton,
            { backgroundColor: completo ? c.primario : c.borde, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>
            Publicar mi perfil gratis
          </Text>
        </Pressable>

        <Pressable onPress={() => router.push('/planes')}>
          <Text style={{ color: c.primario, fontSize: 13, textAlign: 'center', fontWeight: '700' }}>
            Ver los planes de pago
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Campo({
  etiqueta, valor, alCambiar, placeholder, ayuda, multilinea, teclado,
}: {
  etiqueta: string; valor: string; alCambiar: (s: string) => void;
  placeholder: string; ayuda?: string; multilinea?: boolean; teclado?: 'phone-pad' | 'number-pad';
}) {
  const c = useColores();
  return (
    <View style={{ gap: espacio.xs }}>
      <Text style={[e.etiqueta, { color: c.texto }]}>{etiqueta}</Text>
      <TextInput
        value={valor}
        onChangeText={alCambiar}
        placeholder={placeholder}
        placeholderTextColor={c.suave}
        keyboardType={teclado}
        multiline={multilinea}
        style={[
          e.input,
          {
            color: c.texto, backgroundColor: c.tarjeta, borderColor: c.borde,
            minHeight: multilinea ? 88 : 46,
            textAlignVertical: multilinea ? 'top' : 'center',
          },
        ]}
      />
      {ayuda ? <Text style={{ color: c.suave, fontSize: 11 }}>{ayuda}</Text> : null}
    </View>
  );
}

const e = StyleSheet.create({
  etiqueta: { fontSize: 14, fontWeight: '700' },
  input: { borderWidth: 1, borderRadius: radio.chico, paddingHorizontal: espacio.sm, paddingVertical: 10, fontSize: 15 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: espacio.xs },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12,
  },
  boton: { borderRadius: radio.chico, paddingVertical: 15, alignItems: 'center', marginTop: espacio.sm },
});
