export async function loadRemoteContent(newsContainer, carousel) {
  try {
    const response = await fetch("/api/content");
    if (!response.ok) return;
    const { news, carousel: remoteCarousel } = await response.json();

    if (news.length) newsContainer.replaceChildren(...news.map(createNewsCard));
    if (remoteCarousel.length) {
      carousel.replaceChildren(...remoteCarousel.map(createSlide));
      resetCarouselIndicators(remoteCarousel.length);
    }
  } catch (error) {
    console.error("Falha ao carregar conteúdo remoto:", error);
  }
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

function resetCarouselIndicators(amount) {
  const indicators = document.querySelector(".carousel-indicators");
  if (!indicators) return;
  indicators.replaceChildren(...Array.from({ length: amount }, (_, index) => {
    const dot = document.createElement("span");
    dot.className = `dot${index === 0 ? " active" : ""}`;
    dot.dataset.slide = index;
    return dot;
  }));
}