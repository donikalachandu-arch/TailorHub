import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, TailorProfile } from '../types';
import { apiRequest } from '../services/apiClient';

interface AuthContextType {
  user: User | null;
  tailorProfile: TailorProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  setAuthData: (user: User, token: string, tailorProfile?: TailorProfile | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tailorProfile, setTailorProfile] = useState<TailorProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('tailorhub_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        // Auto-login as Master Tailor for direct tailor interface
        try {
          const res = await apiRequest('/auth/login', {
            method: 'POST',
            body: { email: 'ramesh@tailors.com', password: 'password123' }
          });
          localStorage.setItem('tailorhub_token', res.token);
          setToken(res.token);
          setUser(res.user);
          setTailorProfile(res.tailorProfile || null);
        } catch (e) {
          console.warn('Auto-login failed', e);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      try {
        const res = await apiRequest('/auth/me', { token });
        setUser(res.user);
        setTailorProfile(res.tailorProfile || null);
      } catch (err) {
        console.warn('Session expired or invalid token');
        localStorage.removeItem('tailorhub_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [token]);

  const login = async (email: string, pass: string) => {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password: pass }
    });
    localStorage.setItem('tailorhub_token', res.token);
    setToken(res.token);
    setUser(res.user);
    setTailorProfile(res.tailorProfile || null);
  };

  const register = async (payload: any) => {
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: payload
    });
    localStorage.setItem('tailorhub_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('tailorhub_token');
    setToken(null);
    setUser(null);
    setTailorProfile(null);
  };

  const setAuthData = (u: User, t: string, tp?: TailorProfile | null) => {
    localStorage.setItem('tailorhub_token', t);
    setToken(t);
    setUser(u);
    if (tp) setTailorProfile(tp);
  };

  return (
    <AuthContext.Provider value={{ user, tailorProfile, token, isLoading, login, register, logout, setAuthData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
