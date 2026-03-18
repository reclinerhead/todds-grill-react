import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          // Write to request.cookies first so getUser() sees the refreshed token,
          // then reassign supabaseResponse so updated cookies reach the browser.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Must use getUser() — never getSession() — in middleware
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Demo mode: allow anonymous access to /manager — no auth required.
  // Triggered by hostname (e.g. portfolio/recruiter demo deployment) or env var.
  const host = request.headers.get("host");
  const isDemo =
    host === "todds-grill-demo.toddtech.llc" ||
    process.env.IS_DEMONSTRATION_MODE === "true";

  if (pathname.startsWith("/manager")) {
    if (!isDemo) {
      if (!user) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // Look up the user's role in the profiles table.
      // RLS must allow users to read their own row (e.g. "auth.uid() = id").
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        return NextResponse.redirect(
          new URL("/login?error=unauthorized", request.url),
        );
      }
    }
  }

  // Must return supabaseResponse so refreshed session cookies are forwarded to the browser.
  return supabaseResponse;
}

export const config = {
  matcher: ["/manager/:path*", "/auth/callback"],
};
