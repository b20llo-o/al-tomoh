import { LogoMark } from "@/components/brand/logo";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <LogoMark className="h-12 w-12 animate-pulse" />
        <span className="h-1 w-16 overflow-hidden rounded-full bg-navy-900/10 dark:bg-parchment-100/10">
          <span className="block h-full w-1/2 animate-pulse rounded-full bg-brand-500" />
        </span>
      </div>
    </div>
  );
}
