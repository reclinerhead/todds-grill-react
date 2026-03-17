import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Refresh session on every request
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

  return response;
}

export const config = {
  matcher: ["/manager/:path*", "/auth/callback"],
};
