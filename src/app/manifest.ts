import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Al-Tomoh Bookstore",
    short_name: "Al-Tomoh",
    description: "A premium online bookstore devoted to the printed word.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b1024",
    theme_color: "#ee7124",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
