create table if not exists news (
  id bigserial primary key,
  titulo varchar(120) not null,
  texto varchar(2000) not null,
  link text not null default '',
  capa_url text not null,
  criado_em timestamptz not null default now()
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