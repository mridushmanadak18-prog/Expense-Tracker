# SpendSmart

Personal finance app for tracking income, expenses, budgets, and savings. The Next.js server connects to a local PostgreSQL database; users authenticate with individual accounts, and each account's financial records are loaded from and saved to PostgreSQL.

## Features

- Email/password sign-up, login, and sign-out
- Transactions: create, edit, search, filter, and delete
- Monthly category budgets and savings goals with recorded contributions
- Recurring rules with explicit once-per-month transaction generation
- Dashboard metrics, monthly trends, category analytics, and CSV export
- JSON backup and import to the currently signed-in account
- Currency preference and remote finance-data clearing

Bank connections, automatic scheduled recurring payments, and AI-generated financial advice are not included.

## Local PostgreSQL setup

PostgreSQL 18 is installed and running on this computer. From the project folder, run:

```powershell
npm run db:setup
```

The setup script securely prompts for your local PostgreSQL administrator password and the app-specific database password (at least 16 characters). If `spendsmart_app` already exists, enter its current password; the script will not reset it. The script creates the role/database as needed, applies [`database/schema.sql`](./database/schema.sql), and writes the connection string to the ignored `.env.local` file. Passwords are entered in your local terminal, not sent in chat. Existing database data is not dropped.

Then restart the Next.js server:

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create an account, and log in. The app loads that user's profile and records from PostgreSQL. If you already have the dev server running, stop and restart it so Next.js reads `.env.local`.

The app stores password hashes (scrypt) rather than passwords and uses an HttpOnly session cookie. Every finance query and write is scoped to the signed-in user on the server. Keep `.env.local` private and never expose `DATABASE_URL` through a `NEXT_PUBLIC_` variable.

## Import the attached backup

After PostgreSQL is configured, the schema has been applied, and you are signed in, open **Settings → Import SpendSmart JSON backup**. Choose the supplied `spendsmart-backup (2).json` file and confirm the import. The app assigns its transactions, budgets, goals, and recurring rules to the **currently signed-in account**; it replaces that account’s existing finance records. The name/email displayed in the backup is informational and does not change the authenticated account.

## Useful commands

| Command | What it does |
| --- | --- |
| `npm install` | Installs project dependencies |
| `npm run dev` | Starts the local development server |
| `npm run db:setup` | Creates/configures the local PostgreSQL database and `.env.local` |
| `npm run lint` | Runs ESLint |
| `npm run build` | Creates a production build |
| `npm run start` | Serves the production build |

## Project layout

| Path | Role |
| --- | --- |
| `src/app` | Routes and layouts |
| `src/components/app/local-data-provider.tsx` | Auth state, database loading, and per-account persistence |
| `src/features/workspace` | Finance screens and workflows |
| `src/lib/local-data.ts` | Shared finance types and backup validation |
| `src/lib/server` | PostgreSQL connection pool and server-side session handling |
| `src/app/api` | Authentication and account API routes |
| `database/schema.sql` | Local PostgreSQL schema |

## Data and deployment notes

This project is set up for local development. Do not expose the database port to the internet or use the local database password in browser code. Before deploying publicly, review the authentication implementation, configure a production-grade managed PostgreSQL service and secrets, add request-rate limiting and account recovery, and enforce HTTPS. Back up PostgreSQL regularly and use the in-app JSON export for portable user backups.
