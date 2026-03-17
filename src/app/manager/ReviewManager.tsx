"use client";

import { useState, useTransition } from "react";
import { Trash2, MessageSquare } from "lucide-react";
import {
  replyToReview,
  deleteReview,
  deleteComment,
} from "@/app/actions/manager-reviews";
import { formatSmartDate, formatFullDate } from "@/lib/formatDate";

export type ReviewRow = {
  id: number;
  parent_id: string | null;
  created_at: string;
  author_name: string;
  author_avatar: string | null;
  author_bg_color: string | null;
  rating: string | null;
  review_text: string;
  item_reviewed: string;
  author_email: string | null;
  manager_response: string | null;
  ai_sentiment: string | null;
  ai_sentiment_reasoning: string | null;
  attention_needed: boolean;
};

function SentimentBadge({ sentiment }: { sentiment: string | null }) {
  if (!sentiment) return null;
  const map: Record<string, { label: string; cls: string }> = {
    positive: {
      label: "AI: Positive",
      cls: "bg-green-100 text-green-700 border border-green-300",
    },
    negative: {
      label: "AI: Negative",
      cls: "bg-red-100 text-red-700 border border-red-300",
    },
    neutral: {
      label: "AI: Neutral",
      cls: "bg-gray-100 text-gray-600 border border-gray-300",
    },
  };
  const badge = map[sentiment] ?? map["neutral"];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}
    >
      {badge.label}
    </span>
  );
}

// ─── Comment card (child review) ─────────────────────────────────────────────

