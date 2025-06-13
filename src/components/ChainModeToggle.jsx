import React from 'react';
import { t } from '../i18n';

export default function ChainModeToggle({
  chainView, setChainView,
  chainFilter, setChainFilter,
  chains = []
}) {
    const handleToggle = (e) => {
      const on = e.target.checked;
      setChainView(on);
      if (on && !chainFilter && chains.length) setChainFilter(chains[0].id);
    };

  return (
    <div className="mt-4">
      <label className="flex items-center gap-2 select-none text-sm font-medium">
        <input
          type="checkbox"
          checked={chainView}
          onChange={handleToggle}
          className="h-4 w-4 text-indigo-500 bg-gray-700 border-gray-600 rounded accent-indigo-500"/>
        {t('ChainMode.Label')}
      </label>

      {chainView && (
        <select
          className="mt-2 w-full field-dark"
          value={chainFilter || ''}
          onChange={(e) => setChainFilter(e.target.value)}
        >
          <option value="">{t('ChainMode.None')}</option>
          {chains.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}