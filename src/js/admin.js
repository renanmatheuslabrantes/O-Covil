import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore, orderBy, query, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { getApps, initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";
import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

const loginPanel = document.getElementById("login-panel");
const contentPanel = document.getElementById("content-panel");
const loginForm = document.getElementById("login-form");
const logoutButton = document.getElementById("logout-button");
const message = document.getElementById("admin-message");
const newsList = document.getElementById("news-list");
const carouselList = document.getElementById("carousel-list");

let database;
let storage;
let auth;

if (!isFirebaseConfigured) {
  showMessage("Configure o Firebase em src/js/firebase-config.js antes de usar o painel.", true);
} else {
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  database = getFirestore(app);
  storage = getStorage(app);
  auth = getAuth(app);
  onAuthStateChanged(auth, handleAuthChange);
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!auth) {
    return;
  }

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginForm.reset();
  } catch (error) {
    console.error("Falha no login:", error);
    showMessage("E-mail ou senha inválidos.", true);
  }
});

logoutButton.addEventListener("click", () => signOut(auth));

document.getElementById("news-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const file = form.capa.files[0];

  if (!validateImage(file)) {
    return;
  }

  setFormBusy(form, true, "Publicando...");
  try {
    const filePath = `content/news/${createFileName(file)}`;
    const imageRef = ref(storage, filePath);
    await uploadBytes(imageRef, file);
    const capaUrl = await getDownloadURL(imageRef);

    await addDoc(collection(database, "news"), {
      titulo: form.titulo.value.trim(),
      texto: form.texto.value.trim(),
      link: form.link.value.trim(),
      capaUrl,
      storagePath: filePath,
      criadoEm: serverTimestamp()
    });

    form.reset();
    showMessage("Notícia publicada.");
    await loadContentLists();
  } catch (error) {
    console.error("Falha ao publicar notícia:", error);
    showMessage("Não foi possível publicar a notícia.", true);
  } finally {
    setFormBusy(form, false, "Publicar notícia");
  }
});

document.getElementById("carousel-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const file = form.imagem.files[0];

  if (!validateImage(file)) {
    return;
  }

  setFormBusy(form, true, "Enviando...");
  try {
    const filePath = `content/carousel/${createFileName(file)}`;
    const imageRef = ref(storage, filePath);
    await uploadBytes(imageRef, file);
    const imagemUrl = await getDownloadURL(imageRef);

    await addDoc(collection(database, "carousel"), {
      legenda: form.legenda.value.trim(),
      link: form.link.value.trim(),
      imagemUrl,
      storagePath: filePath,
      criadoEm: serverTimestamp()
    });

    form.reset();
    showMessage("Foto adicionada ao carrossel.");
    await loadContentLists();
  } catch (error) {
    console.error("Falha ao adicionar foto:", error);
    showMessage("Não foi possível adicionar a foto.", true);
  } finally {
    setFormBusy(form, false, "Adicionar ao carrossel");
  }
});

function handleAuthChange(user) {
  const authenticated = Boolean(user);
  loginPanel.hidden = authenticated;
  contentPanel.hidden = !authenticated;
  logoutButton.hidden = !authenticated;

  if (authenticated) {
    loadContentLists();
  }
}

async function loadContentLists() {
  const [newsSnapshot, carouselSnapshot] = await Promise.all([
    getDocs(query(collection(database, "news"), orderBy("criadoEm", "desc"))),
    getDocs(query(collection(database, "carousel"), orderBy("criadoEm", "asc")))
  ]);

  newsList.replaceChildren(...newsSnapshot.docs.map((item) => createListItem(item.id, item.data(), "news")));
  carouselList.replaceChildren(...carouselSnapshot.docs.map((item) => createListItem(item.id, item.data(), "carousel")));
}

function createListItem(id, data, type) {
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
  removeButton.addEventListener("click", () => removeContent(id, data, type));

  item.append(image, title, removeButton);
  return item;
}

async function removeContent(id, data, type) {
  const label = type === "news" ? "notícia" : "foto";
  if (!window.confirm(`Remover esta ${label}?`)) {
    return;
  }

  try {
    await deleteDoc(doc(database, type, id));
    if (data.storagePath) {
      await deleteObject(ref(storage, data.storagePath));
    }
    showMessage(`${label[0].toUpperCase()}${label.slice(1)} removida.`);
    await loadContentLists();
  } catch (error) {
    console.error(`Falha ao remover ${label}:`, error);
    showMessage(`Não foi possível remover a ${label}.`, true);
  }
}

function validateImage(file) {
  if (!file || !file.type.startsWith("image/")) {
    showMessage("Escolha um arquivo de imagem.", true);
    return false;
  }
  if (file.size >= 5 * 1024 * 1024) {
    showMessage("A imagem deve ter menos de 5 MB.", true);
    return false;
  }
  return true;
}

function createFileName(file) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  return `${Date.now()}-${safeName}`;
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