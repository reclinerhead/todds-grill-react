"use client";

import { useState } from "react";
import Link from "next/link";

export default function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const openManagerChatPopup = () => {
    setChatOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-50  text-white py-4 bg-surface-dark">
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
            <button
              type="button"
              className="hover:text-orange-200"
              onClick={openManagerChatPopup}
            >
              Talk to Manager
            </button>
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
            <button
              type="button"
              className="block w-full px-4 py-2 text-left hover:bg-orange-800"
              onClick={() => {
                setMenuOpen(false);
                openManagerChatPopup();
              }}
            >
              Talk to Manager
            </button>
          </nav>
        )}
      </header>

      {chatOpen && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setChatOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Talk to Manager"
            className="relative h-[65vh] md:h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-orange-300/30 bg-gray-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-slate-900 px-4 py-2 text-white">
              <h2 className="text-sm font-semibold">Talk to Manager</h2>
              <button
                type="button"
                className="rounded px-2 py-1 text-sm hover:bg-white/10"
                onClick={() => setChatOpen(false)}
              >
                Close
              </button>
            </div>
            <iframe
              src="/chat"
              title="Talk to Manager chat"
              className="h-[calc(100%-40px)] w-full border-0"
            />
          </div>
        </div>
      )}
    </>
  );
}
