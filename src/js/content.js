const newsPageSize = 12;

export async function loadRemoteContent(newsContainer, carousel) {
  const [contentResult] = await Promise.all([
    fetchJson("/api/content", "Falha ao carregar conteúdo remoto:", { carousel: [] }),
    loadNewsPage(newsContainer, 0)
  ]);
  const remoteCarousel = contentResult.carousel || [];
  if (remoteCarousel.length) {
    carousel.append(...remoteCarousel.map(createSlide));
    syncCarouselIndicators(carousel);
  }

  const previousButton = document.getElementById("news-previous");
  const nextButton = document.getElementById("news-next");
  previousButton.addEventListener("click", () => {
    const card = newsContainer.querySelector(".news-card");
    const gap = Number.parseFloat(getComputedStyle(newsContainer).columnGap) || 0;
    newsContainer.scrollBy({ left: -((card?.getBoundingClientRect().width || newsContainer.clientWidth * 0.8) + gap), behavior: "smooth" });
  });
  nextButton.addEventListener("click", async () => {
    if (newsContainer.scrollLeft + newsContainer.clientWidth >= newsContainer.scrollWidth - 80) {
      await loadNextNewsPage(newsContainer);
    }
    const card = newsContainer.querySelector(".news-card");
    const gap = Number.parseFloat(getComputedStyle(newsContainer).columnGap) || 0;
    newsContainer.scrollBy({ left: (card?.getBoundingClientRect().width || newsContainer.clientWidth * 0.8) + gap, behavior: "smooth" });
  });
  newsContainer.addEventListener("scroll", updateNewsControls, { passive: true });
  updateNewsControls();
}

let nextNewsOffset = 0;
let hasMoreNews = true;
let loadingNewsPage = null;

async function loadNewsPage(newsContainer, offset) {
  const response = await fetchJson(
    `/api/posts?feed=1&offset=${offset}`,
    "Falha ao carregar notícias:",
    { items: [], hasMore: false }
  );
  newsContainer.append(...response.items.map(createFeedCard));
  nextNewsOffset = offset + response.items.length;
  hasMoreNews = response.hasMore;
  const count = document.getElementById("news-count");
  count.textContent = `${nextNewsOffset} notícia${nextNewsOffset === 1 ? "" : "s"} carregada${nextNewsOffset === 1 ? "" : "s"}`;
  updateNewsControls();
}

async function loadNextNewsPage(newsContainer) {
  if (!hasMoreNews || loadingNewsPage) return loadingNewsPage;
  loadingNewsPage = loadNewsPage(newsContainer, nextNewsOffset)
    .finally(() => { loadingNewsPage = null; });
  return loadingNewsPage;
}

function updateNewsControls() {
  const newsContainer = document.getElementById("news-container");
  const previousButton = document.getElementById("news-previous");
  const nextButton = document.getElementById("news-next");
  if (!newsContainer || !previousButton || !nextButton) return;
  previousButton.disabled = newsContainer.scrollLeft <= 0;
  nextButton.disabled = !hasMoreNews &&
    newsContainer.scrollLeft + newsContainer.clientWidth >= newsContainer.scrollWidth - 2;
}

async function fetchJson(url, errorMessage, fallback) {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Falha na requisição (${response.status}).`);
    return await response.json();
  } catch (error) {
    console.error(errorMessage, error);
    return fallback;
  }
}

function createFeedCard(item) {
  if (item.tipo === "post") {
    return createPostCard({
      ...item,
      imagemUrl: item.capaUrl,
      resumo: item.texto
    });
  }
  return createNewsCard(item);
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
