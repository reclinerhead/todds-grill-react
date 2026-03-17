export const dynamic = "force-dynamic";

import Image from "next/image";
import MenuGrid from "./components/MenuGrid";
import MobileHeader from "./components/MobileHeader";
import ReviewsGrid from "./components/ReviewsGrid";
import ContactForm from "./components/ContactForm";
import ReviewForm from "./components/ReviewForm";
import { getHeroMenuPhotos } from "@/lib/data/restaurant";
import StatsBar from "./components/StatsBar";
import PhotoGallery from "./components/PhotoGallery";

export default async function Home() {
  const heroPhotos = await getHeroMenuPhotos(3);

  return (
    <>
      <div className="min-h-screen flex flex-col bg-background text-gray-200">
        {/* Header */}
        <MobileHeader />

        <main className="grow flex flex-col">
          {/* Hero Section */}
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
                    Burgers, comfort food, and live bait — all under one roof.
                    Come hungry.
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

          {/* Menu Section */}
          <MenuGrid />

          {/* Reviews Section */}
          <ReviewsGrid />

          {/* Submit Review Section */}
          <ReviewForm />

          {/* Photo Gallery Section */}
          <PhotoGallery />

          {/* Hours & Location Section */}
          <section id="hours" className="py-16 bg-orange-100">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-8 text-orange-600">
                Hours & Location
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-orange-800">
                <div>
                  <h3 className="text-2xl font-semibold mb-4 ">Hours</h3>
                  <ul className="text-lg">
                    <li>Monday - Thursday: 11am - 10pm</li>
                    <li>Friday - Saturday: 11am - 11pm</li>
                    <li>Sunday: Closed</li>
                  </ul>
                  <h3 className="text-2xl font-semibold mt-6 mb-4">Location</h3>
                  <p className="text-lg">
                    604 Norton Drive
                    <br />
                    Kalamazoo, MI 49001
                  </p>
                  <p className="text-lg">Phone: (123) 456-7890</p>
                </div>
                <div>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1000!2d-85.5722795!3d42.2652027!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0:0x0!2s604+Norton+Drive,+Kalamazoo,+MI+49001!5e0!3m2!1sen!2sus!4v1640999999999!5m2!1sen!2sus"
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <ContactForm />
        </main>

        {/* Footer */}
        <footer className="bg-blue-900 text-white py-8">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; 2026 Todds Grill and Bait Shop. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
