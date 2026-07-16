import type { MetadataRoute } from "next";
import { ADMIN_PATH } from "@/lib/defaults";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The hidden host console is never indexed.
      disallow: [`${ADMIN_PATH}`, "/account"],
    },
  };
}
