import React, { createContext, useContext } from 'react';

const TranslationContext = createContext({ t: (key: string) => key });

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Placeholder translation logic
  const t = (key: string) => key;
  return (
    <TranslationContext.Provider value={{ t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export function useTranslation() {
  return useContext(TranslationContext);
}
