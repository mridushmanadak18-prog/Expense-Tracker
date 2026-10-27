"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useLocalData } from "@/components/app/local-data-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { categories, newId, type Transaction, type TransactionType } from "@/lib/local-data";
import { formatCurrency } from "@/lib/money";

const today = () => new Date().toISOString().slice(0, 10);
const noTransactions: Transaction[] = [];

export function TransactionsWorkspace() {
  const { account, updateAccount } = useLocalData();
  const [editing, setEditing] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [type, setType] = useState<TransactionType>("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [date, setDate] = useState(today);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [notes, setNotes] = useState("");
  const transactions = account?.transactions ?? noTransactions;
  const currency = account?.currency ?? "INR";

  const filtered = useMemo(() => transactions
    .filter((item) => filter === "all" || item.type === filter)
    .filter((item) => `${item.description} ${item.category} ${item.notes}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date)), [transactions, filter, query]);

  function resetForm() {
    setEditing(null);
    setDescription("");
    setAmount("");
    setType("expense");
    setCategory(categories[0]);
    setDate(today());
    setPaymentMethod("UPI");
    setNotes("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!description.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) return;
    const record: Transaction = {
      id: editing ?? newId(),
      description: description.trim(),
      amount: numericAmount,
      type,
      category,
      date,
      paymentMethod,
      notes: notes.trim(),
    };
    updateAccount((current) => ({
      ...current,
      transactions: editing
        ? current.transactions.map((item) => item.id === editing ? record : item)
        : [record, ...current.transactions],
    }));
    resetForm();
  }

  function edit(item: Transaction) {
    setEditing(item.id);
    setDescription(item.description);
    setAmount(String(item.amount));
    setType(item.type);
    setCategory(item.category);
    setDate(item.date);
    setPaymentMethod(item.paymentMethod);
    setNotes(item.notes);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function remove(id: string) {
    if (!window.confirm("Delete this transaction? This cannot be undone.")) return;
    updateAccount((current) => ({
      ...current,
      transactions: current.transactions.filter((item) => item.id !== id),
    }));
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Transactions"
        description="Record and manage income and expenses stored in this browser."
      />
      <Card>
        <CardBody className="pt-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg text-navy-950">{editing ? "Edit transaction" : "Add transaction"}</h2>
            {editing ? <Button type="button" variant="ghost" size="sm" onClick={resetForm}><X className="h-4 w-4" /> Cancel edit</Button> : null}
          </div>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" required maxLength={100} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Groceries, salary…" />
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" min="0.01" step="0.01" required value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select id="type" value={type} onChange={(event) => setType(event.target.value as TransactionType)}>
                <option value="expense">Expense</option><option value="income">Income</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select id="category" value={category} onChange={(event) => setCategory(event.target.value)}>
                {categories.map((item) => <option key={item}>{item}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" required value={date} onChange={(event) => setDate(event.target.value)} />
            </div>
            <div>
              <Label htmlFor="payment">Payment method</Label>
              <Select id="payment" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                {["UPI", "Cash", "Card", "Bank transfer", "Other"].map((item) => <option key={item}>{item}</option>)}
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" maxLength={300} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add a note" />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full"><Plus className="h-4 w-4" />{editing ? "Save changes" : "Add transaction"}</Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="pt-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-navy-400" aria-hidden />
              <Input aria-label="Search transactions" className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search descriptions or categories" />
            </div>
            <Select aria-label="Filter by transaction type" className="sm:w-44" value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option value="all">All transactions</option><option value="income">Income</option><option value="expense">Expenses</option>
            </Select>
          </div>
          {filtered.length === 0 ? (
            <p className="rounded-xl bg-navy-50 px-4 py-10 text-center text-sm text-navy-500">
              {transactions.length ? "No transactions match these filters." : "No transactions yet. Add your first record above."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="border-b border-navy-100 text-xs uppercase text-navy-500">
                  <tr><th className="py-3 pr-3">Description</th><th className="py-3 pr-3">Category</th><th className="py-3 pr-3">Date</th><th className="py-3 pr-3">Method</th><th className="py-3 pr-3 text-right">Amount</th><th className="py-3 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {filtered.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 pr-3 font-medium text-navy-900">{item.description}<div className="text-xs font-normal text-navy-500">{item.notes}</div></td>
                      <td className="py-3 pr-3"><Badge tone={item.type === "income" ? "emerald" : "navy"}>{item.category}</Badge></td>
                      <td className="py-3 pr-3 text-navy-600">{item.date}</td>
                      <td className="py-3 pr-3 text-navy-600">{item.paymentMethod}</td>
                      <td className={`py-3 pr-3 text-right font-semibold ${item.type === "income" ? "text-emerald-700" : "text-navy-900"}`}>{item.type === "income" ? "+" : "−"}{formatCurrency(item.amount, currency)}</td>
                      <td className="py-3 text-right">
                        <button type="button" aria-label={`Edit ${item.description}`} onClick={() => edit(item)} className="rounded p-2 text-navy-500 hover:bg-navy-50"><Pencil className="h-4 w-4" /></button>
                        <button type="button" aria-label={`Delete ${item.description}`} onClick={() => remove(item.id)} className="rounded p-2 text-danger hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
