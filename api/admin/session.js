import { createSessionCookie, getSession } from "../_lib/auth.js";
import { sql } from "../_lib/db.js";
import { verifyPassword } from "../_lib/password.js";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { login, password } = req.body || {};
    const expectedLogin = process.env.ADMIN_USERNAME || process.env.ADMIN_EMAIL;
    if (typeof login !== "string" || typeof password !== "string") {
      return res.status(401).json({ error: "Login ou senha inválidos." });
    }

    if (expectedLogin && normalizeLogin(login) === normalizeLogin(expectedLogin) && password === process.env.ADMIN_PASSWORD) {
      const session = { email: expectedLogin, role: "admin", isBootstrapAdmin: true };
      res.setHeader("Set-Cookie", createSessionCookie(session.email, session.role, session.isBootstrapAdmin));
      return res.status(200).json(session);
    }

    try {
      const [user] = await sql`select login, password_hash, role from admin_users where lower(login) = ${normalizeLogin(login)}`;
      if (!user || !verifyPassword(password, user.password_hash)) {
        return res.status(401).json({ error: "Login ou senha inválidos." });
      }

      const session = { email: user.login, role: user.role, isBootstrapAdmin: false };
      res.setHeader("Set-Cookie", createSessionCookie(session.email, session.role));
      return res.status(200).json(session);
    } catch (error) {
      console.error("Falha ao autenticar usuário do painel:", error);
      return res.status(500).json({ error: "Não foi possível autenticar agora." });
    }
  }

  if (req.method === "GET") {
    const session = getSession(req);
    return res.status(session ? 200 : 401).json(session
      ? { email: session.email, role: session.role, isBootstrapAdmin: session.isBootstrapAdmin === true }
      : { error: "Não autenticado." });
  }

  return res.status(405).json({ error: "Método não permitido." });
}

function normalizeLogin(value) {
  return value.trim().toLowerCase();
}