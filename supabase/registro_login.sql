-- ============================================================
--  Chambitas - registrar quien entra con Google
--  Va DESPUES de chambitas_supabase.sql.
--  Pegar TODO en Supabase > SQL Editor > Run.
-- ============================================================

-- 1. Quien entra con Google no tiene contrasena en Chambitas:
--    la contrasena se queda en Google.
alter table usuarios alter column password drop not null;
alter table usuarios add column if not exists google_id varchar(50) unique;
alter table usuarios add column if not exists foto_url  text;

-- 2. Bitacora: una fila cada vez que alguien entra.
create table if not exists ingresos (
    id         uuid primary key default gen_random_uuid(),
    usuario_id uuid not null references usuarios (id) on delete cascade,
    creado_en  timestamp without time zone default current_timestamp
);
-- Sin politicas: desde la app nadie puede leerla ni escribirla directo.
alter table ingresos enable row level security;

-- 3. Lo unico que la app puede hacer: avisar que alguien entro.
--    Si el correo ya existe, actualiza sus datos; si no, lo crea.
--    "security definer" = corre con permisos del duenio de la base,
--    asi la app no necesita permiso sobre las tablas.
create or replace function registrar_ingreso(
    p_google_id text,
    p_nombre    text,
    p_correo    text,
    p_foto_url  text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
    v_id uuid;
begin
    insert into usuarios (google_id, nombre, correo, foto_url)
    values (p_google_id, p_nombre, p_correo, p_foto_url)
    on conflict (correo) do update
        set google_id = excluded.google_id,
            nombre    = excluded.nombre,
            foto_url  = coalesce(excluded.foto_url, usuarios.foto_url)
    returning id into v_id;

    insert into ingresos (usuario_id) values (v_id);
    return v_id;
end;
$$;

grant execute on function registrar_ingreso(text, text, text, text) to anon;

-- Para ver quien ha entrado (en el SQL Editor):
--   select u.nombre, u.correo, i.creado_en
--   from ingresos i join usuarios u on u.id = i.usuario_id
--   order by i.creado_en desc;
