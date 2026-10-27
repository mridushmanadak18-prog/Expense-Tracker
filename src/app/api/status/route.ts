import { getDatabasePool, isDatabaseConfigured } from "@/lib/server/database";

export async function GET(request: Request) {
  if (!request.headers.has("host")) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!isDatabaseConfigured()) return Response.json({ configured: false });
  try {
    await getDatabasePool().query("SELECT 1");
    return Response.json({ configured: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("SpendSmart PostgreSQL health check failed:", error);
    return Response.json({
      configured: true,
      error: "Could not connect to PostgreSQL. Check that the local server is running, DATABASE_URL is correct, and the schema has been applied.",
    }, { headers: { "Cache-Control": "no-store" } });
  }
}
