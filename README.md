# Chambitas

App para que la gente de Oaxaca encuentre trabajadores de oficio cerca, con
recomendación por IA y reseñas. Los trabajadores se dan de alta gratis y pagan
solo si quieren más visibilidad.

## Correrla ahora mismo

```bash
npm run tunel
```

Escanea el QR con **Expo Go**. Funciona sin backend: trae datos de ejemplo de
Oaxaca y búsqueda por palabras clave.

En casa, con WiFi normal, `npm run lan` es bastante más rápido.

### Si Expo Go dice "Something went wrong"

Casi siempre es la red, no el código. Tres causas, en orden de frecuencia:

**1. El servidor anuncia `127.0.0.1`.** Tu celular intenta bajar la app de sí
mismo. Pasa cuando la compu tiene varias tarjetas de red (VirtualBox, Hyper-V,
WSL) y Expo escoge la equivocada. Para eso existe `npm run lan`: detecta la IP
del WiFi en cada arranque y se la impone a Expo.

**2. El firewall de Windows bloquea `node.exe`.** Revisa con:

```bash
powershell -c "Get-NetFirewallRule -Direction Inbound -Enabled True | Where-Object DisplayName -like '*node*' | Select DisplayName,Action,Profile"
```

Si sale `Block` en perfil `Public`, el celular no puede llegar. **En una red
pública (escuela, café) no bajes esa defensa: usa `npm run tunel`.**

**3. El WiFi aísla los dispositivos.** Común en redes de escuela y lugares
públicos: los aparatos no se ven entre sí aunque estén en la misma red. No hay
nada que configurar del lado tuyo — `npm run tunel` lo resuelve porque sale por
internet en lugar de por la red local.

Prueba rápida para saber si es red o código: abre `http://TU_IP:8081` en el
navegador **del celular**. Si carga un JSON, la red está bien y el problema es
otro. Si no carga, es red.

## Cómo funciona la recomendación

La IA **no** es la base de datos. Son tres pasos, y cada uno hace lo que sabe hacer:

```
"Se me está goteando la llave del baño y urge"
            │
            ▼
   1. Claude interpreta          → { oficio: plomeria, urgencia: hoy }
            │
            ▼
   2. Postgres filtra y ordena   → 12 plomeros reales, con distancia real
      (PostGIS, cercanía + reputación + rapidez)
            │
            ▼
   3. Claude explica             → "Está a 2.3 km, 4.8★ en fugas, contesta en 8 min"
```

**Por qué así:** si le pides al modelo que elija directo de la base, se inventa
trabajadores que no existen, tarda más y cuesta 10 veces más. Separado, Postgres
calcula distancias exactas en microsegundos y el modelo solo traduce lenguaje.
Además hay un filtro final en la Edge Function que descarta cualquier `id` que no
exista de verdad: si el modelo alucinara a alguien, ahí muere.

Sin backend configurado, la app cae a búsqueda por palabras clave
(`lib/ia.ts`). Cubre lo común, no entiende matices — eso es justo lo que la IA
agrega.

## El ranking no se compra

El plan de suscripción **no entra** en el puntaje de relevancia, a propósito. Si
el dinero moviera el orden, la recomendación dejaría de ser confiable y el
marketplace se cae solo. Lo que se vende es la etiqueta *Patrocinado*: visible,
aparte, máximo uno, y solo si esa persona ya era competitiva por sí misma
(`marcarPatrocinado` en `lib/ranking.ts`).

## Conectar el backend

### 1. Crear el proyecto en Supabase

Crea uno en [supabase.com](https://supabase.com) (el plan gratis alcanza de
sobra para empezar) y aplica el esquema:

```bash
supabase db push
```

O pega `supabase/schema.sql` en el SQL Editor. Eso crea las tablas, la búsqueda
geográfica (`buscar_candidatos`) y las reglas de seguridad por filas.

### 2. Variables de la app

Copia `.env.example` a `.env` y llena:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Solo la llave **anon** va aquí. Es pública por diseño y está protegida por RLS.

### 3. Publicar la Edge Function

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase functions deploy recomendar
```

> **La llave de Anthropic nunca va en la app.** Un APK se abre con herramientas
> gratuitas y la llave se extrae en minutos; te vaciarían la cuenta. Por eso vive
> en la Edge Function, donde el celular nunca la ve.

## Estructura

```
app/                      Pantallas (expo-router)
  index.tsx               Buscador en lenguaje natural
  resultados.tsx          Resultados + lo que la IA entendió
  trabajador/[id].tsx     Perfil, reseñas y botón de WhatsApp
  alta.tsx                Alta de trabajador
  planes.tsx              Planes freemium
lib/
  ia.ts                   Cliente de la IA + respaldo sin conexión
  ranking.ts              Distancia y puntaje (espejo del SQL)
  tipos.ts, oficios.ts, mock.ts, ubicacion.ts, theme.ts
supabase/
  schema.sql              Tablas, PostGIS, RLS
  functions/recomendar/   La IA (aquí vive la API key)
```

## Decisiones que vale la pena conocer

**El cierre pasa por WhatsApp.** Es donde la gente ya está y donde confía.
Forzar un chat propio solo agrega fricción. Cada apertura se registra en la
tabla `contactos`: es la métrica que justifica cobrar ("te mandamos 14 clientes
este mes") y el candado anti-reseñas-falsas.

**Solo reseña quien contactó.** Está en la política de RLS, no en la app: sin
eso, la competencia se hunde a estrellazos y los trabajadores se compran
reseñas.

**Ubicación aproximada, nunca el domicilio.** Se guarda el centro de la colonia.
La lista es pública y son casas de personas reales.

**La app funciona sin GPS.** Si niegan el permiso, mide desde el centro de
Oaxaca. Mucha gente no da ubicación la primera vez, y una app que no sirve sin
permiso se desinstala.

## Lo que falta

- [ ] Autenticación (Supabase Auth por teléfono con OTP)
- [ ] Guardar el alta real y subir fotos a Supabase Storage
- [ ] Registrar `contactos` al abrir WhatsApp
- [ ] Pantalla para dejar reseña
- [ ] Mercado Pago + webhook que active la suscripción
- [ ] Verificación de identidad (revisión manual al principio)
