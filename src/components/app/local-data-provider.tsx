"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  parseBackup,
  type LocalAccount,
} from "@/lib/local-data";

type AuthResult = {
  error: string | null;
};

type LocalDataContextValue = {
  ready: boolean;
  configured: boolean;
  account: LocalAccount | null;
  error: string | null;
  saving: boolean;
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<string | null>;
  updateAccount: (update: (account: LocalAccount) => LocalAccount) => void;
  updateProfile: (name: string, currency: string) => Promise<string | null>;
  clearAccountData: () => void;
  importBackup: (value: unknown) => string | null;
  clearError: () => void;
};

const LocalDataContext = createContext<LocalDataContextValue | null>(null);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "An unexpected database error occurred.";
}

async function apiRequest(path: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  if (!response.ok) {
    const message = isRecord(payload) && typeof payload.error === "string"
      ? payload.error
      : `The request failed (${response.status}).`;
    throw new Error(message);
  }
  return payload;
}

function parseAccount(value: unknown): LocalAccount | null {
  if (value === null) return null;
  if (!isRecord(value) || typeof value.id !== "string") {
    throw new Error("The server returned an invalid account.");
  }
  const backup = parseBackup(value);
  if (!backup) throw new Error("The server returned invalid account data.");
  return { ...backup, id: value.id };
}

export function LocalDataProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<LocalAccount | null>(null);
  const [ready, setReady] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const accountRef = useRef<LocalAccount | null>(null);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());

  const setCurrentAccount = useCallback((next: LocalAccount | null) => {
    accountRef.current = next;
    setAccount(next);
  }, []);

  const loadAccount = useCallback(async () => {
    const payload = await apiRequest("/api/account");
    if (!isRecord(payload)) throw new Error("The server returned an invalid account response.");
    setCurrentAccount(parseAccount(payload.account));
  }, [setCurrentAccount]);

  useEffect(() => {
    let active = true;
    const initialize = async () => {
      try {
        const status = await apiRequest("/api/status");
        const isConfigured = isRecord(status) && status.configured === true;
        if (!active) return;
        setConfigured(isConfigured);
        if (!isConfigured) {
          setError("PostgreSQL is not configured. Copy .env.example to .env.local, set DATABASE_URL, create the database schema, then restart the app.");
          return;
        }
        if (isRecord(status) && typeof status.error === "string") {
          setError(status.error);
          return;
        }
        await loadAccount();
        if (active) setError(null);
      } catch (loadError) {
        if (active) {
          setCurrentAccount(null);
          setError(getErrorMessage(loadError));
        }
      } finally {
        if (active) setReady(true);
      }
    };
    void initialize();
    return () => {
      active = false;
    };
  }, [loadAccount, setCurrentAccount]);

  const enqueueSave = useCallback((next: LocalAccount) => {
    setSaving(true);
    setError(null);
    const task = saveQueueRef.current.catch(() => undefined).then(async () => {
      if (accountRef.current?.id !== next.id) {
        throw new Error("Your session changed before these changes could be saved. Sign in again and retry.");
      }
      await apiRequest("/api/account", {
        method: "PUT",
        body: JSON.stringify(next),
      });
      if (accountRef.current === next) {
        setSaving(false);
        setError(null);
      }
    });
    saveQueueRef.current = task;
    void task.catch((saveError: unknown) => {
      setSaving(false);
      setError(`Your change could not be saved to the database: ${getErrorMessage(saveError)}`);
    });
    return task;
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string): Promise<AuthResult> => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanName || !cleanEmail || password.length < 8) {
      return { error: "Enter your name, a valid email address, and a password with at least 8 characters." };
    }
    try {
      await apiRequest("/api/auth", {
        method: "POST",
        body: JSON.stringify({ action: "signup", name: cleanName, email: cleanEmail, password }),
      });
      await loadAccount();
      if (!accountRef.current) return { error: "Your account was created but could not be loaded from PostgreSQL." };
      return { error: null };
    } catch (authError) {
      return { error: getErrorMessage(authError) };
    }
  }, [loadAccount]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      await apiRequest("/api/auth", {
        method: "POST",
        body: JSON.stringify({ action: "login", email: email.trim().toLowerCase(), password }),
      });
      await loadAccount();
      if (!accountRef.current) return "Your account was authenticated but could not be loaded from PostgreSQL.";
      return null;
    } catch (authError) {
      return getErrorMessage(authError);
    }
  }, [loadAccount]);

  const signOut = useCallback(async () => {
    try {
      await saveQueueRef.current;
    } catch {
      return "Some changes have not been saved. Check your connection and try again before signing out.";
    }
    try {
      await apiRequest("/api/auth", {
        method: "POST",
        body: JSON.stringify({ action: "logout" }),
      });
      setCurrentAccount(null);
      return null;
    } catch (authError) {
      return getErrorMessage(authError);
    }
  }, [setCurrentAccount]);

  const updateAccount = useCallback((update: (account: LocalAccount) => LocalAccount) => {
    const current = accountRef.current;
    if (!current) return;
    const next = update(current);
    setCurrentAccount(next);
    void enqueueSave(next);
  }, [enqueueSave, setCurrentAccount]);

  const updateProfile = useCallback(async (name: string, currency: string) => {
    const current = accountRef.current;
    const cleanName = name.trim();
    if (!current) return "No signed-in account is available.";
    if (!cleanName) return "Enter your name.";
    const next = { ...current, name: cleanName, currency };
    setCurrentAccount(next);
    try {
      await enqueueSave(next);
      return null;
    } catch (saveError) {
      return `Profile update could not be saved: ${getErrorMessage(saveError)}`;
    }
  }, [enqueueSave, setCurrentAccount]);

  const clearAccountData = useCallback(() => {
    updateAccount((current) => ({
      ...current,
      transactions: [],
      budgets: [],
      goals: [],
      recurring: [],
    }));
  }, [updateAccount]);

  const importBackup = useCallback((value: unknown) => {
    const backup = parseBackup(value);
    if (!backup) {
      return "This file is not a valid SpendSmart backup. No database data was changed.";
    }
    updateAccount((current) => ({
      ...current,
      currency: backup.currency,
      transactions: backup.transactions,
      budgets: backup.budgets,
      goals: backup.goals,
      recurring: backup.recurring,
    }));
    return null;
  }, [updateAccount]);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      ready,
      configured,
      account,
      error,
      saving,
      signUp,
      signIn,
      signOut,
      updateAccount,
      updateProfile,
      clearAccountData,
      importBackup,
      clearError,
    }),
    [
      ready,
      configured,
      account,
      error,
      saving,
      signUp,
      signIn,
      signOut,
      updateAccount,
      updateProfile,
      clearAccountData,
      importBackup,
      clearError,
    ],
  );

  return (
    <LocalDataContext.Provider value={value}>
      {error ? (
        <div className="fixed right-3 top-3 z-50 flex max-w-lg items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 shadow-lg" role="alert">
          <p className="flex-1">{error}</p>
          <button type="button" className="font-semibold" onClick={clearError} aria-label="Dismiss message">×</button>
        </div>
      ) : null}
      {children}
    </LocalDataContext.Provider>
  );
}

export function useLocalData() {
  const context = useContext(LocalDataContext);
  if (!context) throw new Error("useLocalData must be used inside LocalDataProvider");
  return context;
}
