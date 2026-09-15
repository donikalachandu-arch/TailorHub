import React, { useEffect, useState } from 'react';
import { X, Star, MapPin, Phone, Calendar, ShoppingBag, MessageSquare, Clock, Check, Navigation, ShieldCheck } from 'lucide-react';
import { apiRequest } from '../services/apiClient';

interface TailorProfileModalProps {
  tailorId: string | null;
  onClose: () => void;
  onOpenAppointment: (tailor: any, service?: any) => void;
  onOpenOrder: (tailor: any, service?: any) => void;
  onOpenChat: (tailor: any) => void;
}

export const TailorProfileModal: React.FC<TailorProfileModalProps> = ({
  tailorId,
  onClose,
  onOpenAppointment,
  onOpenOrder,
  onOpenChat
}) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!tailorId) return;
    async function loadDetails() {
      setIsLoading(true);
      try {
        const res = await apiRequest(`/tailors/${tailorId}`);
        setData(res);
      } catch (err) {
        console.error('Error fetching tailor details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDetails();
  }, [tailorId]);

  if (!tailorId) return null;

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleDirections = (address: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-slate-950/80 text-slate-400 hover:text-white backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>

        {isLoading || !data ? (
          <div className="py-20 text-center text-slate-400 text-xs font-semibold">
            Loading Tailor Profile & Services...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Gallery / Shop Header */}
            <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden bg-slate-800">
              <img
                src={data.tailor.shop_images[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'}
                alt={data.tailor.shop_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified Master Tailor
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">{data.tailor.shop_name}</h2>
                  <p className="text-xs text-indigo-300 font-semibold">Master Tailor: {data.tailor.tailor_name}</p>
                </div>

                <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-amber-400 text-sm font-extrabold flex items-center gap-1 border border-slate-700">
                  <Star className="w-4 h-4 fill-amber-400" />
                  {data.tailor.rating}
                </div>
              </div>
            </div>

            {/* Quick Action CTAs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => onOpenOrder(data.tailor)}
                className="py-3 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" /> Place Order
              </button>

              <button
                onClick={() => onOpenAppointment(data.tailor)}
                className="py-3 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
              >
                <Calendar className="w-4 h-4" /> Appointment
              </button>

              <button
                onClick={() => handleCall(data.tailor.tailor_phone)}
                className="py-3 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all"
              >
                <Phone className="w-4 h-4 text-emerald-400" /> Call Tailor
              </button>

              <button
                onClick={() => handleDirections(data.tailor.address)}
                className="py-3 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all"
              >
                <Navigation className="w-4 h-4 text-blue-400" /> Directions
              </button>
            </div>

            {/* Shop Details */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">About Studio</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{data.tailor.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  <span>{data.tailor.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>{data.tailor.working_hours}</span>
                </div>
              </div>
            </div>

            {/* Service Menu */}
            <div>
              <h3 className="text-sm font-bold text-white mb-3">Available Stitching Services ({data.services.length})</h3>
              <div className="space-y-2">
                {data.services.map((srv: any) => (
                  <div
                    key={srv.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between hover:border-slate-700 transition-all"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{srv.name}</h4>
                      <p className="text-[11px] text-slate-400">{srv.description}</p>
                      <span className="text-[10px] text-indigo-300 font-semibold mt-1 inline-block">
                        Est. Duration: {srv.duration_days} days
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-white block">₹{srv.price}</span>
                      <button
                        onClick={() => onOpenOrder(data.tailor, srv)}
                        className="mt-1 px-3 py-1 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-[11px] font-bold transition-all"
                      >
                        Select Service
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            {data.reviews && data.reviews.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-white mb-3">Verified Customer Reviews</h3>
                <div className="space-y-2">
                  {data.reviews.map((rev: any) => (
                    <div key={rev.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white">{rev.customer_name}</span>
                        <div className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3 h-3 fill-amber-400" /> {rev.rating}
                        </div>
                      </div>
                      <p className="text-slate-300">{rev.review}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
