-- =====================================================================
--  Chambitas - esquema de base de datos (Supabase / Postgres)
--  Aplicar con:  supabase db push   (o pegarlo en el SQL Editor)
-- =====================================================================

create extension if not exists postgis;

-- ---------------------------------------------------------------------
--  Catalogo de oficios
-- ---------------------------------------------------------------------
create table if not exists oficios (
  slug   text primary key,
  nombre text not null,
  emoji  text not null
);

insert into oficios (slug, nombre, emoji) values
  ('plomeria','Plomeria','🚿'), ('electricidad','Electricidad','⚡'),
  ('albanileria','Albanileria','🧱'), ('carpinteria','Carpinteria','🪚'),
  ('pintura','Pintura','🎨'), ('impermeabilizacion','Impermeabilizacion','🌧'),
  ('herreria','Herreria','🔨'), ('cerrajeria','Cerrajeria','🔑'),
  ('jardineria','Jardineria','🌿'), ('limpieza','Limpieza','🧹'),
  ('mudanzas','Mudanzas y fletes','🚚'), ('cocina','Cocina y banquetes','🍳'),
  ('costura','Costura','🧵'), ('mecanica','Mecanica','🔧'),
  ('cuidados','Cuidado de personas','💛'), ('computo','Computo y redes','💻')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
--  Trabajadores
-- ---------------------------------------------------------------------
create table if not exists trabajadores (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  nombre       text not null,
  descripcion  text not null default '',
  telefono     text not null,              -- para el enlace de WhatsApp
  foto_url     text,

  municipio    text not null,
  colonia      text not null,
  -- Ubicacion APROXIMADA (centro de colonia). Nunca el domicilio exacto:
  -- es la casa de una persona y la lista es publica.
  ubicacion    geography(point, 4326) not null,
  radio_km     numeric not null default 15 check (radio_km between 1 and 150),

  precio_desde   integer,
  disponible_hoy boolean not null default true,
  verificado     boolean not null default false,  -- solo lo cambia un admin
  activo         boolean not null default true,

  -- Se recalculan por trigger desde las resenas; no se escriben a mano.
  calificacion    numeric(2,1) not null default 0,
  num_resenas     integer not null default 0,
  trabajos_hechos integer not null default 0,
  min_respuesta   integer not null default 30,

  creado_en    timestamptz not null default now(),
  unique (user_id)
);

create index if not exists idx_trab_ubicacion on trabajadores using gist (ubicacion);
create index if not exists idx_trab_activo    on trabajadores (activo) where activo;

create table if not exists trabajador_oficios (
  trabajador_id uuid references trabajadores(id) on delete cascade,
  oficio        text references oficios(slug),
  primary key (trabajador_id, oficio)
);
create index if not exists idx_to_oficio on trabajador_oficios (oficio);

-- ---------------------------------------------------------------------
--  Suscripciones (freemium)
--   gratis  = aparece en resultados, sin extras
--   impulso = insignia + mas fotos + puede salir como Patrocinado
--   pro     = lo de impulso + prioridad de soporte + estadisticas
-- ---------------------------------------------------------------------
create type plan_tipo as enum ('gratis','impulso','pro');

create table if not exists suscripciones (
  id            uuid primary key default gen_random_uuid(),
  trabajador_id uuid not null references trabajadores(id) on delete cascade,
  plan          plan_tipo not null default 'gratis',
  vigente_hasta timestamptz,
  -- Referencia del cobro en Mercado Pago (soporta OXXO y SPEI, clave aqui
  -- porque mucha gente no tiene tarjeta).
  referencia_pago text,
  creado_en     timestamptz not null default now()
);
create index if not exists idx_susc_trab on suscripciones (trabajador_id);

/** Plan vigente hoy. Si venc-io o nunca pago, es 'gratis'. */
create or replace function plan_actual(p_trabajador uuid)
returns plan_tipo language sql stable as $$
  select coalesce(
    (select plan from suscripciones
      where trabajador_id = p_trabajador
        and vigente_hasta > now()
      order by vigente_hasta desc limit 1),
    'gratis'::plan_tipo);
$$;

-- ---------------------------------------------------------------------
--  Contactos: cada vez que alguien abre WhatsApp desde un perfil.
--  Es la metrica que justifica cobrar ("te mandamos 14 clientes este mes")
--  y ademas es el candado anti-resenas-falsas.
-- ---------------------------------------------------------------------
create table if not exists contactos (
  id            uuid primary key default gen_random_uuid(),
  trabajador_id uuid not null references trabajadores(id) on delete cascade,
  cliente_id    uuid references auth.users(id) on delete set null,
  creado_en     timestamptz not null default now()
);
create index if not exists idx_cont_trab on contactos (trabajador_id, creado_en desc);

-- ---------------------------------------------------------------------
--  Resenas
-- ---------------------------------------------------------------------
create table if not exists resenas (
  id            uuid primary key default gen_random_uuid(),
  trabajador_id uuid not null references trabajadores(id) on delete cascade,
  autor_id      uuid not null references auth.users(id) on delete cascade,
  estrellas     smallint not null check (estrellas between 1 and 5),
  comentario    text not null default '',
  oficio        text references oficios(slug),
  creado_en     timestamptz not null default now(),
  -- Una resena por cliente por trabajador: corta el spam de golpe.
  unique (trabajador_id, autor_id)
);
create index if not exists idx_res_trab on resenas (trabajador_id, creado_en desc);

