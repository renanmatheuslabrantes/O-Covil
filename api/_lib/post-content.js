import sanitizeHtml from "sanitize-html";

const richContentPrefix = "rich-html-v1:";
const allowedTags = ["p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "blockquote", "a"];
const richContentOptions = {
  allowedTags,
  allowedAttributes: { a: ["href"] },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { a: ["http", "https", "mailto"] }
};
const plainTextOptions = { allowedTags: [], allowedAttributes: {} };

export function preparePostContent(value) {
  if (typeof value !== "string" || value.length > 20000) return null;

  const html = sanitizeHtml(value, richContentOptions);
  const text = sanitizeHtml(html, plainTextOptions).replace(/\u00a0/g, " ").trim();
  if (!text || text.length > 5000) return null;

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
    autor: post.author_login ? {
      login: post.author_login,
      nome: post.author_display_name || post.author_login,
      descricao: post.author_description || "",
      fotoUrl: post.author_avatar_url || ""
    } : null
  };
}