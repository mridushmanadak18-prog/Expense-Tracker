import type { Metadata } from "next";
import { GoalsWorkspace } from "@/features/workspace/goals";

export const metadata: Metadata = { title: "Goals" };
export const instant = false;

export default function GoalsPage() { return <GoalsWorkspace />; }
