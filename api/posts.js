import { sql } from "./_lib/db.js";
import { toPublicPost } from "./_lib/post-content.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  res.setHeader("Cache-Control", "no-store");

  try {
    if (req.query.id !== undefined) {
      const id = Number(req.query.id);
      if (!Number.isSafeInteger(id) || id < 1) {
        return res.status(400).json({ error: "Identificador inválido." });
      }

      const [post] = await sql`
        with viewed_post as (
          update posts
          set visualizacoes = visualizacoes + 1
          where id = ${id}
          returning id, titulo, resumo, conteudo, imagem_url, criado_em, author_login, visualizacoes
        )
        select viewed_post.id, viewed_post.titulo, viewed_post.resumo, viewed_post.conteudo,
          viewed_post.imagem_url, viewed_post.criado_em, viewed_post.author_login, viewed_post.visualizacoes,
          profiles.display_name as author_display_name,
          profiles.description as author_description,
          profiles.avatar_url as author_avatar_url
        from viewed_post
        left join admin_profiles as profiles on lower(profiles.login) = lower(viewed_post.author_login)
      `;
      if (!post) {
        return res.status(404).json({ error: "Publicação não encontrada." });
      }

      return res.status(200).json(toPublicPost(post));
    }

    const posts = await sql`
      select posts.id, posts.titulo, posts.resumo, posts.conteudo, posts.imagem_url, posts.criado_em, posts.author_login,
        posts.visualizacoes,
        profiles.display_name as author_display_name,
        profiles.description as author_description,
        profiles.avatar_url as author_avatar_url
      from posts
      left join admin_profiles as profiles on lower(profiles.login) = lower(posts.author_login)
      order by posts.criado_em desc
      limit 12
    `;
    return res.status(200).json(posts.map(toPublicPost));
  } catch (error) {
    console.error("Falha ao carregar posts:", error);
    return res.status(500).json({ error: "Não foi possível carregar as publicações." });
  }
}