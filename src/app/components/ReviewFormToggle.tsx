"use client";

import { useState, useEffect } from "react";
import ReviewForm from "./ReviewForm";

export default function ReviewFormToggle() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const check = () => {
      if (window.location.hash === "#submitreview") {
        setOpen(true);
      }
    };
    check(); // open immediately if page loaded with the hash
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, []);

  if (open) return <ReviewForm onSuccess={() => setOpen(false)} />;

  return (
    <section id="submitreview" className="py-16 bg-white">
      <div className="container mx-auto px-4 flex flex-col items-center gap-4">
        <p className="text-gray-500 text-sm uppercase tracking-widest font-semibold">
          Enjoyed your visit?
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
        >
          <span>✍️</span> Leave Your Own Review
        </button>
      </div>
    </section>
  );
}
