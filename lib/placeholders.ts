import data from "@/data/placeholders.json";

const previews = data as Record<string, string>;

/**
 * A tiny blurred preview (data URL) of a public/ image, shown while the
 * real one loads. Regenerate with `npm run placeholders`.
 */
export function preview(src: string): string | undefined {
  return previews[src];
}
