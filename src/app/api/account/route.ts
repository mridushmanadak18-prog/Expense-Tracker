import { getAuthenticatedUser } from "@/lib/server/auth";
import type { LocalAccount } from "@/lib/local-data";
import { parseBackup } from "@/lib/local-data";
import { getDatabasePool, isDatabaseConfigured } from "@/lib/server/database";

function getDatabaseError(error: unknown) {
  console.error("SpendSmart account request failed:", error);
  if (!isDatabaseConfigured()) {
    return "PostgreSQL is not configured. Add DATABASE_URL to .env.local and restart the app.";
  }
  return "Could not access PostgreSQL. Check that the server is running, DATABASE_URL is correct, and the database schema has been applied.";
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return Response.json({ account: null });
    const pool = getDatabasePool();
    const [transactions, budgets, goals, recurring] = await Promise.all([
      pool.query("SELECT id, description, amount, type, category, date::text, payment_method, notes FROM transactions WHERE user_id = $1 ORDER BY date DESC", [user.id]),
      pool.query("SELECT id, category, amount_limit, month FROM budgets WHERE user_id = $1 ORDER BY month DESC", [user.id]),
      pool.query("SELECT id, title, target_amount, saved_amount, target_date::text FROM savings_goals WHERE user_id = $1 ORDER BY created_at", [user.id]),
      pool.query("SELECT id, description, amount, type, category, day_of_month, active, last_generated FROM recurring_rules WHERE user_id = $1 ORDER BY created_at", [user.id]),
    ]);

    const account: LocalAccount = {
      ...user,
      transactions: transactions.rows.map((row) => ({
        id: row.id,
        description: row.description,
        amount: Number(row.amount),
        type: row.type,
        category: row.category,
        date: row.date,
        paymentMethod: row.payment_method,
        notes: row.notes,
      })),
      budgets: budgets.rows.map((row) => ({
        id: row.id,
        category: row.category,
        limit: Number(row.amount_limit),
        month: row.month,
      })),
      goals: goals.rows.map((row) => ({
        id: row.id,
        title: row.title,
        target: Number(row.target_amount),
        saved: Number(row.saved_amount),
        targetDate: row.target_date ?? "",
      })),
      recurring: recurring.rows.map((row) => ({
        id: row.id,
        description: row.description,
        amount: Number(row.amount),
        type: row.type,
        category: row.category,
        day: row.day_of_month,
        active: row.active,
        lastGenerated: row.last_generated,
      })),
    };
    return Response.json({ account });
  } catch (error) {
    return Response.json({ error: getDatabaseError(error) }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  let connection;
  try {
    const user = await getAuthenticatedUser();
    if (!user) return Response.json({ error: "Sign in to save your account." }, { status: 401 });
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return Response.json({ error: "Invalid account data." }, { status: 400 });
    }
    const input = body as Record<string, unknown>;
    if (input.id !== user.id) {
      return Response.json({ error: "The account does not match your signed-in user." }, { status: 403 });
    }
    const backup = parseBackup(body);
    if (!backup) return Response.json({ error: "Invalid SpendSmart account data." }, { status: 400 });

    connection = await getDatabasePool().connect();
    await connection.query("BEGIN");
    await connection.query("UPDATE app_users SET full_name = $2, currency = $3 WHERE id = $1", [
      user.id,
      backup.name,
      backup.currency,
    ]);
    await connection.query("DELETE FROM transactions WHERE user_id = $1", [user.id]);
    await connection.query("DELETE FROM budgets WHERE user_id = $1", [user.id]);
    await connection.query("DELETE FROM savings_goals WHERE user_id = $1", [user.id]);
    await connection.query("DELETE FROM recurring_rules WHERE user_id = $1", [user.id]);

    for (const item of backup.transactions) {
      await connection.query(
        `INSERT INTO transactions
          (id, user_id, description, amount, type, category, date, payment_method, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [item.id, user.id, item.description, item.amount, item.type, item.category, item.date, item.paymentMethod, item.notes],
      );
    }
    for (const item of backup.budgets) {
      await connection.query(
        "INSERT INTO budgets (id, user_id, category, amount_limit, month) VALUES ($1, $2, $3, $4, $5)",
        [item.id, user.id, item.category, item.limit, item.month],
      );
    }
    for (const item of backup.goals) {
      await connection.query(
        "INSERT INTO savings_goals (id, user_id, title, target_amount, saved_amount, target_date) VALUES ($1, $2, $3, $4, $5, $6)",
        [item.id, user.id, item.title, item.target, item.saved, item.targetDate || null],
      );
    }
    for (const item of backup.recurring) {
      await connection.query(
        `INSERT INTO recurring_rules
          (id, user_id, description, amount, type, category, day_of_month, active, last_generated)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [item.id, user.id, item.description, item.amount, item.type, item.category, item.day, item.active, item.lastGenerated],
      );
    }
    await connection.query("COMMIT");
    return Response.json({ success: true });
  } catch (error) {
    if (connection) {
      try {
        await connection.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Could not roll back failed SpendSmart account save:", rollbackError);
      }
    }
    if (error instanceof SyntaxError) {
      return Response.json({ error: "Invalid JSON request." }, { status: 400 });
    }
    return Response.json({ error: getDatabaseError(error) }, { status: 503 });
  } finally {
    connection?.release();
  }
}
