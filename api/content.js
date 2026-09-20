import { sql } from "./_lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    const [news, carousel] = await Promise.all([
      sql`select id, titulo, texto, link, capa_url, criado_em from news order by criado_em desc`,
      sql`select id, legenda, link, imagem_url, criado_em from carousel order by criado_em asc`
    ]);

    return res.status(200).json({
      news: news.map((item) => ({ ...item, capaUrl: item.capa_url, criadoEm: item.criado_em })),
      carousel: carousel.map((item) => ({ ...item, imagemUrl: item.imagem_url, criadoEm: item.criado_em }))
    });
  } catch (error) {
    console.error("Falha ao carregar conteúdo:", error);
    return res.status(500).json({ error: "Não foi possível carregar o conteúdo." });
  }
}