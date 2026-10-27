"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocalData } from "@/components/app/local-data-provider";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Notice } from "@/components/ui/notice";

export function LoginForm() {
  const router = useRouter();
  const { signIn, ready, configured } = useLocalData();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const message = await signIn(email, password);
      if (message) {
        setError(message);
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
        <CardTitle>Log in</CardTitle>
        <CardDescription>Sign in to load your personal finance records from PostgreSQL.</CardDescription>
      </CardHeader>
      <CardBody className="space-y-4">
        <Notice title={configured ? "Your data follows your account" : "Connect your PostgreSQL database first"}>
          {configured
            ? "Sign in with the email and password used to create your account. Your data is protected by user-specific database policies."
            : "Set DATABASE_URL in .env.local, run database/schema.sql, and restart the app."}
        </Notice>
        <form className="space-y-4" onSubmit={submit}>
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
              placeholder="you@gmail.com"
              disabled={!configured || !ready || submitting}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={!configured || !ready || submitting}
            />
          </div>
          {error ? <p className="text-sm text-danger" role="alert">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={!configured || !ready || submitting}>
            {submitting ? "Signing in…" : "Log in"}
          </Button>
        </form>
        <p className="text-center text-sm text-navy-500">
          Need a profile?{" "}
          <Link href="/signup" className="font-medium text-emerald-700 hover:underline">
            Sign up
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
