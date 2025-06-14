import React, { createContext, useContext, useState, useEffect } from 'react';

const UIContext = createContext({ archiveMode: false, setArchiveMode: () => {} });

export const useUI = () => useContext(UIContext);

export const UIProvider = ({ children }) => {
  const [archiveMode, setArchiveMode] = useState(() => {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem('archiveMode') === 'true';
  });

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('archiveMode', archiveMode.toString());
    }
  }, [archiveMode]);

  return (
    <UIContext.Provider value={{ archiveMode, setArchiveMode }}>
      {children}
    </UIContext.Provider>
  );
};
