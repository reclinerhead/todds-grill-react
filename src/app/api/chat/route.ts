import { xai } from "@ai-sdk/xai";
import { streamText, convertToModelMessages } from "ai"; // <-- add this import!

export const maxDuration = 30;

// load our prompt for karen
import { BASE_SYSTEM_PROMPT } from "@/lib/prompts/customerchat";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.XAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing XAI_API_KEY in .env.local" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
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

    return result.toUIMessageStreamResponse({
      onError: (error) =>
        error instanceof Error ? error.message : "Unknown chat stream error",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown chat error";

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
