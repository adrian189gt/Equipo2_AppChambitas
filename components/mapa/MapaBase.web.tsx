import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { APIProvider, AdvancedMarker, Circle, Map, Pin } from '@vis.gl/react-google-maps';
import { useColores } from '../../lib/theme';
import { encuadre, RADIO_ZONA_METROS, type PropsMapaBase } from './tipos';

/** Mapa del NAVEGADOR con Google Maps. La llave va en el .env. */
const LLAVE = process.env.EXPO_PUBLIC_GOOGLE_MAPS_WEB_KEY ?? '';

export default function MapaBase({ origen, origenEsReal, trabajadores, seleccionadoId, onSeleccionar }: PropsMapaBase) {
  const c = useColores();
  const [cargado, setCargado] = useState(false);
  const [rechazada, setRechazada] = useState(false);
  const elegido = trabajadores.find((s) => s.trabajador.id === seleccionadoId)?.trabajador;

  // Google llama a esta funcion si rechaza la llave.
  useEffect(() => { (window as any).gm_authFailure = () => setRechazada(true); }, []);

  if (!LLAVE || rechazada) {
    return <Text style={{ color: c.suave, textAlign: 'center', margin: 'auto' }}>Mapa no disponible: revisa la llave de Google Maps.</Text>;
  }

  return (
    <APIProvider apiKey={LLAVE}>
      <Map
        mapId="DEMO_MAP_ID"
        defaultBounds={encuadre(origen, trabajadores)}
        disableDefaultUI
        zoomControl
        gestureHandling="greedy"
        onTilesLoaded={() => setCargado(true)}
      >
        {/* Los pines se dibujan hasta que el mapa cargo bien */}
        {cargado && (
          <>
            {/* Punto azul: la persona que busca */}
            <AdvancedMarker position={origen} title={origenEsReal ? 'Tu ubicacion' : 'Centro de Oaxaca'}>
              <div style={{ width: 14, height: 14, borderRadius: 10, background: '#2B7FFF', border: '3px solid #fff' }} />
            </AdvancedMarker>

            {/* Un pin por trabajador; al tocarlo se elige */}
            {trabajadores.map(({ trabajador: t }) => (
              <AdvancedMarker key={t.id} position={{ lat: t.lat, lng: t.lng }} title={t.nombre} onClick={() => onSeleccionar(t.id)}>
                <Pin background={t.id === seleccionadoId ? c.jade : c.primario} borderColor="#fff" glyphColor="#fff" />
              </AdvancedMarker>
            ))}

            {/* Zona aproximada del elegido: la colonia, no su casa */}
            {elegido && (
              <Circle center={{ lat: elegido.lat, lng: elegido.lng }} radius={RADIO_ZONA_METROS} strokeColor={c.jade} fillColor={c.jade} fillOpacity={0.18} />
            )}
          </>
        )}
      </Map>
    </APIProvider>
  );
}
