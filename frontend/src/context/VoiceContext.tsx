import React, { createContext, useContext, useState } from 'react';
import { LanguageCode } from '../../../shared/types';

interface VoiceContextType {
  isVoiceEnabled: boolean;
  toggleVoice: () => void;
  speakNotification: (textEn: string, textTe?: string, textHi?: string, currentLang?: LanguageCode) => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(() => {
    return localStorage.getItem('tailorhub_voice') !== 'disabled';
  });

  const toggleVoice = () => {
    const nextState = !isVoiceEnabled;
    setIsVoiceEnabled(nextState);
    localStorage.setItem('tailorhub_voice', nextState ? 'enabled' : 'disabled');
  };

  const speakNotification = (textEn: string, textTe?: string, textHi?: string, currentLang: LanguageCode = 'en') => {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;

    let textToSpeak = textEn;
    let langTag = 'en-IN';

    if (currentLang === 'te') {
      textToSpeak = textTe || textEn;
      langTag = 'te-IN';
    } else if (currentLang === 'hi') {
      textToSpeak = textHi || textEn;
      langTag = 'hi-IN';
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = langTag;
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Voice synthesis error:', err);
    }
  };

  return (
    <VoiceContext.Provider value={{ isVoiceEnabled, toggleVoice, speakNotification }}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) throw new Error('useVoice must be used within a VoiceProvider');
  return context;
};
