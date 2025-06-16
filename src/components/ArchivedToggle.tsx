import React from 'react';
import { useUI } from 'context/UIContext';
import { t } from 'i18n';

export default function ArchivedToggle() {
  const { archiveMode, setArchiveMode } = useUI();

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setArchiveMode(e.target.checked);
  };

  return (
    <div className="mt-4">
      <label className="flex items-center gap-2 select-none text-sm font-medium">
        <input
          type="checkbox"
          checked={archiveMode}
          onChange={handleToggle}
          className="h-4 w-4 text-indigo-500 bg-gray-700 border-gray-600 rounded accent-indigo-500"
        />
        {t('ArchivedToggle.Label')}
      </label>
    </div>
  );
}
