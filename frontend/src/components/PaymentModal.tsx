import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, CheckCircle2, Download, Lock } from 'lucide-react';
import { apiRequest } from '../services/apiClient';

interface PaymentModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ order, isOpen, onClose, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'UPI' | 'CARD' | 'CASH'>('RAZORPAY');
  const [amount, setAmount] = useState<number>(order?.balance_amount || order?.advance_amount || 450);
  const [receipt, setReceipt] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !order) return null;

  const handlePayNow = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest('/payments/create', {
        method: 'POST',
        body: {
          order_id: order.id,
          amount,
          payment_method: paymentMethod
        }
      });

      setReceipt(res);
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Payment processing failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 text-white shadow-2xl relative">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Razorpay Secure Payment</h3>
            <p className="text-xs text-amber-400 font-mono">Order {order.order_number}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!receipt ? (
          <div className="space-y-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Order Amount:</span>
                <span className="font-bold">₹{order.total_amount}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Advance Paid:</span>
                <span className="font-bold">₹{order.advance_amount}</span>
              </div>
              <div className="flex justify-between text-amber-400 font-bold border-t border-slate-800 pt-2 text-sm">
                <span>Payable Amount:</span>
                <span>₹{amount}</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                {(['RAZORPAY', 'UPI', 'CARD', 'CASH'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      paymentMethod === m ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>256-Bit SSL Encrypted Razorpay Gateway verification. Credentials never stored locally.</span>
            </div>

            <button
              onClick={handlePayNow}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl text-xs shadow-lg shadow-emerald-600/20"
            >
              {isLoading ? 'Verifying Gateway Response...' : `PAY ₹${amount} NOW`}
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-lg font-extrabold text-white">Payment Verified & Receipt Generated</h4>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-left text-xs space-y-1 font-mono">
              <p className="text-slate-400">Txn ID: <strong className="text-amber-400">{receipt.transactionId}</strong></p>
              <p className="text-slate-400">Amount Paid: <strong className="text-white">₹{receipt.amount}</strong></p>
              <p className="text-slate-400">Remaining Balance: <strong className="text-white">₹{receipt.newBalance}</strong></p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs"
            >
              Close & View Updated Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
