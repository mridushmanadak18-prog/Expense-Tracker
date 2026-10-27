"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { useLocalData } from "@/components/app/local-data-provider";
import { cn } from "@/lib/cn";
import { appNavItems, mobilePrimaryNav } from "@/lib/navigation";
import { Button } from "@/components/ui/button";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, account, saving, signOut } = useLocalData();
  const [moreOpen, setMoreOpen] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (ready && !account) router.replace("/login");
  }, [ready, account, router]);

  if (!ready || !account) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-navy-500">
        {ready ? "Opening account…" : "Loading account data…"}
      </div>
    );
  }

  async function handleSignOut() {
    setSigningOut(true);
    const error = await signOut();
    if (error) {
      setSignOutError(error);
      setSigningOut(false);
      return;
    }
    router.replace("/login");
  }

  return (
    <div className="min-h-full bg-navy-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-navy-800 bg-navy-950 lg:flex lg:flex-col">
        <div className="flex h-16 items-center px-5">
          <Logo href="/dashboard" inverted />
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Application">
          {appNavItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-white/10 text-white"
                    : "text-navy-200 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 px-4 py-4">
          <p className="truncate text-sm font-medium text-white">{account.name}</p>
          <p className="truncate text-xs text-navy-400">{account.email}</p>
          <button type="button" onClick={handleSignOut} disabled={signingOut} className="mt-3 flex items-center gap-2 text-xs text-navy-300 hover:text-white disabled:opacity-50">
            <LogOut className="h-4 w-4" aria-hidden /> {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-navy-100 bg-white px-4 lg:hidden">
          <Logo href="/dashboard" />
          <span className="mr-auto ml-3 max-w-36 truncate text-xs text-navy-600">{account.name}</span>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-navy-900"
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((value) => !value)}
          >
            {moreOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle navigation</span>
          </button>
        </header>

        {moreOpen ? (
          <div className="border-b border-navy-100 bg-white px-4 py-3 lg:hidden">
            <nav className="grid grid-cols-2 gap-2" aria-label="More pages">
              {appNavItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-3 py-2 text-sm",
                      active
                        ? "bg-navy-900 text-white"
                        : "bg-navy-50 text-navy-800",
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        ) : null}

        <main
          id="main-content"
          className="px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-10"
        >
          {saving ? <p className="mx-auto mb-4 max-w-5xl text-xs text-navy-500" role="status">Saving your changes to the database…</p> : null}
          {signOutError ? <p className="mx-auto mb-4 max-w-5xl text-sm text-danger" role="alert">{signOutError}</p> : null}
          {children}
        </main>
      </div>

      <div className="fixed bottom-[4.75rem] right-3 z-30 lg:hidden">
        <Button type="button" variant="outline" size="sm" onClick={handleSignOut} aria-label="Sign out">
          <LogOut className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-navy-100 bg-white lg:hidden"
        aria-label="Primary mobile"
      >
        <ul className="grid grid-cols-4">
          {mobilePrimaryNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                    active ? "text-emerald-700" : "text-navy-500",
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
