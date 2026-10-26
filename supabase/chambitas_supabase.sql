-- ============================================================
--  chambitas - base completa para SUPABASE
--  Pegar TODO en SQL Editor y dar Run.
--  Reconstruida del pgAdmin de Adrian (19/10/2026).
-- ============================================================

-- ------------------------------------------------------------
-- 0. Limpieza: borra lo anterior (lo mio y lo de ustedes)
-- ------------------------------------------------------------
drop table if exists suscripciones    cascade;
drop table if exists contactos        cascade;
drop table if exists resenas          cascade;
drop table if exists trabajador_oficios cascade;
drop table if exists trabajadores     cascade;
drop table if exists usuarios         cascade;
drop table if exists oficios          cascade;
drop table if exists calificaciones   cascade;  -- de la version inventada
drop table if exists chambas          cascade;  -- de la version inventada
drop table if exists clientes         cascade;  -- de la version inventada
drop type  if exists plan_tipo        cascade;


-- ------------------------------------------------------------
-- 1. Tipo plan_tipo  (OJO: adivinado, ver nota al final)
-- ------------------------------------------------------------
create type plan_tipo as enum ('gratis', 'pro', 'premium');


-- ------------------------------------------------------------
-- 2. usuarios
-- ------------------------------------------------------------
create table usuarios (
    id             uuid not null default gen_random_uuid(),
    nombre         varchar(100) not null,
    correo         varchar(150) not null,
    password       varchar(255) not null,
    telefono       varchar(20),
    creado_en      timestamp without time zone default current_timestamp,
    numero_usuario integer not null generated always as identity,
    constraint usuarios_pkey primary key (id),
    constraint usuarios_correo_key unique (correo),
    constraint usuarios_numero_usuario_key unique (numero_usuario)
);


-- ------------------------------------------------------------
-- 3. oficios   (faltaba en lo que me pasaron)
-- ------------------------------------------------------------
create table oficios (
    slug   varchar(50) not null,
    nombre varchar(100) not null,
    icono  varchar(50),
    constraint oficios_pkey primary key (slug)
);


-- ------------------------------------------------------------
-- 4. trabajadores
-- ------------------------------------------------------------
create table trabajadores (
    id              uuid not null default gen_random_uuid(),
    usuario_id      uuid not null,
    nombre          varchar(100) not null,
    descripcion     text,
    telefono        varchar(20) not null,
    foto_url        text,
    municipio       varchar(100) not null,
    colonia         varchar(100) not null,
    radio_km        numeric(6,2) default 15,
    precio_desde    integer,
    disponible_hoy  boolean default true,
    verificado      boolean default false,
    activo          boolean default true,
    calificacion    numeric(2,1) default 0,
    num_resenas     integer default 0,
    trabajos_hechos integer default 0,
    min_respuesta   integer default 30,
    creado_en       timestamp without time zone default current_timestamp,
    constraint trabajadores_pkey primary key (id),
    constraint trabajadores_usuario_id_key unique (usuario_id),
    constraint trabajadores_usuario_id_fkey foreign key (usuario_id)
        references usuarios (id) on update no action on delete cascade,
    constraint trabajadores_radio_km_check
        check (radio_km >= 1::numeric and radio_km <= 150::numeric)
);


-- ------------------------------------------------------------
-- 5. trabajador_oficios
-- ------------------------------------------------------------
create table trabajador_oficios (
    trabajador_id uuid not null,
    oficio        varchar(50) not null,
    constraint trabajador_oficios_pkey primary key (trabajador_id, oficio),
    constraint trabajador_oficios_oficio_fkey foreign key (oficio)
        references oficios (slug) on update no action on delete cascade,
    constraint trabajador_oficios_trabajador_id_fkey foreign key (trabajador_id)
        references trabajadores (id) on update no action on delete cascade
);


-- ------------------------------------------------------------
-- 6. resenas   (el final venia cortado, lo complete)
-- ------------------------------------------------------------
create table resenas (
    id            uuid not null default gen_random_uuid(),
    trabajador_id uuid not null,
    autor_id      uuid not null,
    estrellas     smallint not null,
    comentario    text,
    oficio        varchar(50),
    creado_en     timestamp without time zone default current_timestamp,
    constraint resenas_pkey primary key (id),
    constraint resenas_trabajador_id_autor_id_key unique (trabajador_id, autor_id),
    constraint resenas_autor_id_fkey foreign key (autor_id)
        references usuarios (id) on update no action on delete cascade,
    constraint resenas_trabajador_id_fkey foreign key (trabajador_id)
        references trabajadores (id) on update no action on delete cascade,
    constraint resenas_oficio_fkey foreign key (oficio)
        references oficios (slug) on update no action on delete set null,
    constraint resenas_estrellas_check check (estrellas between 1 and 5)
);


