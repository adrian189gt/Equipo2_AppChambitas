import { View, Text, ScrollView, Pressable, StyleSheet, Linking, Alert } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useColores, radio, espacio } from '../../lib/theme';
import { TRABAJADORES, RESENAS } from '../../lib/mock';
import { nombreOficio, oficioPorSlug } from '../../lib/oficios';
import { Estrellas, Insignia } from '../../components/Tarjeta';
import { useUbicacion } from '../../lib/ubicacion';
import { distanciaKm } from '../../lib/ranking';

export default function Perfil() {
  const c = useColores();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { origen } = useUbicacion();

  const t = TRABAJADORES.find((x) => x.id === id);
  if (!t) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: c.suave }}>No encontramos a esta persona.</Text>
      </View>
    );
  }

  const resenas = RESENAS.filter((r) => r.trabajadorId === t.id);
  const dist = distanciaKm(origen, { lat: t.lat, lng: t.lng });

  /**
   * El cierre pasa por WhatsApp: es donde la gente ya esta y donde
   * confia. Forzar un chat propio solo agrega friccion.
   *
   * Cada apertura se registra en la tabla contactos: es la metrica que
   * justifica cobrar ("te mandamos 14 clientes") y el candado que impide
   * resenar a quien nunca contactaste.
   */
  const abrirWhatsApp = async () => {
    // TODO: registrar en contactos cuando Supabase este conectado.
    const saludo = encodeURIComponent(
      `Hola ${t.nombre.split(' ')[0]}, te encontre en Chambitas. Necesito ayuda con `,
    );
    const url = `https://wa.me/${t.telefono}?text=${saludo}`;
    const puede = await Linking.canOpenURL(url);
    if (puede) Linking.openURL(url);
    else Alert.alert('WhatsApp no disponible', `Marcale al ${t.telefono}`);
  };

  return (
    <>
      <Stack.Screen options={{ title: t.nombre }} />
      <ScrollView contentContainerStyle={{ padding: espacio.md, gap: espacio.md, paddingBottom: 100 }}>

        <View style={[e.encabezado, { backgroundColor: c.tarjeta, borderColor: c.borde }]}>
          <View style={[e.avatar, { backgroundColor: c.primarioSuave }]}>
            <Text style={{ color: c.primario, fontWeight: '900', fontSize: 26 }}>
              {t.nombre.split(' ').slice(0, 2).map((p) => p[0]).join('')}
            </Text>
          </View>

          <Text style={{ color: c.texto, fontSize: 21, fontWeight: '800' }}>{t.nombre}</Text>

          <Text style={{ color: c.suave, fontSize: 13, textAlign: 'center' }}>
            {t.oficios.map((o) => `${oficioPorSlug(o)?.emoji ?? ''} ${nombreOficio(o)}`).join('  ')}
          </Text>

          <View style={[e.fila, { gap: 8 }]}>
            <Estrellas valor={t.calificacion} tam={16} />
            <Text style={{ color: c.texto, fontWeight: '700' }}>{t.calificacion.toFixed(1)}</Text>
            <Text style={{ color: c.suave, fontSize: 13 }}>({t.numResenas} resenas)</Text>
          </View>

          <View style={[e.fila, { gap: 6, flexWrap: 'wrap', justifyContent: 'center' }]}>
            {t.verificado && <Insignia texto="Identidad verificada" />}
            {t.disponibleHoy && <Insignia texto="Disponible hoy" />}
            {t.plan !== 'gratis' && <Insignia texto="Miembro" tono="primario" />}
          </View>
        </View>

        <View style={e.numeros}>
          <Dato valor={`${dist.toFixed(1)} km`} etiqueta="de ti" />
          <Dato valor={`${t.trabajosHechos}`} etiqueta="trabajos" />
          <Dato valor={`${t.minRespuesta} min`} etiqueta="en contestar" />
        </View>

        <Seccion titulo="Sobre su trabajo">
          <Text style={{ color: c.texto, fontSize: 14, lineHeight: 21 }}>{t.descripcion}</Text>
        </Seccion>

        <Seccion titulo="Zona donde trabaja">
          <Text style={{ color: c.texto, fontSize: 14 }}>
            {t.colonia}, {t.municipio}
          </Text>
          <Text style={{ color: c.suave, fontSize: 12 }}>
            Se traslada hasta {t.radioKm} km a la redonda.
          </Text>
          {t.precioDesde != null && (
            <Text style={{ color: c.suave, fontSize: 12 }}>
              Cobra desde ${t.precioDesde}. El precio final lo acuerdan directamente.
            </Text>
          )}
        </Seccion>

        <Seccion titulo={`Resenas (${resenas.length})`}>
          {resenas.length === 0 ? (
            <Text style={{ color: c.suave, fontSize: 13 }}>
              Todavia no tiene resenas. Si lo contratas, cuentanos como te fue.
            </Text>
          ) : (
            resenas.map((r) => (
              <View key={r.id} style={[e.resena, { borderColor: c.borde }]}>
                <View style={[e.fila, { justifyContent: 'space-between' }]}>
                  <Text style={{ color: c.texto, fontWeight: '700', fontSize: 13 }}>{r.autor}</Text>
                  <Text style={{ color: c.suave, fontSize: 11 }}>{r.fecha}</Text>
                </View>
                <View style={[e.fila, { gap: 6 }]}>
                  <Estrellas valor={r.estrellas} tam={12} />
                  <Text style={{ color: c.suave, fontSize: 11 }}>{nombreOficio(r.oficio)}</Text>
                </View>
                <Text style={{ color: c.texto, fontSize: 13, lineHeight: 19 }}>{r.comentario}</Text>
              </View>
            ))
          )}
          <Text style={{ color: c.suave, fontSize: 11, fontStyle: 'italic' }}>
            Solo puede resenar quien de verdad pidio su contacto por aqui.
          </Text>
        </Seccion>
      </ScrollView>

      <View style={[e.barra, { backgroundColor: c.tarjeta, borderColor: c.borde }]}>
        <Pressable
          onPress={abrirWhatsApp}
          style={({ pressed }) => [e.botonWa, { backgroundColor: '#25D366', opacity: pressed ? 0.85 : 1 }]}
        >
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>
            Escribirle por WhatsApp
          </Text>
        </Pressable>
      </View>
    </>
  );
}

