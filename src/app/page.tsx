export const dynamic = "force-dynamic";

import Image from "next/image";
import MenuGrid from "./components/MenuGrid";
import MobileHeader from "./components/MobileHeader";
import ReviewsGrid from "./components/ReviewsGrid";
import ContactForm from "./components/ContactForm";
import ReviewForm from "./components/ReviewForm";
import { getFeaturedMenuItem } from "@/lib/data/restaurant";
import StatsBar from "./components/StatsBar";
import PhotoGallery from "./components/PhotoGallery";

export default async function Home() {
  const featuredItem = await getFeaturedMenuItem();

  return (
    <>
      <div className="min-h-screen flex flex-col bg-background text-gray-200">
        {/* Header */}
        <MobileHeader />

        <main className="grow flex flex-col">
          {/* Hero Section */}
          <section
            className="relative h-screen flex items-center justify-center color-text overflow-hidden"
            style={{
              backgroundImage: "url('/baitshop1.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Optional: subtle gradient overlay for better contrast */}
            <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/50 to-black/70" />

            {/* Frosted glass card */}
            <div className="relative z-10 bg-white/10 backdrop-blur-sm border border-white/20 p-8 md:p-12 rounded-2xl text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-blue-300">
                Welcome to Todd&apos;s Grill and Bait
              </h1>

              <p className="mt-4 text-em md:text-md text-blue-100 max-w-2xl mx-auto pb-6">
                Burgers and bait - what else could you ask for?
              </p>

              {/* Featured Menu Item Highlight */}
              {featuredItem ? (
                <div className="bg-slate-900 text-gray-300 rounded-2xl p-6 md:p-8 mb-10 max-w-2xl mx-auto shadow-lg">
                  <h2 className="text-2xl md:text-3xl font-semibold mb-3 text-slate-500">
                    Featured Today: {featuredItem.name}
                  </h2>

                  {featuredItem.image_url ? (
                    <Image
                      src={featuredItem.image_url}
                      alt={featuredItem.name || "Featured menu item"}
                      width={800}
                      height={500}
                      className="w-full max-h-64 object-cover rounded-xl mb-4"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded-xl mb-4 flex items-center justify-center text-gray-500">
                      No image available
                    </div>
                  )}

                  <p className="text-xl font-bold text-orange-600 mb-6">
                    {featuredItem.price}
                  </p>
                </div>
              ) : (
                <p className="text-lg mb-10 opacity-90">
                  Check out our full menu below!
                </p>
              )}

              <a
                href="#menu"
                className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold text-lg md:text-xl px-8 py-4 md:px-10 md:py-5 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-orange-500 focus:ring-opacity-50"
              >
                View Full Menu
              </a>
            </div>
          </section>

          {/* ────────────────────────────────────────────────
            NEW: The Stats Bar – positioned at the bottom
            This is the key part you're adding
        ──────────────────────────────────────────────── */}
          <div className="py-12">
            <StatsBar />
          </div>

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
