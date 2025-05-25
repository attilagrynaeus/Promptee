// promptFilter.js
export const filterPrompts = ({ session, prompts, search, categoryFilter, favoriteOnly, chainViewActive, currentChain }) => {
  if (!session || !session.user) return [];

  let filteredPrompts = [];

  if (chainViewActive) {
    filteredPrompts = currentChain;
  } else if (favoriteOnly) {
    filteredPrompts = prompts.filter(p => p.favorit && p.user_id === session.user.id);
  } else {
    const lowerSearch = search.toLowerCase();
    filteredPrompts = prompts.filter(p =>
      (p.title.toLowerCase().includes(lowerSearch) || p.content.toLowerCase().includes(lowerSearch)) &&
      (categoryFilter === 'All Categories' || p.categories?.name === categoryFilter)
    );
  }

  filteredPrompts.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return filteredPrompts;
};