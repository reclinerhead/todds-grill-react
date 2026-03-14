"use server";

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
