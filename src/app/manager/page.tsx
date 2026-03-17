import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { signOut, listGalleryImages } from "@/app/actions/manager";
import ManagerDashboard from "./ManagerDashboard";

type ManagerMenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  is_active: boolean;
  is_featured: boolean;
  image_url: string | null;
};

export default async function ManagerPage() {
  // Secondary auth guard (middleware is primary)
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch all menu items via admin client to bypass RLS
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
  const { data: items, error } = await admin
    .from("menu_items")
    .select("id, name, description, price, is_active, is_featured, image_url")
    .order("name", { ascending: true });

  if (error) {
    console.error("Manager: failed to load menu items:", error);
  }

  const menuItems: ManagerMenuItem[] = items ?? [];

  const galleryImages = await listGalleryImages();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-gray-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-xl font-extrabold text-orange-500">
            Todd&apos;s
          </span>
          <span className="text-xl font-extrabold text-white">
            {" "}
            Grill &amp; Bait
          </span>
          <span className="ml-3 text-sm text-gray-400 font-medium">
            Manager Dashboard
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-lg border border-white/20 px-4 py-1.5 text-sm text-gray-300 hover:border-orange-400 hover:text-orange-400 transition-colors"
          >
            ↗ Public Site
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border border-white/20 px-4 py-1.5 text-sm text-gray-300 hover:border-red-400 hover:text-red-400 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <ManagerDashboard menuItems={menuItems} galleryImages={galleryImages} />

      <footer className="border-t border-white/10 bg-gray-900 px-6 py-4 text-center">
        <a
          href="mailto:toddwyatt@outlook.com"
          className="text-sm text-gray-400 hover:text-orange-400 transition-colors"
        >
          Contact the Administrator
        </a>
      </footer>
    </div>
  );
}
