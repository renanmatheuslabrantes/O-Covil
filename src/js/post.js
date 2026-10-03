const status = document.getElementById("post-status");
const content = document.getElementById("post-content");
const postId = new URLSearchParams(window.location.search).get("id");

if (!postId || !/^\d+$/.test(postId)) {
  showUnavailable();
} else {
  loadPost(postId);
}

async function loadPost(id) {
  try {
    const response = await fetch(`/api/posts?id=${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Publicação não encontrada.");

    const post = await response.json();
    document.title = `${post.titulo} | O Covil`;
    document.getElementById("post-title").textContent = post.titulo;

    const image = document.getElementById("post-image");
    image.src = post.imagemUrl;
    image.alt = post.titulo;

    const date = new Date(post.criadoEm);
    const time = document.getElementById("post-date");
    time.dateTime = date.toISOString();
    time.textContent = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" }).format(date);

    const body = document.getElementById("post-body");
    if (post.conteudoHtml) {
      body.innerHTML = post.conteudoHtml;
    } else {
      body.textContent = post.conteudo;
    }
    status.hidden = true;
    content.hidden = false;
  } catch {
    showUnavailable();
  }
}

function showUnavailable() {
  status.textContent = "Esta publicação não está disponível.";
  content.hidden = true;
}