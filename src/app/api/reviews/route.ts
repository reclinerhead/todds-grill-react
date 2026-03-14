import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

/* review schema and validation rules */
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

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const parsed = reviewSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message || "Invalid request payload.",
        },
        { status: 400 },
      );
    }

    const {
      hcaptchaToken,
      productNames: parsedProductNames,
      productName,
      rating,
      reviewText,
      reviewerName: reviewerNameRaw,
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
      return NextResponse.json(
        { error: "At least one menu item is required." },
        { status: 400 },
      );
    }

    const remoteIp = request.headers
      .get("x-forwarded-for")
      ?.split(",")[0]
      ?.trim();
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

      return NextResponse.json(
        { error: captchaVerification.error },
        {
          status:
            captchaVerification.error ===
            "Server captcha configuration is missing."
              ? 500
              : 403,
        },
      );
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user: existingUser },
      error: userError,
    } = await supabase.auth.getUser();

    const isMissingSessionError = userError?.name === "AuthSessionMissingError";

    if (userError && !isMissingSessionError) {
      console.error("Supabase getUser error:", userError);
      return NextResponse.json(
        { error: "Unable to verify user session." },
        { status: 500 },
      );
    }

    let activeUser = existingUser;

    if (!activeUser) {
      const { data: anonymousAuthData, error: anonymousSignInError } =
        await supabase.auth.signInAnonymously();

      if (anonymousSignInError || !anonymousAuthData.user) {
        console.error(
          "Supabase anonymous sign-in error:",
          anonymousSignInError,
        );
        return NextResponse.json(
          { error: "Unable to start anonymous session." },
          { status: 500 },
        );
      }

      activeUser = anonymousAuthData.user;
    }

    const reviewerName = reviewerNameRaw || "Anonymous";
    const stars = "★".repeat(rating);

    const { error } = await supabase.from("reviews").insert({
      parent_id: null,
      user_id: activeUser.id,
      author_name: reviewerName,
      author_avatar: getInitialForAvatar(reviewerName),
      author_bg_color: "bg-orange-200",
      rating: stars,
      review_text: reviewText,
      item_reviewed: productNames.join(", "),
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
