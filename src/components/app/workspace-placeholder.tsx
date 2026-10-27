import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { Card, CardBody } from "@/components/ui/card";

export function WorkspacePlaceholder({
  title,
  description,
  icon,
  emptyTitle,
  emptyDescription,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title={title} description={description} />
      <Notice title="Layout only in Stage 1">
        This screen is navigable and styled. Forms, calculations, and saved
        records will be connected in later stages. Nothing here is stored yet.
      </Notice>
      <Card>
        <CardBody className="pt-5">
          <EmptyState
            icon={icon}
            title={emptyTitle}
            description={emptyDescription}
          />
        </CardBody>
      </Card>
    </div>
  );
}
