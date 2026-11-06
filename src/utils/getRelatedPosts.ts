import type { CollectionEntry } from "astro:content";

/** Posts sharing the most tags with `current`; falls back to newest posts. */
export function getRelatedPosts(
  current: CollectionEntry<"posts">,
  all: CollectionEntry<"posts">[],
  limit = 3
): CollectionEntry<"posts">[] {
  const tags = new Set(current.data.tags.map(t => t.toLowerCase()));
  return all
    .filter(p => p.id !== current.id)
    .map(p => ({
      post: p,
      score: p.data.tags.filter(t => tags.has(t.toLowerCase())).length,
    }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.post.data.pubDatetime.getTime() - a.post.data.pubDatetime.getTime()
    )
    .slice(0, limit)
    .map(x => x.post);
}
