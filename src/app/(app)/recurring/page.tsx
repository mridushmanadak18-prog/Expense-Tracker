import type { Metadata } from "next";
import { RecurringWorkspace } from "@/features/workspace/recurring";

export const metadata: Metadata = { title: "Recurring" };
export const instant = false;

export default function RecurringPage() { return <RecurringWorkspace />; }