/** Recalcula promedio y conteo. El trabajador nunca escribe estos campos. */
create or replace function refrescar_calificacion() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_trab uuid := coalesce(new.trabajador_id, old.trabajador_id);
begin
  update trabajadores t set
    calificacion = coalesce((select round(avg(estrellas)::numeric, 1) from resenas where trabajador_id = v_trab), 0),
    num_resenas  = (select count(*) from resenas where trabajador_id = v_trab)
  where t.id = v_trab;
  return null;
end $$;

drop trigger if exists trg_calificacion on resenas;
create trigger trg_calificacion
  after insert or update or delete on resenas
  for each row execute function refrescar_calificacion();

-- =====================================================================
--  PASO 2 del flujo de IA: filtrar y pre-rankear.
--
--  Esto lo hace Postgres, NO el modelo. Las distancias se calculan de
--  verdad, el filtro es exacto y cuesta microsegundos. El modelo solo
--  recibe esta lista corta y la explica: asi no puede inventar gente.
-- =====================================================================
create or replace function buscar_candidatos(
  p_oficio  text,
  p_lat     double precision,
  p_lng     double precision,
  p_urgente boolean default false,
  p_limite  integer default 12
)
returns table (
  id uuid, nombre text, oficios text[], descripcion text,
  municipio text, colonia text, telefono text, foto_url text,
  distancia_km double precision, calificacion numeric, num_resenas integer,
  min_respuesta integer, precio_desde integer, disponible_hoy boolean,
  verificado boolean, plan plan_tipo, puntaje numeric
)
language sql stable as $$
  with origen as (
    select st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography as punto
  ),
  base as (
    select t.*,
           st_distance(t.ubicacion, o.punto) / 1000.0 as dist_km,
           array(select oficio from trabajador_oficios where trabajador_id = t.id) as sus_oficios
    from trabajadores t, origen o
    where t.activo
      and (p_oficio is null or exists (
            select 1 from trabajador_oficios tt
            where tt.trabajador_id = t.id and tt.oficio = p_oficio))
      -- Solo quien de verdad llega hasta alla (15% de tolerancia).
      and st_dwithin(t.ubicacion, o.punto, t.radio_km * 1150)
  )
  select
    b.id, b.nombre, b.sus_oficios, b.descripcion,
    b.municipio, b.colonia, b.telefono, b.foto_url,
    round(b.dist_km::numeric, 2)::double precision,
    b.calificacion, b.num_resenas, b.min_respuesta, b.precio_desde,
    b.disponible_hoy, b.verificado, plan_actual(b.id),
    round((
      -- Cercania: 40 pts, cae a 0 al borde de su radio de cobertura.
      greatest(0, 1 - b.dist_km / greatest(b.radio_km, 1)) * 40
      -- Reputacion: 35 pts, amortiguada por cuantas resenas la respaldan.
      -- Un 5.0 con 2 resenas pesa menos que un 4.7 con 60.
      + (b.calificacion / 5) * 35 * (0.55 + 0.45 * least(b.num_resenas / 25.0, 1))
      -- Rapidez para contestar: importa mas cuando urge.
      + greatest(0, 1 - b.min_respuesta / 60.0) * (case when p_urgente then 15 else 9 end)
      -- Disponibilidad hoy.
      + (case when b.disponible_hoy then (case when p_urgente then 10 else 4 end) else 0 end)
    )::numeric, 1) as puntaje
  from base b
  -- OJO: el plan NO entra en el puntaje, a proposito. Si el dinero moviera
  -- el orden, la recomendacion dejaria de ser confiable y se cae el
  -- marketplace. Lo que se vende es la etiqueta "Patrocinado", visible y aparte.
  order by puntaje desc
  limit p_limite;
$$;

-- =====================================================================
--  Seguridad por filas (RLS)
-- =====================================================================
alter table trabajadores       enable row level security;
alter table trabajador_oficios enable row level security;
alter table resenas            enable row level security;
alter table contactos          enable row level security;
alter table suscripciones      enable row level security;

-- El directorio es publico: cualquiera busca sin registrarse.
create policy "trabajadores visibles" on trabajadores
  for select using (activo);

create policy "el trabajador edita lo suyo" on trabajadores
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "oficios visibles" on trabajador_oficios
  for select using (true);

create policy "el trabajador edita sus oficios" on trabajador_oficios
  for all using (exists (
    select 1 from trabajadores t
    where t.id = trabajador_id and t.user_id = auth.uid()));

create policy "resenas visibles" on resenas for select using (true);

-- Solo resena quien de verdad pidio el contacto. Sin esto, la competencia
-- se hunde a estrellazos y los trabajadores se compran resenas.
create policy "solo resena quien contacto" on resenas
  for insert with check (
    auth.uid() = autor_id
    and exists (
      select 1 from contactos c
      where c.trabajador_id = resenas.trabajador_id
        and c.cliente_id = auth.uid())
  );

create policy "el autor edita su resena" on resenas
  for update using (auth.uid() = autor_id) with check (auth.uid() = autor_id);

create policy "el autor borra su resena" on resenas
  for delete using (auth.uid() = autor_id);

-- Cualquiera registra un contacto; solo el trabajador ve los suyos.
create policy "registrar contacto" on contactos for insert with check (true);
create policy "el trabajador ve sus contactos" on contactos
  for select using (exists (
    select 1 from trabajadores t
    where t.id = trabajador_id and t.user_id = auth.uid()));

-- El plan se lee publicamente (para la insignia), pero solo lo escribe el
-- webhook de pagos, que entra con la service role key y se salta RLS.
create policy "suscripciones visibles" on suscripciones for select using (true);
