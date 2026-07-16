/**
 * Shown instantly while a host-console page renders on the server, so tapping a
 * sidebar link gives immediate feedback instead of a frozen screen.
 */
export default function HostConsoleLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8 space-y-2">
        <div className="h-7 w-56 rounded-lg bg-navy-900/10 dark:bg-parchment-100/10" />
        <div className="h-4 w-80 max-w-full rounded bg-navy-900/5 dark:bg-parchment-100/5" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-navy-900/5 dark:bg-parchment-100/5" />
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="h-72 rounded-2xl bg-navy-900/5 dark:bg-parchment-100/5" />
        <div className="h-72 rounded-2xl bg-navy-900/5 dark:bg-parchment-100/5" />
      </div>
    </div>
  );
}
