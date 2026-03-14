import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Review, MenuItem } from "@/types/restaurant";

//////////////////////
// MENU ITEMS
/////////////////////

// Returns all the active menu items for the page
export async function getMenuItemsForGrid(): Promise<MenuItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data: menuItemsData, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("is_active", true) // only show active items
    .order("name", { ascending: true }); // sort alphabetically by name

  if (error) {
    console.error("Menu items retrieval error:", error);
    return []; // fallback
  }
  return menuItemsData ?? [];
}

// calls supabase to get the most recent featured menu item, returns null if none or on error
export async function getFeaturedMenuItem() {
  const supabase = await createSupabaseServerClient();
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

// Returns the count of currently active menu items
export async function getActiveMenuCount(): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { count, error } = await supabase
    .from("menu_items")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  if (error) {
    console.error("Active menu count error:", error);
    return 30; // fallback so UI never breaks
  }
  return count ?? 0;
}

//////////////////
// REVIEWS
/////////////////

// Returns the total number of reviews (assuming you have a 'reviews' table)
export async function getReviewCount(): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { count, error } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Review count error:", error);
    return 500; // fallback
  }
  return count ?? 0;
}

// Returns all reviews for the page
export async function getReviewsForGrid(): Promise<Review[]> {
  const supabase = await createSupabaseServerClient();
  const { data: reviewsData, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Review retrieval error:", error);
    return []; // fallback
  }
  return reviewsData ?? [];
}
