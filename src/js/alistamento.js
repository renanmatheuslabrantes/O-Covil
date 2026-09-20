const form = document.querySelector(".alistamento-form");
const message = document.getElementById("mensagem-alistamento");

if (form && message) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = form.querySelector("button[type='submit']");
    const formData = new FormData(form);
    submitButton.disabled = true;
    submitButton.textContent = "Enviando...";

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData.entries()))
      });
      if (!response.ok) throw new Error("Falha ao enviar alistamento");
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
  window.setTimeout(() => { message.style.display = "none"; }, 5000);
}