"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Download, Save, Trash2 } from "lucide-react";
import { useLocalData } from "@/components/app/local-data-provider";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { parseBackup } from "@/lib/local-data";

export function SettingsWorkspace() {
  const { account, updateProfile, clearAccountData, importBackup, saving } = useLocalData();
  const [name, setName] = useState(account?.name ?? "");
  const [currency, setCurrency] = useState(account?.currency ?? "INR");
  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    const error = await updateProfile(name, currency);
    setSaveError(Boolean(error));
    setMessage(error ?? "Profile and preferences saved to your account.");
  }

  function backup() {
    if (!account) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(account, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "spendsmart-backup.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function clearRecords() {
    if (!window.confirm("Delete all transactions, budgets, goals, and recurring rules from this account? This cannot be undone.")) return;
    clearAccountData();
    setMessage("Finance records are being deleted from your account.");
    setSaveError(false);
  }

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    let value: unknown;
    try {
      value = JSON.parse(await file.text());
    } catch {
      setSaveError(true);
      setMessage("Could not read this file as JSON. No database data was changed.");
      return;
    }

    const backupData = parseBackup(value);
    if (!backupData) {
      setSaveError(true);
      setMessage("This file is not a valid SpendSmart backup. No database data was changed.");
      return;
    }
    const confirmed = window.confirm(
      `Import ${backupData.transactions.length} transactions, ${backupData.budgets.length} budgets, ${backupData.goals.length} goals, and ${backupData.recurring.length} recurring rules from ${backupData.name} (${backupData.email}) into the signed-in account ${account?.email}? This replaces the finance data currently stored in that account.`,
    );
    if (!confirmed) return;
    const error = importBackup(value);
    setSaveError(Boolean(error));
    setMessage(error ?? "Backup import started. The records will be saved to your signed-in database account.");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Settings" description="Manage your account preferences and data stored in the database." />
      <Notice title="Your database account">
        Your profile and financial records are loaded from local PostgreSQL after login.
        The server scopes every database operation to your authenticated account.
      </Notice>
      <Card><CardHeader><CardTitle>Profile and preferences</CardTitle><CardDescription>Changes are saved to your signed-in account.</CardDescription></CardHeader><CardBody>
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="settings-name">Name</Label><Input id="settings-name" required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} /></div>
          <div><Label htmlFor="settings-email">Account email</Label><Input id="settings-email" type="email" value={account?.email ?? ""} readOnly /></div>
          <div><Label htmlFor="settings-currency">Currency</Label><Select id="settings-currency" value={currency} onChange={(event) => setCurrency(event.target.value)}>{["INR", "USD", "EUR", "GBP", "CAD", "AUD", "JPY"].map((item) => <option key={item}>{item}</option>)}</Select></div>
          <div className="flex items-end"><Button type="submit" disabled={saving}><Save className="h-4 w-4" />{saving ? "Saving…" : "Save settings"}</Button></div>
          {message ? <p className={`sm:col-span-2 text-sm ${saveError ? "text-danger" : "text-emerald-700"}`} role={saveError ? "alert" : "status"}>{message}</p> : null}
        </form>
      </CardBody></Card>
      <Card><CardHeader><CardTitle>Database data tools</CardTitle><CardDescription>Export a backup, import the attached legacy backup, or clear this account’s finance records.</CardDescription></CardHeader><CardBody className="flex flex-wrap items-end gap-3">
        <Button type="button" variant="outline" onClick={backup}><Download className="h-4 w-4" />Download JSON backup</Button>
        <div>
          <Label htmlFor="backup-file">Import SpendSmart JSON backup</Label>
          <Input id="backup-file" type="file" accept=".json,application/json" onChange={importFile} />
        </div>
        <Button type="button" variant="danger" onClick={clearRecords} disabled={saving}><Trash2 className="h-4 w-4" />Clear finance records</Button>
        {saving ? <p className="w-full text-sm text-navy-500" role="status">Saving database changes…</p> : null}
      </CardBody></Card>
    </div>
  );
}
