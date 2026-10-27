import {
  Database,
  Wallet,
  ChartColumn,
  Lock,
  Sparkles,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Wallet,
    title: "Transactions you control",
    body: "Record income and expenses with category, date, payment method, and notes. Search and filter instead of scrolling a spreadsheet.",
  },
  {
    icon: Target,
    title: "Budgets with real thresholds",
    body: "Set monthly category limits and see spent versus remaining. Warnings appear when you cross a threshold, not as decoration.",
  },
  {
    icon: ChartColumn,
    title: "Analytics from your records",
    body: "Review monthly totals and category breakdowns, then export the exact filtered transactions as CSV.",
  },
  {
    icon: Sparkles,
    title: "Explainable spending observations",
    body: "See simple, data-derived summaries without sending your financial records to an AI service.",
  },
];

const privacy = [
  {
    title: "Private to your account",
    body: "Your records are saved in your account and access is restricted by per-user database policies.",
  },
  {
    title: "Protected sign-in",
    body: "Your account uses email and password authentication. Never share your password or leave your account open on a shared device.",
  },
  {
    title: "You control your data",
    body: "Download a JSON backup, import a previous SpendSmart backup, or clear your finance records from Settings.",
  },
];

export function LandingPage() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.12),_transparent_45%),radial-gradient(ellipse_at_bottom_left,_rgba(10,26,47,0.06),_transparent_40%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
          <div>
            <Badge tone="emerald">Student-built personal finance</Badge>
            <h1 className="mt-5 max-w-xl font-display text-4xl leading-tight text-navy-950 sm:text-5xl">
              Know where the month went — without a noisy spreadsheet.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-navy-600">
              SpendSmart is a personal ledger for income, expenses, budgets, and
              savings goals. Metrics are calculated from your records in your
              account, not from a bank connection.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/signup" size="lg">
                Create a free account
              </Button>
              <Button href="/login" variant="outline" size="lg">
                Log in
              </Button>
            </div>
            <p className="mt-4 text-xs text-navy-500">
              Your data is saved to your account and protected by database access policies.
            </p>
          </div>

          <Card className="relative">
            <CardHeader>
              <CardTitle>What the dashboard shows</CardTitle>
              <CardDescription>
                Live totals appear after you add your own transactions.
              </CardDescription>
            </CardHeader>
            <CardBody className="grid gap-3 sm:grid-cols-2">
              {[
                "Net this month",
                "Income",
                "Expenses",
                "Savings",
              ].map((label) => (
                <div
                  key={label}
                  className="rounded-xl border border-navy-100 bg-navy-50/70 px-4 py-4"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-navy-500">
                    {label}
                  </p>
                  <p className="mt-2 font-display text-2xl text-navy-300">—</p>
                  <p className="mt-1 text-xs text-navy-400">Your own data</p>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </section>

      <section id="features" className="border-t border-navy-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-3xl text-navy-950">Built for real use</h2>
          <p className="mt-2 max-w-2xl text-sm text-navy-600">
            Primary actions are designed to work end to end: add a transaction,
            watch totals move, stay inside your own data.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title}>
                  <CardHeader>
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-emerald-300">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.body}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-t border-navy-100 bg-navy-50/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-3xl text-navy-950">How it works</h2>
          <ol className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Create an account",
                body: "Create a password-protected account. Your data follows your account when you sign in.",
              },
              {
                step: "2",
                title: "Log money as it happens",
                body: "Income and expenses with categories. Recurring rules stay distinct from generated rows.",
              },
              {
                step: "3",
                title: "Read the month honestly",
                body: "Dashboard, budgets, and exports calculate from the records you saved.",
              },
            ].map((item) => (
              <li key={item.step} className="rounded-2xl border border-navy-100 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  Step {item.step}
                </p>
                <h3 className="mt-3 font-display text-xl text-navy-950">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-navy-600">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="privacy" className="border-t border-navy-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-navy-700" aria-hidden />
            <h2 className="font-display text-3xl text-navy-950">Privacy principles</h2>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {privacy.map((item) => (
              <div key={item.title} className="rounded-2xl border border-navy-100 p-5">
                <Lock className="h-5 w-5 text-emerald-700" aria-hidden />
                <h3 className="mt-3 font-semibold text-navy-950">{item.title}</h3>
                <p className="mt-2 text-sm text-navy-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-navy-100 bg-navy-950">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-3xl text-white">
              Start with a clearer monthly view.
            </h2>
            <p className="mt-2 max-w-xl text-sm text-navy-200">
              Create an account and start recording income and expenses.
              Your data is saved to your private database records.
            </p>
          </div>
          <Button href="/signup" size="lg">
            Create an account
          </Button>
        </div>
      </section>
    </div>
  );
}
