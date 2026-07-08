"use client";

import Image from "next/image";
import { useState } from "react";
import { BookCover } from "./book-cover";
import { cn } from "@/lib/utils";

export function BookGallery({
  title,
  coverUrl,
  gallery,
}: {
  title: string;
  coverUrl: string | null;
  gallery: string[];
}) {
  const images = [coverUrl, ...gallery].filter((url): url is string => Boolean(url));
  const [active, setActive] = useState(0);

  return (
    <div className="animate-fade-up">
      <div className="mx-auto w-full max-w-md">
        <BookCover
          title={title}
          coverUrl={images[active] ?? null}
          sizes="(max-width: 1024px) 90vw, 40vw"
          priority
          className="shadow-card"
        />
      </div>

      {images.length > 1 && (
        <div className="mx-auto mt-4 flex max-w-md gap-3 overflow-x-auto pb-1">
          {images.map((url, index) => (
            <button
              key={url + index}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1} of ${title}`}
              className={cn(
                "relative aspect-[2/3] w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-300",
                index === active
                  ? "border-brand-500 shadow-md"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <Image src={url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
