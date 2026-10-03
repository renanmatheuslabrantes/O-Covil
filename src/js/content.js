export async function loadRemoteContent(newsContainer, carousel) {
  try {
    const response = await fetch("/api/content", { cache: "no-store" });
    if (!response.ok) return;
    const { news = [], carousel: remoteCarousel = [] } = await response.json();

    // Notícias do painel entram no topo de "Nossas Novidades" (mais recentes primeiro),
    // sem apagar as notícias fixas do site.
    if (news.length) newsContainer.prepend(...news.map(createNewsCard));

    // Fotos do painel entram depois dos slides fixos, mantendo os botões ‹ › do carrossel.
    if (remoteCarousel.length) {
      carousel.append(...remoteCarousel.map(createSlide));
      syncCarouselIndicators(carousel);
    }
  } catch (error) {
    console.error("Falha ao carregar conteúdo remoto:", error);
  }

  try {
    const response = await fetch("/api/posts", { cache: "no-store" });
    if (!response.ok) return;
    const posts = await response.json();
    if (posts.length) newsContainer.prepend(...posts.map(createPostCard));
  } catch (error) {
    console.error("Falha ao carregar publicações:", error);
  }
}

function createPostCard(post) {
  const article = document.createElement("article");
  article.className = "news-card";
  const link = document.createElement("a");
  link.className = "news-card-link";
  link.href = `/p/post/?id=${encodeURIComponent(post.id)}`;
  link.setAttribute("aria-label", `Ler publicação: ${post.titulo}`);
  const image = document.createElement("img");
  image.src = post.imagemUrl;
  image.alt = post.titulo;
  const content = document.createElement("div");
  content.className = "card-content";
  const title = document.createElement("h3");
  title.textContent = post.titulo;
  const body = document.createElement("p");
  body.textContent = post.resumo || "Leia a publicação para ver os detalhes.";
  const readMore = document.createElement("span");
  readMore.className = "card-read-more";
  readMore.textContent = "Ler publicação →";
  content.append(title, body, readMore);
  link.append(image, content);
  article.append(link);
  return article;
}

function createNewsCard(news) {
  const article = document.createElement("article");
  article.className = "news-card";
  const image = document.createElement("img");
  image.src = news.capaUrl;
  image.alt = news.titulo;
  const content = document.createElement("div");
  content.className = "card-content";
  const title = document.createElement("h3");
  title.textContent = news.titulo;
  const summary = document.createElement("p");
  summary.textContent = news.texto;
  content.append(title, summary);

  if (news.link) {
    const link = document.createElement("a");
    link.href = news.link;
    link.textContent = "Ver detalhes →";
    content.appendChild(link);
  }

  article.append(image, content);
  return article;
}

function createSlide(slideData) {
  const slide = document.createElement("div");
  slide.className = "slide";
  const image = document.createElement("img");
  image.src = slideData.imagemUrl;
  image.alt = slideData.legenda || "Imagem do carrossel";

  if (slideData.link) {
    const link = document.createElement("a");
    link.className = "slide-link";
    link.href = slideData.link;
    link.appendChild(image);
    slide.appendChild(link);
  } else {
    slide.appendChild(image);
  }

  const caption = document.createElement("p");
  caption.textContent = slideData.legenda || "";
  slide.appendChild(caption);
  return slide;
}

function syncCarouselIndicators(carousel) {
  const indicators = document.querySelector(".carousel-indicators");
  if (!indicators) return;
  const total = carousel.querySelectorAll(".slide").length;
  indicators.replaceChildren(...Array.from({ length: total }, (_, index) => {
    const dot = document.createElement("span");
    dot.className = `dot${index === 0 ? " active" : ""}`;
    dot.dataset.slide = index;
    return dot;
  }));
}
