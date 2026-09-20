import { sql } from "./_lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const { nome, discord, email, motivo } = req.body || {};
  if (!isValidText(nome, 2, 80) || !isValidText(discord, 2, 80) || !isValidText(email, 5, 160) || !isValidText(motivo, 10, 2000)) {
    return res.status(400).json({ error: "Preencha todos os campos corretamente." });
  }

  try {
    await sql`insert into alistamentos (nome, discord, email, motivo) values (${nome.trim()}, ${discord.trim()}, ${email.trim()}, ${motivo.trim()})`;
    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error("Falha ao salvar alistamento:", error);
    return res.status(500).json({ error: "Não foi possível enviar agora." });
  }
}

function isValidText(value, minimum, maximum) {
  return typeof value === "string" && value.trim().length >= minimum && value.trim().length <= maximum;
}