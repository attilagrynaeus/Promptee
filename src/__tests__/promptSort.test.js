import { extractLeadingIndex, sortPromptsForCategory } from 'utils/promptSort';

describe('extractLeadingIndex', () => {
  it('finds a single digit at the start', () => {
    expect(extractLeadingIndex('2. 👍Fordít👍🌙 (5 Thinking)')).toBe(2);
  });

  it('finds multi-digit numbers within first five chars', () => {
    expect(extractLeadingIndex('12) Translate')).toBe(12);
    expect(extractLeadingIndex('👍 007 - Title')).toBe(7); // leading zeros
  });

  it('ignores numbers that begin after first five chars', () => {
    expect(extractLeadingIndex('Title abc 9) Later number')).toBeNull();
  });

  it('returns null when no number present', () => {
    expect(extractLeadingIndex('No index here')).toBeNull();
  });
});

describe('sortPromptsForCategory', () => {
  it('sorts by leading index ascending and then by sort_order', () => {
    const items = [
      { id: 'a', title: '2. Second', sort_order: 10 },
      { id: 'b', title: '1. First', sort_order: 1 },
      { id: 'c', title: 'No index', sort_order: 0 },
    ];
    const out = sortPromptsForCategory(items).map(i => i.id);
    expect(out).toEqual(['b', 'a', 'c']);
  });

  it('items without index come after indexed items and are sorted by sort_order', () => {
    const items = [
      { id: 'x', title: 'Nope', sort_order: 2 },
      { id: 'y', title: 'Also none', sort_order: 1 },
      { id: 'z', title: '3) Third', sort_order: 0 },
    ];
    const out = sortPromptsForCategory(items).map(i => i.id);
    expect(out).toEqual(['z', 'y', 'x']);
  });
});

