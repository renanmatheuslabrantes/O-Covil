<!-- Banner ou Logo -->
<p align="center">
  <img src="https://i.pinimg.com/736x/da/7f/a0/da7fa0be85d9bd53ab119eff5c6f4229.jpg">
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
