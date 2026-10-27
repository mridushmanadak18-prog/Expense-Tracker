import type { Metadata } from "next";
import { DashboardWorkspace } from "@/features/workspace/dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
};
export const instant = false;

export default function DashboardPage() { return <DashboardWorkspace />; }
