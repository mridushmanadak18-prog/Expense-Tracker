export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  paymentMethod: string;
  notes: string;
};

export type Budget = {
  id: string;
  category: string;
  limit: number;
  month: string;
};

export type SavingsGoal = {
  id: string;
  title: string;
  target: number;
  saved: number;
  targetDate: string;
};

export type RecurringRule = {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  day: number;
  active: boolean;
  lastGenerated: string;
};

export type LocalAccount = {
  id: string;
  name: string;
  email: string;
  currency: string;
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  recurring: RecurringRule[];
};

export const categories = [
  "Food",
  "Transport",
  "Housing",
  "Bills",
  "Shopping",
  "Health",
  "Education",
  "Entertainment",
  "Travel",
  "Salary",
  "Freelance",
  "Other",
];

export function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPositiveAmount(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isTransaction(value: unknown): value is Transaction {
  return isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.description === "string" &&
    isPositiveAmount(value.amount) &&
    (value.type === "income" || value.type === "expense") &&
    typeof value.category === "string" &&
    typeof value.date === "string" &&
    typeof value.paymentMethod === "string" &&
    typeof value.notes === "string";
}

function isBudget(value: unknown): value is Budget {
  return isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.category === "string" &&
    isPositiveAmount(value.limit) &&
    typeof value.month === "string" &&
    /^\d{4}-(0[1-9]|1[0-2])$/.test(value.month);
}

function isGoal(value: unknown): value is SavingsGoal {
  return isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    isPositiveAmount(value.target) &&
    typeof value.saved === "number" &&
    Number.isFinite(value.saved) &&
    value.saved >= 0 &&
    typeof value.targetDate === "string";
}

function isRecurringRule(value: unknown): value is RecurringRule {
  return isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.description === "string" &&
    isPositiveAmount(value.amount) &&
    (value.type === "income" || value.type === "expense") &&
    typeof value.category === "string" &&
    typeof value.day === "number" &&
    Number.isInteger(value.day) &&
    value.day >= 1 &&
    value.day <= 31 &&
    typeof value.active === "boolean" &&
    typeof value.lastGenerated === "string";
}

export function parseBackup(value: unknown): Omit<LocalAccount, "id"> | null {
  if (
    !isRecord(value) ||
    typeof value.name !== "string" ||
    typeof value.email !== "string" ||
    typeof value.currency !== "string" ||
    !/^[A-Z]{3}$/.test(value.currency) ||
    !Array.isArray(value.transactions) ||
    !value.transactions.every(isTransaction) ||
    !Array.isArray(value.budgets) ||
    !value.budgets.every(isBudget) ||
    !Array.isArray(value.goals) ||
    !value.goals.every(isGoal) ||
    !Array.isArray(value.recurring) ||
    !value.recurring.every(isRecurringRule)
  ) {
    return null;
  }

  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return {
    name: value.name,
    email: value.email,
    currency: value.currency,
    transactions: value.transactions.map((item) => ({ ...item, id: uuidPattern.test(item.id) ? item.id : newId() })),
    budgets: value.budgets.map((item) => ({ ...item, id: uuidPattern.test(item.id) ? item.id : newId() })),
    goals: value.goals.map((item) => ({ ...item, id: uuidPattern.test(item.id) ? item.id : newId() })),
    recurring: value.recurring.map((item) => ({ ...item, id: uuidPattern.test(item.id) ? item.id : newId() })),
  };
}
