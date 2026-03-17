import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Review, MenuItem } from "@/types/restaurant";

//////////////////////
// MENU ITEMS
/////////////////////

// Returns all the active menu items for the page, or null if the query failed
export async function getMenuItemsForGrid(): Promise<MenuItem[] | null> {
  const supabase = await createSupabaseServerClient();
  const { data: menuItemsData, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("is_active", true) // only show active items
    .order("name", { ascending: true }); // sort alphabetically by name

  if (error) {
    console.error("Menu items retrieval error:", error);
    return null;
  }
  return menuItemsData ?? [];
}

// https://todds-grill.toddtech.llc/
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

// Returns a random selection of active menu items that have images, for the hero collage
export async function getHeroMenuPhotos(
  count: number = 3,
): Promise<Pick<MenuItem, "id" | "name" | "image_url">[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("menu_items")
    .select("id, name, image_url")
    .eq("is_active", true)
    .not("image_url", "is", null)
    .neq("image_url", "")
    .limit(count * 3); // fetch extra pool to randomize from

  if (error || !data) return [];
  return data.sort(() => Math.random() - 0.5).slice(0, count);
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

// Returns all reviews for the page, or null if the query failed
export async function getReviewsForGrid(): Promise<Review[] | null> {
  const supabase = await createSupabaseServerClient();
  const { data: reviewsData, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Review retrieval error:", error);
    return null;
  }
  return reviewsData ?? [];
}
