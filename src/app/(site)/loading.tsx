export default function SiteLoading() {
  return (
    <div className="container-page py-14">
      <div className="animate-pulse space-y-8">
        <div className="space-y-3">
          <div className="h-3 w-24 rounded-full bg-navy-900/10 dark:bg-parchment-100/10" />
          <div className="h-9 w-72 max-w-full rounded-xl bg-navy-900/10 dark:bg-parchment-100/10" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[2/3] rounded-xl bg-navy-900/10 dark:bg-parchment-100/10" />
              <div className="h-4 w-3/4 rounded bg-navy-900/10 dark:bg-parchment-100/10" />
              <div className="h-3 w-1/2 rounded bg-navy-900/10 dark:bg-parchment-100/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
