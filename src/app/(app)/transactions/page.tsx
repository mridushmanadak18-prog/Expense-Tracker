import type { Metadata } from "next";
import { TransactionsWorkspace } from "@/features/workspace/transactions";

export const metadata: Metadata = { title: "Transactions" };
export const instant = false;

export default function TransactionsPage() { return <TransactionsWorkspace />; }
