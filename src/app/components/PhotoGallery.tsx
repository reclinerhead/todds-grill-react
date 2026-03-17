"use client";

// src/components/PhotoGallery.tsx
import { useState } from "react";
import Image from "next/image";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

// Optional: define a prop type if you want to pass images from parent later
type PhotoGalleryProps = {
  images?: string[]; // array of /gallery/... paths
  title?: string; // optional custom title
};

export default function PhotoGallery({
  images = [
    "/gallery/2deace6e-58fd-4849-97bb-c6d6cd4a9ea9.jpg",
    "/gallery/47e86086-4cdf-4dcf-b81f-7b2a038098b8.jpg",
    "/gallery/e69fd608-9f68-4ea6-bcd3-03709b96b11f.jpg",
    "/gallery/c5f2ef8e-d6be-4654-84d6-8c699e78768d.jpg",
    "/gallery/f69599c6-e679-4a41-ba35-c15ded76e67d.jpg",
    "/gallery/eddb89b7-7e91-4365-bdbd-250662e07fb3.jpg",
    "/gallery/grok-image-d2895105-ae52-4a64-9e41-3ac3fda73bac.png",
    "/gallery/grok-image-f7d53fe4-b31a-492b-b0f8-0ce3ad46a5c4.png",
  ],
  title = "Customer Photo Gallery",
}: PhotoGalleryProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  return (
    <section id="photos" className="bg-gray-50 px-4 py-12 md:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-12 text-center font-bold tracking-tight text-orange-600 text-3xl">
          {title}
        </h1>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-8">
          {images.map((src, idx) => (
            <div
              key={idx}
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-gray-300"
              onClick={() => {
                setIndex(idx);
                setOpen(true);
              }}
            >
              <Image
                src={src}
                alt={`Gallery photo ${idx + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>
          ))}
        </div>

        {images.length === 0 && (
          <p className="mt-12 text-center text-xl text-gray-500">
            No photos yet — check back soon!
          </p>
        )}
      </div>

      {/* Lightbox - only mounts when open */}
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={images.map((src) => ({ src }))} // convert paths to slide objects
        index={index}
        on={{
          view: ({ index: currentIndex }) => setIndex(currentIndex),
        }}
      />

      <div className="text-gray-800 italic mt-12 mb-12 max-w-5xl mx-auto px-4 text-center space-y-3 ">
        <h2 className="text-2xl font-bold tracking-tight">
          The Legend of Todd&apos;s Grill and Bait
        </h2>

        <p>
          It all began back in the early days of 1912 along the banks of a
          sleepy creek near Kalamazoo, when Todd&apos;s great-grandpappy, the
          one and only Pappy Zeke Wyatt, decided life was too short to choose
          between fishing and eating. Zeke was a man of simple pleasures:
          digging fat nightcrawlers at dawn and firing up whatever he could find
          on an open flame by noon. Business was slow selling bait alone, so one
          fateful afternoon he turned an old pickle barrel into the most
          ramshackle grill the world had ever seen—wobbly legs, a rusty lid that
          whistled like a teakettle, and enough smoke to signal the next county.
        </p>

        <p>
          Before long, hungry fishermen weren&apos;t just buying bait—they were
          lingering for Pappy&apos;s &quot;Grill Surprise,&quot; a smoky
          concoction of fresh catch, the occasional adventurous squirrel, and a
          secret rub that could make shoe leather taste like Sunday dinner. He
          slapped together a hand-painted sign reading &apos;Zeke&apos;s Grill
          &amp; Bait – Bait for the Hook, Grill for the Cook!&apos; and just
          like that, a Michigan tradition was born in a cloud of charcoal smoke
          and good old-fashioned ingenuity. Word spread faster than gossip at
          the general store: come for the worms, stay for the sizzle.
        </p>

        <p>
          The little shack grew through hard times and high waters, passed down
          with love, a few new recipes, and plenty of tall tales. Grandpappy
          added the famous onion rings, your dad perfected the burger batter,
          and now here you are keeping the flame alive at Todd&apos;s Grill and
          Bait. It&apos;s still the same quaint spot where the bait stays
          wriggly, the grill stays hot, and every customer leaves with a full
          belly and a fish story worth telling. Just the way Pappy Zeke
          would&apos;ve chuckled over.
        </p>
      </div>
    </section>
  );
}
