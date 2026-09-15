import React, { useState } from 'react';
import { X, Calendar, Clock, Check, AlertCircle } from 'lucide-react';
import { apiRequest } from '../services/apiClient';

interface AppointmentModalProps {
  tailor: any;
  service?: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  tailor,
  service,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [date, setDate] = useState('2026-09-02');
  const [startTime, setStartTime] = useState('10:30 AM');
  const [appointmentType, setAppointmentType] = useState<'FITTING' | 'MEASUREMENT' | 'CONSULTATION' | 'PICKUP'>('MEASUREMENT');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !tailor) return null;

  const timeSlots = ['09:30 AM', '10:30 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM', '06:30 PM'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await apiRequest('/appointments', {
        method: 'POST',
        body: {
          tailor_id: tailor.id,
          service_id: service?.id || 'srv-1',
          date,
          start_time: startTime,
          appointment_type: appointmentType,
          notes
        }
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 text-white shadow-2xl relative">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Book Appointment</h3>
            <p className="text-xs text-indigo-300 font-semibold">{tailor.shop_name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Appointment Purpose</label>
            <div className="grid grid-cols-2 gap-2">
              {(['MEASUREMENT', 'FITTING', 'CONSULTATION', 'PICKUP'] as const).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setAppointmentType(type)}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all ${
                    appointmentType === type ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Select Preferred Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Available Time Slots</label>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((slot) => (
                <button
                  type="button"
                  key={slot}
                  onClick={() => setStartTime(slot)}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all ${
                    startTime === slot ? 'bg-indigo-600 text-white border-indigo-500 font-bold' : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Special Requests / Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bringing fabric sample for consultation..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all"
          >
            {isLoading ? 'Checking Availability...' : 'Confirm Appointment Request'}
          </button>
        </form>
      </div>
    </div>
  );
};
