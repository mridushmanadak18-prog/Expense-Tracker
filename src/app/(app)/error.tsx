"use client";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg py-10">
      <Card>
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            The application shell hit an unexpected error. Try again. Details
            stay in the browser console, not on this page.
          </CardDescription>
        </CardHeader>
        <CardBody className="flex gap-3">
          <Button type="button" onClick={reset}>
            Try again
          </Button>
          <Button href="/" variant="outline">
            Home
          </Button>
        </CardBody>
      </Card>
      <p className="sr-only">{error.message}</p>
    </div>
  );
}
