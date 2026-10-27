import type { Metadata } from "next";
import { AnalyticsWorkspace } from "@/features/workspace/analytics";

export const metadata: Metadata = { title: "Analytics" };
export const instant = false;

export default function AnalyticsPage() { return <AnalyticsWorkspace />; }
