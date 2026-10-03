import { sql } from "./_lib/db.js";

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

      const [post] = await sql`select id, titulo, conteudo, imagem_url, criado_em from posts where id = ${id}`;
      if (!post) {
        return res.status(404).json({ error: "Publicação não encontrada." });
      }

      return res.status(200).json({
        id: post.id,
        titulo: post.titulo,
        conteudo: post.conteudo,
        imagemUrl: post.imagem_url,
        criadoEm: post.criado_em
      });
    }

    const posts = await sql`select id, titulo, conteudo, imagem_url, criado_em from posts order by criado_em desc`;
    return res.status(200).json(posts.map((post) => ({
      id: post.id,
      titulo: post.titulo,
      conteudo: post.conteudo,
      imagemUrl: post.imagem_url,
      criadoEm: post.criado_em
    })));
  } catch (error) {
    console.error("Falha ao carregar posts:", error);
    return res.status(500).json({ error: "Não foi possível carregar as publicações." });
  }
}