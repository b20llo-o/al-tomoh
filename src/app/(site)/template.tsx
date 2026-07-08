"use client";

/*
 * A template re-mounts on every navigation within the (site) group, so the
 * wrapper's `animate-page` runs each time — giving a subtle, fast fade between
 * pages. It respects prefers-reduced-motion via the keyframe fallback in CSS.
 */
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-page">{children}</div>;
}
