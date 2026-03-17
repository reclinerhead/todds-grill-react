"use server";

import { generateText, Output } from "ai";
import { xai } from "@ai-sdk/xai";
import { z } from "zod";

export async function analyzeReview(comment: string) {
  const { output } = await generateText({
    model: xai("grok-3-mini"), // fast & cheap — right fit for classification
    output: Output.object({
      schema: z.object({
        sentiment: z.enum(["positive", "negative", "neutral"]),
        reason: z
          .string()
          .describe("One sentence explaining the sentiment decision."),
      }),
    }),
    prompt: `Classify this restaurant review. Rules:
- negative: contains a complaint, safety concern, or negative mention of a staff member
- positive: clearly enthusiastic and complimentary  
- neutral: anything else

Review:
"""
${comment}
"""`,
  });
  return output;
}
