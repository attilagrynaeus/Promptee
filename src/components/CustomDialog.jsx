import React from 'react';
import ReactDOM from 'react-dom';

export default function CustomDialog({
  open,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  onClose,
}) {
  if (!open) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    if (onClose) onClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    if (onClose) onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md flex flex-col gap-4 text-gray-200">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p>{message}</p>
        <div className="flex justify-end gap-3">
          {cancelText && (
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-200 transition"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className="bg-indigo-700 hover:bg-indigo-600 rounded-lg px-4 py-2 transition text-white"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}