import React, { useState, useEffect } from 'react';
import { tokensOf } from 'utils/tokenCounter';
import { useDialog } from 'context/DialogContext';
import { t } from 'i18n';
import './PromptCard.css';
import hoverIconUrl from 'assets/hover-icon.svg';

const bgMap = {
  default: '#313338',
  blue:    'rgba(30,144,255,0.40)',
  green:   'rgba(50,205,50,0.40)',
  violet:  'rgba(186,85,211,0.40)',
};

export default function PromptCard({
  prompt, currentUserId,
  onCopy, onEdit, onDelete,
  onToggleFavorit, onClone,
  onColorChange, onView,
  onArchive,
  chainViewActive
}) {
  const tokenCount = tokensOf(prompt.content);
  const isOwner = prompt.user_id === currentUserId;
  const { showDialog } = useDialog();

  const [color, setColor] = useState(prompt.color || 'default');
  const [copied, setCopied] = useState(false);
  const [cloned, setCloned] = useState(false);

  useEffect(() => {
    setColor(prompt.color || 'default');
  }, [prompt.color]);


  const handleColorSelect = async (e, clr) => {
    e.stopPropagation();
    setColor(clr);
    await onColorChange?.(prompt.id, clr);
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleClone = (e) => {
    e.stopPropagation();
    onClone(prompt);
    setCloned(true);
    setTimeout(() => setCloned(false), 1500);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    showDialog({
      title: t('PromptCard.DeleteTitle'),
      message: t('PromptCard.DeleteMessage'),
      confirmText: t('PromptCard.DeleteConfirm'),
      cancelText: t('PromptCard.DeleteCancel'),
      onConfirm: () => onDelete(prompt.id),
    });
  };

  const handleToggleFavorit = (e) => {
    e.stopPropagation();
    if (!prompt.id) {
      showDialog({
        title: t('PromptCard.FavErrorTitle'),
        message: t('PromptCard.FavIdMissing'),
        confirmText: t('PromptCard.OK')
      });
      return;
    }
    onToggleFavorit(prompt);
  };

  const handleArchive = (e) => {
    e.stopPropagation();
    if (!prompt.archived_at) {
      showDialog({
        title: t('PromptCard.ArchiveTitle'),
        message: t('PromptCard.ArchiveMessage', { title: prompt.title }),
        confirmText: t('PromptCard.ArchiveConfirm'),
        cancelText: t('PromptCard.ArchiveCancel'),
        onConfirm: () => onArchive?.(prompt),
      });
    } else {
      onArchive?.(prompt);
    }
  };


return (
  <div
    className={`prompt-card relative ${chainViewActive ? 'chain-view-mode' : ''} ${!chainViewActive ? 'hover-enabled' : ''} ${prompt.archived_at ? 'archived' : ''}`}
    style={{ background: bgMap[color] }}
    tabIndex={-1}
    onFocus={(e) => e.currentTarget.blur()}
  >
    {/* 🔗 chain-badge only in chain-view */}
    {chainViewActive && prompt.chain_order != null && (
      <div className="chain-order-badge">
        {prompt.chain_order}
      </div>
    )}

    {/* Hover icon only visible if NOT in chainView */}
    {!chainViewActive && (
      <span className="hover-icon">
        <img src={hoverIconUrl} alt="Hover icon" width={20} height={20} />
      </span>
    )}

    <header>
      <h3 className="prompt-title">{prompt.title}</h3>
      {prompt.description && (
        <p className="prompt-description">{prompt.description}</p>
      )}
    </header>

    {prompt.archived_at && (
      <span className="archived-badge">{t('PromptCard.ArchivedBadge')}</span>
    )}

    <div className="prompt-tags mt-auto">
      <span className="tag category-tag">{prompt.category}</span>
      <span className={`tag visibility-tag ${prompt.is_public ? 'public' : 'private'}`}>
        {prompt.is_public ? t('PromptCard.Public') : t('PromptCard.Private')}
      </span>
      <span className="tag token-tag">
        {tokenCount} {t('PromptCard.TokensSuffix')}
      </span>
    </div>

    <div className="prompt-actions">
      <button onClick={handleToggleFavorit} className="favorite-button">
        {prompt.favorit ? '⭐️' : '☆'}
      </button>

      <div className="color-selector ml-2">
        {['default', 'blue', 'green', 'violet'].map(clr => (
          <button
            key={clr}
            type="button"
            className={`color-circle ${clr}`}
            onClick={(e) => handleColorSelect(e, clr)}
            aria-label={`Set ${clr} background`}
          />
        ))}
      </div>

      <button onClick={handleCopy} className="action-button copy relative">
        {t('PromptCard.Copy')}
        {copied && (
          <span className="copied-tooltip">{t('PromptCard.Copied')}</span>
        )}
      </button>

      <button onClick={handleClone} className="action-button clone relative">
        {t('PromptCard.Clone')}
        {cloned && (
          <span className="cloned-tooltip">{t('PromptCard.Cloned')}</span>
        )}
      </button>

      {!prompt.archived_at ? (
        <button
          onClick={handleArchive}
          className="action-button archive"
          title={t('PromptCard.ArchiveTooltip')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
          </svg>
        </button>
      ) : (
        <button
          onClick={handleArchive}
          className="action-button restore"
          title={t('PromptCard.RestoreTooltip')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v3m0 0v3m0-3h3m-3 0h3m10 11a9 9 0 1 1-9-9" />
          </svg>
        </button>
      )}

      <button
        onClick={(e) => { e.stopPropagation(); isOwner ? onEdit() : onView(prompt); }}
        className="action-button edit"
      >
        {isOwner ? t('PromptCard.Edit') : t('PromptCard.View')}
      </button>

      {isOwner && (
        <button onClick={handleDelete} className="action-button delete">
          {t('PromptCard.Delete')}
        </button>
      )}
    </div>
  </div>
);
}