import type { Metadata } from "next";
import { BudgetsWorkspace } from "@/features/workspace/budgets";

export const metadata: Metadata = { title: "Budgets" };
export const instant = false;

export default function BudgetsPage() { return <BudgetsWorkspace />; }
