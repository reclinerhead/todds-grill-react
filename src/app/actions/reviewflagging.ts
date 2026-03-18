"use server";

import { generateText, Output } from "ai";
import { xai } from "@ai-sdk/xai";
import { z } from "zod";
import {
  SENTIMENT_ANALYSIS_PROMPT,
  ACTIONABLE_ANALYSIS_PROMPT,
} from "@/lib/prompts/review_analysis";

// Schema for sentiment + themes (your existing one, assuming you have it)
const sentimentSchema = z.object({
  sentiment: z.enum(["positive", "negative", "neutral"]),
  isAbusive: z
    .boolean()
    .describe(
      "True if the review contains abusive language or personal attacks.",
    ),
  reason: z
    .string()
    .describe("One sentence explaining the sentiment decision."),
});

// schema just for actionable items (split to allow parallel)
const actionableSchema = z.object({
  actionableItems: z
    .array(
      z
        .string()
        .describe(
          'One short, practical fix. Example: "Calibrate dining area thermostat to 72°F"',
        ),
    )
    .describe("actionable concerns from this review"),
});

export async function analyzeReview(comment: string) {
  const [sentimentResult, actionableResult] = await Promise.all([
    generateText({
      model: xai("grok-4-1-fast-reasoning"),
      output: Output.object({
        schema: sentimentSchema,
      }),
      prompt: `${SENTIMENT_ANALYSIS_PROMPT}
"""
${comment}
"""`,
    }),

    generateText({
      model: xai("grok-4-1-fast-reasoning"),
      output: Output.object({
        schema: actionableSchema,
      }),
      prompt: `${ACTIONABLE_ANALYSIS_PROMPT}
"""
${comment}
"""`,
    }),
  ]);

  return {
    sentiment: sentimentResult.experimental_output,
    actionable: actionableResult.experimental_output,
  };
}
