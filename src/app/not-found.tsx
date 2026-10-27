import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-navy-50 px-4">
      <Logo />
      <h1 className="mt-8 font-display text-3xl text-navy-950">Page not found</h1>
      <p className="mt-2 max-w-md text-center text-sm text-navy-500">
        That URL is not part of SpendSmart. Use the home page or the dashboard
        shell to continue.
      </p>
      <div className="mt-6 flex gap-3">
        <Button href="/">Home</Button>
        <Button href="/dashboard" variant="outline">
          App shell
        </Button>
      </div>
    </div>
  );
}
