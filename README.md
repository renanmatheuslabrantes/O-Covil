<!-- Banner ou Logo -->
<p align="center">
  <img src="https://i.pinimg.com/1200x/ed/75/eb/ed75ebb5bbb5bb7350e5d52568e6916a.jpg">
</p>

# 🐺 O-Covil

Bem-vindo ao **O-Covil**, um site criado para representar e apoiar a guilda no Discord.  
Aqui você encontrará informações, links importantes e um espaço que reflete a identidade da comunidade.

---

## 📖 Índice

- [Sobre](#-sobre)  
- [Funcionalidades](#-funcionalidades)  
- [Tecnologias](#-tecnologias)  
- [Instalação](#-instalação)  
- [Como usar](#-como-usar)  
- [Contribuição](#-contribuição)  
- [Licença](#-licença)

---

## 📌 Sobre

O **O-Covil** foi desenvolvido como um site estático para centralizar as principais informações da guilda.  
A proposta é ter um espaço digital que sirva como referência para membros atuais e futuros.

---

## ⚡ Funcionalidades

- Página inicial com identidade da guilda  
- Links para redes externas (ex.: Twitch, Discord, etc.)  
- Layout responsivo para diferentes telas  
- Estrutura simples, fácil de atualizar  

---

## 🛠️ Tecnologias

O projeto foi construído com:

- **HTML5**  
- **CSS3**  
- **JavaScript (puro)**  
- **Vercel Functions** para a API
- **Neon Postgres** para os dados
- **Vercel Blob** para as imagens

---

## 🚀 Instalação

Para rodar localmente:

```bash
# Clone o repositório
git clone https://github.com/renanmatheuslabrantes/O-Covil.git

# Acesse a pasta do projeto
cd O-Covil
```

### Configurar a Vercel

1. Importe o repositório no [Vercel](https://vercel.com/).
2. Adicione uma integração Neon e execute o conteúdo de `schema.sql` no banco.
3. Adicione uma integração Vercel Blob.
4. Cadastre estas variáveis de ambiente no projeto:

  - `DATABASE_URL`: conexão do Neon.
  - `BLOB_READ_WRITE_TOKEN`: token criado pelo Vercel Blob.
  - `AUTH_SECRET`: uma chave aleatória longa para assinar a sessão.
  - `CRON_SECRET`: uma chave aleatória longa para proteger a limpeza automática de notícias.
  - `ADMIN_USERNAME`: login do administrador (ou `ADMIN_EMAIL` para compatibilidade com configurações existentes).
  - `ADMIN_PASSWORD`: senha do administrador.

Não coloque essas variáveis diretamente no código. A API usa `AUTH_SECRET` para proteger o cookie da sessão e exige autenticação para alterar notícias, carrossel e imagens.

As notícias deixam de aparecer após 30 dias e são removidas diariamente junto com as respectivas imagens no Blob. A rotina usa `CRON_SECRET`, que deve estar configurada em Production na Vercel.

### Posts com imagem

O site continua em HTML e JavaScript puro. O formulário de posts fica em `admin.html`; as funções estão em `api/admin/posts.js` (criação e gerenciamento), `api/admin/upload.js` (token de upload) e `api/posts.js` (leitura pública). Cada card abre uma página de detalhe própria em `/p/post/?id=...`. O navegador envia a imagem diretamente ao Vercel Blob com um token temporário, e o Postgres guarda somente a URL.

Estrutura relacionada:

```text
admin.html
schema.sql
api/
  _lib/db.js
  admin/
    posts.js
    upload.js
  posts.js
src/
  js/
    admin.js
    content.js
```

1. No painel Vercel, abra **Storage** e crie um Blob Store público conectado a este projeto. Habilite o ambiente Production e confirme a variável `BLOB_READ_WRITE_TOKEN`.
2. Em **Storage**, crie ou conecte o Postgres/Neon ao projeto e confirme `DATABASE_URL` no ambiente Production.
3. Em **Settings → Environment Variables**, configure `AUTH_SECRET`, `ADMIN_USERNAME` e `ADMIN_PASSWORD` em Production. Não compartilhe esses valores nem os coloque no frontend.
4. No console SQL do banco conectado, execute `schema.sql` para criar `posts` e `post_rate_limits` (além das tabelas já usadas pelo site).
5. Faça um novo deploy depois de salvar as variáveis. A biblioteca de upload no navegador é carregada da versão `@vercel/blob@2.8.0` via esm.sh; o token de leitura/escrita continua exclusivamente no servidor.

Uploads aceitam JPG, JPEG, PNG e WebP até 5 MiB. A função autenticada restringe os tipos, tamanho, extensão e nome aleatório antes de emitir token; a API de posts valida os campos e aceita apenas URLs públicas do Blob sob o caminho `posts/`. A rota POST limita cada sessão administrativa a 10 posts por hora usando Postgres.

### Painel de conteúdo

Acesse `/admin.html` no domínio da Vercel para publicar notícias e gerenciar as fotos do carrossel. O formulário público de alistamento grava na tabela `alistamentos`.
