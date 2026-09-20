import { addDoc, collection, getFirestore, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { getApps, initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

const form = document.querySelector(".alistamento-form");
const message = document.getElementById("mensagem-alistamento");

if (form && message) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector("button[type='submit']");
    const formData = new FormData(form);
    const application = {
      nome: formData.get("nome").trim(),
      discord: formData.get("discord").trim(),
      email: formData.get("email").trim(),
      motivo: formData.get("motivo").trim(),
      criadoEm: serverTimestamp()
    };

    if (!isFirebaseConfigured) {
      showMessage("Configure o Firebase antes de enviar o alistamento.", true);
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Enviando...";

    try {
      const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
      await addDoc(collection(getFirestore(app), "alistamentos"), application);
      form.reset();
      showMessage("Obrigado por se alistar ao Covil!");
    } catch (error) {
      console.error("Falha ao salvar o alistamento:", error);
      showMessage("Não foi possível enviar agora. Tente novamente mais tarde.", true);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Enviar Alistamento";
    }
  });
}

function showMessage(text, isError = false) {
  message.textContent = text;
  message.style.display = "block";
  message.style.color = isError ? "#8b1e1e" : "#b98c53";

  window.setTimeout(() => {
    message.style.display = "none";
  }, 5000);
}