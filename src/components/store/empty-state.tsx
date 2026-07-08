import { Library } from "lucide-react";

export function EmptyState({
  message,
  action,
}: {
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card-surface flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
        <Library className="h-6 w-6" strokeWidth={1.5} />
      </span>
      <p className="max-w-sm text-sm leading-relaxed text-muted">{message}</p>
      {action}
    </div>
  );
}
