import React, { createContext, useContext, useState, useEffect } from 'react';

interface LiteModeContextType {
  isLiteMode: boolean;
  toggleLiteMode: () => void;
}

const LiteModeContext = createContext<LiteModeContextType>({
  isLiteMode: false,
  toggleLiteMode: () => {},
});

export const LiteModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLiteMode, setIsLiteMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('innovia_lite_mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    localStorage.setItem('innovia_lite_mode', String(isLiteMode));
  }, [isLiteMode]);

  const toggleLiteMode = () => setIsLiteMode((prev) => !prev);

  return (
    <LiteModeContext.Provider value={{ isLiteMode, toggleLiteMode }}>
      {children}
    </LiteModeContext.Provider>
  );
};

export const useLiteMode = () => useContext(LiteModeContext);
