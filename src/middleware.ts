import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_PATH } from "@/lib/defaults";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/**
 * This middleware runs ONLY on protected paths (see the matcher below).
 * Public storefront navigation never pays the Supabase auth round-trip,
 * which keeps page-to-page transitions fast.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    // Supabase not configured — the hidden console must never be reachable.
    if (request.nextUrl.pathname.startsWith(ADMIN_PATH)) {
      return NextResponse.rewrite(new URL("/404", request.url));
    }
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // ── Hidden host console ─────────────────────────────────────────────
  // Non-admins never learn this route exists: they receive a plain 404.
  if (pathname.startsWith(ADMIN_PATH)) {
    if (!user) {
      return NextResponse.rewrite(new URL("/404", request.url));
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_suspended")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile || profile.role !== "admin" || profile.is_suspended) {
      return NextResponse.rewrite(new URL("/404", request.url));
    }
    return response;
  }

  // ── Customer-only areas ─────────────────────────────────────────────
  if (!user) {
    const redirect = new URL("/login", request.url);
    redirect.searchParams.set("next", pathname);
    return NextResponse.redirect(redirect);
  }

  return response;
}

export const config = {
  matcher: ["/account/:path*", "/host-console/:path*"],
};
