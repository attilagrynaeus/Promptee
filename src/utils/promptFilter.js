export const filterPrompts = ({ session, prompts, search, categoryFilter, favoriteOnly, chainViewActive, currentChain }) => {
  if (!session || !session.user) return [];
  if (chainViewActive) return currentChain;
  if (favoriteOnly) return prompts.filter(p => p.favorit && p.user_id === session.user.id);

  const lowerSearch = search.toLowerCase();
  return prompts.filter(p =>
    (p.title.toLowerCase().includes(lowerSearch) || p.content.toLowerCase().includes(lowerSearch)) &&
    (categoryFilter === 'All Categories' || p.categories?.name === categoryFilter)
  );
};