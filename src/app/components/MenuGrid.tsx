import Image from "next/image";
import fs from "fs/promises";
import path from "path";

type MenuItem = {
  name: string;
  description: string;
  price: string;
  image: string;
};

const getTinyPlaceholder = (src: string) =>
  `/_next/image?url=${encodeURIComponent(src)}&w=16&q=1`;

export default async function MenuGrid() {
  const filePath = path.join(process.cwd(), "data", "menu.json");
  const jsonData = await fs.readFile(filePath, "utf-8");
  const menuItems: MenuItem[] = JSON.parse(jsonData);

  return (
    <section id="menu" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-orange-600">
          Our Menu
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="bg-gray-200 p-4 rounded shadow hover:shadow-lg transition-shadow"
            >
              <Image
                src={item.image}
                alt={item.name}
                width={465}
                height={310}
                className="w-full h-48 object-cover rounded mb-4"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                placeholder="blur"
                blurDataURL={getTinyPlaceholder(item.image)}
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
