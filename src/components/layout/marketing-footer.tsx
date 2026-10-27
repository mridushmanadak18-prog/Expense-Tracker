import { Logo } from "@/components/brand/logo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-navy-100 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Logo />
        <p className="text-sm text-navy-500">
          Personal finance for students. Your records are protected by
          account-specific database policies.
        </p>
      </div>
    </footer>
  );
}
