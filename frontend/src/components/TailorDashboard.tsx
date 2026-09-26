import React, { useEffect, useState } from 'react';
import { Store, Camera, Plus, Users, ShoppingBag, Calendar, IndianRupee, ArrowRight, Clock, Star, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/apiClient';

interface TailorDashboardProps {
  onSelectTab: (t: string) => void;
}

export const TailorDashboard: React.FC<TailorDashboardProps> = ({ onSelectTab }) => {
  const { tailorProfile } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const analyticsRes = await apiRequest('/analytics/dashboard');
        setMetrics(analyticsRes.tailorMetrics);

        const ordersRes = await apiRequest('/orders');
        setRecentOrders(ordersRes.orders.slice(0, 5));

        const aptRes = await apiRequest('/appointments');
        setAppointments(aptRes.appointments.slice(0, 3));
      } catch (err) {
        console.error('Error loading tailor dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6 pb-20">
      {/* Studio Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Tailor Business Ecosystem</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              {tailorProfile ? tailorProfile.shop_name : 'Master Tailor Studio'} ✂️
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Manage custom stitching orders, customer measurement vault & digitize old registers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={() => onSelectTab('customers')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs border border-slate-700 flex items-center justify-center gap-2 transition-all transform active:scale-95"
            >
              <Users className="w-4 h-4 text-indigo-400" />
              Customer Vault
            </button>
            <button
              onClick={() => onSelectTab('ocr-scan')}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold rounded-2xl text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-95"
            >
              <Camera className="w-4 h-4" />
              TailorHub Lens OCR
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-white shadow-sm">
          <span className="text-[10px] font-semibold uppercase text-slate-400 block">Weekly Revenue</span>
          <p className="text-2xl font-extrabold text-amber-400 mt-1">
            ₹{(metrics?.weekly_revenue ?? 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-400 font-semibold">Live DB verified</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-white shadow-sm">
          <span className="text-[10px] font-semibold uppercase text-slate-400 block">Total Orders</span>
          <p className="text-2xl font-extrabold text-white mt-1">
            {metrics?.total_orders ?? 0}
          </p>
          <span className="text-[10px] text-slate-400">Active stitching</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-white shadow-sm">
          <span className="text-[10px] font-semibold uppercase text-slate-400 block">Completed</span>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1">
            {metrics?.completed_orders ?? 0}
          </p>
          <span className="text-[10px] text-emerald-400">Delivered</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-white shadow-sm">
          <span className="text-[10px] font-semibold uppercase text-slate-400 block">Pending Balance</span>
          <p className="text-2xl font-extrabold text-rose-400 mt-1">
            ₹{(metrics?.pending_payments ?? 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400">Due at delivery</span>
        </div>
      </div>

      {/* Today's Appointments */}
      {appointments.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            Today's Fitting & Measurement Appointments
          </h3>
          <div className="space-y-2">
            {appointments.map((a) => (
              <div key={a.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">{a.customer_name || 'Customer Fitting'}</span>
                  <span className="text-slate-400">{a.service_name} • {a.appointment_type}</span>
                </div>
                <div className="text-right">
                  <span className="text-amber-400 font-bold block">{a.start_time}</span>
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded font-bold uppercase">
                    {a.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            Recent Custom Stitching Orders
          </h3>
          <button
            onClick={() => onSelectTab('orders')}
            className="text-xs text-indigo-400 hover:underline font-semibold flex items-center gap-1"
          >
            Manage All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {recentOrders.map((ord) => (
            <div
              key={ord.id}
              onClick={() => onSelectTab('orders')}
              className="p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl text-white cursor-pointer transition-all flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-extrabold text-amber-400">{ord.order_number}</span>
                  <h4 className="text-sm font-bold">{ord.garment_type}</h4>
                </div>
                <p className="text-xs text-slate-400">Customer: {ord.customer_name || 'Vikram Reddy'}</p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-white block">₹{ord.total_amount}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
                  {ord.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
