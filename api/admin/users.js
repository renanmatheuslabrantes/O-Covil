import { sql } from "../_lib/db.js";
import { requireRole } from "../_lib/auth.js";
import { hashPassword } from "../_lib/password.js";

export default async function handler(req, res) {
  const session = requireRole(req, res, ["admin"]);
  if (!session) return;

  try {
    if (req.method === "GET") {
      const users = await sql`select login, role, created_at from admin_users order by created_at desc`;
      const bootstrapLogin = process.env.ADMIN_USERNAME || process.env.ADMIN_EMAIL;
      if (bootstrapLogin && !users.some((user) => user.login.toLowerCase() === bootstrapLogin.toLowerCase())) {
        users.unshift({ login: bootstrapLogin, role: "admin", created_at: null, isBootstrapAdmin: true });
      }
      return res.status(200).json(users.map((user) => ({
        login: user.login,
        role: user.role,
        createdAt: user.created_at,
        isBootstrapAdmin: user.isBootstrapAdmin === true
      })));
    }

    if (req.method === "POST") {
      const { login, password, role } = req.body || {};
      if (!isValidLogin(login) || !isValidPassword(password) || !["admin", "journalist"].includes(role)) {
        return res.status(400).json({ error: "Informe usuário, senha de pelo menos 12 caracteres e perfil válido." });
      }
      if (role === "admin" && !session.isBootstrapAdmin) {
        return res.status(403).json({ error: "Somente o administrador inicial pode criar outros administradores." });
      }

      const normalizedLogin = login.trim();
      await sql`
        insert into admin_users (login, password_hash, role)
        values (${normalizedLogin}, ${hashPassword(password)}, ${role})
      `;
      await sql`
        insert into admin_profiles (login, display_name)
        values (${normalizedLogin}, ${normalizedLogin})
        on conflict (login) do nothing
      `;
      return res.status(201).json({ login: normalizedLogin, role });
    }

    return res.status(405).json({ error: "Método não permitido." });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "Já existe uma conta com esse usuário." });
    }
    console.error("Falha ao gerenciar contas do painel:", error);
    return res.status(500).json({ error: "Não foi possível gerenciar as contas." });
  }
}

function isValidLogin(value) {
  return typeof value === "string" && /^[a-zA-Z0-9._-]{3,32}$/.test(value.trim());
}

function isValidPassword(value) {
  return typeof value === "string" && value.length >= 12 && value.length <= 128;
}