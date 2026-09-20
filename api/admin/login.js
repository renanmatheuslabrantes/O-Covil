import { createSessionCookie } from "../_lib/auth.js";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const { email, password } = req.body || {};
  if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "E-mail ou senha inválidos." });
  }

  res.setHeader("Set-Cookie", createSessionCookie(email));
  return res.status(200).json({ ok: true });
}