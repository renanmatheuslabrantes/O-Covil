<!-- Banner ou Logo -->
<p align="center">
  <img src="https://sdmntprnortheu.oaiusercontent.com/files/00000000-0db4-61f4-859e-947cd635f531/raw?se=2025-09-20T19%3A10%3A09Z&sp=r&sv=2024-08-04&sr=b&scid=5e41fb5f-3876-516a-b224-db9f73726e8e&skoid=b0fd38cc-3d33-418f-920e-4798de4acdd1&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-09-20T12%3A29%3A11Z&ske=2025-09-21T12%3A29%3A11Z&sks=b&skv=2024-08-04&sig=OmkDNHvE9p2BQlg340puVuCL30DL7TmdAVJE%2B/wfabs%3D">
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
  - `ADMIN_EMAIL`: e-mail do administrador.
  - `ADMIN_PASSWORD`: senha do administrador.

Não coloque essas variáveis diretamente no código. A API usa `AUTH_SECRET` para proteger o cookie da sessão e exige autenticação para alterar notícias, carrossel e imagens.

### Painel de conteúdo

Acesse `/admin.html` no domínio da Vercel para publicar notícias e gerenciar as fotos do carrossel. O formulário público de alistamento grava na tabela `alistamentos`.
