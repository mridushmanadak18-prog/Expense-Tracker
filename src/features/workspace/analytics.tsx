"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { useLocalData } from "@/components/app/local-data-provider";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { formatCurrency } from "@/lib/money";
import type { Transaction } from "@/lib/local-data";

const thisMonth = new Date().toISOString().slice(0, 7);
const noTransactions: Transaction[] = [];

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export function AnalyticsWorkspace() {
  const { account } = useLocalData();
  const [month, setMonth] = useState(thisMonth);
  const currency = account?.currency ?? "INR";
  const transactions = account?.transactions ?? noTransactions;
  const filtered = useMemo(() => transactions.filter((item) => item.date.slice(0, 7) === month), [transactions, month]);
  const income = filtered.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expenses = filtered.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const byCategory = Object.entries(filtered.filter((item) => item.type === "expense").reduce<Record<string, number>>((totals, item) => {
    totals[item.category] = (totals[item.category] ?? 0) + item.amount;
    return totals;
  }, {})).sort((a, b) => b[1] - a[1]);
  const highest = Math.max(1, ...byCategory.map(([, value]) => value));

  function exportCsv() {
    const columns = ["Date", "Type", "Description", "Category", "Amount", "Payment method", "Notes"];
    const rows = filtered.map((item) => [item.date, item.type, item.description, item.category, item.amount, item.paymentMethod, item.notes]);
    const csv = [columns, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `spendsmart-${month}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Analytics" description="Monthly summaries and exports from your recorded transactions." actions={<Button type="button" variant="outline" onClick={exportCsv}><Download className="h-4 w-4" />Export month CSV</Button>} />
      <Card><CardBody className="pt-5"><div className="max-w-xs"><Label htmlFor="analytics-month">Month</Label><Input id="analytics-month" type="month" value={month} onChange={(event) => setMonth(event.target.value)} /></div></CardBody></Card>
      <section className="grid gap-4 sm:grid-cols-3">
        {[["Income", income], ["Expenses", expenses], ["Net", income - expenses]].map(([label, amount]) => <Card key={label}><CardBody className="pt-5"><p className="text-xs font-medium uppercase tracking-wide text-navy-500">{label}</p><p className="mt-3 font-display text-2xl text-navy-950">{formatCurrency(Number(amount), currency)}</p><p className="mt-1 text-xs text-navy-500">{filtered.length} transaction{filtered.length === 1 ? "" : "s"} in {month}</p></CardBody></Card>)}
      </section>
      <Card><CardHeader><CardTitle>Expense categories</CardTitle><CardDescription>Breakdown for {month}</CardDescription></CardHeader><CardBody className="space-y-4">
        {byCategory.length === 0 ? <p className="py-8 text-center text-sm text-navy-500">No expenses recorded for this month.</p> : byCategory.map(([category, amount]) => <div key={category}><div className="mb-1 flex justify-between text-sm"><span>{category}</span><span className="font-medium">{formatCurrency(amount, currency)}</span></div><div className="h-2 overflow-hidden rounded-full bg-navy-100"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${amount / highest * 100}%` }} /></div></div>)}
      </CardBody></Card>
    </div>
  );
}
