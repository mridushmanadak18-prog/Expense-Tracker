import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  ChartColumn,
  Target,
  Repeat,
  Sparkles,
  Settings,
} from "lucide-react";

export type AppNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
};

/** Primary navigation for a locally stored profile. */
export const appNavItems: AppNavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Balance, trends, and recent activity",
  },
  {
    href: "/transactions",
    label: "Transactions",
    icon: ArrowLeftRight,
    description: "Income and expenses",
  },
  {
    href: "/budgets",
    label: "Budgets",
    icon: PiggyBank,
    description: "Monthly category limits",
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: ChartColumn,
    description: "Charts and CSV reports",
  },
  {
    href: "/goals",
    label: "Goals",
    icon: Target,
    description: "Savings goals and planner",
  },
  {
    href: "/recurring",
    label: "Recurring",
    icon: Repeat,
    description: "Repeatable transaction rules",
  },
  {
    href: "/assistant",
    label: "Assistant",
    icon: Sparkles,
    description: "Optional AI insights",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    description: "Profile and preferences",
  },
];

export const mobilePrimaryNav = appNavItems.slice(0, 4);
