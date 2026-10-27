import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { useColores, radio, espacio } from '../lib/theme';
import type { Usuario } from '../lib/auth';
import { AvatarUsuario } from './AvatarUsuario';

/**
 * Menu de sesion: con que cuenta entraste y como salirte.
 *
 * Es un Modal propio y no Alert.alert porque Alert NO existe en web:
 * en el navegador simplemente no pasa nada al tocarlo. Un Modal se ve
 * igual en celular y en navegador.
 */
export function MenuSesion({
  visible, usuario, onCerrar, onSalir, onCambiarLado,
}: {
  visible: boolean;
  usuario: Usuario | null;
  onCerrar: () => void;
  onSalir: () => void;
  /** Permite pasar de cliente a trabajador y al reves, sin cerrar sesion. */
  onCambiarLado?: () => void;
}) {
  const c = useColores();
  const invitado = usuario?.invitado ?? false;
  const esTrabajador = usuario?.rol === 'trabajador';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}>
      {/* Tocar fuera cierra el menu, como espera cualquiera. */}
      <Pressable style={e.fondo} onPress={onCerrar}>
        <Pressable
          style={[e.tarjeta, { backgroundColor: c.tarjeta, borderColor: c.borde }]}
          onPress={(ev) => ev.stopPropagation()}
        >
          <View style={{ marginBottom: 4 }}>
            <AvatarUsuario usuario={usuario} tam={60} color={c.primario} fondo={c.primarioSuave} />
          </View>

          <Text style={{ color: c.texto, fontSize: 17, fontWeight: '800' }}>
            {invitado ? 'Entraste sin cuenta' : usuario?.nombre}
          </Text>

          <Text style={{ color: c.suave, fontSize: 13, textAlign: 'center', lineHeight: 19 }}>
            {invitado
              ? 'Inicia sesion con Google para guardar tus favoritos y dejar resenas.'
              : usuario?.correo}
          </Text>

          <Pressable
            onPress={onSalir}
            style={({ pressed }) => [
              e.boton,
              { backgroundColor: invitado ? c.primario : 'transparent',
                borderColor: invitado ? c.primario : c.borde,
                opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={{ color: invitado ? '#fff' : c.texto, fontWeight: '700', fontSize: 15 }}>
              {invitado ? 'Iniciar sesion con Google' : 'Cerrar sesion'}
            </Text>
          </Pressable>

          {onCambiarLado && (
            <Pressable onPress={onCambiarLado} style={e.botonTexto}>
              <Text style={{ color: c.primario, fontSize: 14, fontWeight: '700', textAlign: 'center' }}>
                {esTrabajador
                  ? 'Cambiar a buscar servicios'
                  : 'Cambiar a ofrecer mi trabajo'}
              </Text>
            </Pressable>
          )}

          <Pressable onPress={onCerrar} style={e.botonTexto}>
            <Text style={{ color: c.suave, fontSize: 14, fontWeight: '600' }}>Volver</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const e = StyleSheet.create({
  fondo: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center', padding: espacio.lg,
  },
  tarjeta: {
    width: '100%', maxWidth: 340, borderWidth: 1, borderRadius: radio.grande,
    padding: espacio.lg, alignItems: 'center', gap: espacio.sm,
  },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  boton: {
    width: '100%', borderWidth: 1, borderRadius: radio.chico,
    paddingVertical: 13, alignItems: 'center', marginTop: espacio.sm,
  },
  botonTexto: { paddingVertical: espacio.xs },
});