function Dato({ valor, etiqueta }: { valor: string; etiqueta: string }) {
  const c = useColores();
  return (
    <View style={[e.dato, { backgroundColor: c.tarjeta, borderColor: c.borde }]}>
      <Text style={{ color: c.texto, fontWeight: '800', fontSize: 16 }}>{valor}</Text>
      <Text style={{ color: c.suave, fontSize: 11 }}>{etiqueta}</Text>
    </View>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  const c = useColores();
  return (
    <View style={[e.seccion, { backgroundColor: c.tarjeta, borderColor: c.borde }]}>
      <Text style={{ color: c.texto, fontWeight: '800', fontSize: 15 }}>{titulo}</Text>
      {children}
    </View>
  );
}

const e = StyleSheet.create({
  encabezado: {
    borderWidth: 1, borderRadius: radio.grande, padding: espacio.lg,
    alignItems: 'center', gap: espacio.xs,
  },
  avatar: { width: 74, height: 74, borderRadius: 37, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  fila: { flexDirection: 'row', alignItems: 'center' },
  numeros: { flexDirection: 'row', gap: espacio.sm },
  dato: { flex: 1, borderWidth: 1, borderRadius: radio.medio, padding: espacio.sm, alignItems: 'center', gap: 2 },
  seccion: { borderWidth: 1, borderRadius: radio.medio, padding: espacio.md, gap: espacio.sm },
  resena: { borderWidth: 1, borderRadius: radio.chico, padding: espacio.sm, gap: 4 },
  barra: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    borderTopWidth: 1, padding: espacio.md, paddingBottom: espacio.lg,
  },
  botonWa: { borderRadius: radio.chico, paddingVertical: 15, alignItems: 'center' },
});
