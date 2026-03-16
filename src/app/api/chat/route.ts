import { xai } from "@ai-sdk/xai";
import { streamText, convertToModelMessages } from "ai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

// load our prompt for karen
import { BASE_SYSTEM_PROMPT } from "@/lib/prompts/customerchat";

const allowedOrigins = [
  "https://todds-grill.toddtech.llc", // production URL
  "http://localhost:3000", // for dev
];

function getCorsHeaders(origin: string): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "600",
    Vary: "Origin",
  };
}

function getAllowedOrigin(req: Request): string | null {
  const origin = req.headers.get("origin");
  if (!origin) {
    return null;
  }

  return allowedOrigins.includes(origin) ? origin : null;
}

// Create Redis client once (outside handler for reuse)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Rate limit: 15 messages per minute per IP (adjust as you learn)
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(15, "60 s"), // 15 requests in a 60-second sliding window
  prefix: "chat:rl:", // helps organize keys in Redis
  analytics: true, // optional: see usage in Upstash dashboard
});

// pre-flight check to validate allowed origins
export async function OPTIONS(req: Request) {
  const allowedOrigin = getAllowedOrigin(req);

  // not allowed
  if (!allowedOrigin) {
    return new Response("Not allowed from this origin", { status: 403 });
  }

  // ok for pre-flight, just return CORS headers with no body
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(allowedOrigin),
  });
}

export async function POST(req: Request) {
  const start = Date.now();

  // Get client IP for rate limiting (handle proxies with x-forwarded-for)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "anonymous";

  // Check rate limit
  const { success, pending, limit, reset, remaining } =
    await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      {
        error: "Whoa, slow down! You've hit the message limit.",
        retryAfter: Math.ceil((reset - Date.now()) / 1000), // seconds until reset
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
        },
      },
    );
  }

  const rlTime = Date.now() - start;
  console.log(`Rate limit check took ${rlTime}ms for IP ${ip}`);

  const allowedOrigin = getAllowedOrigin(req);
  if (!allowedOrigin) {
    return new Response("Not allowed from this origin", { status: 403 });
  }

  const corsHeaders = getCorsHeaders(allowedOrigin);

  try {
    const { messages } = await req.json();

    if (!process.env.XAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing XAI_API_KEY in .env.local" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        },
      );
    }

    const modelMessages = await convertToModelMessages(messages);

    const result = await streamText({
      model: xai("grok-4-1-fast-reasoning"),
      messages: [
        { role: "system", content: BASE_SYSTEM_PROMPT },
        ...modelMessages,
      ],
    });

    const response = result.toUIMessageStreamResponse({
      onError: (error) =>
        error instanceof Error ? error.message : "Unknown chat stream error",
    });

    const headers = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown chat error";

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  }
}
