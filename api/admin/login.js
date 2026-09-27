import { createSessionCookie } from "../_lib/auth.js";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const { login, password } = req.body || {};
  const expectedLogin = process.env.ADMIN_USERNAME || process.env.ADMIN_EMAIL;
  if (login !== expectedLogin || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Login ou senha inválidos." });
  }

  res.setHeader("Set-Cookie", createSessionCookie(login));
  return res.status(200).json({ ok: true });
}