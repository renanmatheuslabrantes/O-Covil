create table if not exists news (
  id bigserial primary key,
  titulo varchar(120) not null,
  texto varchar(2000) not null,
  link text not null default '',
  capa_url text not null,
  criado_em timestamptz not null default now()
);

create table if not exists posts (
  id bigserial primary key,
  titulo varchar(120) not null,
  conteudo varchar(5000) not null,
  imagem_url text not null,
  criado_em timestamptz not null default now()
);

create table if not exists post_rate_limits (
  admin_login text primary key,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0
);

create table if not exists carousel (
  id bigserial primary key,
  legenda varchar(160) not null default '',
  link text not null default '',
  imagem_url text not null,
  criado_em timestamptz not null default now()
);

create table if not exists alistamentos (
  id bigserial primary key,
  nome varchar(80) not null,
  discord varchar(80) not null,
  email varchar(160) not null,
  motivo varchar(2000) not null,
  criado_em timestamptz not null default now()
);