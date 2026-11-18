import sanitizeHtml from "sanitize-html";

const richContentPrefix = "rich-html-v1:";
const allowedTags = ["p", "br", "h2", "h3", "strong", "b", "em", "i", "u", "ul", "ol", "li", "blockquote", "a", "img"];
const blobHostSuffix = ".public.blob.vercel-storage.com";
const postImagePathPattern = /^\/posts\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$/i;
const richContentOptions = {
  allowedTags,
  allowedAttributes: { a: ["href"], img: ["src", "alt"] },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { a: ["http", "https", "mailto"], img: ["https"] },
  exclusiveFilter: (frame) => frame.tag === "img" && !isValidPostImageUrl(frame.attribs.src)
};
const plainTextOptions = { allowedTags: [], allowedAttributes: {} };

export function preparePostContent(value) {
  if (typeof value !== "string" || value.length > 20000) return null;

  const html = sanitizeHtml(value, richContentOptions);
  const text = sanitizeHtml(html, plainTextOptions).replace(/\u00a0/g, " ").trim();
  if (!text || text.length > 10000) return null;

  return { stored: `${richContentPrefix}${html}` };
}

export function toPublicPost(post) {
  const isRichContent = post.conteudo.startsWith(richContentPrefix);
  const html = isRichContent ? sanitizeHtml(post.conteudo.slice(richContentPrefix.length), richContentOptions) : null;
  const text = isRichContent ? sanitizeHtml(html, plainTextOptions) : post.conteudo;

  return {
    id: post.id,
    titulo: post.titulo,
    resumo: post.resumo || "",
    conteudo: text,
    conteudoHtml: html,
    imagemUrl: post.imagem_url,
    criadoEm: post.criado_em,
    visualizacoes: Number(post.visualizacoes || 0),
    autor: post.author_login ? {
      login: post.author_login,
      nome: post.author_display_name || post.author_login,
      descricao: post.author_description || "",
      fotoUrl: post.author_avatar_url || ""
    } : null
  };
}

export function extractPostImageUrls(value) {
  if (typeof value !== "string" || !value.startsWith(richContentPrefix)) return [];
  const content = value.slice(richContentPrefix.length);
  const urls = [...content.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/gi)].map((match) => match[1]);
  return urls.filter(isValidPostImageUrl);
}

function isValidPostImageUrl(value) {
  if (typeof value !== "string" || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      url.hostname.endsWith(blobHostSuffix) &&
      postImagePathPattern.test(url.pathname);
  } catch {
    return false;
  }
}