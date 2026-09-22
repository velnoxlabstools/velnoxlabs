export interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = "Nothing here yet",
  description = "Content will appear when available.",
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className="text-center py-16 px-4 border border-dashed rounded-2xl border-slate-300 bg-slate-100/60 dark:border-slate-800 dark:bg-slate-900/40"
    >
      <p className="m-0 text-lg font-semibold tracking-tight text-slate-800 dark:text-slate-100">
        {title}
      </p>
      <p className="mt-2 mb-0 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
        {description}
      </p>
    </div>
  );
}
