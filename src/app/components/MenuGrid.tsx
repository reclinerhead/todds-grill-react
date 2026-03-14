import { getMenuItemsForGrid } from "@/lib/data/restaurant";
import Image from "next/image";

const getTinyPlaceholder = (src: string) =>
  `/_next/image?url=${encodeURIComponent(src)}&w=16&q=1`;

export default async function MenuGrid() {
  // get the active menu items from the database library
  const items = await getMenuItemsForGrid();

  if (items === null) {
    return (
      <section id="menu" className="py-16 bg-white">
        <p className="text-center text-red-500">
          Could not load the menu right now. Please try again later.
        </p>
      </section>
    );
  }

  return (
    <section id="menu" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-orange-600">
          Our Menu
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-8">
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
                loading="lazy"
                blurDataURL={getTinyPlaceholder(
                  item.image_url || "/placeholder.png",
                )}
              />
              <div className="text-gray-600 text-md font-bold mb-2 md:text-lg">
                {item.name}
              </div>
              <p className="text-gray-600 mb-2 text-sm lg:text-base">
                {item.description}
              </p>
              <p className="font-bold text-orange-600">{item.price}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
