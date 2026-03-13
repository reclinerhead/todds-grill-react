"use client";

import { FormEvent, useEffect, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";

type FormErrors = {
  productName?: string;
  rating?: string;
  reviewText?: string;
  reviewerEmail?: string;
};

type MenuOption = {
  id: string;
  name: string;
  is_active: boolean;
};

const MAX_REVIEW_LENGTH = 1000;

export default function ReviewForm() {
  const [menuOptions, setMenuOptions] = useState<MenuOption[]>([]);
  const [isLoadingMenuItems, setIsLoadingMenuItems] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const abortController = new AbortController();

    const fetchMenuItems = async () => {
      setIsLoadingMenuItems(true);

      try {
        const response = await fetch("/api/menu-items", {
          method: "GET",
          signal: abortController.signal,
        });

        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          throw new Error(data.error || "Unable to load menu items.");
        }

        const data = (await response.json()) as { items?: MenuOption[] };
        const items = data.items ?? [];

        items.sort((a, b) => a.name.localeCompare(b.name));
        setMenuOptions(items);
      } catch (error) {
        if (abortController.signal.aborted) return;

        const message =
          error instanceof Error ? error.message : "Unable to load menu items.";
        toast.error(message);
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoadingMenuItems(false);
        }
      }
    };

    fetchMenuItems();

    return () => {
      abortController.abort();
    };
  }, []);

  const validate = () => {
    const nextErrors: FormErrors = {};
    const emailTrimmed = reviewerEmail.trim();

    if (selectedProducts.length === 0) {
      nextErrors.productName = "Please select at least one menu item.";
    }

    if (rating < 1) {
      nextErrors.rating = "Please select a rating from 1 to 5 stars.";
    }

    if (!reviewText.trim()) {
      nextErrors.reviewText = "Review text is required.";
    }

    if (reviewText.trim().length > MAX_REVIEW_LENGTH) {
      nextErrors.reviewText = `Review must be ${MAX_REVIEW_LENGTH} characters or less.`;
    }

    if (emailTrimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      nextErrors.reviewerEmail = "Please enter a valid email address.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const clearForm = () => {
    setSelectedProducts([]);
    setRating(0);
    setReviewText("");
    setReviewerName("");
    setReviewerEmail("");
    setErrors({});
    setHoveredRating(0);
  };

  const toggleProductSelection = (itemName: string) => {
    setSelectedProducts((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName],
    );

    setErrors((prev) => ({ ...prev, productName: undefined }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productNames: selectedProducts,
          rating,
          reviewText: reviewText.trim(),
          reviewerName: reviewerName.trim(),
          reviewerEmail: reviewerEmail.trim(),
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Unable to submit review.");
      }

      toast.success("Thanks! Your review has been submitted.");
      clearForm();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while submitting your review.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeStars = hoveredRating || rating;

  return (
    <section
      id="submitreview"
      aria-labelledby="submit-review-title"
      className="py-16"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-xl p-6 md:p-8">
          <h2
            id="submit-review-title"
            className="text-3xl font-bold text-orange-600 dark:text-orange-400"
          >
            Leave a Review
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Tell us what you tried and how it tasted.
          </p>

          <form className="mt-8 space-y-5" onSubmit={onSubmit} noValidate>
            <div>
              <label
                htmlFor="productNames"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Menu items reviewed <span aria-hidden="true">*</span>
              </label>

              <div
                id="productNames"
                role="group"
                aria-label="Menu items reviewed"
                aria-describedby={
                  errors.productName ? "productName-error" : "productNames-help"
                }
              >
                <div className="mt-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 md:p-4">
                  {isLoadingMenuItems ? (
                    <p className="text-sm text-slate-500">
                      Loading menu items...
                    </p>
                  ) : menuOptions.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No menu items available right now.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                      {menuOptions.map((item) => {
                        const isSelected = selectedProducts.includes(item.name);

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleProductSelection(item.name)}
                            aria-pressed={isSelected}
                            className={`w-full rounded-lg border px-3 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                              isSelected
                                ? "border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-slate-900 dark:text-slate-100"
                                : "border-slate-300 dark:border-slate-600 hover:border-orange-400 text-slate-700 dark:text-slate-200"
                            }`}
                          >
                            <span className="flex items-center justify-between gap-2">
                              <span className="font-medium">{item.name}</span>
                              {!item.is_active && (
                                <span className="rounded-full bg-slate-200 dark:bg-slate-700 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300">
                                  inactive
                                </span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {selectedProducts.length > 0 && (
                    <div className="mt-3 border-t border-slate-200 dark:border-slate-700 pt-3">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Selected ({selectedProducts.length})
                        </p>
                        <button
                          type="button"
                          onClick={() => setSelectedProducts([])}
                          className="text-xs font-semibold text-orange-600 hover:text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded"
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedProducts.map((itemName) => (
                          <button
                            key={itemName}
                            type="button"
                            onClick={() => toggleProductSelection(itemName)}
                            className="rounded-full bg-orange-100 dark:bg-orange-900/40 px-3 py-1 text-xs font-semibold text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800/40 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            aria-label={`Remove ${itemName}`}
                          >
                            {itemName} x
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <p id="productNames-help" className="mt-1 text-xs text-slate-500">
                Tap items to select multiple. Tap a selected item again to
                remove it.
              </p>
              {errors.productName && (
                <p id="productName-error" className="mt-1 text-sm text-red-600">
                  {errors.productName}
                </p>
              )}
            </div>

            <div>
              <span
                id="rating-label"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Rating <span aria-hidden="true">*</span>
              </span>
              <div
                role="radiogroup"
                aria-labelledby="rating-label"
                aria-invalid={Boolean(errors.rating)}
                aria-describedby={errors.rating ? "rating-error" : undefined}
                className="mt-2 flex items-center gap-2"
              >
                {[1, 2, 3, 4, 5].map((starValue) => (
                  <button
                    key={starValue}
                    type="button"
                    role="radio"
                    aria-checked={rating === starValue}
                    aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoveredRating(starValue)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        starValue <= activeStars
                          ? "fill-orange-500 text-orange-500"
                          : "text-slate-400"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-slate-600 dark:text-slate-300">
                  {rating > 0 ? `${rating}/5` : "Select a rating"}
                </span>
              </div>
              {errors.rating && (
                <p id="rating-error" className="mt-1 text-sm text-red-600">
                  {errors.rating}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="reviewText"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Review text <span aria-hidden="true">*</span>
              </label>
              <textarea
                id="reviewText"
                name="reviewText"
                rows={5}
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
                aria-required="true"
                aria-invalid={Boolean(errors.reviewText)}
                aria-describedby={
                  errors.reviewText ? "reviewText-error" : "reviewText-help"
                }
                className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="The fries were crispy and the burger was cooked perfectly."
              />
              <p id="reviewText-help" className="mt-1 text-xs text-slate-500">
                Max {MAX_REVIEW_LENGTH} characters.
              </p>
              {errors.reviewText && (
                <p id="reviewText-error" className="mt-1 text-sm text-red-600">
                  {errors.reviewText}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="reviewerName"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Your name (optional)
                </label>
                <input
                  id="reviewerName"
                  name="reviewerName"
                  type="text"
                  value={reviewerName}
                  onChange={(event) => setReviewerName(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Jane D."
                />
              </div>
              <div>
                <label
                  htmlFor="reviewerEmail"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Email (optional)
                </label>
                <input
                  id="reviewerEmail"
                  name="reviewerEmail"
                  type="email"
                  value={reviewerEmail}
                  onChange={(event) => setReviewerEmail(event.target.value)}
                  aria-invalid={Boolean(errors.reviewerEmail)}
                  aria-describedby={
                    errors.reviewerEmail ? "reviewerEmail-error" : undefined
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="jane@example.com"
                />
                {errors.reviewerEmail && (
                  <p
                    id="reviewerEmail-error"
                    className="mt-1 text-sm text-red-600"
                  >
                    {errors.reviewerEmail}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-lg bg-orange-600 px-5 py-2.5 font-semibold text-white shadow-md transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {isSubmitting ? "Submitting..." : "Submit review"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
