export function slugifyPostTitle(title) {
  return String(title || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "") || "publicacao";
}

export function postUrl(post) {
  return `/p/post/${slugifyPostTitle(post.titulo)}-${encodeURIComponent(post.id)}`;
}
