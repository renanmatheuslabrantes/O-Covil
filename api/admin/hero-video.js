import { del } from "@vercel/blob";
import { sql } from "../_lib/db.js";
import { requireRole } from "../_lib/auth.js";

const blobHostSuffix = ".public.blob.vercel-storage.com";
const heroVideoPathPattern = /^\/hero\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(mp4|webm)$/i;

export default async function handler(req, res) {
  const session = requireRole(req, res, ["admin"]);
  if (!session) return;

  res.setHeader("Cache-Control", "no-store");

  try {
    if (req.method === "GET") {
      const [setting] = await sql`select value from site_settings where key = 'hero_video_url'`;
      return res.status(200).json({ videoUrl: setting?.value || "" });
    }

    if (req.method === "PUT") {
      const { videoUrl } = req.body || {};
      if (!isValidHeroVideoUrl(videoUrl)) {
        return res.status(400).json({ error: "Envie um vídeo MP4 ou WebM válido." });
      }

      const [previous] = await sql`select value from site_settings where key = 'hero_video_url'`;
      const [setting] = await sql`
        insert into site_settings (key, value)
        values ('hero_video_url', ${videoUrl})
        on conflict (key) do update set value = excluded.value, updated_at = now()
        returning value
      `;

      if (previous?.value && previous.value !== setting.value) {
        await del(previous.value).catch((error) => console.error("Falha ao apagar vídeo de fundo antigo:", error));
      }

      return res.status(200).json({ videoUrl: setting.value });
    }

    return res.status(405).json({ error: "Método não permitido." });
  } catch (error) {
    console.error("Falha ao gerenciar vídeo de fundo:", error);
    return res.status(500).json({ error: "Não foi possível salvar o vídeo de fundo." });
  }
}

function isValidHeroVideoUrl(value) {
  if (typeof value !== "string" || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      url.hostname.endsWith(blobHostSuffix) &&
      heroVideoPathPattern.test(url.pathname);
  } catch {
    return false;
  }
}
