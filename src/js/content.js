const newsPageSize = 12;

export async function loadRemoteContent(newsContainer, carousel) {
  const [contentResult, firstNewsPage] = await Promise.all([
    fetchJson("/api/content", "Falha ao carregar conteúdo remoto:", { carousel: [] }),
    fetchNewsPage(0)
  ]);
  newsPages = [firstNewsPage];
  renderNewsPage(newsContainer, newsPages[0], false);

  const remoteCarousel = contentResult.carousel || [];
  if (remoteCarousel.length) {
    carousel.append(...remoteCarousel.map(createSlide));
    syncCarouselIndicators(carousel);
  }

  const previousButton = document.getElementById("news-previous");
  const nextButton = document.getElementById("news-next");
  previousButton.addEventListener("click", () => {
    changeNewsPage(newsContainer, currentNewsPage - 1);
  });
  nextButton.addEventListener("click", () => {
    changeNewsPage(newsContainer, currentNewsPage + 1);
  });
  updateNewsControls();
}

let newsPages = [];
let currentNewsPage = 0;
let changingNewsPage = false;

async function fetchNewsPage(pageNumber) {
  const response = await fetchJson(
    `/api/posts?feed=1&offset=${pageNumber * newsPageSize}`,
    "Falha ao carregar notícias:",
    { items: [], hasMore: false }
  );
  return response;
}

async function changeNewsPage(newsContainer, pageNumber) {
  if (changingNewsPage || pageNumber < 0) return;
  if (pageNumber > currentNewsPage && !newsPages[currentNewsPage]?.hasMore) return;

  changingNewsPage = true;
  updateNewsControls();
  let page = newsPages[pageNumber];
  if (!page) {
    page = await fetchNewsPage(pageNumber);
    newsPages[pageNumber] = page;
  }

  const direction = pageNumber > currentNewsPage ? "forward" : "backward";
  newsContainer.classList.add("news-page-changing", `news-page-${direction}`);
  await new Promise((resolve) => setTimeout(resolve, 180));
  currentNewsPage = pageNumber;
  renderNewsPage(newsContainer, page, true);
  newsContainer.scrollTop = 0;
  requestAnimationFrame(() => {
    newsContainer.classList.remove("news-page-changing", `news-page-${direction}`);
  });
  await new Promise((resolve) => setTimeout(resolve, 180));
  changingNewsPage = false;
  updateNewsControls();
}

function renderNewsPage(newsContainer, page, transition) {
  newsContainer.replaceChildren(...page.items.map(createFeedCard));
  if (!transition) newsContainer.classList.remove("news-page-changing");
  const count = document.getElementById("news-count");
  const firstItem = pageNumberStart(currentNewsPage);
  const lastItem = firstItem + page.items.length - 1;
  count.textContent = `Página ${currentNewsPage + 1} · notícias ${firstItem}–${lastItem}`;
}

function updateNewsControls() {
  const previousButton = document.getElementById("news-previous");
  const nextButton = document.getElementById("news-next");
  if (!previousButton || !nextButton) return;
  previousButton.disabled = changingNewsPage || currentNewsPage === 0;
  nextButton.disabled = changingNewsPage || !newsPages[currentNewsPage]?.hasMore;
}

function pageNumberStart(pageNumber) {
  return pageNumber * newsPageSize + 1;
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