-- ------------------------------------------------------------
-- 7. contactos
-- ------------------------------------------------------------
create table contactos (
    id            uuid not null default gen_random_uuid(),
    trabajador_id uuid not null,
    cliente_id    uuid,
    creado_en     timestamp without time zone default current_timestamp,
    constraint contactos_pkey primary key (id),
    constraint contactos_cliente_id_fkey foreign key (cliente_id)
        references usuarios (id) on update no action on delete set null,
    constraint contactos_trabajador_id_fkey foreign key (trabajador_id)
        references trabajadores (id) on update no action on delete cascade
);


-- ------------------------------------------------------------
-- 8. suscripciones
-- ------------------------------------------------------------
create table suscripciones (
    id              uuid not null default gen_random_uuid(),
    trabajador_id   uuid not null,
    plan            plan_tipo not null default 'gratis'::plan_tipo,
    vigente_hasta   timestamp without time zone,
    referencia_pago varchar(255),
    creado_en       timestamp without time zone default current_timestamp,
    constraint suscripciones_pkey primary key (id),
    constraint suscripciones_trabajador_id_fkey foreign key (trabajador_id)
        references trabajadores (id) on update no action on delete cascade
);


-- ============================================================
--  DATOS DE PRUEBA
-- ============================================================

insert into oficios (slug, nombre, icono) values
    ('plomero',      'Plomero',      'water'),
    ('electricista', 'Electricista', 'bolt'),
    ('carpintero',   'Carpintero',   'hammer'),
    ('albanil',      'Albanil',      'brick'),
    ('pintor',       'Pintor',       'brush'),
    ('jardinero',    'Jardinero',    'leaf'),
    ('limpieza',     'Limpieza',     'broom'),
    ('herrero',      'Herrero',      'anvil');


-- Usuarios de los 13 trabajadores
insert into usuarios (nombre, correo, password, telefono) values
    ('Miguel Angel Ramirez Cruz',      'miguel.ramirez@demo.mx',   'CAMBIAR', '9511234501'),
    ('Jose Luis Hernandez Mendez',     'joseluis.hernandez@demo.mx','CAMBIAR', '9511234502'),
    ('Rosa Maria Lopez Garcia',        'rosa.lopez@demo.mx',       'CAMBIAR', '9511234503'),
    ('Pedro Antonio Martinez Ruiz',    'pedro.martinez@demo.mx',   'CAMBIAR', '9511234504'),
    ('Juana Perez Santiago',           'juana.perez@demo.mx',      'CAMBIAR', '9511234505'),
    ('Carlos Alberto Vasquez Diaz',    'carlos.vasquez@demo.mx',   'CAMBIAR', '9511234506'),
    ('Ana Lilia Jimenez Morales',      'ana.jimenez@demo.mx',      'CAMBIAR', '9511234507'),
    ('Roberto Sanchez Aguilar',        'roberto.sanchez@demo.mx',  'CAMBIAR', '9511234508'),
    ('Francisco Javier Gomez Luna',    'francisco.gomez@demo.mx',  'CAMBIAR', '9511234509'),
    ('Maria Elena Castillo Reyes',     'maria.castillo@demo.mx',   'CAMBIAR', '9511234510'),
    ('Victor Manuel Torres Ortiz',     'victor.torres@demo.mx',    'CAMBIAR', '9511234511'),
    ('Sergio Enrique Flores Bautista', 'sergio.flores@demo.mx',    'CAMBIAR', '9511234512'),
    ('Lucia Guadalupe Mendoza Silva',  'lucia.mendoza@demo.mx',    'CAMBIAR', '9511234513');

-- Usuarios que solo buscan chamba (clientes)
insert into usuarios (nombre, correo, password, telefono) values
    ('Adrian Delfin',         'adrian.delfin@demo.mx', 'CAMBIAR', '9519876001'),
    ('Laura Nunez Pacheco',   'laura.nunez@demo.mx',   'CAMBIAR', '9519876002'),
    ('Oscar Rivera Alvarado', 'oscar.rivera@demo.mx',  'CAMBIAR', '9519876003');


