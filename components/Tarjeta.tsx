import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useColores, radio, espacio } from '../lib/theme';
import type { Trabajador } from '../lib/tipos';
import { nombreOficio, oficioPorSlug } from '../lib/oficios';

export function Estrellas({ valor, tam = 13 }: { valor: number; tam?: number }) {
  const c = useColores();
  return (
    <Text style={{ color: c.oro, fontSize: tam, letterSpacing: 1 }}>
      {'★'.repeat(Math.round(valor))}
      <Text style={{ color: c.borde }}>{'★'.repeat(5 - Math.round(valor))}</Text>
    </Text>
  );
}

export function Insignia({ texto, tono = 'jade' }: { texto: string; tono?: 'jade' | 'primario' | 'suave' }) {
  const c = useColores();
  const fondo = tono === 'jade' ? c.jadeSuave : tono === 'primario' ? c.primarioSuave : c.borde;
  const color = tono === 'jade' ? c.jade : tono === 'primario' ? c.primario : c.suave;
  return (
    <View style={{ backgroundColor: fondo, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 }}>
      <Text style={{ color, fontSize: 11, fontWeight: '700' }}>{texto}</Text>
    </View>
  );
}

function Avatar({ nombre }: { nombre: string }) {
  const c = useColores();
  const iniciales = nombre.split(' ').slice(0, 2).map((p) => p[0]).join('');
  return (
    <View style={[e.avatar, { backgroundColor: c.primarioSuave }]}>
      <Text style={{ color: c.primario, fontWeight: '800', fontSize: 18 }}>{iniciales}</Text>
    </View>
  );
}

type Props = {
  trabajador: Trabajador;
  distanciaKm?: number;
  razon?: string;
  patrocinado?: boolean;
  onPress?: () => void;
};

export function TarjetaTrabajador({ trabajador: t, distanciaKm, razon, patrocinado, onPress }: Props) {
  const c = useColores();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        e.tarjeta,
        { backgroundColor: c.tarjeta, borderColor: c.borde, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={e.fila}>
        <Avatar nombre={t.nombre} />

        <View style={{ flex: 1, gap: 3 }}>
          <View style={[e.fila, { gap: 6 }]}>
            <Text style={[e.nombre, { color: c.texto }]} numberOfLines={1}>{t.nombre}</Text>
            {t.verificado && <Text style={{ color: c.jade, fontSize: 13 }}>{'✓'}</Text>}
          </View>

          <Text style={{ color: c.suave, fontSize: 12 }} numberOfLines={1}>
            {t.oficios.map((o) => `${oficioPorSlug(o)?.emoji ?? ''} ${nombreOficio(o)}`).join(' · ')}
          </Text>

          <View style={[e.fila, { gap: 6 }]}>
            <Estrellas valor={t.calificacion} />
            <Text style={{ color: c.suave, fontSize: 12 }}>
              {t.calificacion.toFixed(1)} ({t.numResenas})
            </Text>
            {distanciaKm !== undefined && (
              <Text style={{ color: c.suave, fontSize: 12 }}>
                {'·'} a {distanciaKm.toFixed(1)} km
              </Text>
            )}
          </View>
        </View>

        {t.precioDesde != null && (
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: c.suave, fontSize: 10 }}>desde</Text>
            <Text style={{ color: c.texto, fontWeight: '800', fontSize: 15 }}>${t.precioDesde}</Text>
          </View>
        )}
      </View>

      {razon ? (
        <View style={[e.razon, { backgroundColor: c.jadeSuave }]}>
          <Text style={{ color: c.jade, fontSize: 12, lineHeight: 17 }}>{razon}</Text>
        </View>
      ) : null}

      <View style={[e.fila, { gap: 6, marginTop: 2 }]}>
        {t.disponibleHoy && <Insignia texto="Disponible hoy" />}
        {t.minRespuesta <= 15 && <Insignia texto={`Contesta en ${t.minRespuesta} min`} tono="suave" />}
        {/* La etiqueta de pago va visible y aparte del orden por relevancia. */}
        {patrocinado && <Insignia texto="Patrocinado" tono="primario" />}
      </View>
    </Pressable>
  );
}

const e = StyleSheet.create({
  tarjeta: {
    borderWidth: 1, borderRadius: radio.medio,
    padding: espacio.md, gap: espacio.sm,
  },
  fila: { flexDirection: 'row', alignItems: 'center', gap: espacio.sm },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  nombre: { fontSize: 16, fontWeight: '700', flexShrink: 1 },
  razon: { padding: espacio.sm, borderRadius: radio.chico },
});
