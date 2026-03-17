"use server";

import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

export async function toggleMenuItemActive(id: string, currentValue: boolean) {
  const supabase = adminClient();
  const { error } = await supabase
    .from("menu_items")
    .update({ is_active: !currentValue })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/manager");
}

export async function toggleMenuItemFeatured(
  id: string,
  currentValue: boolean,
) {
  const supabase = adminClient();
  const { error } = await supabase
    .from("menu_items")
    .update({ is_featured: !currentValue })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/manager");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