function CommentCard({ comment }: { comment: ReviewRow }) {
  const [deleting, startDeleteTransition] = useTransition();

  function handleDelete() {
    if (
      !window.confirm(
        `Delete ${comment.author_name}'s comment? This cannot be undone.`,
      )
    )
      return;
    startDeleteTransition(async () => {
      await deleteComment(comment.id);
    });
  }

  return (
    <div className="flex gap-3" style={{ opacity: deleting ? 0.4 : 1 }}>
      {/* Thread dot + line */}
      <div className="flex flex-col items-center pt-1">
        <div className="w-3 h-3 rounded-full border-2 border-gray-300 bg-white shrink-0" />
        <div className="w-px flex-1 bg-gray-200 mt-1" />
      </div>

      {/* Comment body */}
      <div className="flex-1 pb-3">
        <div className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <div
                className="shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white select-none"
                style={{
                  backgroundColor: comment.author_bg_color ?? "#6b7280",
                }}
              >
                {comment.author_name.charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold text-gray-800 text-sm">
                {comment.author_name}
              </span>
              <span className="text-xs text-gray-400">
                {formatSmartDate(comment.created_at)}
              </span>
              {comment.author_email && (
                <a
                  href={`mailto:${comment.author_email}`}
                  className="text-xs text-gray-400 hover:text-orange-600 underline underline-offset-2"
                >
                  {comment.author_email}
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              title="Delete comment"
              className="shrink-0 p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
            >
              <Trash2 size={13} />
            </button>
          </div>

          {/* Comment text */}
          <p className="mt-2 text-sm text-gray-700 leading-relaxed">
            {comment.review_text}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Parent review card ───────────────────────────────────────────────────────

function ReviewCard({
  review,
  comments,
}: {
  review: ReviewRow;
  comments: ReviewRow[];
}) {
  const hasResponse = Boolean(review.manager_response);
  const [replyOpen, setReplyOpen] = useState(!hasResponse);
  const [commentsOpen, setCommentsOpen] = useState(true);
  const [deleting, startDeleteTransition] = useTransition();

  // Card background: responded → neutral, negative → red tint, positive → green tint
  let cardClass = "rounded-xl border p-5 bg-white border-gray-200";
  if (hasResponse) {
    cardClass = "rounded-xl border p-5 bg-gray-50 border-gray-200";
  } else if (review.ai_sentiment === "negative") {
    cardClass = "rounded-xl border p-5 bg-red-50 border-red-200";
  } else if (review.ai_sentiment === "positive") {
    cardClass = "rounded-xl border p-5 bg-green-50 border-green-200";
  }

  function handleDelete() {
    const commentNote =
      comments.length > 0
        ? ` This will also delete ${comments.length} comment${comments.length > 1 ? "s" : ""}.`
        : "";
    if (
      !window.confirm(
        `Delete ${review.author_name}'s review?${commentNote} This cannot be undone.`,
      )
    )
      return;
    startDeleteTransition(async () => {
      await deleteReview(review.id);
    });
  }

  return (
    <div style={{ opacity: deleting ? 0.4 : 1 }}>
      {/* Main review card */}
      <div className={cardClass}>
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            <div
              className={`shrink-0 h-12 w-12 rounded-full flex items-center justify-center text-2xl select-none ${review.author_bg_color ?? "bg-gray-200"}`}
            >
              {review.author_avatar ||
                review.author_name.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              {/* Name + badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900 text-sm">
                  {review.author_name}
                </span>
                {review.rating && (
                  <span className="text-orange-500 text-sm">
                    {review.rating}
                  </span>
                )}
                {hasResponse && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                    ✓ Responded
                  </span>
                )}
                {!hasResponse && review.ai_sentiment === "negative" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-300">
                    ⚠ Needs attention
                  </span>
                )}
                <SentimentBadge sentiment={review.ai_sentiment} />
                {review.ai_sentiment_reasoning && (
                  <span className="text-xs text-gray-500 italic">
                    {review.ai_sentiment_reasoning}
                  </span>
                )}
                {comments.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCommentsOpen((o) => !o)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200 hover:bg-purple-200 transition-colors"
                  >
                    <MessageSquare size={10} />
                    {comments.length} comment{comments.length > 1 ? "s" : ""}
                    <span className="ml-0.5 text-purple-400">
                      {commentsOpen ? "▾" : "▸"}
                    </span>
                  </button>
                )}
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400 flex-wrap">
                <span>{formatFullDate(review.created_at)}</span>
                <span>·</span>
                <span className="italic">— {review.item_reviewed}</span>
                {review.author_email && (
                  <>
                    <span>·</span>
                    <a
                      href={`mailto:${review.author_email}`}
                      className="hover:text-orange-600 underline underline-offset-2"
                    >
                      {review.author_email}
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Delete */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            title={
              comments.length > 0
                ? `Delete review + ${comments.length} comment${comments.length > 1 ? "s" : ""}`
                : "Delete review"
            }
            className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* Review text */}
        <p className="mt-3 text-sm text-gray-700 leading-relaxed">
          {review.review_text}
        </p>

        {/* Existing manager response display */}
        {hasResponse && !replyOpen && (
          <div className="mt-4 pl-4 border-l-4 border-orange-300 bg-orange-50 rounded-r-lg py-2 pr-3">
            <p className="text-xs font-semibold text-orange-700 mb-1">
              Todd (Owner) 🐟
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {review.manager_response}
            </p>
            <button
              type="button"
              onClick={() => setReplyOpen(true)}
              className="mt-2 text-xs text-orange-600 hover:text-orange-800 underline underline-offset-2"
            >
              Edit reply
            </button>
          </div>
        )}

        {/* Reply form */}
        {replyOpen && (
          <form
            action={replyToReview.bind(null, review.id)}
            onSubmit={() => setReplyOpen(false)}
            className="mt-4"
          >
            <textarea
              name="response"
              required
              rows={3}
              defaultValue={review.manager_response ?? ""}
              placeholder="Write a reply as Todd (Owner) 🐟…"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 resize-y"
            />
            <div className="flex items-center gap-2 mt-2">
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors"
              >
                Post Reply
              </button>
              {hasResponse && (
                <button
                  type="button"
                  onClick={() => setReplyOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Child comments — threaded below */}
      {comments.length > 0 && commentsOpen && (
        <div className="ml-8 mt-2 border-l-2 border-gray-200 pl-4 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={12} className="text-gray-400" />
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Customer Comments
            </span>
          </div>
          {comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main manager component ───────────────────────────────────────────────────

type FilterState = "all" | "pending" | "responded";

export default function ReviewManager({ reviews }: { reviews: ReviewRow[] }) {
  const [filter, setFilter] = useState<FilterState>("all");

  // Split top-level and child reviews
  const topLevel = reviews.filter((r) => !r.parent_id);
  const allComments = reviews.filter((r) => Boolean(r.parent_id));

  const getComments = (parentId: number) =>
    allComments.filter((c) => c.parent_id === parentId.toString());

  const pendingCount = topLevel.filter((r) => !r.manager_response).length;
  const respondedCount = topLevel.filter((r) =>
    Boolean(r.manager_response),
  ).length;

  const filteredTopLevel = topLevel.filter((r) => {
    if (filter === "pending") return !r.manager_response;
    if (filter === "responded") return Boolean(r.manager_response);
    return true;
  });

  const filters: [FilterState, string][] = [
    ["all", `All (${topLevel.length})`],
    ["pending", `Needs reply (${pendingCount})`],
    ["responded", `Responded (${respondedCount})`],
  ];

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl bg-gray-800 border border-white/10 p-5 text-center">
          <p className="text-3xl font-extrabold text-white">
            {topLevel.length}
          </p>
          <p className="text-sm text-gray-400 mt-1">Reviews</p>
        </div>
        <div className="rounded-xl bg-gray-800 border border-white/10 p-5 text-center">
          <p className="text-3xl font-extrabold text-purple-400">
            {allComments.length}
          </p>
          <p className="text-sm text-gray-400 mt-1">Comments</p>
        </div>
        <div className="rounded-xl bg-gray-800 border border-white/10 p-5 text-center">
          <p className="text-3xl font-extrabold text-red-400">{pendingCount}</p>
          <p className="text-sm text-gray-400 mt-1">Awaiting reply</p>
        </div>
        <div className="rounded-xl bg-gray-800 border border-white/10 p-5 text-center">
          <p className="text-3xl font-extrabold text-green-400">
            {respondedCount}
          </p>
          <p className="text-sm text-gray-400 mt-1">Replied</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-5">
        {filters.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === id
                ? "bg-orange-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {filteredTopLevel.length === 0 ? (
        <div className="rounded-xl bg-gray-800 border border-white/10 p-10 text-center">
          <p className="text-gray-400">
            {filter === "pending"
              ? "All reviews have been responded to. 🎉"
              : filter === "responded"
                ? "No responded reviews yet."
                : "No reviews yet."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredTopLevel.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              comments={getComments(review.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
