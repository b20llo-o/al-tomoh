"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

/**
 * Theme toggle with a luxurious animated transition.
 *
 * Where the browser supports the View Transitions API, the new theme is
 * revealed with a soft circular wipe originating from the button. Elsewhere it
 * falls back to a smooth global colour crossfade (see `.theme-transition` in
 * globals.css). Respects prefers-reduced-motion.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  function applyThemeCrossfade(next: string) {
    const root = document.documentElement;
    root.classList.add("theme-transition");
    setTheme(next);
    window.setTimeout(() => root.classList.remove("theme-transition"), 480);
  }

  function toggle() {
    const next = resolvedTheme === "dark" ? "light" : "dark";

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const supportsVT =
      typeof document !== "undefined" &&
      "startViewTransition" in document &&
      !reduce;

    if (!supportsVT) {
      applyThemeCrossfade(next);
      return;
    }

    // Circular reveal centred on the toggle button.
    const rect = btnRef.current?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = (
      document as Document & {
        startViewTransition: (cb: () => void) => {
          ready: Promise<void>;
        };
      }
    ).startViewTransition(() => setTheme(next));
    transition.ready
      .then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 520,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            pseudoElement: "::view-transition-new(root)",
          }
        );
      })
      .catch(() => applyThemeCrossfade(next));
  }

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl text-navy-900/70 transition-colors duration-300 hover:bg-navy-900/5 hover:text-navy-950 dark:text-parchment-100/70 dark:hover:bg-parchment-100/10 dark:hover:text-parchment-50"
    >
      <Sun
        className={`absolute h-[18px] w-[18px] transition-all duration-500 ${
          mounted && resolvedTheme === "dark"
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0"
        }`}
        strokeWidth={1.75}
      />
      <Moon
        className={`absolute h-[18px] w-[18px] transition-all duration-500 ${
          mounted && resolvedTheme === "dark"
            ? "rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100"
        }`}
        strokeWidth={1.75}
      />
    </button>
  );
}
