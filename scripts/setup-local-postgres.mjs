import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Pool } from "pg";

const adminPassword = process.env.SPENDSMART_POSTGRES_ADMIN_PASSWORD;
const appPassword = process.env.SPENDSMART_APP_PASSWORD;

if (!adminPassword || !appPassword || appPassword.length < 16) {
  console.error("Provide the PostgreSQL administrator password and an app password of at least 16 characters.");
  process.exitCode = 1;
} else {
  const projectRoot = process.cwd();
  const schema = await readFile(resolve(projectRoot, "database", "schema.sql"), "utf8");
  const adminPool = new Pool({
    host: "127.0.0.1",
    port: 5432,
    database: "postgres",
    user: "postgres",
    password: adminPassword,
    connectionTimeoutMillis: 5000,
    max: 1,
  });

  try {
    const databaseResult = await adminPool.query(
      "SELECT pg_get_userbyid(datdba) AS owner FROM pg_database WHERE datname = $1",
      ["spendsmart"],
    );
    if (databaseResult.rows[0] && databaseResult.rows[0].owner !== "spendsmart_app") {
      throw new Error("A database named spendsmart already exists and is not owned by spendsmart_app. No database changes were made.");
    }

    const roleResult = await adminPool.query(
      "SELECT 1 FROM pg_roles WHERE rolname = $1",
      ["spendsmart_app"],
    );
    if (roleResult.rowCount === 0) {
      const passwordLiteral = `'${appPassword.replaceAll("'", "''")}'`;
      await adminPool.query(`CREATE ROLE spendsmart_app LOGIN PASSWORD ${passwordLiteral}`);
    } else {
      const passwordLiteral = `'${appPassword.replaceAll("'", "''")}'`;
      await adminPool.query(`ALTER ROLE spendsmart_app WITH LOGIN PASSWORD ${passwordLiteral}`);
    }

    if (databaseResult.rowCount === 0) {
      await adminPool.query("CREATE DATABASE spendsmart OWNER spendsmart_app");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("not owned by spendsmart_app")) {
      console.error(message);
    } else {
      console.error("Could not prepare PostgreSQL. Verify the server is running on port 5432 and the administrator password is correct.");
      if (typeof error === "object" && error !== null && "code" in error) {
        console.error(`PostgreSQL error code: ${String(error.code)}`);
      }
    }
    process.exitCode = 1;
  } finally {
    await adminPool.end();
  }

  if (process.exitCode !== 1) {
    const appPool = new Pool({
      host: "127.0.0.1",
      port: 5432,
      database: "spendsmart",
      user: "spendsmart_app",
      password: appPassword,
      connectionTimeoutMillis: 5000,
      max: 1,
    });

    try {
      await appPool.query(schema);
      await appPool.query("SELECT 1");

      const encodedPassword = encodeURIComponent(appPassword).replace(/[!'()*]/g, (character) =>
        `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
      );
      const connectionString = `postgresql://spendsmart_app:${encodedPassword}@127.0.0.1:5432/spendsmart`;
      const envPath = resolve(projectRoot, ".env.local");
      let existingEnv = "";
      try {
        existingEnv = await readFile(envPath, "utf8");
      } catch (error) {
        if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
      }

      const databaseUrlLine = `DATABASE_URL=${connectionString}`;
      const updatedEnv = /^DATABASE_URL=.*$/m.test(existingEnv)
        ? existingEnv.replace(/^DATABASE_URL=.*$/m, databaseUrlLine)
        : `${existingEnv}${existingEnv && !existingEnv.endsWith("\n") ? "\n" : ""}${databaseUrlLine}\n`;
      await writeFile(envPath, updatedEnv, { encoding: "utf8", mode: 0o600 });
      console.log("Local PostgreSQL is ready. .env.local has been configured without exposing credentials.");
      console.log("Restart the Next.js server, create your SpendSmart account, then import the JSON backup in Settings.");
    } catch (error) {
      console.error("Could not apply the schema or verify the app database login. Check the PostgreSQL role and schema, then retry.");
      console.error(error instanceof Error ? error.message : "Unknown PostgreSQL setup error.");
      process.exitCode = 1;
    } finally {
      await appPool.end();
    }
  }
}
