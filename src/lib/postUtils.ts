import { formatDistanceToNow } from "date-fns";

export const timeAgo = (dateStr: string | null) => {
  if (!dateStr) return "";
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return "";
  }
};

import news1 from "@/assets/news-1.jpg";
import news2 from "@/assets/news-2.jpg";
import news3 from "@/assets/news-3.jpg";
import news4 from "@/assets/news-4.jpg";
import news5 from "@/assets/news-5.jpg";

export const placeholderImages = [news1, news2, news3, news4, news5];

export const getPostImage = (post: { featured_image_url: string | null }, index: number) => {
  return post.featured_image_url || placeholderImages[index % placeholderImages.length];
};
