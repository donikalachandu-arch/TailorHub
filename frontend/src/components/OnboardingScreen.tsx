import React, { useState } from 'react';
import { Search, Ruler, Activity, ArrowRight, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const OnboardingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: Search,
      color: 'from-blue-600 to-indigo-700',
      titleKey: 'onboarding_1_title',
      titleDefault: 'Find Trusted Local Tailors',
      descKey: 'onboarding_1_desc',
      descDefault: 'Discover nearby tailors, boutiques and alteration experts in your city with ratings and verified services.'
    },
    {
      icon: Ruler,
      color: 'from-indigo-600 to-purple-700',
      titleKey: 'onboarding_2_title',
      titleDefault: 'Save Your Measurements Digitally',
      descKey: 'onboarding_2_desc',
      descDefault: 'Keep reusable measurement profiles for shirts, suits, blouses & kurtas with version history safety.'
    },
    {
      icon: Activity,
      color: 'from-amber-600 to-orange-700',
      titleKey: 'onboarding_3_title',
      titleDefault: 'Track Every Stitch',
      descKey: 'onboarding_3_desc',
      descDefault: 'Follow your stitching order step-by-step from cutting to quality check and home delivery.'
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      localStorage.setItem('tailorhub_onboarding_done', 'true');
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('tailorhub_onboarding_done', 'true');
    onComplete();
  };

  const SlideIcon = slides[currentSlide].icon;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden">
      {/* Background Decorative Blur Circles */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Skip */}
      <div className="flex justify-between items-center z-10">
        <span className="text-xl font-bold tracking-tight text-white">TAILORHUB</span>
        <button
          onClick={handleSkip}
          className="text-sm font-semibold text-slate-400 hover:text-white transition-colors"
        >
          {t('skip', 'Skip')}
        </button>
      </div>

      {/* Content Slide */}
      <div className="my-auto text-center flex flex-col items-center max-w-md mx-auto z-10">
        <div className={`w-28 h-28 rounded-3xl bg-gradient-to-tr ${slides[currentSlide].color} flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/30 transform transition-all duration-500 hover:scale-105`}>
          <SlideIcon className="w-14 h-14 text-white" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold mb-4 tracking-tight">
          {t(slides[currentSlide].titleKey, slides[currentSlide].titleDefault)}
        </h2>

        <p className="text-slate-300 text-base leading-relaxed mb-8">
          {t(slides[currentSlide].descKey, slides[currentSlide].descDefault)}
        </p>

        {/* Indicators */}
        <div className="flex gap-2">
          {slides.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'w-8 bg-amber-400' : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex justify-between items-center z-10 pt-6 border-t border-slate-800">
        <span className="text-xs font-medium text-slate-400">
          Step {currentSlide + 1} of {slides.length}
        </span>

        <button
          onClick={handleNext}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all transform active:scale-95"
        >
          {currentSlide === slides.length - 1 ? (
            <>
              {t('get_started', 'Get Started')}
              <Check className="w-5 h-5" />
            </>
          ) : (
            <>
              {t('next', 'Next')}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
