"use client";

import { useState } from "react";
import Link from "next/link";

export default function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="header-bg text-white py-4"
      style={{ backgroundColor: "rgba(30, 58, 138, 0.4)" }}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl md:text-3xl font-bold tracking-tight hover:text-orange-200 transition-colors"
        >
          Todd&apos;s Grill & Bait
        </Link>
        <nav className="hidden md:flex space-x-4">
          <a href="#menu" className="hover:text-orange-200">
            Menu
          </a>
          <a href="#reviews" className="hover:text-orange-200">
            Reviews
          </a>
          <a href="#photos" className="hover:text-orange-200">
            Photo Gallery
          </a>
          <a href="#hours" className="hover:text-orange-200">
            Hours & Location
          </a>
          <a href="#contact" className="hover:text-orange-200">
            Contact
          </a>
        </nav>
        <button
          className="md:hidden text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {menuOpen && (
        <nav
          className="md:hidden bg-orange-700 py-2"
          style={{ backgroundColor: "rgba(255, 165, 0, 0.8)" }}
        >
          <a href="#menu" className="block px-4 py-2 hover:bg-orange-800">
            Menu
          </a>
          <a href="#reviews" className="block px-4 py-2 hover:bg-orange-800">
            Reviews
          </a>
          <a href="#hours" className="block px-4 py-2 hover:bg-orange-800">
            Hours & Location
          </a>
          <a href="#contact" className="block px-4 py-2 hover:bg-orange-800">
            Contact
          </a>
        </nav>
      )}
    </header>
  );
}
