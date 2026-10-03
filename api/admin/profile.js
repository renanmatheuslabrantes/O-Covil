import { del } from "@vercel/blob";
import { sql } from "../_lib/db.js";
import { requireSession } from "../_lib/auth.js";

const blobHostSuffix = ".public.blob.vercel-storage.com";
const profileImagePathPattern = /^\/profiles\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$/i;

export default async function handler(req, res) {
  const session = requireSession(req, res);
  if (!session) return;

  try {
    if (req.method === "GET") {
      const [profile] = await sql`
        select login, display_name, description, avatar_url
        from admin_profiles where lower(login) = lower(${session.email})
      `;
      return res.status(200).json({
        login: session.email,
        displayName: profile?.display_name || session.email,
        description: profile?.description || "",
        avatarUrl: profile?.avatar_url || ""
      });
    }

    if (req.method === "PUT") {
      const { displayName, description, avatarUrl } = req.body || {};
      if (!isValidDisplayName(displayName) || !isValidDescription(description) || !isValidAvatarUrl(avatarUrl)) {
        return res.status(400).json({ error: "Confira o nome, a descrição e a foto de perfil." });
      }

      const [previous] = await sql`
        select avatar_url from admin_profiles where lower(login) = lower(${session.email})
      `;
      const [profile] = await sql`
        insert into admin_profiles (login, display_name, description, avatar_url)
        values (${session.email}, ${displayName.trim()}, ${description.trim()}, ${avatarUrl || ""})
        on conflict (login) do update set
          display_name = excluded.display_name,
          description = excluded.description,
          avatar_url = excluded.avatar_url,
          updated_at = now()
        returning login, display_name, description, avatar_url
      `;

      if (previous?.avatar_url && previous.avatar_url !== profile.avatar_url) {
        await del(previous.avatar_url).catch((error) => console.error("Falha ao apagar foto de perfil antiga:", error));
      }

      return res.status(200).json({
        login: profile.login,
        displayName: profile.display_name,
        description: profile.description,
        avatarUrl: profile.avatar_url
      });
    }

    return res.status(405).json({ error: "Método não permitido." });
  } catch (error) {
    console.error("Falha ao carregar perfil do painel:", error);
    return res.status(500).json({ error: "Não foi possível salvar o perfil." });
  }
}

function isValidDisplayName(value) {
  return typeof value === "string" && value.trim().length >= 2 && value.trim().length <= 80;
}

function isValidDescription(value) {
  return typeof value === "string" && value.length <= 500;
}

function isValidAvatarUrl(value) {
  if (value === "") return true;
  if (typeof value !== "string" || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(blobHostSuffix) && profileImagePathPattern.test(url.pathname);
  } catch {
    return false;
  }
}