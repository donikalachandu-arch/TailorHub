import React, { useEffect } from 'react';
import { Scissors, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 1800);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center text-white px-4">
      {/* Subtle background stitching line animation */}
      <div className="absolute inset-0 opacity-10 pointer-events-none flex justify-around">
        <div className="w-px border-r-2 border-dashed border-indigo-400 h-full animate-pulse"></div>
        <div className="w-px border-r-2 border-dashed border-amber-400 h-full animate-pulse delay-300"></div>
        <div className="w-px border-r-2 border-dashed border-indigo-400 h-full animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Animated Brand Logo Icon */}
        <div className="relative w-24 h-24 mb-6 flex items-center justify-center bg-indigo-600/30 rounded-3xl border border-indigo-400/40 backdrop-blur-md shadow-2xl shadow-indigo-500/30 animate-bounce">
          <Scissors className="w-12 h-12 text-amber-400 transform -rotate-45" />
          <Sparkles className="w-6 h-6 text-indigo-300 absolute top-2 right-2 animate-spin" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-amber-300 mb-2">
          {t('app_name', 'TAILORHUB')}
        </h1>

        <p className="text-slate-300 text-sm sm:text-base font-medium max-w-sm">
          “{t('tagline', 'Your Tailor. Your Style. Your Digital Wardrobe.')}”
        </p>

        {/* Loading Spinner */}
        <div className="mt-10 flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping"></div>
          Initializing TailorHub Ecosystem...
        </div>
      </div>
    </div>
  );
};
