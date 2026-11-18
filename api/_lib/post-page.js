export function renderPostPage(post, canonicalUrl) {
  const title = escapeHtml(post.titulo);
  const description = escapeHtml(post.resumo || post.titulo);
  const imageUrl = escapeHtml(post.imagem_url);
  const url = escapeHtml(canonicalUrl);

  return `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | O Covil</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="O Covil">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:alt" content="${title}">
  <meta property="og:url" content="${url}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
  <link rel="icon" type="image/x-icon" href="/favicon.ico?v=2">
  <link rel="stylesheet" href="/src/css/style.css">
</head>
<body class="post-page">
  <header>
    <div class="container header-container">
      <a href="/" class="logo">O Covil</a>
    </div>
  </header>
  <main class="container">
    <article class="post-detail">
      <a class="post-back-link" href="/#noticias">&larr; Voltar às novidades</a>
      <p id="post-status" class="post-status" role="status">Carregando publicação...</p>
      <div id="post-content" hidden>
        <h1 id="post-title"></h1>
        <time id="post-date"></time>
        <p id="post-views" class="post-views"></p>
        <img id="post-image" alt="">
        <div id="post-body" class="post-detail-content"></div>
        <aside id="post-author-signature" class="post-author-signature" hidden>
          <img id="post-author-avatar" alt="">
          <div>
            <span>Publicado por</span>
            <strong id="post-author-name"></strong>
            <p id="post-author-description"></p>
          </div>
        </aside>
      </div>
    </article>
  </main>
  <script type="module" src="/src/js/post.js"></script>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}
