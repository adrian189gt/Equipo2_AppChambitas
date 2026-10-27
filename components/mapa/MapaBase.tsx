import MapView, { Circle, Marker } from 'react-native-maps';
import { useColores } from '../../lib/theme';
import { encuadre, RADIO_ZONA_METROS, type PropsMapaBase } from './tipos';

/** Mapa del CELULAR (react-native-maps). En Expo Go funciona sin llave. */
export default function MapaBase({ origen, origenEsReal, trabajadores, seleccionadoId, onSeleccionar }: PropsMapaBase) {
  const c = useColores();
  const b = encuadre(origen, trabajadores);
  const elegido = trabajadores.find((s) => s.trabajador.id === seleccionadoId)?.trabajador;

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: (b.north + b.south) / 2, longitude: (b.east + b.west) / 2,
        latitudeDelta: b.north - b.south, longitudeDelta: b.east - b.west,
      }}
      showsUserLocation={origenEsReal}
    >
      {/* Sin GPS: marcamos el centro de Oaxaca como referencia */}
      {!origenEsReal && <Marker coordinate={{ latitude: origen.lat, longitude: origen.lng }} pinColor="blue" />}

      {trabajadores.map(({ trabajador: t }) => (
        <Marker
          key={t.id}
          coordinate={{ latitude: t.lat, longitude: t.lng }}
          pinColor={t.id === seleccionadoId ? c.jade : c.primario}
          title={t.nombre}
          onPress={() => onSeleccionar(t.id)}
        />
      ))}

      {elegido && (
        <Circle center={{ latitude: elegido.lat, longitude: elegido.lng }} radius={RADIO_ZONA_METROS} strokeColor={c.jade} fillColor="rgba(27,153,139,0.18)" />
      )}
    </MapView>
  );
}
