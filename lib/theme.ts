import { useColorScheme } from 'react-native';

/** Paleta calida: barro oaxaqueno + verde jade. */
const claro = {
  fondo: '#FDF7F2',
  tarjeta: '#FFFFFF',
  texto: '#241710',
  suave: '#7B6A5C',
  borde: '#EADFD4',
  primario: '#D2542D',
  primarioSuave: '#FBE9E1',
  jade: '#1B998B',
  jadeSuave: '#E2F4F1',
  oro: '#E8A317',
};

const oscuro = {
  fondo: '#16100C',
  tarjeta: '#221A14',
  texto: '#F6EEE7',
  suave: '#A69485',
  borde: '#352A22',
  primario: '#F0754C',
  primarioSuave: '#3A2018',
  jade: '#3FCBBB',
  jadeSuave: '#13302D',
  oro: '#F0B73F',
};

export type Colores = typeof claro;

export function useColores(): Colores {
  return useColorScheme() === 'dark' ? oscuro : claro;
}

export const radio = { chico: 10, medio: 16, grande: 24 };
export const espacio = { xs: 6, sm: 10, md: 16, lg: 24, xl: 32 };
