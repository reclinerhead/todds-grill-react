"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
