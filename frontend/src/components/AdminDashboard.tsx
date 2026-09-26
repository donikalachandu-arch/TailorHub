import React, { useEffect, useState } from 'react';
import { Shield, Users, Store, ShoppingBag, IndianRupee, CheckCircle2, AlertTriangle, RefreshCw, Search, Check, AlertCircle, RotateCcw } from 'lucide-react';
import { apiRequest } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { mode, isDemo, toggleMode } = useMode();

  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'users' | 'tailors' | 'orders' | 'demo-controls'>('overview');
  const [metrics, setMetrics] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [tailorsList, setTailorsList] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reset Demo State
  const [isResettingDemo, setIsResettingDemo] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [analyticsRes, usersRes, tailorsRes, ordersRes] = await Promise.all([
        apiRequest('/analytics/dashboard'),
        apiRequest('/admin/users'),
        apiRequest('/admin/tailors'),
        apiRequest('/admin/orders')
      ]);

      setMetrics(analyticsRes?.adminMetrics || null);
      setUsersList(usersRes?.users || []);
      setTailorsList(tailorsRes?.tailors || []);
      setOrdersList(ordersRes?.orders || []);
    } catch (err: any) {
      console.error('Error fetching admin dashboard:', err);
      setError(err.message || 'Unable to connect to TailorHub Admin services.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [mode]);

  const handleVerifyTailor = async (tailorId: string) => {
    try {
      await apiRequest(`/admin/tailors/${tailorId}/verify`, { method: 'PATCH' });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to verify tailor.');
    }
  };

  const handleResetDemoData = async () => {
    const confirmed = window.confirm(
      '⚠️ RESET DEMO DATASET?\n\nThis will wipe all demo modifications and restore exactly 10 demo customer profiles and demo orders.\n\nPRODUCTION RECORDS WILL NOT BE TOUCHED.'
    );
    if (!confirmed) return;

    setIsResettingDemo(true);
    setResetSuccessMessage(null);
    try {
      const res = await apiRequest('/admin/reset-demo', { method: 'POST' });
      setResetSuccessMessage(res.message || 'Demo dataset reset successfully with 10 demo customers restored.');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to reset demo dataset.');
    } finally {
      setIsResettingDemo(false);
    }
  };

  // 1. Authorization Guard Check
  if (user && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">403 — Unauthorized Role Access</h2>
        <p className="text-xs text-slate-400">
          Your account ({user.email}) has role <b className="text-amber-400">{user.role}</b>, which does not have administrative privileges.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Privileged Platform Access</span>
            <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full border ${
              isDemo ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-emerald-950 text-emerald-300 border-emerald-800'
            }`}>
              {isDemo ? 'DEMO ENVIRONMENT' : 'LIVE PRODUCTION'}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-400" />
            TailorHub Platform Super-Admin Control Panel
          </h2>
          <p className="text-xs text-slate-400">Database supervision, MSME verification, platform order flow, and demo controls.</p>
        </div>

        <button
          onClick={loadData}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveAdminTab('overview')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeAdminTab === 'overview' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Platform Overview
        </button>
        <button
          onClick={() => setActiveAdminTab('users')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeAdminTab === 'users' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Registered Users ({usersList.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('tailors')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeAdminTab === 'tailors' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Tailor Shops ({tailorsList.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('orders')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeAdminTab === 'orders' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Orders Monitor ({ordersList.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('demo-controls')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeAdminTab === 'demo-controls' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30' : 'text-amber-400 hover:text-amber-300 bg-slate-900 border border-amber-500/30'
          }`}
        >
          Demo Controls (10 Accounts)
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadData}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {/* Tab 1: Overview */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-6">
          {/* Admin KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-slate-900 border border-purple-500/30 rounded-2xl text-white shadow-lg">
              <span className="text-xs font-semibold uppercase text-slate-400 block">Total Database Users</span>
              <p className="text-2xl font-extrabold text-white mt-1">{metrics?.total_users ?? usersList.length}</p>
              <span className="text-[10px] text-purple-400 font-semibold mt-1 block">Live DB Count</span>
            </div>

            <div className="p-5 bg-slate-900 border border-purple-500/30 rounded-2xl text-white shadow-lg">
              <span className="text-xs font-semibold uppercase text-slate-400 block">Verified Master Tailors</span>
              <p className="text-2xl font-extrabold text-amber-400 mt-1">{metrics?.total_tailors ?? tailorsList.length}</p>
              <span className="text-[10px] text-amber-300 font-semibold mt-1 block">Active MSME Studios</span>
            </div>

            <div className="p-5 bg-slate-900 border border-purple-500/30 rounded-2xl text-white shadow-lg">
              <span className="text-xs font-semibold uppercase text-slate-400 block">Total Orders Recorded</span>
              <p className="text-2xl font-extrabold text-indigo-400 mt-1">{metrics?.total_orders ?? ordersList.length}</p>
              <span className="text-[10px] text-indigo-300 font-semibold mt-1 block">State Machine Tracked</span>
            </div>

            <div className="p-5 bg-slate-900 border border-purple-500/30 rounded-2xl text-white shadow-lg">
              <span className="text-xs font-semibold uppercase text-slate-400 block">Platform GMV Volume</span>
              <p className="text-2xl font-extrabold text-emerald-400 mt-1">₹{metrics?.total_platform_revenue ?? 0}</p>
              <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">Gross Merchandise Value</span>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white">Production Infrastructure Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                <span className="font-bold text-emerald-400 block mb-1">Database Connection</span>
                <p className="text-slate-300">ACID Transactions & Connection Pooling Active.</p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                <span className="font-bold text-indigo-400 block mb-1">WebSocket Feeds</span>
                <p className="text-slate-300">Room-based Channel Broadcasting (`shop:id`, `order:id`) Online.</p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                <span className="font-bold text-amber-400 block mb-1">OCR & AI Services</span>
                <p className="text-slate-300">Tesseract.js Neural Engine & Gemini 1.5 Assistant Ready.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Users Registry */}
      {activeAdminTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white">Platform Users Directory ({usersList.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Environment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-amber-400 font-extrabold text-[11px]">
                        {u.name.substring(0, 2).toUpperCase()}
                      </div>
                      {u.name}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        u.role === 'ADMIN' ? 'bg-purple-950 text-purple-300 border-purple-800' :
                        u.role === 'TAILOR' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                        'bg-indigo-950 text-indigo-300 border-indigo-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">{u.phone} • {u.email}</td>
                    <td className="p-3">{u.location || 'Hyderabad'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.is_demo ? 'bg-amber-900/40 text-amber-400' : 'bg-emerald-900/40 text-emerald-400'
                      }`}>
                        {u.is_demo ? 'DEMO' : 'LIVE'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Tailor Shops */}
      {activeAdminTab === 'tailors' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white">Registered Tailor MSMEs ({tailorsList.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tailorsList.map((t) => (
              <div key={t.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white">{t.shop_name}</h4>
                      <p className="text-xs text-slate-400">{t.owner_name} • {t.owner_phone}</p>
                    </div>
                    <span className="text-xs font-extrabold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-800">
                      ★ {t.rating || 5.0}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{t.description}</p>
                  <p className="text-[11px] text-slate-500 mt-1">📍 {t.address}</p>
                </div>
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{t.orders_count || 0} Platform Orders</span>
                  <button
                    onClick={() => handleVerifyTailor(t.id)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-md shadow-emerald-600/20"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Verify Shop
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Orders Monitor */}
      {activeAdminTab === 'orders' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white">Platform Orders Stream ({ordersList.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">Order Number</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Tailor Shop</th>
                  <th className="p-3">Garment</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {ordersList.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-white">{o.order_number}</td>
                    <td className="p-3">{o.customer_name}</td>
                    <td className="p-3 text-amber-300">{o.shop_name}</td>
                    <td className="p-3">{o.garment_type}</td>
                    <td className="p-3 font-bold text-emerald-400">₹{o.total_amount}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Demo Controls */}
      {activeAdminTab === 'demo-controls' && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 text-white space-y-6 shadow-xl">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Demonstration Dataset Supervisor</span>
            <h3 className="text-lg font-extrabold text-white mt-1">Isolated Demo Environment Controls</h3>
            <p className="text-xs text-slate-400">
              TailorHub maintains a separate demonstration database containing exactly 10 demo customers with pre-populated measurements, orders, and appointments.
            </p>
          </div>

          {resetSuccessMessage && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {resetSuccessMessage}
            </div>
          )}

          <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              Restore / Reset Demo Dataset
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              If demo orders or customer records have been modified during client demonstrations, click below to wipe and restore the clean 10 demo customer accounts.
            </p>
            <button
              onClick={handleResetDemoData}
              disabled={isResettingDemo}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all active:scale-95"
            >
              <RotateCcw className={`w-4 h-4 ${isResettingDemo ? 'animate-spin' : ''}`} />
              {isResettingDemo ? 'Resetting Demo Data...' : 'RESET DEMO DATA (Restore 10 Customers)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
