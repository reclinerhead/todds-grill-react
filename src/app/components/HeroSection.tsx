import Image from "next/image";
import { getHeroMenuPhotos } from "@/lib/data/restaurant";
import StatsBar from "./StatsBar";

export default async function HeroSection() {
  const heroPhotos = await getHeroMenuPhotos(3);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gray-950">
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "url('/baitshop1.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-linear-to-r from-gray-950 via-gray-950/90 to-gray-950/40" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-20 flex flex-col gap-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <div className="text-right">
            <p className="text-orange-500 font-semibold tracking-widest uppercase text-sm mb-3">
              Kalamazoo&apos;s favorite since 1912
            </p>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
              Todd&apos;s Grill
              <br />
              <span className="text-orange-500">&amp; Bait</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-md text-right ml-auto">
              Burgers, comfort food, and live bait — all under one roof. Come
              hungry.
            </p>
            <div className="flex flex-wrap gap-4 justify-end">
              <a
                href="#menu"
                className="bg-orange-600 hover:bg-orange-500 text-white font-semibold px-8 py-4 rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
              >
                View Full Menu
              </a>
            </div>
          </div>

          {/* Right: Photo collage */}
          {heroPhotos.length >= 3 && (
            <div className="flex gap-3 h-105">
              {/* Tall left image */}
              <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={heroPhotos[0].image_url}
                  alt={heroPhotos[0].name ?? "Menu item"}
                  width={400}
                  height={600}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              {/* Two stacked images on the right */}
              <div className="flex flex-col gap-3 flex-1">
                <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={heroPhotos[1].image_url}
                    alt={heroPhotos[1].name ?? "Menu item"}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={heroPhotos[2].image_url}
                    alt={heroPhotos[2].name ?? "Menu item"}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Bar inside hero */}
        <div className="border-t border-white/10 pt-10">
          <StatsBar />
        </div>
      </div>
    </section>
  );
}
