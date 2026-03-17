import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import {
  toggleMenuItemActive,
  toggleMenuItemFeatured,
  signOut,
} from "@/app/actions/manager";

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
  const activeCount = menuItems.filter((i) => i.is_active).length;
  const featuredCount = menuItems.filter((i) => i.is_featured).length;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Top bar */}
      <header className="border-b border-white/10 bg-gray-900 px-6 py-4 flex items-center justify-between">
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
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-lg border border-white/20 px-4 py-1.5 text-sm text-gray-300 hover:border-red-400 hover:text-red-400 transition-colors"
          >
            Sign out
          </button>
        </form>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="rounded-xl bg-gray-800 border border-white/10 p-5 text-center">
            <p className="text-3xl font-extrabold text-white">
              {menuItems.length}
            </p>
            <p className="text-sm text-gray-400 mt-1">Total items</p>
          </div>
          <div className="rounded-xl bg-gray-800 border border-white/10 p-5 text-center">
            <p className="text-3xl font-extrabold text-green-400">
              {activeCount}
            </p>
            <p className="text-sm text-gray-400 mt-1">Active</p>
          </div>
          <div className="rounded-xl bg-gray-800 border border-white/10 p-5 text-center">
            <p className="text-3xl font-extrabold text-orange-400">
              {featuredCount}
            </p>
            <p className="text-sm text-gray-400 mt-1">Featured</p>
          </div>
        </div>

        <h2 className="text-lg font-bold text-white mb-4">Menu Items</h2>

        {menuItems.length === 0 ? (
          <p className="text-gray-400">No menu items found.</p>
        ) : (
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-800 text-gray-400 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium text-center">Active</th>
                  <th className="px-4 py-3 font-medium text-center">
                    Featured
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {menuItems.map((item) => (
                  <tr
                    key={item.id}
                    className="bg-gray-900 hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{item.name}</p>
                      {item.description && (
                        <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">
                          {item.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{item.price}</td>
                    <td className="px-4 py-3 text-center">
                      <form
                        action={toggleMenuItemActive.bind(
                          null,
                          item.id,
                          item.is_active,
                        )}
                      >
                        <button
                          type="submit"
                          title={item.is_active ? "Deactivate" : "Activate"}
                          className={`inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                            item.is_active ? "bg-green-500" : "bg-gray-600"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                              item.is_active ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <form
                        action={toggleMenuItemFeatured.bind(
                          null,
                          item.id,
                          item.is_featured,
                        )}
                      >
                        <button
                          type="submit"
                          title={item.is_featured ? "Unfeature" : "Feature"}
                          className={`inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                            item.is_featured ? "bg-orange-500" : "bg-gray-600"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                              item.is_featured
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
