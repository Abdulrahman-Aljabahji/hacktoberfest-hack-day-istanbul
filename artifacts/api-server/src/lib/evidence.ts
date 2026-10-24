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
 * - Text input: "verified" only when the normalized quote is found inside the normalized source text.
 * - Photo input: `sourceText` is the AI's own transcript of the photo. A quote found in it is only
 *   "ai-extracted" (the transcript itself could be wrong); a quote missing from it is "unverified".
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
  const found = Boolean(src) && q.length >= MIN_QUOTE_LENGTH && src.includes(q);
  if (hasImage) return !src || found ? "ai-extracted" : "unverified";
  return found ? "verified" : "unverified";
}

/** Map Arabic-Indic and Persian digits to ASCII so "٢٨" matches 28. */
export function asciiDigits(input: string): string {
  return input
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x660))
    .replace(/[\u06f0-\u06f9]/g, (d) => String(d.charCodeAt(0) - 0x6f0));
}

/** True when the quote contains `n` as a whole number (so 2 does not match 28, 5 does not match 15.00). */
export function quoteHasNumber(quote: string, n: number): boolean {
  const q = asciiDigits(quote.normalize("NFKC"));
  const variants = new Set([String(n), String(n).padStart(2, "0")]);
  return [...variants].some((v) => new RegExp(`(?<!\\d)${v}(?!\\d)`).test(q));
}
