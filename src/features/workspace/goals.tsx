"use client";

import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useLocalData } from "@/components/app/local-data-provider";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { newId } from "@/lib/local-data";
import { formatCurrency } from "@/lib/money";

export function GoalsWorkspace() {
  const { account, updateAccount } = useLocalData();
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [goalId, setGoalId] = useState("");
  const [contribution, setContribution] = useState("");
  const currency = account?.currency ?? "INR";
  const goals = account?.goals ?? [];

  function addGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(target);
    if (!title.trim() || !Number.isFinite(value) || value <= 0) return;
    updateAccount((current) => ({
      ...current,
      goals: [...current.goals, { id: newId(), title: title.trim(), target: value, saved: 0, targetDate }],
    }));
    setTitle("");
    setTarget("");
    setTargetDate("");
  }

  function addContribution(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(contribution);
    const selectedGoalId = goalId || goals[0]?.id;
    if (!selectedGoalId || !Number.isFinite(value) || value <= 0) return;
    updateAccount((current) => ({
      ...current,
      goals: current.goals.map((goal) => goal.id === selectedGoalId ? { ...goal, saved: goal.saved + value } : goal),
    }));
    setContribution("");
  }

  function remove(id: string) {
    if (!window.confirm("Delete this savings goal?")) return;
    updateAccount((current) => ({ ...current, goals: current.goals.filter((goal) => goal.id !== id) }));
    if (goalId === id) setGoalId("");
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Savings goals" description="Track progress using contributions you record." />
      <Card><CardBody className="pt-5">
        <h2 className="mb-4 font-display text-lg text-navy-950">Create a goal</h2>
        <form onSubmit={addGoal} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2"><Label htmlFor="goal-title">Goal name</Label><Input id="goal-title" required maxLength={80} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Emergency fund" /></div>
          <div><Label htmlFor="goal-target">Target amount</Label><Input id="goal-target" type="number" min="0.01" step="0.01" required value={target} onChange={(event) => setTarget(event.target.value)} /></div>
          <div><Label htmlFor="goal-date">Target date (optional)</Label><Input id="goal-date" type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} /></div>
          <div className="sm:col-span-2 lg:col-span-4"><Button type="submit"><Plus className="h-4 w-4" />Create goal</Button></div>
        </form>
      </CardBody></Card>
      <Card><CardBody className="pt-5">
        <h2 className="mb-4 font-display text-lg text-navy-950">Record a contribution</h2>
        {goals.length === 0 ? <p className="text-sm text-navy-500">Create a goal before recording contributions.</p> : (
          <form onSubmit={addContribution} className="grid gap-4 sm:grid-cols-3">
            <div><Label htmlFor="contribution-goal">Goal</Label><Select id="contribution-goal" required value={goalId || goals[0].id} onChange={(event) => setGoalId(event.target.value)}>{goals.map((goal) => <option key={goal.id} value={goal.id}>{goal.title}</option>)}</Select></div>
            <div><Label htmlFor="contribution-amount">Contribution</Label><Input id="contribution-amount" type="number" min="0.01" step="0.01" required value={contribution} onChange={(event) => setContribution(event.target.value)} /></div>
            <div className="flex items-end"><Button type="submit" className="w-full">Add contribution</Button></div>
          </form>
        )}
      </CardBody></Card>
      <div className="grid gap-4 md:grid-cols-2">
        {goals.length === 0 ? <Card className="md:col-span-2"><CardBody className="py-10 text-center text-sm text-navy-500">No goals yet. Create one above to track progress.</CardBody></Card> : goals.map((goal) => {
          const percent = Math.min(100, Math.round(goal.saved / goal.target * 100));
          return <Card key={goal.id}><CardBody className="pt-5">
            <div className="flex justify-between gap-3"><div><h3 className="font-semibold text-navy-950">{goal.title}</h3>{goal.targetDate ? <p className="mt-1 text-xs text-navy-500">Target date: {goal.targetDate}</p> : null}</div><button type="button" aria-label={`Delete ${goal.title}`} onClick={() => remove(goal.id)} className="h-fit rounded p-2 text-navy-500 hover:bg-red-50 hover:text-danger"><Trash2 className="h-4 w-4" /></button></div>
            <p className="mt-5 text-sm text-navy-600">{formatCurrency(goal.saved, currency)} saved of {formatCurrency(goal.target, currency)}</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-navy-100" role="progressbar" aria-label={`${goal.title} progress`} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-emerald-600" style={{ width: `${percent}%` }} /></div>
            <p className="mt-2 text-right text-xs text-navy-500">{percent}%</p>
          </CardBody></Card>;
        })}
      </div>
    </div>
  );
}
