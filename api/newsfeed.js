import { sql } from "./_lib/db.js";

const pageSize = 12;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const offset = Number(req.query.offset || 0);
  if (!Number.isSafeInteger(offset) || offset < 0 || offset > 1000000) {
    return res.status(400).json({ error: "Página inválida." });
  }

  res.setHeader("Cache-Control", "no-store");

  try {
    const items = await sql`
      select * from (
        select id, 'post'::text as tipo, titulo, resumo as texto, ''::text as link,
          imagem_url as capa_url, criado_em
        from posts
        union all
        select id, 'news'::text as tipo, titulo, texto, link, capa_url, criado_em
        from news
        where criado_em > now() - interval '30 days'
      ) as feed
      order by criado_em desc, tipo asc, id desc
      limit ${pageSize + 1} offset ${offset}
    `;
    const hasMore = items.length > pageSize;
    const page = items.slice(0, pageSize);

    return res.status(200).json({
      items: page.map((item) => ({
        ...item,
        capaUrl: item.capa_url,
        criadoEm: item.criado_em
      })),
      hasMore
    });
  } catch (error) {
    console.error("Falha ao carregar novidades:", error);
    return res.status(500).json({ error: "Não foi possível carregar as novidades." });
  }
}
