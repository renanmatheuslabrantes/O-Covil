import { del } from "@vercel/blob";
import { sql } from "../_lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: "Não autorizado." });
  }

  try {
    const expiredNews = await sql`
      delete from news
      where criado_em <= now() - interval '30 days'
      returning capa_url
    `;
    const imageUrls = [...new Set(expiredNews.map((item) => item.capa_url).filter(isPublicBlobUrl))];
    const imageResults = await Promise.allSettled(imageUrls.map((url) => del(url)));
    const failedImages = imageResults.filter((result) => result.status === "rejected");

    if (failedImages.length > 0) {
      console.error(`Falha ao apagar ${failedImages.length} imagem(ns) de notícias expiradas.`);
    }

    return res.status(200).json({
      deletedNews: expiredNews.length,
      deletedImages: imageUrls.length - failedImages.length,
      failedImages: failedImages.length
    });
  } catch (error) {
    console.error("Falha ao limpar notícias expiradas:", error);
    return res.status(500).json({ error: "Não foi possível limpar notícias expiradas." });
  }
}

function isPublicBlobUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}