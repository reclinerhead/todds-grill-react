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
    "/gallery/grok-image-fb43fa7b-a49e-42de-bad9-dfa559e3e611.png",
    "/gallery/f69599c6-e679-4a41-ba35-c15ded76e67d.jpg",
    "/gallery/eddb89b7-7e91-4365-bdbd-250662e07fb3.jpg",
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
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
    </section>
  );
}
