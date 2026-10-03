import { del } from "@vercel/blob";
import { sql } from "../_lib/db.js";
import { requireRole } from "../_lib/auth.js";

export default async function handler(req, res) {
  if (!requireRole(req, res, ["admin"])) return;

  try {
    if (req.method === "GET") {
      const items = await sql`select id, titulo, texto, link, capa_url from news where criado_em > now() - interval '30 days' order by criado_em desc`;
      return res.status(200).json(items.map((item) => ({ ...item, capaUrl: item.capa_url })));
    }
    if (req.method === "POST") {
      const { titulo, texto, link, capaUrl } = req.body || {};
      if (!isValidText(titulo, 1, 120) || !isValidText(texto, 1, 2000) || !isValidText(capaUrl, 1, 2048) || !isValidOptionalUrl(link)) {
        return res.status(400).json({ error: "Dados da notícia inválidos." });
      }
      const [item] = await sql`insert into news (titulo, texto, link, capa_url) values (${titulo.trim()}, ${texto.trim()}, ${link?.trim() || ""}, ${capaUrl}) returning id, titulo, texto, link, capa_url`;
      return res.status(201).json({ ...item, capaUrl: item.capa_url });
    }
    if (req.method === "DELETE") {
      const id = Number(req.query.id);
      if (!Number.isInteger(id)) {
        return res.status(400).json({ error: "Identificador inválido." });
      }
      const [item] = await sql`delete from news where id = ${id} returning capa_url`;
      if (item?.capa_url) await del(item.capa_url).catch((error) => console.error("Falha ao apagar imagem do Blob:", error));
      return res.status(204).end();
    }
    return res.status(405).json({ error: "Método não permitido." });
  } catch (error) {
    console.error("Falha ao gerenciar notícia:", error);
    return res.status(500).json({ error: "Não foi possível gerenciar a notícia." });
  }
}

function isValidText(value, minimum, maximum) {
  return typeof value === "string" && value.trim().length >= minimum && value.trim().length <= maximum;
}

function isValidOptionalUrl(value) {
  if (value === undefined || value === null || value === "") return true;
  if (typeof value !== "string" || value.length > 2048) return false;
  try {
    return ["http:", "https:"].includes(new URL(value.trim()).protocol);
  } catch {
    return false;
  }
}
