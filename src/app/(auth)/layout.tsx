import { Logo } from "@/components/brand/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-navy-950">
      <div className="flex h-16 items-center px-4 sm:px-8">
        <Logo href="/" inverted />
      </div>
      <div className="flex flex-1 items-start justify-center px-4 py-10 sm:items-center">
        {children}
      </div>
    </div>
  );
}
