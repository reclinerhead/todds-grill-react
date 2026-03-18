"use server";

import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

export async function toggleMenuItemActive(id: string, currentValue: boolean) {
  const supabase = adminClient();
  const { error } = await supabase
    .from("menu_items")
    .update({ is_active: !currentValue })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/manager");
}

export async function toggleMenuItemFeatured(
  id: string,
  currentValue: boolean,
) {
  const supabase = adminClient();
  const { error } = await supabase
    .from("menu_items")
    .update({ is_featured: !currentValue })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/manager");
}

export async function updateMenuItemName(id: string, formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  if (!name) return;

  const supabase = adminClient();
  const { error } = await supabase
    .from("menu_items")
    .update({ name })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/manager");
}

export async function updateMenuItemDescription(
  id: string,
  formData: FormData,
) {
  const description = (formData.get("description") as string)?.trim() ?? "";

  const supabase = adminClient();
  const { error } = await supabase
    .from("menu_items")
    .update({ description: description || null })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/manager");
}

export async function updateMenuItemPrice(id: string, formData: FormData) {
  const price = (formData.get("price") as string)?.trim();
  if (!price) return;

  const supabase = adminClient();
  const { error } = await supabase
    .from("menu_items")
    .update({ price })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/manager");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

// ── Menu image management ──────────────────────────────────────────────────

export async function listMenuImages(): Promise<
  { name: string; url: string }[]
> {
  const supabase = adminClient();
  const { data, error } = await supabase.storage
    .from("restaurant-files")
    .list("menu", { sortBy: { column: "name", order: "asc" } });

  if (error || !data) return [];

  const imageFiles = data.filter(
    (f) =>
      f.name !== ".emptyFolderPlaceholder" &&
      /\.(jpe?g|png|webp|gif)$/i.test(f.name),
  );

  return imageFiles.map((f) => {
    const { data: urlData } = supabase.storage
      .from("restaurant-files")
      .getPublicUrl(`menu/${f.name}`);
    return { name: f.name, url: urlData.publicUrl };
  });
}

export async function uploadMenuImage(
  formData: FormData,
): Promise<{ url: string } | { error: string }> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No file provided." };
  if (!file.type.startsWith("image/"))
    return { error: "File must be an image." };
  if (file.size > 5 * 1024 * 1024) return { error: "File exceeds 5 MB limit." };

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `menu/${randomUUID()}.${ext}`;

  const supabase = adminClient();
  const bytes = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from("restaurant-files")
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (error) return { error: error.message };

  const { data: urlData } = supabase.storage
    .from("restaurant-files")
    .getPublicUrl(path);

  return { url: urlData.publicUrl };
}

export async function updateMenuItemImage(id: string, imageUrl: string | null) {
  const supabase = adminClient();
  const { error } = await supabase
    .from("menu_items")
    .update({ image_url: imageUrl })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/manager");
}

export async function deleteMenuImage(
  name: string,
): Promise<{ success: true } | { error: string }> {
  // Validate name to prevent path traversal
  if (!name || name.includes("/") || name.includes("..")) {
    return { error: "Invalid file name." };
  }

  const path = `menu/${name}`;
  const supabase = adminClient();
  const { error } = await supabase.storage
    .from("restaurant-files")
    .remove([path]);

  if (error) return { error: error.message };

  revalidatePath("/manager");
  return { success: true };
}

// ── Gallery image management ───────────────────────────────────────────────

export async function listGalleryImages(): Promise<
  { name: string; url: string }[]
> {
  const supabase = adminClient();
  const { data, error } = await supabase.storage
    .from("restaurant-files")
    .list("gallery", { sortBy: { column: "created_at", order: "desc" } });

  if (error || !data) return [];

  const imageFiles = data.filter(
    (f) =>
      f.name !== ".emptyFolderPlaceholder" &&
      /\.(jpe?g|png|webp|gif)$/i.test(f.name),
  );

  return imageFiles.map((f) => {
    const { data: urlData } = supabase.storage
      .from("restaurant-files")
      .getPublicUrl(`gallery/${f.name}`);
    return { name: f.name, url: urlData.publicUrl };
  });
}

export async function uploadGalleryImage(
  formData: FormData,
): Promise<{ url: string; name: string } | { error: string }> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No file provided." };
  if (!file.type.startsWith("image/"))
    return { error: "File must be an image." };
  if (file.size > 5 * 1024 * 1024) return { error: "File exceeds 5 MB limit." };

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const fileName = `${randomUUID()}.${ext}`;
  const path = `gallery/${fileName}`;

  const supabase = adminClient();
  const bytes = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from("restaurant-files")
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (error) return { error: error.message };

  const { data: urlData } = supabase.storage
    .from("restaurant-files")
    .getPublicUrl(path);

  revalidatePath("/");
  return { url: urlData.publicUrl, name: fileName };
}

export async function deleteGalleryImage(
  name: string,
): Promise<{ success: true } | { error: string }> {
  // Validate name to prevent path traversal
  if (!name || name.includes("/") || name.includes("..")) {
    return { error: "Invalid file name." };
  }

  const path = `gallery/${name}`;
  const supabase = adminClient();
  const { error } = await supabase.storage
    .from("restaurant-files")
    .remove([path]);

  if (error) return { error: error.message };

  revalidatePath("/");
  return { success: true };
}
