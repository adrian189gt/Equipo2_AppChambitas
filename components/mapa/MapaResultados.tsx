import { useState } from 'react';
import { View, Text } from 'react-native';
import { useColores, radio } from '../../lib/theme';
import type { Coordenada, Sugerencia } from '../../lib/tipos';
import { TarjetaTrabajador } from '../Tarjeta';
import MapaBase from './MapaBase'; // Expo escoge MapaBase.web.tsx o MapaBase.tsx

/** Pestana "Mapa": los puntos de los trabajadores y la tarjeta del que tocaste. */
export function MapaResultados({ sugerencias, origen, origenEsReal, onAbrirPerfil }: {
  sugerencias: Sugerencia[];
  origen: Coordenada;
  origenEsReal: boolean;
  onAbrirPerfil: (id: string) => void;
}) {
  const c = useColores();
  // Solo los que tienen ubicacion (lat 0 = sin dato).
  const trabajadores = sugerencias.filter((s) => s.trabajador.lat !== 0);
  // Arranca con el mejor resultado elegido.
  const [seleccionadoId, setSeleccionadoId] = useState<string | null>(trabajadores[0]?.trabajador.id ?? null);
  const elegido = trabajadores.find((s) => s.trabajador.id === seleccionadoId);

  return (
    <View style={{ gap: 10 }}>
      <View style={{ height: 360, borderRadius: radio.medio, overflow: 'hidden' }}>
        <MapaBase
          origen={origen}
          origenEsReal={origenEsReal}
          trabajadores={trabajadores}
          seleccionadoId={seleccionadoId}
          onSeleccionar={setSeleccionadoId}
        />
      </View>
      <Text style={{ color: c.suave, fontSize: 11 }}>Ubicaciones aproximadas por colonia, no el domicilio.</Text>
      {elegido && <TarjetaTrabajador {...elegido} onPress={() => onAbrirPerfil(elegido.trabajador.id)} />}
    </View>
  );
}
