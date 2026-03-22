export const dynamic = "force-dynamic";

import MenuGrid from "./components/MenuGrid";
import MobileHeader from "./components/MobileHeader";
import ReviewsGrid from "./components/ReviewsGrid";
import ContactForm from "./components/ContactForm";
import ReviewFormToggle from "./components/ReviewFormToggle";
import PhotoGallery from "./components/PhotoGallery";
import HeroSection from "./components/HeroSection";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

export default async function Home() {
  // call our supabase storage bucket to get the list of gallery images, then map to public URLs for the PhotoGallery component
  const supabase = await createSupabaseServerClient();

  // Demo mode: allow anonymous access to /manager — no auth required.
  // Triggered by hostname (e.g. portfolio/recruiter demo deployment) or env var.
  // On Vercel, the public domain is in x-forwarded-host; host contains the internal hostname.
  const headersList = await headers();
  const host =
    headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "";
  const isDemo =
    host === "todds-grill-demo.toddtech.llc" ||
    process.env.IS_DEMONSTRATION_MODE === "true";

  // Check if the current user is the manager
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isManager = !!user && user.email === process.env.MANAGER_EMAIL;
  const { data: galleryFiles, error: galleryError } = await supabase.storage
    .from("restaurant-files")
    .list("gallery", { sortBy: { column: "created_at", order: "desc" } });

  if (galleryError)
    console.error("[Gallery] storage list error:", galleryError);

  const galleryImages = (galleryFiles ?? [])
    .filter((f) => f.name !== ".emptyFolderPlaceholder")
    .map((f) => {
      const { data } = supabase.storage
        .from("restaurant-files")
        .getPublicUrl(`gallery/${f.name}`);
      return data.publicUrl;
    });

  return (
    <>
      <div className="min-h-screen flex flex-col bg-background text-gray-200">
        {/* Header */}
        <MobileHeader isManager={isManager} isDemo={isDemo} />

        <main className="grow flex flex-col">
          {/* Hero Section */}
          <HeroSection />

          {/* Menu Section */}
          <MenuGrid />

          {/* Reviews Section */}
          <ReviewsGrid />

          {/* Submit Review Section */}
          <ReviewFormToggle />

          {/* Photo Gallery Section */}
          <PhotoGallery images={galleryImages} />

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
                    src="https://www.google.com/maps/embed?pb=!1m10!1m8!1m3!1d1267203.5992153015!2d-84.52240640860875!3d42.46399355077823!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v1773866133632!5m2!1sen!2sus"
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
        <footer className="bg-gray-950 text-white py-8">
          <div className="container mx-auto px-4 text-center">
            <p className="text-orange-500">
              &copy; 2026 Todd&apos;s Grill and Bait Shop. All rights reserved.
            </p>

            <p className="mt-2 text-gray-300">
              Web design and hosting by{" "}
              <a
                href="https://toddtech.llc"
                target="_blank"
                className="text-orange-500 hover:text-orange-400 transition-colors"
              >
                ToddTech LLC
              </a>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
