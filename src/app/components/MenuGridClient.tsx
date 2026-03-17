"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import type { MenuItem } from "@/types/restaurant";

const getTinyPlaceholder = (src: string) =>
  `/_next/image?url=${encodeURIComponent(src)}&w=16&q=1`;

type MenuGridClientProps = {
  items: MenuItem[];
};

export default function MenuGridClient({ items }: MenuGridClientProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const slides = items.map((item) => ({
    src: item.image_url || "/placeholder.png",
    alt: item.name,
  }));

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-8">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="bg-gray-200 p-4 rounded shadow hover:shadow-lg transition-shadow"
          >
            <div
              className="group relative w-full h-48 mb-4 cursor-pointer overflow-hidden rounded"
              onClick={() => {
                setIndex(idx);
                setOpen(true);
              }}
            >
              <Image
                src={item.image_url || "/placeholder.png"}
                alt={item.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                placeholder="blur"
                loading="lazy"
                blurDataURL={getTinyPlaceholder(
                  item.image_url || "/placeholder.png",
                )}
              />
            </div>
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

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={slides}
        index={index}
        on={{
          view: ({ index: currentIndex }) => setIndex(currentIndex),
        }}
      />
    </>
  );
}
