import { sql } from "./_lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  res.setHeader("Cache-Control", "no-store");

  try {
    const [news, carousel, heroVideo] = await Promise.all([
      sql`select id, titulo, texto, link, capa_url, criado_em from news where criado_em > now() - interval '30 days' order by criado_em desc limit 12`,
      sql`select id, legenda, link, imagem_url, criado_em from carousel order by criado_em asc`,
      sql`select value from site_settings where key = 'hero_video_url'`
    ]);

    return res.status(200).json({
      news: news.map((item) => ({ ...item, capaUrl: item.capa_url, criadoEm: item.criado_em })),
      carousel: carousel.map((item) => ({ ...item, imagemUrl: item.imagem_url, criadoEm: item.criado_em })),
      heroVideoUrl: heroVideo[0]?.value || ""
    });
  } catch (error) {
    console.error("Falha ao carregar conteúdo:", error);
    return res.status(500).json({ error: "Não foi possível carregar o conteúdo." });
  }
}