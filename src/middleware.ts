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

  if (pathname.startsWith("/manager")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const allowedEmail = process.env.MANAGER_EMAIL;
    if (allowedEmail && user.email !== allowedEmail) {
      return NextResponse.redirect(
        new URL("/login?error=unauthorized", request.url),
      );
    }
  }

  // Must return supabaseResponse so refreshed session cookies are forwarded to the browser.
  return supabaseResponse;
}

export const config = {
  matcher: ["/manager/:path*", "/auth/callback"],
};
