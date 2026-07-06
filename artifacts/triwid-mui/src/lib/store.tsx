import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'id' | 'ja';

interface AppState {
  hasSeenIntro: boolean;
  setHasSeenIntro: (val: boolean) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [hasSeenIntro, setHasSeenIntro] = useState(() => {
    const saved = sessionStorage.getItem('triwid-intro-seen');
    return saved === 'true';
  });
  const [language, setLanguage] = useState<Language>('en');
  const [audioEnabled, setAudioEnabled] = useState(false);

  useEffect(() => {
    if (hasSeenIntro) {
      sessionStorage.setItem('triwid-intro-seen', 'true');
    }
  }, [hasSeenIntro]);

  return (
    <AppContext.Provider value={{ hasSeenIntro, setHasSeenIntro, language, setLanguage, audioEnabled, setAudioEnabled }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used within AppProvider');
  return context;
}