-- Los 13 trabajadores
insert into trabajadores
    (usuario_id, nombre, descripcion, telefono, municipio, colonia,
     radio_km, precio_desde, disponible_hoy, verificado, trabajos_hechos, min_respuesta)
values
    ((select id from usuarios where correo='miguel.ramirez@demo.mx'),
     'Miguel Angel Ramirez Cruz', 'Plomeria en general, fugas y calentadores. 12 anios de experiencia.',
     '9511234501', 'Oaxaca de Juarez', 'Centro', 20, 180, true, true, 240, 15),

    ((select id from usuarios where correo='joseluis.hernandez@demo.mx'),
     'Jose Luis Hernandez Mendez', 'Instalaciones electricas, cortos y centros de carga.',
     '9511234502', 'Oaxaca de Juarez', 'Reforma', 25, 220, true, true, 180, 20),

    ((select id from usuarios where correo='rosa.lopez@demo.mx'),
     'Rosa Maria Lopez Garcia', 'Limpieza de casas y oficinas, por hora o por dia.',
     '9511234503', 'Oaxaca de Juarez', 'Centro', 15, 120, true, false, 95, 30),

    ((select id from usuarios where correo='pedro.martinez@demo.mx'),
     'Pedro Antonio Martinez Ruiz', 'Muebles a la medida, closets y cocinas integrales.',
     '9511234504', 'Oaxaca de Juarez', 'Santa Rosa', 30, 200, true, true, 310, 45),

    ((select id from usuarios where correo='juana.perez@demo.mx'),
     'Juana Perez Santiago', 'Limpieza profunda y lavado de alfombras.',
     '9511234505', 'Oaxaca de Juarez', 'San Felipe del Agua', 12, 130, true, false, 48, 25),

    ((select id from usuarios where correo='carlos.vasquez@demo.mx'),
     'Carlos Alberto Vasquez Diaz', 'Albanileria, firmes, castillos y aplanados.',
     '9511234506', 'Oaxaca de Juarez', 'Volcanes', 35, 190, false, true, 420, 60),

    ((select id from usuarios where correo='ana.jimenez@demo.mx'),
     'Ana Lilia Jimenez Morales', 'Pintura de interiores y exteriores, texturizados.',
     '9511234507', 'Oaxaca de Juarez', 'Centro', 18, 160, true, false, 76, 30),

    ((select id from usuarios where correo='roberto.sanchez@demo.mx'),
     'Roberto Sanchez Aguilar', 'Electricidad residencial y comercial. Servicio de urgencia.',
     '9511234508', 'Santa Cruz Xoxocotlan', 'Santa Cruz', 40, 210, true, true, 205, 15),

    ((select id from usuarios where correo='francisco.gomez@demo.mx'),
     'Francisco Javier Gomez Luna', 'Jardineria, poda de arboles y mantenimiento de pasto.',
     '9511234509', 'San Antonio de la Cal', 'San Antonio', 22, 140, true, false, 130, 40),

    ((select id from usuarios where correo='maria.castillo@demo.mx'),
     'Maria Elena Castillo Reyes', 'Pintura decorativa y acabados finos.',
     '9511234510', 'Oaxaca de Juarez', 'Reforma', 16, 155, true, false, 62, 35),

    ((select id from usuarios where correo='victor.torres@demo.mx'),
     'Victor Manuel Torres Ortiz', 'Herreria: portones, barandales y proteccion de ventanas.',
     '9511234511', 'Oaxaca de Juarez', 'Trinidad de Viguera', 45, 230, true, true, 380, 50),

    ((select id from usuarios where correo='sergio.flores@demo.mx'),
     'Sergio Enrique Flores Bautista', 'Plomeria, desazolve y reparacion de bombas.',
     '9511234512', 'Oaxaca de Juarez', 'Volcanes', 28, 175, false, false, 150, 25),

    ((select id from usuarios where correo='lucia.mendoza@demo.mx'),
     'Lucia Guadalupe Mendoza Silva', 'Jardines pequenos, macetas y riego.',
     '9511234513', 'Santa Lucia del Camino', 'Santa Lucia', 14, 135, true, false, 30, 20);


