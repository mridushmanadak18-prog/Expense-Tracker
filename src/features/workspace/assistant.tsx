"use client";

import { useMemo } from "react";
import { Lightbulb, Sparkles } from "lucide-react";
import { useLocalData } from "@/components/app/local-data-provider";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { formatCurrency } from "@/lib/money";
import type { Transaction } from "@/lib/local-data";
const noTransactions: Transaction[] = [];

const monthKey = (offset: number) => {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() + offset);
  return date.toISOString().slice(0, 7);
};

export function AssistantWorkspace() {
  const { account } = useLocalData();
  const currency = account?.currency ?? "INR";
  const transactions = account?.transactions ?? noTransactions;
  const month = monthKey(0);
  const previousMonth = monthKey(-1);
  const insight = useMemo(() => {
    const monthExpenses = transactions.filter((item) => item.type === "expense" && item.date.slice(0, 7) === month);
    const previousExpenses = transactions.filter((item) => item.type === "expense" && item.date.slice(0, 7) === previousMonth).reduce((sum, item) => sum + item.amount, 0);
    const total = monthExpenses.reduce((sum, item) => sum + item.amount, 0);
    const categoryTotals = monthExpenses.reduce<Record<string, number>>((totals, item) => {
      totals[item.category] = (totals[item.category] ?? 0) + item.amount;
      return totals;
    }, {});
    const top = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    const messages = [];
    if (!transactions.length) messages.push("Add a few transactions and this page can summarize patterns from your records.");
    else if (!monthExpenses.length) messages.push(`No expenses are recorded for ${month}.`);
    else messages.push(`You recorded ${formatCurrency(total, currency)} in expenses this month.`);
    if (top) messages.push(`${top[0]} is your largest expense category this month at ${formatCurrency(top[1], currency)}.`);
    if (previousExpenses > 0) {
      const change = (total - previousExpenses) / previousExpenses * 100;
      messages.push(`${change >= 0 ? "Spending is up" : "Spending is down"} ${Math.abs(change).toFixed(0)}% compared with last month.`);
    }
    const overBudget = (account?.budgets ?? []).filter((budget) => budget.month === month).map((budget) => ({
      budget,
      spent: monthExpenses.filter((item) => item.category === budget.category).reduce((sum, item) => sum + item.amount, 0),
    })).filter(({ budget, spent }) => spent >= budget.limit * 0.8);
    for (const { budget, spent } of overBudget) messages.push(`${budget.category} has used ${Math.round(spent / budget.limit * 100)}% of its monthly budget.`);
    return messages;
  }, [account?.budgets, currency, month, previousMonth, transactions]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Finance assistant" description="Simple, explainable observations calculated locally from your records." />
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-emerald-700" />Monthly observations</CardTitle><CardDescription>No AI service is connected. These notes are generated from your own data in your browser.</CardDescription></CardHeader><CardBody className="space-y-3">
        {insight.map((item) => <div key={item} className="flex gap-3 rounded-xl bg-navy-50 p-4 text-sm text-navy-800"><Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden /><p>{item}</p></div>)}
      </CardBody></Card>
      <p className="text-xs leading-5 text-navy-500">These are descriptive summaries, not financial, investment, tax, or legal advice. Check the underlying transactions for accuracy.</p>
    </div>
  );
}
