import { handleUpload } from "@vercel/blob/client";
import { getSession } from "../_lib/auth.js";

const maximumImageSizeInBytes = 5 * 1024 * 1024;
const maximumVideoSizeInBytes = 100 * 1024 * 1024;
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
          maximumSizeInBytes: isHeroVideo ? maximumVideoSizeInBytes : maximumImageSizeInBytes,
          validUntil: Date.now() + 5 * 60 * 1000
        };
      },
      onUploadCompleted: async ({ blob }) => {
        const extension = blob.pathname.split(".").pop().toLowerCase();
        const isHeroVideo = blob.pathname.startsWith("hero/");
        const contentTypes = isHeroVideo ? videoContentTypesByExtension : contentTypesByExtension;
        const maximumSizeInBytes = isHeroVideo ? maximumVideoSizeInBytes : maximumImageSizeInBytes;
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