import React from 'react';
import { Home, Search, ShoppingBag, Ruler, Camera, BarChart3, Users, Sparkles, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();
  const role = user?.role || 'CUSTOMER';

  let navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tailors', label: 'Tailors', icon: Search },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'measurements', label: 'Vault', icon: Ruler },
    { id: 'ai-style', label: 'AI Style', icon: Sparkles }
  ];

  if (role === 'TAILOR') {
    navItems = [
      { id: 'tailor-dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'customers', label: 'Customers', icon: Users },
      { id: 'ocr-scan', label: 'Lens Scan', icon: Camera },
      { id: 'orders', label: 'Orders', icon: ShoppingBag },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 }
    ];
  } else if (role === 'ADMIN') {
    navItems = [
      { id: 'admin-dashboard', label: 'Admin', icon: LayoutDashboard },
      { id: 'tailors', label: 'Tailors', icon: Search },
      { id: 'orders', label: 'Orders', icon: ShoppingBag },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 }
    ];
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900 border-t border-slate-800 backdrop-blur-lg bg-opacity-95">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full text-xs font-semibold transition-all ${
                isActive ? 'text-amber-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className="text-[11px] leading-none">{item.label}</span>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
