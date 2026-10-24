export type EvidenceStatus = "verified" | "unverified" | "none" | "ai-extracted";

/** Quotes shorter than this (after normalization) are too generic to count as proof. */
export const MIN_QUOTE_LENGTH = 4;

/**
 * Conservative normalization used on BOTH the quote and the source before comparing.
 * It only removes differences that are invisible to a reader (whitespace, zero-width
 * characters, curly vs straight quotes, dash variants, letter case). It never drops
 * words or punctuation and never folds Turkish dotless "ı" into "i".
 */
export function normalizeForMatch(input: string): string {
  return input
    .normalize("NFKC")
    .replace(/[\u200b-\u200f\u202a-\u202e\u2060\u00ad\ufeff]/g, "")
    .replace(/[\u2018\u2019\u201b\u02bc\u0060\u00b4]/g, "'")
    .replace(/[\u201c\u201d\u201e\u00ab\u00bb]/g, '"')
    .replace(/[\u2010-\u2015\u2212]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    // "İ".toLowerCase() yields "i" + combining dot above; drop the dot so it equals "i".
    .replace(/\u0307/g, "");
}

/**
 * Decide how much a model-proposed quote can be trusted.
 * - "verified" only when the normalized quote is found inside the normalized source text.
 * - "ai-extracted" when the input was an image and no text check was possible.
 * - "unverified" when we had text to check against and the quote is not in it.
 * - "none" when the model gave no quote.
 */
export function checkQuote(
  quote: string,
  sourceText: string | null | undefined,
  hasImage: boolean,
): EvidenceStatus {
  const q = normalizeForMatch(quote ?? "");
  if (!q) return "none";
  const src = normalizeForMatch(sourceText ?? "");
  if (src && q.length >= MIN_QUOTE_LENGTH && src.includes(q)) return "verified";
  if (hasImage) return "ai-extracted";
  return "unverified";
}
