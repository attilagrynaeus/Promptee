import React, { createContext, useContext, useState } from 'react';
import CustomDialog from 'components/CustomDialog';

const DialogContext = createContext();

export const useDialog = () => useContext(DialogContext);

export const DialogProvider = ({ children }) => {
  const [dialog, setDialog] = useState({
    open: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: () => {},
    onCancel: () => {},
  });

  const showDialog = (options) => setDialog({ open: true, ...options });

  const closeDialog = () => setDialog((prev) => ({ ...prev, open: false }));

  return (
    <DialogContext.Provider value={{ showDialog, closeDialog }}>
      {children}
      <CustomDialog {...dialog} onClose={closeDialog} />
    </DialogContext.Provider>
  );
};
