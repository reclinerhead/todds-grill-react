// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// calls supabase to get the most recent featured menu item, returns null if none or on error
export async function getFeaturedMenuItem() {
  const { data, error } = await supabase
    .from("menu_items")
    .select("name, description, price, image_url")
    .eq("is_active", true) // only active items
    .eq("is_featured", true) // only featured ones
    .order("created_at", { ascending: false }) // newest first if multiple
    .limit(1); // just grab the first one

  if (error) {
    console.error("Featured item error:", error);
    return null;
  }

  return data[0] || null; // return the item or null if none
}
