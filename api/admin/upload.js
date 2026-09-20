import { put } from "@vercel/blob";
import { requireSession } from "../_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }
  if (!requireSession(req, res)) {
    return;
  }

  const { fileName, contentType, data } = req.body || {};
  if (!fileName || !contentType?.startsWith("image/") || typeof data !== "string") {
    return res.status(400).json({ error: "Arquivo de imagem inválido." });
  }

  const buffer = Buffer.from(data, "base64");
  if (buffer.length === 0 || buffer.length > 3 * 1024 * 1024) {
    return res.status(400).json({ error: "A imagem deve ter no máximo 3 MB." });
  }

  try {
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
    const blob = await put(`content/${Date.now()}-${safeName}`, buffer, { access: "public", contentType });
    return res.status(201).json({ url: blob.url });
  } catch (error) {
    console.error("Falha ao enviar imagem:", error);
    return res.status(500).json({ error: "Não foi possível enviar a imagem." });
  }
}