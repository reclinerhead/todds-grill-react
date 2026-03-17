import { formatFullDate, formatSmartDate } from "@/lib/formatDate";

import { getReviewsForGrid } from "@/lib/data/restaurant";

export default async function ReviewsGrid() {
  // load our review data from the server
  const reviews = await getReviewsForGrid();

  if (reviews === null) {
    return (
      <section id="reviews" className="py-16 bg-gray-50">
        <p className="text-center text-red-500">
          Could not load reviews right now. Please try again later.
        </p>
      </section>
    );
  }

  // Find top-level reviews (no parent)
  const topLevelReviews = reviews.filter((r) => r.parent_id === null);

  // Helper to get replies for a parent id
  const getReplies = (parentId: number) =>
    reviews.filter((r) => r.parent_id === parentId.toString());

  return (
    <section id="reviews" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-3 text-orange-600">
          What Our Customers Say
        </h2>
        <div className="text-center mb-12">
          <a
            href="#submitreview"
            className="inline-flex items-center gap-2 text-orange-600 font-semibold hover:text-orange-500 underline underline-offset-4 decoration-orange-400 transition-colors"
          >
            ✍️ Leave your own review — as long as it&apos;s a good one!
          </a>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-gray-600 font-semibold text-lg">
                          {review.author_name}
                        </p>
                        {review.manager_response && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                            ✓ Responded
                          </span>
                        )}
                      </div>
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
                {review.manager_response && (
                  <div className="mt-4 pl-4 border-l-4 border-orange-300 bg-orange-50 rounded-r-lg py-2 pr-3">
                    <p className="text-xs font-semibold text-orange-700 mb-1">
                      Todd (Owner) 🐟
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {review.manager_response}
                    </p>
                  </div>
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
