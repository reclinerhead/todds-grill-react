import { supabase } from "@/lib/supabase";
import { formatFullDate, formatSmartDate } from "@/lib/formatDate";

type Review = {
  id: number;
  parent_id: string | null;
  author_name: string;
  author_avatar: string | null;
  author_bg_color: string | null;
  rating: string | null;
  review_text: string;
  item_reviewed: string | null;
  created_at: string;
};

export default async function ReviewsGrid() {
  // Fetch all reviews from Supabase
  const { data: reviewsData, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase fetch error:", error);
    return (
      <p className="text-red-600 text-center">
        Could not load reviews right now.
      </p>
    );
  }

  const reviews: Review[] = reviewsData || [];

  // Find top-level reviews (no parent)
  const topLevelReviews = reviews.filter((r) => r.parent_id === null);

  // Helper to get replies for a parent id
  const getReplies = (parentId: number) =>
    reviews.filter((r) => r.parent_id === parentId.toString());

  return (
    <section id="reviews" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-orange-600">
          What Our Customers Say
        </h2>

        <div className="max-w-3xl mx-auto space-y-12">
          {topLevelReviews.map((review) => (
            <div key={review.id}>
              {/* Parent / Standalone Review Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 ${review.author_bg_color || "bg-gray-200"} rounded-full flex items-center justify-center text-2xl`}
                    >
                      {review.author_avatar || "?"}
                    </div>
                    <div>
                      <p className="text-gray-600 font-semibold text-lg">
                        {review.author_name}
                      </p>
                      {review.rating && (
                        <div className="flex text-orange-500">
                          {review.rating}
                        </div>
                      )}
                      <p
                        className="text-sm text-gray-500"
                        title={formatFullDate(review.created_at)}
                      >
                        {formatSmartDate(review.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-gray-700">{review.review_text}</p>
                {review.item_reviewed && (
                  <p className="text-xs text-orange-600 mt-3 font-medium">
                    — {review.item_reviewed}
                  </p>
                )}
              </div>

              {/* Replies (nested) */}
              {getReplies(review.id).map((reply, replyIndex) => (
                <div
                  key={reply.id}
                  className={`ml-${replyIndex === 0 ? "8" : "14"} pl-6 border-l-2 border-orange-300 mt-4`}
                >
                  <div className="bg-orange-50 p-5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-${replyIndex === 0 ? "9" : "8"} h-${
                          replyIndex === 0 ? "9" : "8"
                        } ${reply.author_bg_color || "bg-gray-100"} rounded-full flex items-center justify-center text-${
                          replyIndex === 0 ? "sm" : "xs"
                        }`}
                      >
                        {reply.author_avatar || "?"}
                      </div>
                      <div>
                        <p className="text-gray-600 font-semibold">
                          {reply.author_name}
                        </p>
                        <p
                          className="text-xs text-gray-500"
                          title={formatFullDate(reply.created_at)}
                        >
                          {formatSmartDate(reply.created_at)}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-gray-700">{reply.review_text}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {topLevelReviews.length === 0 && (
            <p className="text-center text-gray-500">
              No reviews yet. Be the first!
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