-- Que oficio hace cada quien
insert into trabajador_oficios (trabajador_id, oficio) values
    ((select id from trabajadores where telefono='9511234501'), 'plomero'),
    ((select id from trabajadores where telefono='9511234502'), 'electricista'),
    ((select id from trabajadores where telefono='9511234503'), 'limpieza'),
    ((select id from trabajadores where telefono='9511234504'), 'carpintero'),
    ((select id from trabajadores where telefono='9511234505'), 'limpieza'),
    ((select id from trabajadores where telefono='9511234506'), 'albanil'),
    ((select id from trabajadores where telefono='9511234507'), 'pintor'),
    ((select id from trabajadores where telefono='9511234508'), 'electricista'),
    ((select id from trabajadores where telefono='9511234509'), 'jardinero'),
    ((select id from trabajadores where telefono='9511234510'), 'pintor'),
    ((select id from trabajadores where telefono='9511234511'), 'herrero'),
    ((select id from trabajadores where telefono='9511234512'), 'plomero'),
    ((select id from trabajadores where telefono='9511234513'), 'jardinero'),
    -- algunos hacen mas de un oficio
    ((select id from trabajadores where telefono='9511234506'), 'plomero'),
    ((select id from trabajadores where telefono='9511234504'), 'pintor');


-- Resenas
insert into resenas (trabajador_id, autor_id, estrellas, comentario, oficio) values
    ((select id from trabajadores where telefono='9511234501'),
     (select id from usuarios where correo='adrian.delfin@demo.mx'),
     5, 'Llego puntual y dejo todo limpio.', 'plomero'),

    ((select id from trabajadores where telefono='9511234504'),
     (select id from usuarios where correo='laura.nunez@demo.mx'),
     5, 'El closet quedo justo como lo pedi.', 'carpintero'),

    ((select id from trabajadores where telefono='9511234503'),
     (select id from usuarios where correo='laura.nunez@demo.mx'),
     4, 'Buen trabajo, solo tardo un poco mas de lo acordado.', 'limpieza'),

    ((select id from trabajadores where telefono='9511234511'),
     (select id from usuarios where correo='oscar.rivera@demo.mx'),
     5, 'El porton quedo como nuevo, muy recomendable.', 'herrero'),

    ((select id from trabajadores where telefono='9511234508'),
     (select id from usuarios where correo='adrian.delfin@demo.mx'),
     4, 'Resolvio rapido el corto, precio justo.', 'electricista');


-- Contactos (quien le marco a quien)
insert into contactos (trabajador_id, cliente_id) values
    ((select id from trabajadores where telefono='9511234501'),
     (select id from usuarios where correo='adrian.delfin@demo.mx')),
    ((select id from trabajadores where telefono='9511234508'),
     (select id from usuarios where correo='adrian.delfin@demo.mx')),
    ((select id from trabajadores where telefono='9511234504'),
     (select id from usuarios where correo='laura.nunez@demo.mx')),
    ((select id from trabajadores where telefono='9511234511'),
     (select id from usuarios where correo='oscar.rivera@demo.mx'));


-- Suscripciones
insert into suscripciones (trabajador_id, plan, vigente_hasta) values
    ((select id from trabajadores where telefono='9511234501'), 'pro',     '2027-03-31'),
    ((select id from trabajadores where telefono='9511234504'), 'premium', '2027-06-30'),
    ((select id from trabajadores where telefono='9511234511'), 'pro',     '2026-12-31'),
    ((select id from trabajadores where telefono='9511234502'), 'gratis',  null),
    ((select id from trabajadores where telefono='9511234503'), 'gratis',  null);


-- Dejar al dia los contadores de resenas
update trabajadores t
set num_resenas  = sub.cuantas,
    calificacion = sub.promedio
from (
    select trabajador_id,
           count(*)                        as cuantas,
           round(avg(estrellas)::numeric, 1) as promedio
    from resenas
    group by trabajador_id
) sub
where t.id = sub.trabajador_id;


-- ============================================================
--  SEGURIDAD (RLS)
--  Publico: el catalogo que la app necesita mostrar.
--  Cerrado: usuarios (trae correos y passwords), contactos
--           y suscripciones.
-- ============================================================
alter table usuarios           enable row level security;
alter table oficios            enable row level security;
alter table trabajadores       enable row level security;
alter table trabajador_oficios enable row level security;
alter table resenas            enable row level security;
alter table contactos          enable row level security;
alter table suscripciones      enable row level security;

create policy "lectura publica" on oficios            for select using (true);
create policy "lectura publica" on trabajadores       for select using (true);
create policy "lectura publica" on trabajador_oficios for select using (true);
create policy "lectura publica" on resenas            for select using (true);

-- usuarios, contactos y suscripciones quedan SIN politica a proposito:
-- con la llave anon nadie los puede leer ni escribir.
