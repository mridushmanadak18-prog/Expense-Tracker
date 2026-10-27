"use client";

import { useState, type FormEvent } from "react";
import { Plus, Play, Trash2 } from "lucide-react";
import { useLocalData } from "@/components/app/local-data-provider";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { categories, newId, type TransactionType } from "@/lib/local-data";
import { formatCurrency } from "@/lib/money";

const monthNow = new Date().toISOString().slice(0, 7);

export function RecurringWorkspace() {
  const { account, updateAccount } = useLocalData();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [category, setCategory] = useState("Bills");
  const [day, setDay] = useState("1");
  const currency = account?.currency ?? "INR";
  const rules = account?.recurring ?? [];

  function addRule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(amount);
    const scheduledDay = Number(day);
    if (!description.trim() || !Number.isFinite(value) || value <= 0 || !Number.isInteger(scheduledDay) || scheduledDay < 1 || scheduledDay > 31) return;
    updateAccount((current) => ({
      ...current,
      recurring: [...current.recurring, { id: newId(), description: description.trim(), amount: value, type, category, day: scheduledDay, active: true, lastGenerated: "" }],
    }));
    setDescription("");
    setAmount("");
  }

  function generate(ruleId: string) {
    updateAccount((current) => {
      const rule = current.recurring.find((item) => item.id === ruleId);
      if (!rule || !rule.active || rule.lastGenerated === monthNow) return current;
      const [year, month] = monthNow.split("-").map(Number);
      const dayInMonth = Math.min(rule.day, new Date(year, month, 0).getDate());
      const date = `${monthNow}-${String(dayInMonth).padStart(2, "0")}`;
      const transaction = {
        id: newId(),
        description: rule.description,
        amount: rule.amount,
        type: rule.type,
        category: rule.category,
        date,
        paymentMethod: "Recurring",
        notes: `Generated from recurring rule for ${monthNow}`,
      };
      return {
        ...current,
        transactions: [transaction, ...current.transactions],
        recurring: current.recurring.map((item) => item.id === ruleId ? { ...item, lastGenerated: monthNow } : item),
      };
    });
  }

  function toggle(ruleId: string) {
    updateAccount((current) => ({ ...current, recurring: current.recurring.map((item) => item.id === ruleId ? { ...item, active: !item.active } : item) }));
  }

  function remove(ruleId: string) {
    if (!window.confirm("Delete this recurring rule? Generated transactions will stay in your ledger.")) return;
    updateAccount((current) => ({ ...current, recurring: current.recurring.filter((item) => item.id !== ruleId) }));
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Recurring" description="Create repeatable rules and generate a transaction once per month when you choose." />
      <Card><CardBody className="pt-5">
        <h2 className="mb-4 font-display text-lg text-navy-950">Create a recurring rule</h2>
        <form onSubmit={addRule} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2"><Label htmlFor="rule-description">Description</Label><Input id="rule-description" required maxLength={100} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Monthly rent" /></div>
          <div><Label htmlFor="rule-amount">Amount</Label><Input id="rule-amount" type="number" min="0.01" step="0.01" required value={amount} onChange={(event) => setAmount(event.target.value)} /></div>
          <div><Label htmlFor="rule-type">Type</Label><Select id="rule-type" value={type} onChange={(event) => setType(event.target.value as TransactionType)}><option value="expense">Expense</option><option value="income">Income</option></Select></div>
          <div><Label htmlFor="rule-day">Day of month</Label><Input id="rule-day" type="number" min="1" max="31" required value={day} onChange={(event) => setDay(event.target.value)} /></div>
          <div><Label htmlFor="rule-category">Category</Label><Select id="rule-category" value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</Select></div>
          <div className="flex items-end sm:col-span-2"><Button type="submit"><Plus className="h-4 w-4" />Add rule</Button></div>
        </form>
      </CardBody></Card>
      <div className="space-y-3">
        {rules.length === 0 ? <Card><CardBody className="py-10 text-center text-sm text-navy-500">No recurring rules. Create one above to generate transactions on demand.</CardBody></Card> : rules.map((rule) => (
          <Card key={rule.id}><CardBody className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-navy-950">{rule.description}</h3><span className={`rounded-full px-2 py-0.5 text-xs ${rule.active ? "bg-emerald-50 text-emerald-800" : "bg-navy-100 text-navy-600"}`}>{rule.active ? "Active" : "Paused"}</span></div><p className="mt-1 text-sm text-navy-500">{rule.category} · Day {rule.day} · {rule.type} · {formatCurrency(rule.amount, currency)}</p><p className="mt-1 text-xs text-navy-400">{rule.lastGenerated === monthNow ? `Generated for ${monthNow}` : `Not yet generated for ${monthNow}`}</p></div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={() => generate(rule.id)} disabled={!rule.active || rule.lastGenerated === monthNow}><Play className="h-4 w-4" />Generate for this month</Button>
              <Button type="button" size="sm" variant="outline" onClick={() => toggle(rule.id)}>{rule.active ? "Pause" : "Resume"}</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => remove(rule.id)} aria-label={`Delete ${rule.description}`}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </CardBody></Card>
        ))}
      </div>
    </div>
  );
}
