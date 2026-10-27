import type { Metadata } from "next";
import { AssistantWorkspace } from "@/features/workspace/assistant";

export const metadata: Metadata = { title: "Assistant" };
export const instant = false;

export default function AssistantPage() { return <AssistantWorkspace />; }
