import crypto from "node:crypto";

const cookieName = "ocovil_session";

export function createSessionCookie(email) {
  const payload = Buffer.from(JSON.stringify({ email, expiresAt: Date.now() + 8 * 60 * 60 * 1000 })).toString("base64url");
  const signature = sign(payload);
  return `${cookieName}=${payload}.${signature}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`;
}

export function clearSessionCookie() {
  return `${cookieName}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export function getSession(req) {
  const cookies = Object.fromEntries((req.headers.cookie || "").split(";").filter(Boolean).map((part) => {
    const separator = part.indexOf("=");
    return [part.slice(0, separator).trim(), part.slice(separator + 1)];
  }));
  const value = cookies[cookieName];
  if (!value) {
    return null;
  }

  const [payload, signature] = value.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload))) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return session.expiresAt > Date.now() ? session : null;
  } catch {
    return null;
  }
}

export function requireSession(req, res) {
  const session = getSession(req);
  if (!session) {
    res.status(401).json({ error: "Não autorizado." });
    return null;
  }
  return session;
}

function sign(payload) {
  return crypto.createHmac("sha256", process.env.AUTH_SECRET).update(payload).digest("base64url");
}

function safeEqual(first, second) {
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);
  return firstBuffer.length === secondBuffer.length && crypto.timingSafeEqual(firstBuffer, secondBuffer);
}