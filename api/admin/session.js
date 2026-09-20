import { getSession } from "../_lib/auth.js";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido." });
  }
  const session = getSession(req);
  return res.status(session ? 200 : 401).json(session ? { email: session.email } : { error: "Não autenticado." });
}