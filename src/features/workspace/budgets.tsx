"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useLocalData } from "@/components/app/local-data-provider";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { categories, newId } from "@/lib/local-data";
import { formatCurrency } from "@/lib/money";

const monthNow = () => new Date().toISOString().slice(0, 7);
const noBudgets: NonNullable<ReturnType<typeof useLocalData>["account"]>["budgets"] = [];

export function BudgetsWorkspace() {
  const { account, updateAccount } = useLocalData();
  const [category, setCategory] = useState("Food");
  const [limit, setLimit] = useState("");
  const [month, setMonth] = useState(monthNow);
  const currency = account?.currency ?? "INR";
  const budgets = account?.budgets ?? noBudgets;

  const rows = useMemo(() => budgets
    .filter((budget) => budget.month === month)
    .map((budget) => {
      const spent = (account?.transactions ?? [])
        .filter((transaction) => transaction.type === "expense" && transaction.category === budget.category && transaction.date.slice(0, 7) === month)
        .reduce((sum, transaction) => sum + transaction.amount, 0);
      return { ...budget, spent, remaining: budget.limit - spent };
    })
    .sort((a, b) => a.category.localeCompare(b.category)), [account?.transactions, budgets, month]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(limit);
    if (!Number.isFinite(value) || value <= 0) return;
    updateAccount((current) => {
      const existing = current.budgets.find((item) => item.category === category && item.month === month);
      return {
        ...current,
        budgets: existing
          ? current.budgets.map((item) => item.id === existing.id ? { ...item, limit: value } : item)
          : [...current.budgets, { id: newId(), category, limit: value, month }],
      };
    });
    setLimit("");
  }

  function remove(id: string) {
    if (!window.confirm("Delete this budget?")) return;
    updateAccount((current) => ({ ...current, budgets: current.budgets.filter((item) => item.id !== id) }));
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Budgets" description="Set category limits and track spending against real expenses." />
      <Card><CardBody className="pt-5">
        <h2 className="mb-4 font-display text-lg text-navy-950">Set a monthly budget</h2>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div><Label htmlFor="budget-category">Category</Label><Select id="budget-category" value={category} onChange={(event) => setCategory(event.target.value)}>{categories.filter((item) => item !== "Salary" && item !== "Freelance").map((item) => <option key={item}>{item}</option>)}</Select></div>
          <div><Label htmlFor="budget-limit">Limit</Label><Input id="budget-limit" type="number" min="0.01" step="0.01" required value={limit} onChange={(event) => setLimit(event.target.value)} placeholder="0.00" /></div>
          <div><Label htmlFor="budget-month">Month</Label><Input id="budget-month" type="month" required value={month} onChange={(event) => setMonth(event.target.value)} /></div>
          <div className="flex items-end"><Button type="submit" className="w-full"><Plus className="h-4 w-4" />Save budget</Button></div>
        </form>
        <p className="mt-3 text-xs text-navy-500">Saving the same category and month updates its existing limit.</p>
      </CardBody></Card>
      <Card><CardBody className="space-y-4 pt-5">
        <h2 className="font-display text-lg text-navy-950">Budgets for {month}</h2>
        {rows.length === 0 ? <p className="rounded-xl bg-navy-50 px-4 py-10 text-center text-sm text-navy-500">No budgets for this month yet.</p> : rows.map((row) => {
          const ratio = row.spent / row.limit;
          const percentage = Math.min(100, Math.round(ratio * 100));
          return (
            <div key={row.id} className="rounded-xl border border-navy-100 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><p className="font-semibold text-navy-950">{row.category}</p><p className="mt-1 text-sm text-navy-500">{formatCurrency(row.spent, currency)} spent of {formatCurrency(row.limit, currency)}</p></div>
                <div className="text-right"><p className={`text-sm font-semibold ${row.remaining < 0 ? "text-danger" : "text-navy-800"}`}>{row.remaining >= 0 ? `${formatCurrency(row.remaining, currency)} left` : `${formatCurrency(Math.abs(row.remaining), currency)} over`}</p><button type="button" onClick={() => remove(row.id)} className="mt-1 inline-flex items-center gap-1 text-xs text-navy-500 hover:text-danger"><Trash2 className="h-3.5 w-3.5" />Delete</button></div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-navy-100" role="progressbar" aria-label={`${row.category} budget spent`} aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
                <div className={`h-full rounded-full ${ratio >= 1 ? "bg-danger" : ratio >= 0.8 ? "bg-amber-900" : "bg-emerald-600"}`} style={{ width: `${percentage}%` }} />
              </div>
              {ratio >= 0.8 ? <p className="mt-2 text-xs text-amber-900">{ratio >= 1 ? "Budget exceeded." : "You have used at least 80% of this budget."}</p> : null}
            </div>
          );
        })}
      </CardBody></Card>
    </div>
  );
}
