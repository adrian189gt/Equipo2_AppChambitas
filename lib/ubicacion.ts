import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { CENTRO_OAXACA } from './mock';

/**
 * Da la ubicacion de la persona. Si no da permiso de GPS, usa el centro
 * de Oaxaca: nunca bloqueamos la busqueda por falta de permiso.
 */
export function useUbicacion() {
  const [estado, setEstado] = useState({ origen: CENTRO_OAXACA, esReal: false, cargando: true });

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const { coords } = await Location.getCurrentPositionAsync();
          return setEstado({ origen: { lat: coords.latitude, lng: coords.longitude }, esReal: true, cargando: false });
        }
      } catch {}
      setEstado((e) => ({ ...e, cargando: false }));
    })();
  }, []);

  return estado;
}
