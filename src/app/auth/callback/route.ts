import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createSupabaseServerClient();

  // PKCE flow: Supabase sends ?code=... (default for newer projects)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("PKCE exchange error:", error);
      return NextResponse.redirect(
        new URL("/login?error=link-expired", request.url),
      );
    }
    return NextResponse.redirect(new URL("/manager", request.url));
  }

  // OTP flow: Supabase sends ?token_hash=...&type=...
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (error) {
      console.error("Magic link verification error:", error);
      return NextResponse.redirect(
        new URL("/login?error=link-expired", request.url),
      );
    }
    return NextResponse.redirect(new URL("/manager", request.url));
  }

  return NextResponse.redirect(
    new URL("/login?error=link-invalid", request.url),
  );
}
