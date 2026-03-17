import { getMenuItemsForGrid } from "@/lib/data/restaurant";
import MenuGridClient from "./MenuGridClient";

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

        <MenuGridClient items={items} />
      </div>
    </section>
  );
}
