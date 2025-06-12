export interface Prompt {
  title: string;
  description: string;
  categories?: { name?: string | null } | null;
  favorit?: boolean;
  user_id?: string;
  sort_order?: number | null;
  [key: string]: any;
}

export interface FilterPromptsParams {
  session: { user: { id: string } } | null;
  prompts: Prompt[];
  search: string;
  categoryFilter: string;
  favoriteOnly: boolean;
  chainViewActive: boolean;
  currentChain: Prompt[];
}

export const filterPrompts = ({
  session,
  prompts,
  search,
  categoryFilter,
  favoriteOnly,
  chainViewActive,
  currentChain,
}: FilterPromptsParams): Prompt[] => {
  if (!session || !session.user) return [];

  let filteredPrompts: Prompt[] = [];

  if (chainViewActive) {
    filteredPrompts = currentChain;
  } else if (favoriteOnly) {
    filteredPrompts = prompts.filter(
      (p) => p.favorit && p.user_id === session.user.id,
    );
  } else {
    const lowerSearch = search.toLowerCase();
    filteredPrompts = prompts.filter(
      (p) =>
        (p.title.toLowerCase().includes(lowerSearch) ||
          p.description.toLowerCase().includes(lowerSearch)) &&
        (categoryFilter === 'All Categories' ||
          p.categories?.name === categoryFilter),
    );
  }

  filteredPrompts.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return filteredPrompts;
};
