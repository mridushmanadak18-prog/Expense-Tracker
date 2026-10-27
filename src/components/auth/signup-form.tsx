"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocalData } from "@/components/app/local-data-provider";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Notice } from "@/components/ui/notice";

export function SignupForm() {
  const router = useRouter();
  const { signUp, ready, configured } = useLocalData();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const result = await signUp(name, email, password);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/dashboard");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>Your account and finance records are stored in PostgreSQL.</CardDescription>
      </CardHeader>
      <CardBody className="space-y-4">
        <Notice title={configured ? "Database-backed account" : "Connect your PostgreSQL database first"}>
          {configured
            ? "Use a strong password. Your account can access only its own records."
            : "Set DATABASE_URL in .env.local, run database/schema.sql, and restart the app."}
        </Notice>
        <form className="space-y-4" onSubmit={submit}>
          <div>
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              maxLength={80}
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={!configured || !ready || submitting}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={!configured || !ready || submitting}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={!configured || !ready || submitting}
            />
            <p className="mt-1 text-xs text-navy-500">At least 8 characters.</p>
          </div>
          {error ? <p className="text-sm text-danger" role="alert">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={!configured || !ready || submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </Button>
        </form>
        <p className="text-center text-sm text-navy-500">
          Already have a profile?{" "}
          <Link href="/login" className="font-medium text-emerald-700 hover:underline">
            Log in
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
