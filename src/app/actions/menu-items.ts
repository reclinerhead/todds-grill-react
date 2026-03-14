"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ReviewFormMenuOption = {
  id: string;
  name: string;
  is_active: boolean;
};

export type GetReviewFormMenuItemsResult = {
  items: ReviewFormMenuOption[];
  error?: string;
};

export async function getReviewFormMenuItems(): Promise<GetReviewFormMenuItemsResult> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("menu_items")
    .select("id, name, is_active")
    .order("name", { ascending: true });

  if (error) {
    console.error("Supabase menu_items fetch error:", error);
    return {
      items: [],
      error: "Unable to load menu items right now.",
    };
  }

  return { items: data ?? [] };
}