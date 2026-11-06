/** Rough reading time from raw markdown body (Vietnamese ≈ 200 words/min). */
export function readingTime(body: string | undefined): number {
  if (!body) return 1;
  const text = body
    .replace(/```[\s\S]*?```/g, " ") // code blocks count less
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_`~\-|]/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
