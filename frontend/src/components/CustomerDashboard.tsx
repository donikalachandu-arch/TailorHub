import React, { useEffect, useState } from 'react';
import { Search, Ruler, Sparkles, Calendar, ShoppingBag, MapPin, Star, ArrowRight, Clock, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../services/apiClient';

interface CustomerDashboardProps {
  onSelectTab: (tab: string) => void;
  onSelectTailor: (tailorId: string) => void;
  onOpenOrderWizard: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onSelectTab,
  onSelectTailor,
  onOpenOrderWizard
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [nearbyTailors, setNearbyTailors] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const tailorRes = await apiRequest('/tailors');
        setNearbyTailors(tailorRes.tailors.slice(0, 4));

        if (user) {
          const orderRes = await apiRequest('/orders');
          setActiveOrders(orderRes.orders.filter((o: any) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED'));

          const aptRes = await apiRequest('/appointments');
          setUpcomingAppointments(aptRes.appointments.filter((a: any) => a.status === 'CONFIRMED' || a.status === 'REQUESTED'));
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, [user]);

  return (
    <div className="space-y-6 pb-20">
      {/* Greeting Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Digital Wardrobe Ecosystem</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Namaste, {user ? user.name : 'Fashion Lover'}! 👋
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              Connect with Hyderabad's finest master tailors, store reusable measurement profiles, and track every stitch live.
            </p>
          </div>

          <button
            onClick={onOpenOrderWizard}
            className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-2xl text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-95 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            {t('place_order', 'Place New Order')}
          </button>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onSelectTab('tailors')}
          className="p-4 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl text-left transition-all group shadow-sm hover:shadow-indigo-500/10"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Search className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-white">Find Tailor</p>
          <p className="text-[10px] text-slate-400">Discover boutiques & experts</p>
        </button>

        <button
          onClick={() => onSelectTab('measurements')}
          className="p-4 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl text-left transition-all group shadow-sm hover:shadow-indigo-500/10"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Ruler className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-white">{t('measurements', 'Measurement Vault')}</p>
          <p className="text-[10px] text-slate-400">Shirt, Pant, Blouse profiles</p>
        </button>

        <button
          onClick={() => onSelectTab('ai-style')}
          className="p-4 bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl text-left transition-all group shadow-sm hover:shadow-amber-500/10"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-white">{t('ai_assistant', 'AI Style Assistant')}</p>
          <p className="text-[10px] text-slate-400">Neck & sleeve recommendations</p>
        </button>

        <button
          onClick={() => onSelectTab('orders')}
          className="p-4 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl text-left transition-all group shadow-sm hover:shadow-emerald-500/10"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-white">Track Orders</p>
          <p className="text-[10px] text-slate-400">11-stage live status</p>
        </button>
      </div>

      {/* Active Orders Section */}
      {activeOrders.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              Active Stitching Orders ({activeOrders.length})
            </h3>
            <button
              onClick={() => onSelectTab('orders')}
              className="text-xs text-indigo-400 hover:underline font-semibold flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeOrders.map((ord) => (
              <div
                key={ord.id}
                onClick={() => onSelectTab('orders')}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl text-white cursor-pointer transition-all shadow-md"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[10px] font-extrabold text-amber-400 font-mono">{ord.order_number}</span>
                    <h4 className="text-sm font-bold">{ord.garment_type} Stitching</h4>
                    <p className="text-xs text-slate-400">{ord.shop_name}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg uppercase">
                    {ord.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" /> Est: {ord.delivery_date}
                  </span>
                  <span className="font-bold text-white">₹{ord.total_amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured / Nearby Tailors */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-400" />
            Top Rated Local Tailors in Hyderabad
          </h3>
          <button
            onClick={() => onSelectTab('tailors')}
            className="text-xs text-indigo-400 hover:underline font-semibold flex items-center gap-1"
          >
            Explore All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {nearbyTailors.map((tailor) => (
            <div
              key={tailor.id}
              onClick={() => onSelectTailor(tailor.id)}
              className="bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-4 text-white cursor-pointer transition-all hover:shadow-xl hover:shadow-indigo-500/5 group"
            >
              <div className="relative h-36 rounded-xl overflow-hidden mb-3 bg-slate-800">
                <img
                  src={tailor.shop_images[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80'}
                  alt={tailor.shop_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-amber-400 text-xs font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {tailor.rating}
                </div>
              </div>

              <h4 className="text-sm font-bold line-clamp-1 group-hover:text-amber-400 transition-colors">
                {tailor.shop_name}
              </h4>
              <p className="text-xs text-slate-400 line-clamp-1 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-500" /> {tailor.address}
              </p>

              <div className="flex items-center justify-between text-xs mt-3 pt-2 border-t border-slate-800">
                <span className="text-slate-400">Starts at <strong className="text-white">₹{tailor.starting_price}</strong></span>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded font-semibold">
                  {tailor.categories[0] || 'Custom'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
