"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title,
  description,
  onRetry,
  className,
}: ErrorStateProps): React.ReactElement {
  const tCommon = useTranslations("common");

  return (
    <div
      className={`grid place-items-center gap-3 rounded-xl border border-[var(--danger)]/40 bg-[var(--danger-soft)] px-6 py-8 text-center ${className ?? ""}`}
      role="alert"
    >
      <div className="grid size-10 place-items-center rounded-full bg-[var(--danger)]/15 text-[var(--danger)]">
        <AlertTriangle className="size-5" />
      </div>
      <div className="font-display text-sm font-medium tracking-tight">
        {title ?? tCommon("error")}
      </div>
      {description ? (
        <div className="max-w-sm text-xs text-[var(--text-muted)]">{description}</div>
      ) : null}
      {onRetry ? (
        <Button size="sm" variant="outline" onClick={onRetry} className="mt-1 gap-1.5">
          <RefreshCw className="size-3.5" />
          {tCommon("retry")}
        </Button>
      ) : null}
    </div>
  );
}
