import Image from "next/image";
import { supabase } from "@/lib/supabase";

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  image_url: string;
};

const getTinyPlaceholder = (src: string) =>
  `/_next/image?url=${encodeURIComponent(src)}&w=16&q=1`;

export default async function MenuGrid() {
  // query supabase for all menu items, sorted alphabetically by name
  const { data: menuItems, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("is_active", true) // only show active items
    .order("name", { ascending: true }); // sort alphabetically by name

  if (error) {
    console.error("Supabase menu error:", error);
    return (
      <p className="text-red-600 text-center">Could not load menu right now.</p>
    );
  }

  // cast our supabase data result to our MenuItem type
  const items: MenuItem[] = menuItems || [];

  return (
    <section id="menu" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-orange-600">
          Our Menu
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <div
              key={index}
              className="bg-gray-200 p-4 rounded shadow hover:shadow-lg transition-shadow"
            >
              <Image
                src={item.image_url || "/placeholder.png"}
                alt={item.name}
                width={465}
                height={310}
                className="w-full h-48 object-cover rounded mb-4"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                placeholder="blur"
                blurDataURL={getTinyPlaceholder(
                  item.image_url || "/placeholder.png",
                )}
              />
              <h3 className="text-gray-600 text-xl font-semibold mb-2">
                {item.name}
              </h3>
              <p className="text-gray-600 mb-2">{item.description}</p>
              <p className="font-bold text-orange-600">{item.price}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
