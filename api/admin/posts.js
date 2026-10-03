import { del } from "@vercel/blob";
import { sql } from "../_lib/db.js";
import { requireSession } from "../_lib/auth.js";
import { preparePostContent, toPublicPost } from "../_lib/post-content.js";

const maximumImageSize = 5 * 1024 * 1024;
const blobHostSuffix = ".public.blob.vercel-storage.com";
const postImagePathPattern = /^\/posts\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$/i;

export default async function handler(req, res) {
  const session = requireSession(req, res);
  if (!session) return;

  try {
    if (req.method === "GET") {
      const posts = await sql`select id, titulo, conteudo, imagem_url, criado_em from posts order by criado_em desc`;
      return res.status(200).json(posts.map((post) => ({ ...post, imagemUrl: post.imagem_url })));
    }

    if (req.method === "POST") {
      const { titulo, conteudo, imagemUrl } = req.body || {};
      const preparedContent = preparePostContent(conteudo);
      if (!isValidText(titulo, 120) || !preparedContent || !isValidImageUrl(imagemUrl)) {
        return res.status(400).json({ error: "Informe título, conteúdo e uma imagem válida." });
      }

      const [rateLimit] = await sql`
        insert into post_rate_limits (admin_login, window_started_at, request_count)
        values (${session.email}, now(), 1)
        on conflict (admin_login) do update
        set window_started_at = case
              when post_rate_limits.window_started_at <= now() - interval '1 hour' then now()
              else post_rate_limits.window_started_at
            end,
            request_count = case
              when post_rate_limits.window_started_at <= now() - interval '1 hour' then 1
              else post_rate_limits.request_count + 1
            end
        returning request_count
      `;

      if (rateLimit.request_count > 10) {
        return res.status(429).json({ error: "Limite de 10 publicações por hora atingido." });
      }

      const [post] = await sql`
        insert into posts (titulo, conteudo, imagem_url, author_login)
        values (${titulo.trim()}, ${preparedContent.stored}, ${imagemUrl}, ${session.email})
        returning id, titulo, conteudo, imagem_url, criado_em, author_login
      `;
      return res.status(201).json(toPublicPost(post));
    }

    if (req.method === "DELETE") {
      if (session.role !== "admin") {
        return res.status(403).json({ error: "Somente administradores podem remover publicações." });
      }
      const id = Number(req.query.id);
      if (!Number.isSafeInteger(id) || id < 1) {
        return res.status(400).json({ error: "Identificador inválido." });
      }

      const [post] = await sql`delete from posts where id = ${id} returning imagem_url`;
      if (post?.imagem_url) {
        await del(post.imagem_url).catch((error) => console.error("Falha ao apagar imagem do Blob:", error));
      }
      return res.status(204).end();
    }

    return res.status(405).json({ error: "Método não permitido." });
  } catch (error) {
    console.error("Falha ao gerenciar posts:", error);
    return res.status(500).json({ error: "Não foi possível concluir a operação." });
  }
}

function isValidText(value, maximum) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= maximum;
}

function isValidImageUrl(value) {
  if (typeof value !== "string" || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(blobHostSuffix) && postImagePathPattern.test(url.pathname);
  } catch {
    return false;
  }
}