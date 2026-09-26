import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppMode = 'LIVE' | 'DEMO';

interface ModeContextType {
  mode: AppMode;
  isDemo: boolean;
  setMode: (mode: AppMode) => void;
  toggleMode: () => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<AppMode>(() => {
    const saved = localStorage.getItem('tailorhub_mode');
    return saved === 'DEMO' ? 'DEMO' : 'LIVE';
  });

  const setMode = (newMode: AppMode) => {
    localStorage.setItem('tailorhub_mode', newMode);
    setModeState(newMode);
    // Reload to clear cached state and reconnect cleanly with correct mode header
    window.location.reload();
  };

  const toggleMode = () => {
    const next = mode === 'LIVE' ? 'DEMO' : 'LIVE';
    if (next === 'LIVE') {
      const confirmLive = window.confirm(
        'Switch to LIVE Production Data?\n\nAll records displayed will be genuine customer, tailor, and financial business data from the production database.'
      );
      if (!confirmLive) return;
    }
    setMode(next);
  };

  return (
    <ModeContext.Provider
      value={{
        mode,
        isDemo: mode === 'DEMO',
        setMode,
        toggleMode
      }}
    >
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = (): ModeContextType => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
};
