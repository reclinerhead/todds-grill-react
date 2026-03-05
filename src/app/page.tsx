import MenuGrid from "./components/MenuGrid";
import MobileHeader from "./components/MobileHeader";
import ReviewsGrid from "./components/ReviewsGrid";
import ContactForm from "./components/ContactForm";

export default function Home() {
  return (
    <>
      {/* Header */}
      <MobileHeader />

      {/* Hero Section */}
      <section
        className="h-screen flex items-center justify-center text-white"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="text-center bg-black bg-opacity-50 p-8 rounded">
          <h2 className="text-5xl font-bold mb-4">
            Welcome to Todds Grill and Bait Shop
          </h2>
          <p className="text-xl mb-6">
            The best grilled food in town. And minnows and wrigglers when you
            need them.
          </p>
          <a
            href="#menu"
            className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded text-lg font-semibold"
          >
            View Menu
          </a>
        </div>
      </section>

      {/* Menu Section */}
      <MenuGrid />

      {/* Reviews Section */}
      <ReviewsGrid />

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

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 Todds Grill and Bait Shop. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
