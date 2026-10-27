import "server-only";
import { Pool } from "pg";

declare global {
  var spendSmartPool: Pool | undefined;
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getDatabasePool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("PostgreSQL is not configured. Add DATABASE_URL to .env.local and restart the app.");
  }
  globalThis.spendSmartPool ??= new Pool({ connectionString });
  return globalThis.spendSmartPool;
}
