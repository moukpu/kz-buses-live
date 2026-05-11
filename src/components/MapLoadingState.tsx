import { Skeleton } from "@/components/ui/skeleton";

export function MapLoadingState({ label }: { label?: string }): React.ReactElement {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[var(--bg-elevated)]">
      <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 gap-[1px] opacity-30">
        {Array.from({ length: 36 }).map((_, i) => (
          <Skeleton key={i} className="h-full w-full rounded-none" />
        ))}
      </div>
      {label ? (
        <div className="absolute inset-0 grid place-items-center">
          <div className="bg-card/90 border-border/60 rounded-full border px-4 py-1.5 font-mono text-xs tracking-wider text-[var(--text-muted)] uppercase backdrop-blur">
            {label}
          </div>
        </div>
      ) : null}
    </div>
  );
}
