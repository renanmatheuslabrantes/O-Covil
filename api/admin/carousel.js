import { del } from "@vercel/blob";
import { sql } from "../_lib/db.js";
import { requireSession } from "../_lib/auth.js";

export default async function handler(req, res) {
  if (!requireSession(req, res)) {
    return;
  }

  try {
    if (req.method === "GET") {
      const items = await sql`select id, legenda, link, imagem_url from carousel order by criado_em asc`;
      return res.status(200).json(items.map((item) => ({ ...item, imagemUrl: item.imagem_url })));
    }
    if (req.method === "POST") {
      const { legenda, link, imagemUrl } = req.body || {};
      if (!isValidText(imagemUrl, 1, 2048) || !isValidOptionalUrl(link)) {
        return res.status(400).json({ error: "Imagem do carrossel inválida." });
      }
      const [item] = await sql`insert into carousel (legenda, link, imagem_url) values (${legenda?.trim() || ""}, ${link?.trim() || ""}, ${imagemUrl}) returning id, legenda, link, imagem_url`;
      return res.status(201).json({ ...item, imagemUrl: item.imagem_url });
    }
    if (req.method === "DELETE") {
      const id = Number(req.query.id);
      if (!Number.isInteger(id)) {
        return res.status(400).json({ error: "Identificador inválido." });
      }
      const [item] = await sql`delete from carousel where id = ${id} returning imagem_url`;
      if (item?.imagem_url) await del(item.imagem_url).catch((error) => console.error("Falha ao apagar imagem do Blob:", error));
      return res.status(204).end();
    }
    return res.status(405).json({ error: "Método não permitido." });
  } catch (error) {
    console.error("Falha ao gerenciar carrossel:", error);
    return res.status(500).json({ error: "Não foi possível gerenciar o carrossel." });
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
