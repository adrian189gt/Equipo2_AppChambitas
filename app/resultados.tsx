import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useColores, radio, espacio } from '../lib/theme';
import { useUbicacion } from '../lib/ubicacion';
import { buscar } from '../lib/ia';
import { TRABAJADORES } from '../lib/mock';
import { buscarCandidatos, marcarPatrocinado } from '../lib/ranking';
import { nombreOficio } from '../lib/oficios';
import { TarjetaTrabajador } from '../components/Tarjeta';
import type { ResultadoBusqueda } from '../lib/tipos';

export default function Resultados() {
  const c = useColores();
  const router = useRouter();
  const { q, oficio } = useLocalSearchParams<{ q?: string; oficio?: string }>();
  const { origen, esReal, cargando: cargandoGps } = useUbicacion();

  const [datos, setDatos] = useState<ResultadoBusqueda | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cargandoGps) return;
    let vivo = true;

    (async () => {
      try {
        // Por oficio: no hace falta IA, es un filtro directo. No gastamos
        // una llamada al modelo en algo que la base resuelve sola.
        if (oficio && !q) {
          const cands = buscarCandidatos(TRABAJADORES, { oficio, origen, limite: 20 });
          const patro = marcarPatrocinado(cands);
          if (!vivo) return;
          setDatos({
            interpretacion: {
              oficio, tipoTrabajo: nombreOficio(oficio), urgencia: 'esta_semana',
              presupuesto: 'no_dijo', resumen: `${nombreOficio(oficio)} cerca de ti.`,
            },
            sugerencias: cands.map((x) => ({
              trabajador: x.trabajador,
              distanciaKm: x.distanciaKm,
              razon: '',
              patrocinado: x.trabajador.id === patro,
            })),
            modoLocal: true,
          });
          return;
        }

        const r = await buscar(q ?? '', origen);
        if (vivo) setDatos(r);
      } catch (err) {
        if (vivo) setError('No pudimos buscar ahorita. Revisa tu conexion.');
      }
    })();

    return () => { vivo = false; };
  }, [q, oficio, origen.lat, origen.lng, cargandoGps]);

  if (error) {
    return (
      <Centro>
        <Text style={{ color: c.texto, textAlign: 'center' }}>{error}</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: c.primario, fontWeight: '700', marginTop: 12 }}>Volver</Text>
        </Pressable>
      </Centro>
    );
  }

  if (!datos) {
    return (
      <Centro>
        <ActivityIndicator size="large" color={c.primario} />
        <Text style={{ color: c.suave, marginTop: 12, textAlign: 'center' }}>
          Entendiendo lo que necesitas...
        </Text>
      </Centro>
    );
  }

  const { interpretacion: nec, sugerencias, modoLocal } = datos;

  return (
    <>
      <Stack.Screen options={{ title: nec.oficio ? nombreOficio(nec.oficio) : 'Resultados' }} />
      <ScrollView contentContainerStyle={{ padding: espacio.md, gap: espacio.md }}>

        {/* Lo que la IA entendio, a la vista. Si le erro, la persona
            se da cuenta al instante en vez de creer que no hay nadie. */}
        <View style={[e.lectura, { backgroundColor: c.primarioSuave }]}>
          <Text style={{ color: c.primario, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 }}>
            ENTENDIMOS ESTO
          </Text>
          <Text style={{ color: c.texto, fontSize: 15, fontWeight: '600', lineHeight: 21 }}>
            {nec.resumen}
          </Text>
          <View style={e.fila}>
            {nec.urgencia === 'hoy' && <Etiqueta texto="Para hoy" />}
            {nec.presupuesto === 'bajo' && <Etiqueta texto="Economico" />}
            {nec.oficio && <Etiqueta texto={nombreOficio(nec.oficio)} />}
          </View>
          <Pressable onPress={() => router.back()}>
            <Text style={{ color: c.primario, fontSize: 12, fontWeight: '700' }}>
              {'¿'}No es eso? Describelo de otra forma
            </Text>
          </Pressable>
        </View>

        {sugerencias.length === 0 ? (
          <View style={{ gap: espacio.sm, paddingVertical: espacio.xl }}>
            <Text style={{ color: c.texto, fontWeight: '700', textAlign: 'center' }}>
              Todavia no hay nadie de ese oficio por tu zona.
            </Text>
            <Text style={{ color: c.suave, fontSize: 13, textAlign: 'center' }}>
              Chambitas apenas esta creciendo en Oaxaca.{'\n'}
              {'¿'}Conoces a alguien? Invitalo a darse de alta.
            </Text>
          </View>
        ) : (
          <>
            <Text style={{ color: c.suave, fontSize: 13 }}>
              {sugerencias.length} {sugerencias.length === 1 ? 'persona' : 'personas'} que te pueden ayudar,
              de la que mas te conviene a la que menos.
            </Text>

            {sugerencias.map((s) => (
              <TarjetaTrabajador
                key={s.trabajador.id}
                trabajador={s.trabajador}
                distanciaKm={s.distanciaKm}
                razon={s.razon}
                patrocinado={s.patrocinado}
                onPress={() => router.push(`/trabajador/${s.trabajador.id}`)}
              />
            ))}
          </>
        )}

        {modoLocal && (
          <Text style={{ color: c.suave, fontSize: 11, textAlign: 'center' }}>
            Busqueda por palabras clave. Con Supabase conectado, la IA entiende matices.
          </Text>
        )}
      </ScrollView>
    </>
  );
}

function Etiqueta({ texto }: { texto: string }) {
  const c = useColores();
  return (
    <View style={{ backgroundColor: c.tarjeta, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 }}>
      <Text style={{ color: c.texto, fontSize: 11, fontWeight: '700' }}>{texto}</Text>
    </View>
  );
}

function Centro({ children }: { children: React.ReactNode }) {
  const c = useColores();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: espacio.lg, backgroundColor: c.fondo }}>
      {children}
    </View>
  );
}

const e = StyleSheet.create({
  lectura: { padding: espacio.md, borderRadius: radio.medio, gap: espacio.xs },
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
});
