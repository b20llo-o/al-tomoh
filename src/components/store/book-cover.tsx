import Image from "next/image";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Book cover with an elegant typographic fallback when no image is set,
 * so the catalogue never shows a broken image.
 */
export function BookCover({
  title,
  coverUrl,
  className,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw",
  priority = false,
}: {
  title: string;
  coverUrl: string | null;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[2/3] overflow-hidden rounded-xl bg-gradient-to-br from-navy-900 to-navy-950",
        className
      )}
    >
      {coverUrl ? (
        <Image
          src={coverUrl}
          alt={`Cover of ${title}`}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
          <BookOpen className="h-8 w-8 text-brand-400" strokeWidth={1.5} />
          <p className="font-display text-sm font-medium leading-snug text-parchment-100/90 line-clamp-4">
            {title}
          </p>
          <span className="h-px w-10 bg-brand-500/60" />
        </div>
      )}
    </div>
  );
}
