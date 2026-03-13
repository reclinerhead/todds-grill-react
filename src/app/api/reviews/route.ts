import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const MAX_REVIEW_LENGTH = 1000;

type ReviewPayload = {
  productName?: unknown;
  rating?: unknown;
  reviewText?: unknown;
  reviewerName?: unknown;
  reviewerEmail?: unknown;
};

const getInitialForAvatar = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed[0].toUpperCase();
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ReviewPayload;

    const productName =
      typeof body.productName === "string" ? body.productName.trim() : "";
    const rating = typeof body.rating === "number" ? body.rating : 0;
    const reviewText =
      typeof body.reviewText === "string" ? body.reviewText.trim() : "";
    const reviewerNameRaw =
      typeof body.reviewerName === "string" ? body.reviewerName.trim() : "";
    const reviewerEmail =
      typeof body.reviewerEmail === "string" ? body.reviewerEmail.trim() : "";

    if (!productName) {
      return NextResponse.json(
        { error: "Product name is required." },
        { status: 400 },
      );
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be an integer between 1 and 5." },
        { status: 400 },
      );
    }

    if (!reviewText) {
      return NextResponse.json(
        { error: "Review text is required." },
        { status: 400 },
      );
    }

    if (reviewText.length > MAX_REVIEW_LENGTH) {
      return NextResponse.json(
        { error: `Review must be ${MAX_REVIEW_LENGTH} characters or less.` },
        { status: 400 },
      );
    }

    if (reviewerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reviewerEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Server is missing Supabase configuration." },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const reviewerName = reviewerNameRaw || "Anonymous";
    const stars = "★".repeat(rating);

    const { error } = await supabase.from("reviews").insert({
      parent_id: null,
      author_name: reviewerName,
      author_avatar: getInitialForAvatar(reviewerName),
      author_bg_color: "bg-orange-200",
      rating: stars,
      review_text: reviewText,
      item_reviewed: productName,
    });

    if (error) {
      console.error("Supabase insert review error:", error);
      return NextResponse.json(
        { error: "Unable to save your review right now." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Review submission error:", error);
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 },
    );
  }
}
