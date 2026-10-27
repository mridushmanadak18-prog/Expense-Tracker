import "server-only";
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { getDatabasePool } from "@/lib/server/database";

const scrypt = promisify(scryptCallback);
export const SESSION_COOKIE = "spendsmart_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30;

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  currency: string;
};

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const derivedKey = await scrypt(password, salt, 64) as Buffer;
  return `scrypt$${salt}$${derivedKey.toString("base64url")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, encodedKey] = storedHash.split("$");
  if (algorithm !== "scrypt" || !salt || !encodedKey) return false;
  const expectedKey = Buffer.from(encodedKey, "base64url");
  const actualKey = await scrypt(password, salt, expectedKey.length) as Buffer;
  return actualKey.length === expectedKey.length && timingSafeEqual(actualKey, expectedKey);
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000);
  const pool = getDatabasePool();
  await pool.query("DELETE FROM app_sessions WHERE expires_at <= now()");
  await pool.query(
    "INSERT INTO app_sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)",
    [tokenHash, userId, expiresAt],
  );
  return token;
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  };
}

export function getExpiredSessionCookieOptions() {
  return { ...getSessionCookieOptions(), maxAge: 0 };
}

export async function getSessionToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const token = await getSessionToken();
  if (!token) return null;
  const result = await getDatabasePool().query<AuthenticatedUser>(
    `SELECT users.id, users.full_name AS name, users.email, users.currency
     FROM app_sessions AS sessions
     JOIN app_users AS users ON users.id = sessions.user_id
     WHERE sessions.token_hash = $1 AND sessions.expires_at > now()`,
    [hashSessionToken(token)],
  );
  return result.rows[0] ?? null;
}

export async function deleteSession(token: string) {
  await getDatabasePool().query(
    "DELETE FROM app_sessions WHERE token_hash = $1",
    [hashSessionToken(token)],
  );
}
