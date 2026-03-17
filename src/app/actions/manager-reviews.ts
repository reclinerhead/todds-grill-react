"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

export async function replyToReview(id: number, formData: FormData) {
  const response = (formData.get("response") as string)?.trim();
  if (!response) return;

  const supabase = adminClient();
  const { error } = await supabase
    .from("reviews")
    .update({ manager_response: response, attention_needed: false })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/manager");
}

export async function deleteReview(id: number) {
  const supabase = adminClient();

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
  const supabase = adminClient();
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/manager");
}
