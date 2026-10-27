"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowLeftRight, ArrowUpRight, PiggyBank, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useLocalData } from "@/components/app/local-data-provider";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { formatCurrency } from "@/lib/money";

const currentMonth = new Date().toISOString().slice(0, 7);
const pastMonths = Array.from({ length: 6 }, (_, index) => {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() - (5 - index));
  return date.toISOString().slice(0, 7);
});

export function DashboardWorkspace() {
  const { account } = useLocalData();
  const transactions = account?.transactions ?? [];
  const currency = account?.currency ?? "INR";
  const monthTransactions = transactions.filter((item) => item.date.slice(0, 7) === currentMonth);
  const income = monthTransactions.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expenses = monthTransactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const savings = income - expenses;
  const metrics = [
    { label: "Net this month", value: savings, hint: "Income minus expenses", icon: Wallet },
    { label: "Income", value: income, hint: "This calendar month", icon: TrendingUp },
    { label: "Expenses", value: expenses, hint: "This calendar month", icon: TrendingDown },
    { label: "Savings rate", value: income > 0 ? savings / income * 100 : 0, hint: income > 0 ? "Of this month's income" : "Add income to calculate", icon: PiggyBank, percent: true },
  ];
  const chartData = pastMonths.map((month) => {
    const records = transactions.filter((item) => item.date.slice(0, 7) === month);
    return {
      month,
      income: records.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0),
      expense: records.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0),
    };
  });
  const maxAmount = Math.max(1, ...chartData.flatMap((item) => [item.income, item.expense]));
  const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const openBudgets = (account?.budgets ?? []).filter((item) => item.month === currentMonth);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title={`Welcome, ${account?.name.split(" ")[0] ?? "there"}`} description="A clear view of your finances, calculated from your local records." actions={<Button href="/transactions">Add transaction</Button>} />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const positive = metric.label === "Net this month" && metric.value < 0;
          return <Card key={metric.label}><CardBody className="pt-5">
            <div className="flex items-start justify-between"><p className="text-xs font-medium uppercase tracking-wide text-navy-500">{metric.label}</p><Icon className="h-4 w-4 text-navy-400" aria-hidden /></div>
            <p className={`mt-3 font-display text-2xl ${positive ? "text-danger" : "text-navy-950"}`}>{metric.percent ? `${metric.value.toFixed(1)}%` : formatCurrency(metric.value, currency)}</p>
            <p className="mt-1 text-xs text-navy-400">{metric.hint}</p>
          </CardBody></Card>;
        })}
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Income and expenses</CardTitle><CardDescription>Monthly totals for the last six months</CardDescription></CardHeader>
          <CardBody>
            <div className="flex h-48 items-end gap-3 border-b border-navy-100 pb-2">
              {chartData.map((item) => <div key={item.month} className="flex h-full flex-1 flex-col items-center justify-end">
                <div className="flex h-[85%] w-full items-end justify-center gap-1">
                  <div title={`Income ${formatCurrency(item.income, currency)}`} className="w-4 rounded-t bg-emerald-500" style={{ height: `${Math.max(item.income ? 4 : 0, item.income / maxAmount * 100)}%` }} />
                  <div title={`Expenses ${formatCurrency(item.expense, currency)}`} className="w-4 rounded-t bg-navy-700" style={{ height: `${Math.max(item.expense ? 4 : 0, item.expense / maxAmount * 100)}%` }} />
                </div>
                <span className="mt-2 text-[10px] text-navy-500">{item.month.slice(5)}</span>
              </div>)}
            </div>
            <div className="mt-4 flex gap-4 text-xs text-navy-600"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-emerald-500" />Income</span><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-navy-700" />Expenses</span></div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader><CardTitle>Monthly budgets</CardTitle><CardDescription>Spent against your current-month limits</CardDescription></CardHeader>
          <CardBody className="space-y-4">
            {openBudgets.length === 0 ? <p className="py-8 text-center text-sm text-navy-500">No budgets set for this month. <Link className="text-emerald-700 underline" href="/budgets">Create one</Link>.</p> : openBudgets.map((budget) => {
              const spent = monthTransactions.filter((item) => item.type === "expense" && item.category === budget.category).reduce((sum, item) => sum + item.amount, 0);
              return <div key={budget.id}><div className="flex justify-between text-sm"><span>{budget.category}</span><span className="text-navy-500">{formatCurrency(spent, currency)} / {formatCurrency(budget.limit, currency)}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-navy-100"><div className={`h-full rounded-full ${spent >= budget.limit ? "bg-danger" : "bg-emerald-600"}`} style={{ width: `${Math.min(100, spent / budget.limit * 100)}%` }} /></div></div>;
            })}
          </CardBody>
        </Card>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Recent transactions</CardTitle><CardDescription>Your latest recorded activity</CardDescription></div><Button href="/transactions" variant="outline" size="sm">View all <ArrowLeftRight className="h-4 w-4" /></Button></CardHeader>
        <CardBody>
          {recent.length === 0 ? <p className="py-8 text-center text-sm text-navy-500">No transactions recorded yet.</p> : <div className="divide-y divide-navy-100">{recent.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 py-3"><div className="flex items-center gap-3"><span className={`flex h-9 w-9 items-center justify-center rounded-full ${item.type === "income" ? "bg-emerald-50 text-emerald-700" : "bg-navy-50 text-navy-600"}`}>{item.type === "income" ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}</span><div><p className="text-sm font-medium text-navy-900">{item.description}</p><p className="text-xs text-navy-500">{item.category} · {item.date}</p></div></div><p className={`whitespace-nowrap text-sm font-semibold ${item.type === "income" ? "text-emerald-700" : "text-navy-900"}`}>{item.type === "income" ? "+" : "−"}{formatCurrency(item.amount, currency)}</p></div>)}</div>}
        </CardBody>
      </Card>
    </div>
  );
}
