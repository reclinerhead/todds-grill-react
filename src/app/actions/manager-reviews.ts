"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { analyzeReview } from "@/app/actions/reviewflagging";

export async function replyToReview(id: number, formData: FormData) {
  const response = (formData.get("response") as string)?.trim();
  if (!response) return;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("reviews")
    .update({ manager_response: response, attention_needed: false })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/manager");
}

export async function deleteReview(id: number) {
  const supabase = await createSupabaseServerClient();

  // Delete child comments first (parent_id is stored as text)
  const { error: childError } = await supabase
    .from("reviews")
    .delete()
    .eq("parent_id", id.toString());
  if (childError) throw new Error(childError.message);

  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/manager");
}

export async function deleteComment(id: number) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/manager");
}

export async function reanalyzeReview(id: number) {
  const supabase = await createSupabaseServerClient();

  const { data: review, error: fetchError } = await supabase
    .from("reviews")
    .select("review_text")
    .eq("id", id)
    .single();

  if (fetchError || !review)
    throw new Error(fetchError?.message ?? "Review not found");

  const { sentiment, actionable } = await analyzeReview(review.review_text);

  const { error } = await supabase
    .from("reviews")
    .update({
      ai_sentiment: sentiment?.sentiment ?? null,
      ai_sentiment_reasoning: sentiment?.reason ?? null,
      actionable_analysis: actionable ? JSON.stringify(actionable) : null,
      attention_needed: sentiment?.isAbusive
        ? true
        : sentiment?.sentiment === "negative" ||
          sentiment?.sentiment === "positive",
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/manager");
}
