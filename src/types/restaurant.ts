export type Review = {
  id: number; // or string if uuid later
  parent_id: string | null;
  author_name: string;
  author_avatar: string | null;
  author_bg_color: string | null;
  rating: string | null;
  review_text: string;
  item_reviewed: string | null;
  created_at: string; // ISO string like "2026-03-11T15:46:23.345687+00"
  manager_response: string | null;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  image_url: string;
};
