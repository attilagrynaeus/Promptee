import React from 'react';
import { t } from '../i18n';

export default function FavoritesToggle({ favoriteOnly, toggleFavoriteOnly }) {
  return (
    <button
      onClick={toggleFavoriteOnly}
      className={`mt-4 w-full py-2 rounded-lg transition-colors font-semibold ${
        favoriteOnly
          ? 'bg-yellow-500 text-gray-800'
          : 'bg-gray-700 text-gray-200'
      }`}
    >
      {favoriteOnly ? t('FavoritesToggle.Showing') : t('FavoritesToggle.Show')}
    </button>
  );
}