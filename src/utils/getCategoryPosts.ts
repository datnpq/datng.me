import type { CollectionEntry } from "astro:content";
import { postFilter } from "./postFilter";

/** Posts in a "Kỹ thuật" section, oldest first so they read like a series. */
export function getCategoryPosts(
  posts: CollectionEntry<"posts">[],
  slug: string
) {
  return posts
    .filter(p => p.data.category === slug && postFilter(p))
    .sort(
      (a, b) =>
        new Date(a.data.pubDatetime).getTime() -
        new Date(b.data.pubDatetime).getTime()
    );
}
