import { upload as uploadBlob } from "https://esm.sh/@vercel/blob@2.8.0/client";

const loginPanel = document.getElementById("login-panel");
const contentPanel = document.getElementById("content-panel");
const loginForm = document.getElementById("login-form");
const logoutButton = document.getElementById("logout-button");
const message = document.getElementById("admin-message");
const newsList = document.getElementById("news-list");
const carouselList = document.getElementById("carousel-list");
const postsList = document.getElementById("posts-list");
const postEditor = document.getElementById("post-content");
const postEditorToolbar = document.getElementById("post-editor-toolbar");
const postContentValue = document.getElementById("post-content-value");
const postContentCount = document.getElementById("post-content-count");

postEditorToolbar.addEventListener("mousedown", (event) => {
  if (event.target.closest("button")) event.preventDefault();
});

postEditorToolbar.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.editorLink !== undefined) {
    insertPostLink();
    return;
  }

  postEditor.focus();
  document.execCommand(button.dataset.editorCommand, false);
  updatePostContentCount();
});

postEditor.addEventListener("input", updatePostContentCount);

checkSession();

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setFormBusy(loginForm, true, "Entrando...");
  try {
    await request("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({
        login: document.getElementById("login-username").value,
        password: document.getElementById("login-password").value
      })
    });
  } catch (error) {
    showMessage(error.message || "Login ou senha inválidos.", true);
    setFormBusy(loginForm, false, "Entrar");
    return;
  }

  loginForm.reset();
  setFormBusy(loginForm, false, "Entrar");
  showAuthenticatedArea(true);
  await loadContentLists();
});

logoutButton.addEventListener("click", async () => {
  await request("/api/admin/logout", { method: "POST" });
  showAuthenticatedArea(false);
});

document.getElementById("post-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const file = form.imagem.files[0];
  if (!syncPostContent()) return;
  if (!validateImage(file)) return;
  setFormBusy(form, true, "Enviando imagem...");

  try {
    const image = await uploadImage(file, "posts");
    setFormBusy(form, true, "Publicando...");
    await request("/api/admin/posts", {
      method: "POST",
      body: JSON.stringify({ titulo: form.titulo.value.trim(), conteudo: form.conteudo.value.trim(), imagemUrl: image.url })
    });
    form.reset();
    postEditor.replaceChildren();
    updatePostContentCount();
    showMessage("Post publicado.");
    await loadPosts();
  } catch (error) {
    showMessage(error.message || "Não foi possível publicar o post.", true);
  } finally {
    setFormBusy(form, false, "Publicar post");
  }
});

document.getElementById("carousel-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const file = form.imagem.files[0];
  if (!validateImage(file, true)) return;
  setFormBusy(form, true, "Enviando...");

  try {
    const upload = await uploadImage(file, "content");
    await request("/api/admin/carousel", {
      method: "POST",
      body: JSON.stringify({ legenda: form.legenda.value.trim(), link: form.link.value.trim(), imagemUrl: upload.url })
    });
    form.reset();
    showMessage("Foto adicionada ao carrossel.");
    await loadContentLists();
  } catch (error) {
    showMessage(error.message || "Não foi possível adicionar a foto.", true);
  } finally {
    setFormBusy(form, false, "Adicionar ao carrossel");
  }
});

async function checkSession() {
  try {
    await request("/api/admin/session");
  } catch {
    showAuthenticatedArea(false);
    return;
  }
  showAuthenticatedArea(true);
  await loadContentLists();
}

function showAuthenticatedArea(authenticated) {
  loginPanel.hidden = authenticated;
  contentPanel.hidden = !authenticated;
  logoutButton.hidden = !authenticated;
}

async function loadContentLists() {
  try {
    const [news, carousel] = await Promise.all([request("/api/admin/news"), request("/api/admin/carousel")]);
    newsList.replaceChildren(...news.map((item) => createListItem(item, "news")));
    carouselList.replaceChildren(...carousel.map((item) => createListItem(item, "carousel")));
  } catch (error) {
    showMessage(error.message || "Não foi possível carregar as listas.", true);
  }
  await loadPosts();
}

async function loadPosts() {
  try {
    const posts = await request("/api/admin/posts");
    postsList.replaceChildren(...posts.map(createPostListItem));
  } catch (error) {
    showMessage(error.message || "Não foi possível carregar os posts.", true);
  }
}

