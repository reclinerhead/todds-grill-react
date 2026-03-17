"use server";

import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signInAnonymously() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInAnonymously({
    // Optional: Pass CAPTCHA token if enabled in dashboard
    // captchaToken: formData.get('cf-turnstile-response') as string,
  });

  if (error) {
    console.error("Anon sign-in error:", error);
    throw new Error("Failed to start session");
  }

  // Optional: Return user ID or something for client
  return { user: data.user };
}

type MagicLinkState = { error: string | null; sent: boolean };

export async function sendMagicLink(
  _prevState: MagicLinkState,
  formData: FormData,
): Promise<MagicLinkState> {
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const captchaToken =
    (formData.get("captchaToken") as string | null)?.trim() ?? "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address.", sent: false };
  }

  const headersList = await headers();
  const origin =
    headersList.get("origin") ??
    `${headersList.get("x-forwarded-proto") ?? "http"}://${headersList.get("host")}`;
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      ...(captchaToken ? { captchaToken } : {}),
    },
  });

  if (error) {
    console.error("Magic link error:", error);
    return {
      error: "Failed to send magic link. Please try again.",
      sent: false,
    };
  }

  return { error: null, sent: true };
}
