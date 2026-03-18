"use client";

import { useState } from "react";
import Link from "next/link";

export default function MobileHeader({
  isManager = false,
  isDemo = false,
}: {
  isManager?: boolean;
  isDemo?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const openManagerChatPopup = () => {
    setChatOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-50 text-white bg-gray-950/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-xl md:text-2xl font-extrabold tracking-tight text-white hover:text-orange-400 transition-colors"
          >
            Todd&apos;s Grill <span className="text-orange-500">& Bait</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-300">
            <a href="#menu" className="hover:text-orange-400 transition-colors">
              Menu
            </a>
            <a
              href="#reviews"
              className="hover:text-orange-400 transition-colors"
            >
              Reviews
            </a>
            <a
              href="#photos"
              className="hover:text-orange-400 transition-colors"
            >
              Photo Gallery
            </a>
            <a
              href="#hours"
              className="hover:text-orange-400 transition-colors"
            >
              Hours & Location
            </a>
            <a
              href="#contact"
              className="hover:text-orange-400 transition-colors"
            >
              Contact
            </a>
            <button
              type="button"
              className="border border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white px-4 py-1.5 rounded-lg transition-all duration-200"
              onClick={openManagerChatPopup}
            >
              Talk to the Manager
            </button>
            {(isManager || isDemo) && (
              <Link
                href="/manager"
                className="border border-white/20 text-gray-300 hover:border-orange-400 hover:text-orange-400 px-4 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium"
              >
                Manage
              </Link>
            )}
          </nav>
          <button
            className="md:hidden text-gray-300 hover:text-white transition-colors p-1"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {menuOpen && (
          <nav className="md:hidden bg-gray-900 border-t border-white/10 py-2 text-sm font-medium text-gray-300">
            <a
              href="#menu"
              className="block px-6 py-3 hover:text-orange-400 hover:bg-white/5 transition-colors"
            >
              Menu
            </a>
            <a
              href="#reviews"
              className="block px-6 py-3 hover:text-orange-400 hover:bg-white/5 transition-colors"
            >
              Reviews
            </a>
            <a
              href="#photos"
              className="block px-6 py-3 hover:text-orange-400 hover:bg-white/5 transition-colors"
            >
              Photo Gallery
            </a>
            <a
              href="#hours"
              className="block px-6 py-3 hover:text-orange-400 hover:bg-white/5 transition-colors"
            >
              Hours & Location
            </a>
            <a
              href="#contact"
              className="block px-6 py-3 hover:text-orange-400 hover:bg-white/5 transition-colors"
            >
              Contact
            </a>
            <div className="px-6 py-3">
              <button
                type="button"
                className="w-full border border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white px-4 py-2 rounded-lg transition-all duration-200"
                onClick={() => {
                  setMenuOpen(false);
                  openManagerChatPopup();
                }}
              >
                Talk to Manager
              </button>
            </div>

            {(isManager || isDemo) && (
              <div className="px-6 py-3">
                <Link
                  href="/manager"
                  className="block w-full text-center border border-white/20 text-gray-300 hover:border-orange-400 hover:text-orange-400 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  Manage
                </Link>
              </div>
            )}
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
