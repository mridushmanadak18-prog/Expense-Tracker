import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

const variants = {
  primary:
    "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:outline-emerald-700",
  navy: "bg-navy-900 text-white hover:bg-navy-800 focus-visible:outline-navy-900",
  outline:
    "border border-navy-200 bg-white text-navy-900 hover:bg-navy-50 focus-visible:outline-navy-900",
  ghost: "text-navy-800 hover:bg-navy-50 focus-visible:outline-navy-900",
  danger: "bg-danger text-white hover:bg-red-800 focus-visible:outline-red-800",
} as const;

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
} as const;

type ButtonVariant = keyof typeof variants;
type ButtonSize = keyof typeof sizes;

type SharedProps = {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

type ButtonProps = SharedProps &
  (
    | ({ href: string } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "href">)
    | ({ href?: never } & ButtonHTMLAttributes<HTMLButtonElement>)
  );

function buttonClassName(
  variant: ButtonVariant,
  size: ButtonSize,
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  href,
  ...props
}: ButtonProps) {
  const classes = buttonClassName(variant, size, className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
