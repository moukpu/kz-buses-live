import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  className,
}: EmptyStateProps): React.ReactElement {
  return (
    <div
      className={`grid place-items-center gap-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)]/40 px-6 py-10 text-center ${className ?? ""}`}
    >
      <div className="bg-surface-2 grid size-10 place-items-center rounded-full text-[var(--text-muted)]">
        {icon ?? <Inbox className="size-5" />}
      </div>
      <div className="font-display text-sm font-medium tracking-tight">{title}</div>
      {description ? (
        <div className="max-w-sm text-xs text-[var(--text-muted)]">{description}</div>
      ) : null}
    </div>
  );
}
