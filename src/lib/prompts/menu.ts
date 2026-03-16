export type MenuItem = {
  name: string;
  description: string;
  price: string;
};

const menuItems: MenuItem[] = [
  {
    name: "Caesar Salad",
    description:
      "Crisp hearts of fresh romaine lettuce tossed in our classic creamy Caesar dressing made with garlic, anchovies, lemon juice, and egg yolk. Topped generously with freshly grated Parmesan cheese and crunchy homemade garlic croutons. Served chilled. Allergen information: Contains gluten (from the croutons).",
    price: "$9.99",
  },
  {
    name: "Cheesecake",
    description:
      "Silky smooth New York-style cheesecake with a graham cracker crust, baked using Todds own family recipe. Finished with a fresh mixed berry topping made from strawberries, blueberries, and raspberries. Allergen information: Contains gluten (from the graham cracker crust).",
    price: "$6.99",
  },
  {
    name: "Chocolate Cake",
    description:
      "Decadent triple-layer chocolate cake made with dark cocoa, topped with rich vanilla buttercream frosting and chocolate shavings. Moist and fudgy with every bite. Allergen information: Contains gluten.",
    price: "$6.99",
  },
  {
    name: "Classic Burger",
    description:
      "8oz juicy all-beef patty seasoned and grilled to medium on a toasted brioche bun. Topped with fresh lettuce, ripe tomato slices, melted American cheese, red onion, pickles, and our signature house sauce. Allergen information: Contains gluten (from the brioche bun). Gluten-free bun available upon request.",
    price: "$12.99",
  },
  {
    name: "Fresh Minnows",
    description:
      "Live fathead minnows, perfect for baiting your hook or - for the adventurous - fried as an appetizer. Fresh and lively daily. Catch your dinner or use as bait! Allergen information: Gluten-free.",
    price: "$6.99 a dozen",
  },
  {
    name: "Fresh Wrigglers",
    description:
      "Fresh Canadian nightcrawlers in a ventilated bag - the gold standard for serious fishermen looking to catch the big ones. Not recommended for eating (at least according to Todd). Allergen information: Gluten-free.",
    price: "$7.99 a bag",
  },
  {
    name: "Fried Mushrooms",
    description:
      "Fresh button mushrooms dipped in our seasoned beer batter and deep-fried until golden and crispy. Served hot with your choice of ranch or marinara dipping sauce. Allergen information: Contains gluten (from the beer batter).",
    price: "$8.99",
  },
  {
    name: "Grilled Chicken",
    description:
      "Tender boneless chicken breast marinated overnight in garlic, herbs, and olive oil, then grilled over open flames for a smoky char while staying juicy inside. Allergen information: Gluten-free.",
    price: "$17.99",
  },
  {
    name: "Grilled Steak",
    description:
      "Premium 12oz ribeye steak, hand-selected and grilled to your desired doneness (medium rare recommended) over hardwood charcoal for smoky flavor. Allergen information: Gluten-free.",
    price: "$24.99",
  },
  {
    name: "Lasagna",
    description:
      "Hearty homemade lasagna with multiple layers of wide pasta sheets, savory meat sauce made with ground beef and Italian sausage, creamy ricotta, and plenty of melted mozzarella and Parmesan cheeses. Allergen information: Contains gluten (from the pasta).",
    price: "$14.99",
  },
  {
    name: "Loaded Fries",
    description:
      "Golden crispy french fries topped with melted cheddar cheese, crispy bacon bits, green onions, and a dollop of sour cream. The ultimate comfort side. Allergen information: Gluten-free.",
    price: "$9.99",
  },
];

export { menuItems };
export default menuItems;
