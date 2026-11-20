import { del } from "@vercel/blob";
import { handleUpload } from "@vercel/blob/client";
import { getSession, requireRole } from "../_lib/auth.js";
import { sql } from "../_lib/db.js";

const maximumPostImageSizeInBytes = 10 * 1024 * 1024;
const maximumOtherImageSizeInBytes = 5 * 1024 * 1024;
const maximumVideoSizeInBytes = 100 * 1024 * 1024;
const blobHostSuffix = ".public.blob.vercel-storage.com";
const heroVideoPathPattern = /^\/hero\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(mp4|webm)$/i;
const contentTypesByExtension = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif"
};
const videoContentTypesByExtension = {
  mp4: "video/mp4",
  webm: "video/webm"
};

export default async function handler(req, res) {
  if (req.method === "GET" || req.method === "PUT") {
    const session = requireRole(req, res, ["admin"]);
    if (!session) return;

    res.setHeader("Cache-Control", "no-store");

    try {
      if (req.method === "GET") {
        const [setting] = await sql`select value from site_settings where key = 'hero_video_url'`;
        return res.status(200).json({ videoUrl: setting?.value || "" });
      }

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
    } catch (error) {
      console.error("Falha ao gerenciar vídeo de fundo:", error);
      return res.status(500).json({ error: "Não foi possível salvar o vídeo de fundo." });
    }
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    const response = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Upload tokens are issued only to authenticated panel accounts.
        if (!getSession(req)) {
          throw new Error("UNAUTHORIZED");
        }

        const imageMatch = pathname.match(/^(posts|content|profiles)\/([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\.(jpg|jpeg|png|webp|gif)$/i);
        const videoMatch = pathname.match(/^hero\/([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\.(mp4|webm)$/i);
        const isHeroVideo = Boolean(videoMatch);
        const isPostImage = imageMatch?.[1] === "posts";
        const isCarouselAsset = imageMatch?.[1] === "content";
        const match = imageMatch || videoMatch;
        const extension = imageMatch ? imageMatch[3].toLowerCase() : videoMatch?.[2].toLowerCase();
        const contentTypes = isHeroVideo ? videoContentTypesByExtension : contentTypesByExtension;
        let metadata;
        try {
          metadata = JSON.parse(clientPayload || "{}");
        } catch {
          throw new Error("Arquivo de imagem inválido.");
        }

        if (
          !match ||
          (extension === "gif" && !isCarouselAsset) ||
          (isHeroVideo && getSession(req)?.role !== "admin") ||
          !metadata ||
          contentTypes[extension] !== metadata.contentType
        ) {
          throw new Error("Extensão e tipo do arquivo não correspondem.");
        }

        return {
          allowedContentTypes: isHeroVideo
            ? ["video/mp4", "video/webm"]
            : isCarouselAsset
              ? ["image/jpeg", "image/png", "image/webp", "image/gif"]
              : ["image/jpeg", "image/png", "image/webp"],
          maximumSizeInBytes: isHeroVideo
            ? maximumVideoSizeInBytes
            : isPostImage
              ? maximumPostImageSizeInBytes
              : maximumOtherImageSizeInBytes,
          validUntil: Date.now() + 5 * 60 * 1000
        };
      },
      onUploadCompleted: async ({ blob }) => {
        const extension = blob.pathname.split(".").pop().toLowerCase();
        const isHeroVideo = blob.pathname.startsWith("hero/");
        const isPostImage = blob.pathname.startsWith("posts/");
        const contentTypes = isHeroVideo ? videoContentTypesByExtension : contentTypesByExtension;
        const maximumSizeInBytes = isHeroVideo
          ? maximumVideoSizeInBytes
          : isPostImage
            ? maximumPostImageSizeInBytes
            : maximumOtherImageSizeInBytes;
        if (blob.size > maximumSizeInBytes || contentTypes[extension] !== blob.contentType) {
          throw new Error("Arquivo enviado não passou na validação.");
        }
      }
    });

    return res.status(200).json(response);
  } catch (error) {
    if (error.message === "UNAUTHORIZED") {
      return res.status(401).json({ error: "Não autorizado." });
    }
    console.error("Falha ao gerar token de upload:", error);
    return res.status(400).json({ error: error.message || "Não foi possível enviar a imagem." });
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
