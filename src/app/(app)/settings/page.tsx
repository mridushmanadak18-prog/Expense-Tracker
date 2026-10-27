import type { Metadata } from "next";
import { SettingsWorkspace } from "@/features/workspace/settings";

export const metadata: Metadata = { title: "Settings" };
export const instant = false;

export default function SettingsPage() { return <SettingsWorkspace />; }
