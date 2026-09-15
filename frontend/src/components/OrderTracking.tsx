import React, { useEffect, useState } from 'react';
import { ShoppingBag, Clock, CheckCircle2, AlertCircle, ArrowLeft, Volume2, ShieldCheck, User, Store } from 'lucide-react';
import { apiRequest } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { useVoice } from '../context/VoiceContext';
import { useLanguage } from '../context/LanguageContext';
import { OrderStatus } from '../types';

export const OrderTracking: React.FC<{ orderId?: string; onBack?: () => void }> = ({ orderId, onBack }) => {
  const { user } = useAuth();
  const { speakNotification } = useVoice();
  const { language } = useLanguage();

  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusHistory, setStatusHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const allStatuses: OrderStatus[] = [
    'ORDER_PLACED',
    'ORDER_ACCEPTED',
    'MEASUREMENT_CONFIRMED',
    'FABRIC_RECEIVED',
    'CUTTING',
    'STITCHING',
    'QUALITY_CHECK',
    'READY',
    'OUT_FOR_DELIVERY',
    'COMPLETED'
  ];

  const fetchOrders = async () => {
    try {
      const res = await apiRequest('/orders');
      setOrders(res.orders);

      if (orderId) {
        loadSingleOrder(orderId);
      } else if (res.orders.length > 0) {
        loadSingleOrder(res.orders[0].id);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSingleOrder = async (id: string) => {
    try {
      const res = await apiRequest(`/orders/${id}`);
      setSelectedOrder(res.order);
      setStatusHistory(res.statusHistory);
    } catch (err) {
      console.error('Error fetching order detail:', err);
    }
  };

  useEffect(() => {
    fetchOrders();

    // WebSocket real-time connection
    const socket = new WebSocket('ws://localhost:5000/ws');
    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'ORDER_STATUS_UPDATE') {
          fetchOrders();
        }
      } catch (e) {
        console.error('WebSocket parse error:', e);
      }
    };

    return () => {
      socket.close();
    };
  }, [orderId]);

  const handleUpdateStatus = async (nextStatus: OrderStatus) => {
    if (!selectedOrder) return;
    try {
      await apiRequest(`/orders/${selectedOrder.id}/status`, {
        method: 'PATCH',
        body: { status: nextStatus, notes: `Tailor changed status to ${nextStatus}` }
      });

      // Trigger localized voice notification
      if (nextStatus === 'READY') {
        speakNotification(
          'Your stitching order is ready for pickup or delivery.',
          'మీ స్టిచింగ్ ఆర్డర్ సిద్ధంగా ఉంది.',
          'आपका सिलाई ऑर्डर तैयार है।',
          language
        );
      } else if (nextStatus === 'STITCHING') {
        speakNotification(
          'Your garment is currently on the stitching table.',
          'మీ దుస్తులు ప్రస్తుతం కుట్టు టేబుల్‌పై ఉన్నాయి.',
          'आपका कपड़ा वर्तमान में सिलाई टेबल पर है।',
          language
        );
      }

      loadSingleOrder(selectedOrder.id);
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  if (isLoading) {
    return <div className="text-center py-20 text-slate-400 text-xs font-semibold">Loading Live Order Timeline...</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Real-Time Order Tracking</h2>
            <p className="text-xs text-slate-400">11-stage stitching progress with WebSocket live sync</p>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-bold text-white mb-1">No orders found</p>
          <p className="text-xs">Place your first stitching order to begin live order tracking.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List Sidebar */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Select Order</h3>
            {orders.map((o) => (
              <div
                key={o.id}
                onClick={() => loadSingleOrder(o.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedOrder?.id === o.id
                    ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-600/10'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-extrabold font-mono text-amber-400">{o.order_number}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                    {o.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{o.garment_type}</h4>
                <p className="text-xs text-slate-400">{user?.role === 'TAILOR' ? o.customer_name : o.shop_name}</p>
              </div>
            ))}
          </div>

          {/* Detailed Order Timeline Card */}
          {selectedOrder && (
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-extrabold font-mono text-amber-400">{selectedOrder.order_number}</span>
                  <h3 className="text-xl font-extrabold">{selectedOrder.garment_type} Stitching</h3>
                  <p className="text-xs text-indigo-300">
                    {user?.role === 'TAILOR' ? `Customer: ${selectedOrder.customer_name} (${selectedOrder.customer_phone})` : `Tailor: ${selectedOrder.shop_name}`}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Delivery Est: {selectedOrder.delivery_date}</span>
                  <span className="text-lg font-extrabold text-white">₹{selectedOrder.total_amount}</span>
                </div>
              </div>

              {/* Status Updater for Tailor */}
              {user?.role === 'TAILOR' && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                  <span className="text-xs font-bold text-amber-400 block">Tailor Controls: Advance Order Status</span>
                  <div className="flex flex-wrap gap-2">
                    {allStatuses.map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(st)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                          selectedOrder.status === st
                            ? 'bg-amber-500 text-slate-950 border-amber-400'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {st.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 11-Stage Progress Timeline */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Visual Stitching Timeline</h4>
                <div className="space-y-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
                  {allStatuses.map((st, idx) => {
                    const currentIndex = allStatuses.indexOf(selectedOrder.status);
                    const isCompleted = idx <= currentIndex;
                    const isCurrent = idx === currentIndex;

                    return (
                      <div key={st} className="flex items-start gap-4 relative z-10">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isCurrent
                              ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/20 scale-110'
                              : isCompleted
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-800 text-slate-500 border border-slate-700'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>

                        <div className="flex-1">
                          <h5 className={`text-xs font-bold ${isCurrent ? 'text-amber-400 font-extrabold' : isCompleted ? 'text-white' : 'text-slate-500'}`}>
                            {st.replace(/_/g, ' ')}
                          </h5>
                          {isCurrent && (
                            <p className="text-[11px] text-indigo-300 mt-0.5">
                              Current Stage • Live status updated in database
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
