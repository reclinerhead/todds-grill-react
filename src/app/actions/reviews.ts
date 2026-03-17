"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { analyzeReview } from "@/app/actions/reviewflagging";

const reviewSchema = z
  .object({
    hcaptchaToken: z
      .string()
      .trim()
      .min(1, "Please complete the captcha challenge."),
    productNames: z.array(z.string().trim().min(1).max(200)).optional(),
    productName: z.string().trim().min(1).max(200).optional(),
    rating: z.number().int().min(1).max(5),
    reviewText: z.string().trim().min(1, "Review required").max(1000),
    reviewerName: z.string().trim().max(100).optional().or(z.literal("")),
    reviewerEmail: z.preprocess(
      (value) => (typeof value === "string" ? value.trim() : value),
      z.union([z.literal(""), z.email().max(150)]).optional(),
    ),
  })
  .refine(
    (data) => {
      const multiCount = data.productNames?.length ?? 0;
      return multiCount > 0 || Boolean(data.productName);
    },
    {
      message: "At least one menu item is required.",
      path: ["productNames"],
    },
  );

type SubmitReviewInput = {
  hcaptchaToken: string;
  productNames: string[];
  rating: number;
  reviewText: string;
  reviewerName: string;
  reviewerEmail: string;
};

type SubmitReviewResult = {
  ok: boolean;
  error?: string;
  resetCaptcha?: boolean;
  blocked?: boolean;
};

const getInitialForAvatar = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed[0].toUpperCase();
};

async function verifyHCaptchaToken(token: string, remoteIp?: string) {
  const hcaptchaSecret = process.env.HCAPTCHA_SECRET_KEY;

  if (!hcaptchaSecret) {
    return { ok: false, error: "Server captcha configuration is missing." };
  }

  const params = new URLSearchParams({
    secret: hcaptchaSecret,
    response: token,
  });

  if (remoteIp) {
    params.set("remoteip", remoteIp);
  }

  const response = await fetch("https://hcaptcha.com/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    return { ok: false, error: "Captcha verification failed." };
  }

  const data = (await response.json()) as {
    success?: boolean;
    "error-codes"?: string[];
  };

  if (!data.success) {
    return {
      ok: false,
      error: "Captcha verification failed. Please try again.",
      details: data["error-codes"],
    };
  }

  return { ok: true };
}

function isSupabaseCaptchaError(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const candidate = error as {
    message?: string;
    code?: string;
    name?: string;
  };

  const markerText = [candidate.message, candidate.code, candidate.name]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return markerText.includes("captcha") || markerText.includes("hcaptcha");
}

/**
 * Submits a user review for a menu item.
 *
 * This function validates the review input, verifies hCaptcha, manages user authentication (including anonymous sessions),
 * and inserts the review into the Supabase database. It handles errors related to input validation, captcha verification,
 * user session, and database insertion, returning a result object indicating success or failure.
 *
 * @param input - The review submission data, including captcha token, product names, rating, review text, reviewer name, and email.
 * @returns A promise resolving to the result of the review submission, indicating success or failure, and whether the captcha should be reset.
 */
export async function submitReview(
  input: SubmitReviewInput,
): Promise<SubmitReviewResult> {
  try {
    const parsed = reviewSchema.safeParse(input);

    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message || "Invalid request payload.",
        resetCaptcha: true,
      };
    }

    const {
      hcaptchaToken,
      productNames: parsedProductNames,
      productName,
      rating,
      reviewText,
      reviewerName: reviewerNameRaw,
      reviewerEmail: reviewerEmailRaw,
    } = parsed.data;

    const productNames = Array.from(
      new Set(
        (parsedProductNames?.length ?? 0) > 0
          ? parsedProductNames
          : productName
            ? [productName]
            : [],
      ),
    );

    if (productNames.length === 0) {
      return {
        ok: false,
        error: "At least one menu item is required.",
        resetCaptcha: true,
      };
    }

    const headerStore = await headers();
    const remoteIp = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();

    const captchaVerification = await verifyHCaptchaToken(
      hcaptchaToken,
      remoteIp,
    );

    if (!captchaVerification.ok) {
      if (captchaVerification.details) {
        console.error(
          "hCaptcha verification error:",
          captchaVerification.details,
        );
      }

      return {
        ok: false,
        error: captchaVerification.error,
        resetCaptcha:
          captchaVerification.error !==
          "Server captcha configuration is missing.",
      };
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user: existingUser },
      error: userError,
    } = await supabase.auth.getUser();

    const isMissingSessionError = userError?.name === "AuthSessionMissingError";

    if (userError && !isMissingSessionError) {
      console.error("Supabase getUser error:", userError);
      return { ok: false, error: "Unable to verify user session." };
    }

    let activeUser = existingUser;

    if (!activeUser) {
      const { data: anonymousAuthData, error: anonymousSignInError } =
        await supabase.auth.signInAnonymously({
          options: {
            captchaToken: hcaptchaToken,
          },
        });

      if (anonymousSignInError || !anonymousAuthData.user) {
        console.error(
          "Supabase anonymous sign-in error:",
          anonymousSignInError,
        );

        if (
          anonymousSignInError &&
          isSupabaseCaptchaError(anonymousSignInError)
        ) {
          return {
            ok: false,
            error:
              "Captcha verification failed while starting your session. Please complete the challenge again and resubmit.",
            resetCaptcha: true,
          };
        }

        return { ok: false, error: "Unable to start anonymous session." };
      }

      activeUser = anonymousAuthData.user;
    }

    const reviewerName = reviewerNameRaw || "Anonymous";
    const reviewerEmail = reviewerEmailRaw || null;
    const stars = "★".repeat(rating);

    // Analyze sentiment — fire and don't block on failure
    let aiSentiment: string | null = null;
    let aiReasoning: string | null = null;
    let attentionNeeded = true;
    try {
      const analysis = await analyzeReview(reviewText);
      if (analysis) {
        if (analysis.isAbusive) {
          return {
            ok: false,
            blocked: true,
            error:
              "Your review could not be posted because it appears to violate our community guidelines.  Please contact the restaurant directly if you have feedback you'd like to share with them.",
          };
        }
        aiSentiment = analysis.sentiment;
        aiReasoning = analysis.reason;
        attentionNeeded =
          analysis.sentiment === "negative" ||
          analysis.sentiment === "positive";
      }
    } catch (aiError) {
      console.error("Sentiment analysis failed (non-fatal):", aiError);
    }

    const { error } = await supabase.from("reviews").insert({
      parent_id: null,
      user_id: activeUser.id,
      author_name: reviewerName,
      author_email: reviewerEmail,
      author_avatar: getInitialForAvatar(reviewerName),
      author_bg_color: "bg-orange-200",
      rating: stars,
      review_text: reviewText,
      item_reviewed: productNames.join(", "),
      ai_sentiment: aiSentiment,
      ai_sentiment_reasoning: aiReasoning,
      attention_needed: attentionNeeded,
    });

    if (error) {
      console.error("Supabase insert review error:", error);
      return { ok: false, error: "Unable to save your review right now." };
    }

    revalidatePath("/");

    return { ok: true };
  } catch (error) {
    console.error("Review submission error:", error);
    return { ok: false, error: "Invalid request payload.", resetCaptcha: true };
  }
}
