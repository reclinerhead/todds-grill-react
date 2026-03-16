import { xai } from "@ai-sdk/xai";
import { streamText, convertToModelMessages } from "ai"; // <-- add this import!

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

export async function OPTIONS(req: Request) {
  const allowedOrigin = getAllowedOrigin(req);
  if (!allowedOrigin) {
    return new Response("Not allowed from this origin", { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(allowedOrigin),
  });
}

export async function POST(req: Request) {
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
