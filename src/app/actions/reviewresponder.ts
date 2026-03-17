"use server";

import { generateText } from "ai";
import { xai } from "@ai-sdk/xai";
import {
  TODD_PERSONA,
  KAREN_PERSONA,
  RESTAURANT_HISTORY,
} from "@/lib/prompts/customerchat";

// passed a review comment, we use this to generate automatic replies to the customer
// with options to control tone, length, and content of the reply.
// sentiment = positive | negative | neutral, determined by the review classifier when written to database
// passion = 1-10, how emotional/enthusiastic the reply should be. 1 = very calm and neutral, 10 = very passionate and emotional.

// this is the scaling we use to link our requested passion level to the temperature parameter for generation. We want to ensure that even at low passion levels, we have some variability in the output to avoid robotic or repetitive replies. //

/* Button	Passion	Temperature
Brief	1	0.37
Casual	3	0.51
Friendly	5	0.65
Fired Up	7	0.79
Full Todd Energy	10	1.00  */

function buildPassionGuidance(passion: number): string {
  if (passion <= 2) {
    return `TONE: One sentence only. Flat, minimal, professional. No warmth, no personality, no sign-off flourishes. Acknowledge and done.`;
  } else if (passion <= 4) {
    return `TONE: Two sentences max. Plain and direct. A single genuine thank-you or acknowledgment — no storytelling, no extra color, no exclamation points.`;
  } else if (passion <= 6) {
    return `TONE: Friendly and personable, like chatting with a regular. Medium length — two to three sentences. A little personality, maybe a touch of humor if it fits naturally.`;
  } else if (passion <= 8) {
    return `TONE: Enthusiastic and heartfelt. Show real appreciation or genuine concern. Use expressive language, maybe one exclamation point. Two to four sentences. Let the family pride come through.`;
  } else {
    return `TONE: Full Todd energy. Warm, effusive, deeply personal. You are genuinely moved. Multiple sentences, storytelling encouraged, include a corny joke or a nod to the restaurant's history. This is a moment — treat it like one.`;
  }
}

function buildSentimentGuidance(sentiment: string): string {
  if (sentiment === "positive") {
    return `
SITUATION: This is a POSITIVE review. The customer had a great experience.
YOUR GOAL:
- Thank them sincerely and specifically (reference anything they mentioned).
- Reinforce what made their experience special — tie it to the family, the food, or the history if relevant.
- Invite them back. Make them feel like part of the Todd's Grill family.
- Do NOT be sycophantic or hollow. "Thanks for the 5 stars!" alone is not enough.`;
  } else if (sentiment === "negative") {
    return `
SITUATION: This is a NEGATIVE review. The customer had a bad experience.
YOUR GOAL:
- Acknowledge the issue directly without making excuses.
- Apologize genuinely — not defensively. Own it.
- If appropriate, lightly blame Todd or Karen (in the restaurant's playful, self-deprecating style) — but only if it feels natural and not dismissive of the complaint.
- Offer a concrete next step: invite them back, offer to make it right, or provide a way to follow up.
- Keep your tone humble and human. Never argue with the customer.`;
  } else {
    return `
SITUATION: This is a NEUTRAL review. The customer had a middling or mixed experience.
YOUR GOAL:
- Acknowledge both the positives and any shortcomings honestly.
- Show that you take even lukewarm feedback seriously.
- Invite them back and give them a reason to bump that rating up next time.`;
  }
}

export async function analyzeReviewForReply(
  comment: string,
  sentiment: string,
  passion: number,
) {
  const clampedPassion = Math.min(10, Math.max(1, Math.round(passion)));
  const temperature = 0.3 + (clampedPassion / 10) * 0.7; // 0.37 (terse) → 1.0 (full Todd energy)

  // Only include restaurant history at higher passion levels where storytelling is relevant
  const historySection = clampedPassion > 6 ? `\n\n${RESTAURANT_HISTORY}` : "";

  const system = `
You are the manager on duty at Todd's Grill and Bait, responding publicly to a customer review on behalf of the restaurant.
Write in the voice of either Todd Wyatt (owner) or Karen Wyatt (manager) — whichever feels like the better fit for this review and tone.

${TODD_PERSONA}

${KAREN_PERSONA}

${historySection}

RULES:
- Always sign the reply with the persona's first name (Todd or Karen).
- Keep it authentic to a real neighborhood restaurant — no corporate-speak, no copy-paste pleasantries.
- Never invent details about the customer's visit that aren't in the review.
- Never promise specific discounts or free items unless you phrase it vaguely ("come back and let us make it right").
- Keep the reply focused — do not ramble beyond what the passion level calls for.
- Write in plain prose. No bullet points, no headers, no markdown.
`.trim();

  const prompt = `
${buildSentimentGuidance(sentiment)}

${buildPassionGuidance(clampedPassion)}
PASSION LEVEL: ${clampedPassion}/10

Now write your response to this customer review:

"""
${comment}
"""`.trim();

  const { text } = await generateText({
    model: xai("grok-4-1-fast-reasoning"),
    temperature,
    system,
    prompt,
  });

  return { reply: text.trim() };
}
