import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createSession, deleteSession, getAuthenticatedUser, getExpiredSessionCookieOptions, getSessionCookieOptions, getSessionToken, hashPassword, SESSION_COOKIE, verifyPassword } from "@/lib/server/auth";
import { getDatabasePool, isDatabaseConfigured } from "@/lib/server/database";

function getDatabaseError(error: unknown) {
  console.error("SpendSmart authentication request failed:", error);
  if (!isDatabaseConfigured()) {
    return "PostgreSQL is not configured. Add DATABASE_URL to .env.local and restart the app.";
  }
  return "Could not connect to PostgreSQL. Check that the server is running, DATABASE_URL is correct, and the database schema has been applied.";
}

export async function GET() {
  try {
    return Response.json({ user: await getAuthenticatedUser() });
  } catch (error) {
    return Response.json({ error: getDatabaseError(error) }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return Response.json({ error: "Invalid request." }, { status: 400 });
    }

    const input = body as Record<string, unknown>;
    if (input.action === "logout") {
      const token = await getSessionToken();
      if (token) await deleteSession(token);
      const response = NextResponse.json({ success: true });
      response.cookies.set(SESSION_COOKIE, "", getExpiredSessionCookieOptions());
      return response;
    }

    const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
    const password = typeof input.password === "string" ? input.password : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
      return Response.json({ error: "Enter a valid email address and a password with at least 8 characters." }, { status: 400 });
    }

    const pool = getDatabasePool();
    let userId: string;
    if (input.action === "signup") {
      const name = typeof input.name === "string" ? input.name.trim() : "";
      if (!name || name.length > 80) {
        return Response.json({ error: "Enter a name between 1 and 80 characters." }, { status: 400 });
      }
      const passwordHash = await hashPassword(password);
      try {
        const result = await pool.query<{ id: string }>(
          `INSERT INTO app_users (id, email, password_hash, full_name)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          [randomUUID(), email, passwordHash, name],
        );
        userId = result.rows[0].id;
      } catch (error) {
        if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
          return Response.json({ error: "An account with this email already exists. Log in instead." }, { status: 409 });
        }
        throw error;
      }
    } else if (input.action === "login") {
      const result = await pool.query<{ id: string; password_hash: string }>(
        "SELECT id, password_hash FROM app_users WHERE email = $1",
        [email],
      );
      const user = result.rows[0];
      if (!user || !(await verifyPassword(password, user.password_hash))) {
        return Response.json({ error: "Invalid email or password." }, { status: 401 });
      }
      userId = user.id;
    } else {
      return Response.json({ error: "Unsupported authentication action." }, { status: 400 });
    }

    const token = await createSession(userId);
    const user = await getAuthenticatedUserForId(userId);
    const response = NextResponse.json({ user });
    response.cookies.set(SESSION_COOKIE, token, getSessionCookieOptions());
    return response;
  } catch (error) {
    console.error("SpendSmart authentication request failed:", error);
    if (error instanceof SyntaxError) {
      return Response.json({ error: "Invalid JSON request." }, { status: 400 });
    }
    return Response.json({ error: getDatabaseError(error) }, { status: 503 });
  }
}

async function getAuthenticatedUserForId(userId: string) {
  const result = await getDatabasePool().query(
    "SELECT id, full_name AS name, email, currency FROM app_users WHERE id = $1",
    [userId],
  );
  return result.rows[0] ?? null;
}
