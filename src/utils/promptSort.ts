// Utilities for sorting prompts with an optional title-based index.
// If a category filter is active, we try to extract a leading index from
// the prompt title and sort by that; otherwise we fall back to sort_order.

export type PromptLike = {
  id: string;
  title?: string | null;
  sort_order?: number;
};

// Extracts the first number that starts within the first five code points
// of the title. Only considers up to 5-digit long numbers. Ignores emojis
// and other characters by scanning code points, keeping the search limited
// to the very beginning to avoid picking numbers appearing later (e.g. in
// parentheses like "(5)" within the title).
export function extractLeadingIndex(title: unknown): number | null {
  if (typeof title !== 'string') return null;
  const trimmed = title.trimStart();
  const codePoints = [...trimmed]; // iterate code points for emoji safety
  const window = codePoints.slice(0, 12).join('');
  const match = window.match(/\d{1,5}/);
  if (!match || match.index == null) return null;
  // Number must start within the first five code points
  const startIdx = [...window].slice(0, match.index).length;
  if (startIdx > 5) return null;
  return parseInt(match[0], 10);
}

export function sortPromptsForCategory<T extends PromptLike>(items: T[]): T[] {
  const enriched = items.map((p, i) => ({
    item: p,
    idx: extractLeadingIndex(p.title ?? ''),
    order: typeof p.sort_order === 'number' ? p.sort_order as number : Number.MAX_SAFE_INTEGER,
    t: (p.title ?? '').toLowerCase(),
    i,
  }));

  enriched.sort((a, b) => {
    const aHas = typeof a.idx === 'number';
    const bHas = typeof b.idx === 'number';
    if (aHas && bHas) {
      if (a.idx! !== b.idx!) return a.idx! - b.idx!;
      if (a.order !== b.order) return a.order - b.order;
      if (a.t !== b.t) return a.t < b.t ? -1 : 1;
      return a.i - b.i; // stable
    }
    if (aHas && !bHas) return -1;
    if (!aHas && bHas) return 1;
    if (a.order !== b.order) return a.order - b.order;
    if (a.t !== b.t) return a.t < b.t ? -1 : 1;
    return a.i - b.i;
  });

  return enriched.map(e => e.item);
}

