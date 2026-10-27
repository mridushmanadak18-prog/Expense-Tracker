import { PageSkeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageSkeleton />
    </div>
  );
}
