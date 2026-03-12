/* eslint-disable react/no-unescaped-entities */
// components/StatsBar.tsx
// Server Component - fetches live stats using our shared Supabase helpers

import { getActiveMenuCount, getReviewCount } from "@/lib/supabase";
import {
  UserCheck,
  ClipboardList,
  Star,
  PartyPopper,
  ThumbsDown,
} from "lucide-react";

export default async function StatsBar() {
  // Fetch real counts (runs on server - fast & secure)
  const activeDishes = await getActiveMenuCount();
  const totalReviews = await getReviewCount();

  // Static for now - easy to make dynamic later
  const years = "7+";
  const happyCustomers = "10k+";

  return (
    <div className="bg-zinc-900/95 backdrop-blur-md rounded-3xl p-8 md:p-10 shadow-2xl max-w-5xl mx-auto">
      <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-8 text-center">
        {/* Years of Experience */}
        <div className="flex flex-col items-center">
          <UserCheck className="w-12 h-12 text-violet-500 mb-4" />
          <div className="text-5xl font-bold text-violet-400 tracking-tighter">
            {years}
          </div>
          <p className="text-zinc-400 text-sm uppercase tracking-widest mt-1">
            Years of Experience
          </p>
        </div>

        {/* Dishes - now using real count */}
        <div className="flex flex-col items-center">
          <ClipboardList className="w-12 h-12 text-violet-500 mb-4" />
          <div className="text-5xl font-bold text-violet-400 tracking-tighter">
            {activeDishes}
          </div>
          <p className="text-zinc-400 text-sm uppercase tracking-widest mt-1">
            Dishes in Our Menu
          </p>
        </div>

        {/* Reviews - now using real count */}
        <div className="flex flex-col items-center">
          <Star className="w-12 h-12 text-violet-500 mb-4" />
          <div className="text-5xl font-bold text-violet-400 tracking-tighter">
            {totalReviews}
          </div>
          <p className="text-zinc-400 text-sm uppercase tracking-widest mt-1">
            Customer Reviews
          </p>
        </div>

        {/* Happy Customers */}
        <div className="flex flex-col items-center">
          <PartyPopper className="w-12 h-12 text-violet-500 mb-4" />
          <div className="text-5xl font-bold text-violet-400 tracking-tighter">
            {happyCustomers}
          </div>
          <p className="text-zinc-400 text-sm uppercase tracking-widest mt-1">
            Happy Customers
          </p>
        </div>

        {/* Unhappy Customers */}
        <div className="flex flex-col items-center">
          <ThumbsDown className="w-12 h-12 text-violet-500 mb-4" />
          <div className="text-5xl font-bold text-violet-400 tracking-tighter">
            ??
          </div>
          <p className="text-zinc-400 text-sm uppercase tracking-widest mt-1">
            <span>
              Unhappy Customers - we don't keep track of these, but we hope it's
              zero!
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
