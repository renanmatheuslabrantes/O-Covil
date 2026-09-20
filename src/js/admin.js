const loginPanel = document.getElementById("login-panel");
const contentPanel = document.getElementById("content-panel");
const loginForm = document.getElementById("login-form");
const logoutButton = document.getElementById("logout-button");
const message = document.getElementById("admin-message");
const newsList = document.getElementById("news-list");
const carouselList = document.getElementById("carousel-list");

checkSession();

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setFormBusy(loginForm, true, "Entrando...");
  try {
    await request("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({
        email: document.getElementById("login-email").value,
        password: document.getElementById("login-password").value
      })
    });
    loginForm.reset();
    showAuthenticatedArea(true);
    await loadContentLists();
  } catch (error) {
    showMessage(error.message || "E-mail ou senha inválidos.", true);
  } finally {
    setFormBusy(loginForm, false, "Entrar");
  }
});

logoutButton.addEventListener("click", async () => {
  await request("/api/admin/logout", { method: "POST" });
  showAuthenticatedArea(false);
});

document.getElementById("news-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const file = form.capa.files[0];
  if (!validateImage(file)) return;
  setFormBusy(form, true, "Publicando...");

  try {
    const upload = await uploadImage(file);
    await request("/api/admin/news", {
      method: "POST",
      body: JSON.stringify({ titulo: form.titulo.value.trim(), texto: form.texto.value.trim(), link: form.link.value.trim(), capaUrl: upload.url })
    });
    form.reset();
    showMessage("Notícia publicada.");
    await loadContentLists();
  } catch (error) {
    showMessage(error.message || "Não foi possível publicar a notícia.", true);
  } finally {
    setFormBusy(form, false, "Publicar notícia");
  }
});

document.getElementById("carousel-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const file = form.imagem.files[0];
  if (!validateImage(file)) return;
  setFormBusy(form, true, "Enviando...");

  try {
    const upload = await uploadImage(file);
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
    showAuthenticatedArea(true);
    await loadContentLists();
  } catch {
    showAuthenticatedArea(false);
  }
}

function showAuthenticatedArea(authenticated) {
  loginPanel.hidden = authenticated;
  contentPanel.hidden = !authenticated;
  logoutButton.hidden = !authenticated;
}

async function loadContentLists() {
  const [news, carousel] = await Promise.all([request("/api/admin/news"), request("/api/admin/carousel")]);
  newsList.replaceChildren(...news.map((item) => createListItem(item, "news")));
  carouselList.replaceChildren(...carousel.map((item) => createListItem(item, "carousel")));
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

async function uploadImage(file) {
  return request("/api/admin/upload", {
    method: "POST",
    body: JSON.stringify({ fileName: file.name, contentType: file.type, data: await toBase64(file) })
  });
}

function request(url, options = {}) {
  return fetch(url, { ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) } }).then(async (response) => {
    const data = response.status === 204 ? null : await response.json();
    if (!response.ok) throw new Error(data?.error || "Ocorreu um erro inesperado.");
    return data;
  });
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function validateImage(file) {
  if (!file || !file.type.startsWith("image/")) {
    showMessage("Escolha um arquivo de imagem.", true);
    return false;
  }
  if (file.size > 3 * 1024 * 1024) {
    showMessage("A imagem deve ter no máximo 3 MB.", true);
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