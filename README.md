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
- **Firebase Cloud Firestore** para receber os alistamentos

---

## 🚀 Instalação

Para rodar localmente:

```bash
# Clone o repositório
git clone https://github.com/renanmatheuslabrantes/O-Covil.git

# Acesse a pasta do projeto
cd O-Covil

### Configurar o Firebase

1. Crie um projeto no [console do Firebase](https://console.firebase.google.com/), adicione um app Web e ative o **Cloud Firestore**.
2. Copie as credenciais do app para `src/js/firebase-config.js`.
3. Publique `firestore.rules` no Firestore. A regra permite apenas novos alistamentos na coleção `alistamentos`; o cliente não pode ler, alterar ou excluir documentos.

As credenciais do app Web podem ficar no frontend. A proteção dos dados é feita pelas regras do Firestore. Para um formulário público em produção, adicione também autenticação, App Check ou uma proteção anti-spam conforme a necessidade.

### Painel de conteúdo

1. Em **Authentication > Sign-in method**, ative o provedor **E-mail/senha** e crie o usuário administrador.
2. Ative o **Cloud Storage** e publique `storage.rules` junto com `firestore.rules`.
3. Acesse `admin.html` para publicar notícias e gerenciar as fotos do carrossel. O conteúdo só pode ser alterado por usuários autenticados.
