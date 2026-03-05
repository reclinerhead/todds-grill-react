import fs from "fs/promises";
import path from "path";

type Review = {
  type: "threaded" | "standalone";
  parent?: {
    avatar: string;
    bgColor: string;
    name: string;
    rating: string;
    date: string;
    text: string;
    item: string;
  };
  avatar?: string;
  bgColor?: string;
  name?: string;
  rating?: string;
  date?: string;
  text: string;
  item?: string;
  replies?: Review[];
};

export default async function ReviewsGrid() {
  const filePath = path.join(process.cwd(), "data", "reviews.json");
  const jsonData = await fs.readFile(filePath, "utf-8");
  const reviews: Review[] = JSON.parse(jsonData);

  return (
    <section id="reviews" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-orange-600">
          What Our Customers Say
        </h2>

        <div className="max-w-3xl mx-auto space-y-12">
          {reviews.map((review, index) => (
            <div key={index}>
              {review.type === "threaded" && review.parent ? (
                <div className="space-y-6">
                  {/* Parent review */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 ${review.parent.bgColor} rounded-full flex items-center justify-center text-2xl`}
                        >
                          {review.parent.avatar}
                        </div>
                        <div>
                          <p className="text-gray-600 font-semibold text-lg">
                            {review.parent.name}
                          </p>
                          <div className="flex text-orange-500">
                            {review.parent.rating}
                          </div>
                          <p className="text-sm text-gray-500">
                            {review.parent.date}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 text-gray-700">{review.parent.text}</p>
                    <p className="text-xs text-orange-600 mt-3 font-medium">
                      — {review.parent.item}
                    </p>
                  </div>

                  {/* Replies */}
                  {review.replies?.map((reply, replyIndex) => (
                    <div
                      key={replyIndex}
                      className={`ml-${replyIndex === 0 ? "8" : "14"} pl-6 border-l-2 border-orange-300`}
                    >
                      <div className="bg-orange-50 p-5 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-${replyIndex === 0 ? "9" : "8"} h-${replyIndex === 0 ? "9" : "8"} ${reply.bgColor || "bg-gray-100"} rounded-full flex items-center justify-center text-${replyIndex === 0 ? "sm" : "xs"}`}
                          >
                            {reply.avatar}
                          </div>
                          <div>
                            <p className="text-gray-600 font-semibold">
                              {reply.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {reply.date}
                            </p>
                          </div>
                        </div>
                        <p className="mt-3 text-gray-700">{reply.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Standalone review */
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 ${review.bgColor} rounded-full flex items-center justify-center text-2xl`}
                      >
                        {review.avatar}
                      </div>
                      <div>
                        <p className="text-gray-600 font-semibold text-lg">
                          {review.name}
                        </p>
                        <div className="flex text-orange-500">
                          {review.rating}
                        </div>
                        <p className="text-sm text-gray-500">{review.date}</p>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-700">{review.text}</p>
                  <p className="text-xs text-orange-600 mt-3 font-medium">
                    — {review.item}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
