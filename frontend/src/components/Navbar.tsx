import React, { useState } from 'react';
import { Scissors, Volume2, VolumeX, Globe, LogOut, User as UserIcon, Shield, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useVoice } from '../context/VoiceContext';
import { LanguageCode } from '../../../shared/types';
import { apiRequest } from '../services/apiClient';

export const Navbar: React.FC<{ onOpenLogin: () => void; activeTab: string; setActiveTab: (t: string) => void }> = ({
  onOpenLogin,
  activeTab,
  setActiveTab
}) => {
  const { user, tailorProfile, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { isVoiceEnabled, toggleVoice } = useVoice();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const langNames: Record<LanguageCode, string> = {
    en: 'English',
    te: 'తెలుగు (Telugu)',
    hi: 'हिन्दी (Hindi)'
  };

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand logo & tagline */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('tailor-dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Scissors className="w-5 h-5 text-amber-400 transform -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-amber-300">
                TAILORHUB STUDIO
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                MASTER TAILOR
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              “Smart Digitization, Measurement Vault & Business Management”
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Voice Notification Toggle */}
          <button
            onClick={toggleVoice}
            title={isVoiceEnabled ? t('voice_on', 'Voice ON') : t('voice_off', 'Voice OFF')}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isVoiceEnabled
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isVoiceEnabled ? <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span className="hidden md:inline">{isVoiceEnabled ? 'Voice ON' : 'Voice OFF'}</span>
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Globe className="w-4 h-4 text-indigo-400" />
              <span className="uppercase text-xs font-bold">{language}</span>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 py-1">
                {(['en', 'te', 'hi'] as LanguageCode[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang);
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-700 transition-colors ${
                      language === lang ? 'text-amber-400 font-bold bg-slate-700/50' : 'text-slate-200'
                    }`}
                  >
                    {langNames[lang]}
                    {language === lang && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 1-Click Role Switcher */}
          <div className="hidden lg:flex items-center bg-slate-950/80 border border-slate-800 p-1 rounded-2xl gap-1">
            <button
              onClick={async () => {
                try {
                  const res = await apiRequest('/auth/login', {
                    method: 'POST',
                    body: { email: 'ramesh@tailors.com', password: 'password123' }
                  });
                  localStorage.setItem('tailorhub_token', res.token);
                  window.location.reload();
                } catch(e) {}
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                user?.role === 'TAILOR'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              Tailor
            </button>
            <button
              onClick={async () => {
                try {
                  const res = await apiRequest('/auth/login', {
                    method: 'POST',
                    body: { email: 'vikram@gmail.com', password: 'password123' }
                  });
                  localStorage.setItem('tailorhub_token', res.token);
                  window.location.reload();
                } catch(e) {}
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                user?.role === 'CUSTOMER'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              Customer
            </button>
            <button
              onClick={async () => {
                try {
                  const res = await apiRequest('/auth/login', {
                    method: 'POST',
                    body: { email: 'admin@tailorhub.com', password: 'admin123' }
                  });
                  localStorage.setItem('tailorhub_token', res.token);
                  window.location.reload();
                } catch(e) {}
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                user?.role === 'ADMIN'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </button>
          </div>

          {/* User Auth Action */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
                <img
                  src={user.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-700"
                />
                <div className="text-left text-xs">
                  <p className="font-bold text-white leading-tight line-clamp-1">{user.name}</p>
                  <p className="text-[10px] text-slate-400">{user.role === 'TAILOR' && tailorProfile ? tailorProfile.shop_name : user.email}</p>
                </div>
              </div>

              <button
                onClick={logout}
                title={t('logout', 'Logout')}
                className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
            >
              {t('login', 'Login')}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