function createPostListItem(post) {
  const item = document.createElement("article");
  item.className = "admin-list-item";
  const image = document.createElement("img");
  image.src = post.imagemUrl;
  image.alt = post.titulo;
  const title = document.createElement("strong");
  title.textContent = post.titulo;
  const removeButton = document.createElement("button");
  removeButton.className = "admin-remove-button";
  removeButton.type = "button";
  removeButton.textContent = "Remover";
  removeButton.addEventListener("click", () => removePost(post.id));
  item.append(image, title, removeButton);
  return item;
}

async function removePost(id) {
  if (!window.confirm("Remover esta publicação?")) return;
  try {
    await request(`/api/admin/posts?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    showMessage("Post removido.");
    await loadPosts();
  } catch (error) {
    showMessage(error.message || "Não foi possível remover o post.", true);
  }
}

function createListItem(data, type) {
  const item = document.createElement("article");
  item.className = "admin-list-item";
  const image = document.createElement("img");
  image.src = type === "news" ? data.capaUrl : data.imagemUrl;
  image.alt = type === "news" ? data.titulo : data.legenda || "Foto do carrossel";
  const title = document.createElement("strong");
  title.textContent = type === "news" ? data.titulo : data.legenda || "Sem legenda";
  const removeButton = document.createElement("button");
  removeButton.className = "admin-remove-button";
  removeButton.type = "button";
  removeButton.textContent = "Remover";
  removeButton.addEventListener("click", () => removeContent(data.id, type));
  item.append(image, title, removeButton);
  return item;
}

async function removeContent(id, type) {
  const label = type === "news" ? "notícia" : "foto";
  if (!window.confirm(`Remover esta ${label}?`)) return;
  try {
    await request(`/api/admin/${type}?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    showMessage(`${label[0].toUpperCase()}${label.slice(1)} removida.`);
    await loadContentLists();
  } catch (error) {
    showMessage(error.message || `Não foi possível remover a ${label}.`, true);
  }
}

async function uploadImage(file, folder) {
  const extension = file.name.split(".").pop().toLowerCase();
  const pathname = `${folder}/${crypto.randomUUID()}.${extension}`;
  return uploadBlob(pathname, file, {
    access: "public",
    contentType: file.type,
    handleUploadUrl: "/api/admin/upload",
    clientPayload: JSON.stringify({ contentType: file.type })
  });
}

function request(url, options = {}) {
  return fetch(url, { ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) } }).then(async (response) => {
    const data = response.status === 204 || !response.headers.get("content-type")?.includes("application/json") ? null : await response.json();
    if (!response.ok) throw new Error(data?.error || `Falha na requisição (${response.status}).`);
    return data;
  });
}

function validateImage(file, allowGif = false) {
  const acceptedTypes = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
  if (allowGif) acceptedTypes.gif = "image/gif";
  const extension = file?.name.split(".").pop().toLowerCase();
  if (!file || acceptedTypes[extension] !== file.type) {
    showMessage(`Use uma imagem ${allowGif ? "JPG, PNG, WebP ou GIF" : "JPG, PNG ou WebP"} válida.`, true);
    return false;
  }
  if (file.size > 5 * 1024 * 1024) {
    showMessage("A imagem deve ter no máximo 5 MB.", true);
    return false;
  }
  return true;
}

function setFormBusy(form, busy, text) {
  const button = form.querySelector("button[type='submit']");
  button.disabled = busy;
  button.textContent = text;
}

function showMessage(text, isError = false) {
  message.textContent = text;
  message.className = `admin-message${isError ? " is-error" : ""}`;
}

function updatePostContentCount() {
  const length = postEditor.innerText.replace(/\u00a0/g, " ").trim().length;
  postContentCount.textContent = `${length} / 5000`;
  postContentCount.classList.toggle("is-over-limit", length > 5000);
}

function syncPostContent() {
  const text = postEditor.innerText.replace(/\u00a0/g, " ").trim();
  if (!text || text.length > 5000) {
    showMessage(text ? "O conteúdo deve ter no máximo 5000 caracteres." : "Escreva o conteúdo da publicação.", true);
    postEditor.focus();
    return false;
  }

  postContentValue.value = postEditor.innerHTML;
  return true;
}

function insertPostLink() {
  const value = window.prompt("Digite o endereço do link:");
  if (!value) return;

  let url;
  try {
    url = new URL(value.trim());
  } catch {
    showMessage("Informe um link válido começando com https://, http:// ou mailto:.", true);
    return;
  }

  if (!["https:", "http:", "mailto:"].includes(url.protocol)) {
    showMessage("Links devem usar https://, http:// ou mailto:.", true);
    return;
  }

  postEditor.focus();
  document.execCommand("createLink", false, url.href);
}