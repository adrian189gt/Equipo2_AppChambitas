# Reparto del trabajo — Chambitas

Cuatro integrantes, cuatro áreas que casi no se pisan entre sí.

## Paso 0 — Alguien sube la base (primero que todo)

Sin esto nada compila para los demás, así que va antes que cualquier otra cosa.

```bash
git add package.json package-lock.json app.json tsconfig.json .gitignore .env.example lib/tipos.ts scripts/
git commit -m "Configuración base del proyecto Expo"
git push -u origin main
```

`lib/tipos.ts` va aquí porque **todos** los demás archivos lo importan.

---

## Rol 1 — Base de datos y backend

**Archivos:**
```
supabase/schema.sql
```

```bash
git checkout -b backend
git add supabase/schema.sql
git commit -m "Esquema de base de datos con PostGIS y seguridad por filas"
git push -u origin backend
```

**Qué debe poder explicar:**
- Por qué la distancia se calcula en Postgres y no en la app
- Qué es RLS y por qué la regla "solo reseña quien contactó" vive en la base
- Por qué el promedio de estrellas lo hace un trigger y no la app

---

## Rol 2 — IA y motor de recomendación

**Archivos:**
```
supabase/functions/recomendar/index.ts
lib/ia.ts
lib/ranking.ts
```

```bash
git checkout -b ia
git add supabase/functions/ lib/ia.ts lib/ranking.ts
git commit -m "Motor de recomendación con Claude y ranking por cercanía"
git push -u origin ia
```

**Qué debe poder explicar:**
- Los tres pasos: Claude interpreta → Postgres filtra → Claude explica
- Por qué la API key va en el servidor y nunca en la app
- Por qué se descartan los `id` que el modelo devuelve si no existen
- Por qué el plan de pago **no** entra en el puntaje

---

## Rol 3 — App: búsqueda y perfiles

**Archivos:**
```
app/_layout.tsx
app/index.tsx
app/resultados.tsx
app/trabajador/[id].tsx
components/Tarjeta.tsx
```

```bash
git checkout -b app-busqueda
git add app/_layout.tsx app/index.tsx app/resultados.tsx app/trabajador/ components/
git commit -m "Pantallas de búsqueda, resultados y perfil del trabajador"
git push -u origin app-busqueda
```

**Qué debe poder explicar:**
- Por qué se muestra "entendimos esto" antes de los resultados
- Por qué el contacto cierra en WhatsApp y no en un chat propio
- Por qué la app sirve aunque el usuario niegue el GPS

---

## Rol 4 — Alta, planes y diseño

**Archivos:**
```
app/alta.tsx
app/planes.tsx
lib/theme.ts
lib/oficios.ts
lib/mock.ts
README.md
```

```bash
git checkout -b alta-planes
git add app/alta.tsx app/planes.tsx lib/theme.ts lib/oficios.ts lib/mock.ts README.md
git commit -m "Alta de trabajadores, planes freemium y tema visual"
git push -u origin alta-planes
```

**Qué debe poder explicar:**
- Por qué el ranking no se compra y qué es la etiqueta "Patrocinado"
- Por qué arrancan gratis en lugar de cobrar desde el día 1
- Por qué se guarda la colonia y nunca el domicilio exacto

---

## Archivos compartidos — cuidado aquí

`package.json` es el único que van a tocar varios. Si dos personas instalan
paquetes al mismo tiempo, se pelea el archivo. Avisen en el grupo antes de
instalar algo.

## Lo que falta por hacer (para repartir después)

| Rol | Pendiente |
|---|---|
| 1 | Autenticación por teléfono (OTP) |
| 2 | Desplegar la Edge Function y medir cuánto tarda |
| 3 | Pantalla para dejar reseña; registrar contactos al abrir WhatsApp |
| 4 | Guardar el alta en Supabase; subir fotos a Storage |
