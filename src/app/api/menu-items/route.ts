import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "Server is missing Supabase configuration." },
      { status: 500 },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase
    .from("menu_items")
    .select("id, name, is_active")
    .order("name", { ascending: true });

  if (error) {
    console.error("Supabase menu_items fetch error:", error);
    return NextResponse.json(
      { error: "Unable to load menu items right now." },
      { status: 500 },
    );
  }

  return NextResponse.json({ items: data ?? [] }, { status: 200 });
}
