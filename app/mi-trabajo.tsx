import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColores, radio, espacio } from '../lib/theme';
import { useSesion } from '../lib/auth';
import { Estrellas, Insignia } from '../components/Tarjeta';
import { MenuSesion } from '../components/MenuSesion';
import { AvatarUsuario } from '../components/AvatarUsuario';
import { useState } from 'react';

/**
 * Panel del trabajador: lo primero que ve quien viene a ofrecer su oficio.
 *
 * La metrica principal es "cuantas personas te contactaron", no cuantas
 * visitas tuvo su perfil. Las visitas no le dan de comer; los clientes si.
 * Es tambien el numero que justifica cobrarle una suscripcion.
 */
export default function MiTrabajo() {
  const c = useColores();
  const router = useRouter();
  const { usuario, salir, elegirRol } = useSesion();
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Sin perfil publicado todavia: es el caso de quien acaba de entrar.
  const tienePerfil = false;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.fondo }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: espacio.lg, gap: espacio.lg }}>

        <View style={[e.fila, { justifyContent: 'space-between' }]}>
          <View style={{ gap: 4, flex: 1 }}>
            <Text style={[e.marca, { color: c.jade }]}>Mi trabajo</Text>
            <Text style={{ color: c.suave, fontSize: 15 }}>
              {usuario?.invitado ? 'Chambitas' : `Hola, ${usuario?.nombre?.split(' ')[0] ?? ''}`}
            </Text>
          </View>

          <Pressable
            onPress={() => setMenuAbierto(true)}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <AvatarUsuario usuario={usuario} tam={42} color={c.jade} fondo={c.jadeSuave} />
          </Pressable>
        </View>

        {!tienePerfil ? (
          <View style={[e.aviso, { backgroundColor: c.jadeSuave, borderColor: c.jade }]}>
            <Text style={{ fontSize: 34 }}>{'\u{1F4CB}'}</Text>
            <Text style={{ color: c.texto, fontSize: 18, fontWeight: '800', textAlign: 'center' }}>
              Todavia no tienes perfil publicado
            </Text>
            <Text style={{ color: c.suave, fontSize: 14, textAlign: 'center', lineHeight: 21 }}>
              Publicalo gratis y empieza a aparecer cuando alguien busque
              tu oficio en tu zona.
            </Text>
            <Pressable
              onPress={() => router.push('/alta')}
              style={({ pressed }) => [
                e.botonGrande,
                { backgroundColor: c.jade, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>
                Publicar mi perfil gratis
              </Text>
            </Pressable>
            <Text style={{ color: c.suave, fontSize: 12 }}>
              Toma menos de 3 minutos
            </Text>
          </View>
        ) : null}

        <View style={{ gap: espacio.sm }}>
          <Text style={[e.titulo, { color: c.texto }]}>Este mes</Text>
          <View style={e.numeros}>
            <Dato valor="0" etiqueta="te contactaron" destacado />
            <Dato valor="0" etiqueta="vieron tu perfil" />
            <Dato valor="—" etiqueta="calificacion" />
          </View>
          <Text style={{ color: c.suave, fontSize: 12, lineHeight: 18 }}>
            Los numeros empiezan a moverse en cuanto publiques tu perfil.
          </Text>
        </View>

        <View style={[e.seccion, { backgroundColor: c.tarjeta, borderColor: c.borde }]}>
          <Text style={[e.titulo, { color: c.texto }]}>Tus resenas</Text>
          <Text style={{ color: c.suave, fontSize: 13, lineHeight: 20 }}>
            Aqui apareceran las calificaciones de tus clientes. Solo puede
            resenarte quien de verdad pidio tu contacto por la app, asi que
            nadie puede bajarte estrellas sin haberte contratado.
          </Text>
          <View style={{ opacity: 0.35 }}>
            <Estrellas valor={0} tam={18} />
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/planes')}
          style={({ pressed }) => [
            e.seccion,
            { backgroundColor: c.tarjeta, borderColor: c.borde, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <View style={[e.fila, { justifyContent: 'space-between' }]}>
            <Text style={[e.titulo, { color: c.texto }]}>Quiero que me vean mas</Text>
            <Insignia texto="Ver planes" tono="primario" />
          </View>
          <Text style={{ color: c.suave, fontSize: 13, lineHeight: 20 }}>
            Tu perfil gratis ya aparece en las busquedas. Con un plan sales
            destacado, con insignia de verificado y mas fotos de tu trabajo.
          </Text>
        </Pressable>

        {/* Cambiar de lado sin cerrar sesion: la misma persona puede
            necesitar contratar a alguien mas tarde. */}
        <Pressable
          onPress={() => router.replace('/')}
          style={({ pressed }) => [e.botonTexto, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={{ color: c.primario, fontSize: 14, fontWeight: '700' }}>
            {'¿'}Necesitas contratar a alguien? Busca aqui
          </Text>
        </Pressable>
      </ScrollView>

      <MenuSesion
        visible={menuAbierto}
        usuario={usuario}
        onCerrar={() => setMenuAbierto(false)}
        onSalir={async () => { setMenuAbierto(false); await salir(); }}
        onCambiarLado={async () => { setMenuAbierto(false); await elegirRol('cliente'); }}
      />
    </SafeAreaView>
  );
}

function Dato({ valor, etiqueta, destacado }: { valor: string; etiqueta: string; destacado?: boolean }) {
  const c = useColores();
  return (
    <View style={[e.dato, {
      backgroundColor: destacado ? c.jadeSuave : c.tarjeta,
      borderColor: destacado ? c.jade : c.borde,
    }]}>
      <Text style={{ color: destacado ? c.jade : c.texto, fontWeight: '900', fontSize: 24 }}>
        {valor}
      </Text>
      <Text style={{ color: c.suave, fontSize: 11, textAlign: 'center' }}>{etiqueta}</Text>
    </View>
  );
}

const e = StyleSheet.create({
  marca: { fontSize: 30, fontWeight: '900', letterSpacing: -1 },
  titulo: { fontSize: 16, fontWeight: '800' },
  fila: { flexDirection: 'row', alignItems: 'center' },
  aviso: {
    borderWidth: 1, borderRadius: radio.grande, padding: espacio.lg,
    alignItems: 'center', gap: espacio.sm,
  },
  botonGrande: {
    borderRadius: radio.chico, paddingVertical: 15,
    paddingHorizontal: espacio.lg, alignItems: 'center',
    width: '100%', marginTop: espacio.xs,
  },
  numeros: { flexDirection: 'row', gap: espacio.sm },
  dato: {
    flex: 1, borderWidth: 1, borderRadius: radio.medio,
    padding: espacio.md, alignItems: 'center', gap: 3,
  },
  seccion: { borderWidth: 1, borderRadius: radio.medio, padding: espacio.md, gap: espacio.sm },
  botonTexto: { alignItems: 'center', paddingVertical: espacio.sm },
});
