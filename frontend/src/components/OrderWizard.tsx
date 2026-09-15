import React, { useState, useEffect } from 'react';
import { X, Check, ArrowRight, ArrowLeft, Upload, Scissors, ShieldCheck, CreditCard } from 'lucide-react';
import { apiRequest } from '../services/apiClient';

interface OrderWizardProps {
  initialTailor?: any;
  initialService?: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}

export const OrderWizard: React.FC<OrderWizardProps> = ({
  initialTailor,
  initialService,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState(1);

  // Form State
  const [tailor, setTailor] = useState<any>(initialTailor || null);
  const [tailorsList, setTailorsList] = useState<any[]>([]);
  const [garmentType, setGarmentType] = useState(initialService?.category || 'Shirt');
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [selectedMeasurementId, setSelectedMeasurementId] = useState<string>('');
  const [fabricOption, setFabricOption] = useState<'CUSTOMER_PROVIDED' | 'TAILOR_PROVIDED'>('CUSTOMER_PROVIDED');
  const [instructions, setInstructions] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('2026-09-05');
  const [totalAmount, setTotalAmount] = useState<number>(initialService?.price || 750);
  const [advanceAmount, setAdvanceAmount] = useState<number>(initialService?.price ? Math.round(initialService.price / 2) : 375);
  const [designImages, setDesignImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=400&q=80'
  ]);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const tRes = await apiRequest('/tailors');
        setTailorsList(tRes.tailors);
        if (!tailor && tRes.tailors.length > 0) {
          setTailor(tRes.tailors[0]);
        }

        const mRes = await apiRequest('/measurements');
        setMeasurements(mRes.measurements);
        if (mRes.measurements.length > 0) {
          setSelectedMeasurementId(mRes.measurements[0].id);
        }
      } catch (err) {
        console.error('Wizard setup error:', err);
      }
    }
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest('/orders', {
        method: 'POST',
        body: {
          tailor_id: tailor?.id || 'prof-tailor-1',
          garment_type: garmentType,
          measurement_id: selectedMeasurementId || 'meas-1',
          fabric_option: fabricOption,
          total_amount: totalAmount,
          advance_amount: advanceAmount,
          delivery_date: deliveryDate,
          instructions,
          design_images: designImages
        }
      });

      onSuccess(res.orderId);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Order creation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 text-white shadow-2xl relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-[10px] font-bold uppercase text-amber-400">Step {step} of 10</span>
            <h3 className="text-xl font-extrabold text-white">Stitching Order Wizard</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Content */}
        <div className="py-3 min-h-[300px]">
          {step === 1 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">Step 1: Select Master Tailor / Boutique</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {tailorsList.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setTailor(t)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      tailor?.id === t.id ? 'bg-indigo-600/20 border-indigo-500 font-bold' : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div>
                      <p className="text-xs text-white">{t.shop_name}</p>
                      <p className="text-[10px] text-slate-400">{t.address}</p>
                    </div>
                    {tailor?.id === t.id && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">Step 2: Select Garment Type</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Shirt', 'Pant', 'Kurta', 'Blouse', 'Suit', 'Dress', 'Uniform', 'Alteration'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGarmentType(g)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                      garmentType === g ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-950 text-slate-300 border-slate-800'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">Step 3: Attach Digital Measurement Profile</h4>
              <div className="space-y-2">
                {measurements.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMeasurementId(m.id)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      selectedMeasurementId === m.id ? 'bg-indigo-600/20 border-indigo-500 font-bold' : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div>
                      <p className="text-xs text-white">{m.profile_name} (v{m.version})</p>
                      <p className="text-[10px] text-slate-400">Garment: {m.garment_category}</p>
                    </div>
                    {selectedMeasurementId === m.id && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">Step 4: Upload Design Reference Images</h4>
              <div className="grid grid-cols-2 gap-3">
                {designImages.map((img, idx) => (
                  <div key={idx} className="h-32 rounded-xl overflow-hidden border border-slate-800 relative">
                    <img src={img} alt="Design" className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="h-32 rounded-xl border border-dashed border-slate-700 bg-slate-950 flex flex-col items-center justify-center text-slate-400 cursor-pointer">
                  <Upload className="w-6 h-6 mb-1 text-indigo-400" />
                  <span className="text-[10px] font-bold">Add Photo</span>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">Step 5: Fabric Provisioning Option</h4>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFabricOption('CUSTOMER_PROVIDED')}
                  className={`p-4 rounded-xl border text-xs font-bold text-left transition-all ${
                    fabricOption === 'CUSTOMER_PROVIDED' ? 'bg-amber-500/10 text-amber-400 border-amber-500' : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  <p className="font-extrabold text-sm mb-1 text-white">Customer Fabric</p>
                  <p className="text-[10px] text-slate-400">I will provide cloth material to tailor</p>
                </button>

                <button
                  onClick={() => setFabricOption('TAILOR_PROVIDED')}
                  className={`p-4 rounded-xl border text-xs font-bold text-left transition-all ${
                    fabricOption === 'TAILOR_PROVIDED' ? 'bg-amber-500/10 text-amber-400 border-amber-500' : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  <p className="font-extrabold text-sm mb-1 text-white">Tailor Fabric</p>
                  <p className="text-[10px] text-slate-400">Tailor will supply premium fabric</p>
                </button>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">Step 6: Special Stitching Instructions</h4>
              <textarea
                rows={4}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Slim fit collar, french cuff, 2-inch side vents..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
              />
            </div>
          )}

          {step === 7 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">Step 7: Expected Delivery Date</h4>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
              />
            </div>
          )}

          {step === 8 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">Step 8: Pricing & Payment Breakdown</h4>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Garment Stitching Cost:</span>
                  <span className="font-bold">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-amber-400 font-bold">
                  <span>Advance Payment Required (50%):</span>
                  <span>₹{advanceAmount}</span>
                </div>
                <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-2">
                  <span>Balance payable at delivery:</span>
                  <span>₹{totalAmount - advanceAmount}</span>
                </div>
              </div>
            </div>
          )}

          {step === 9 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">Step 9: Select Payment Gateway</h4>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-amber-400" />
                  <div>
                    <p className="text-xs font-bold">Razorpay Secure Online Payment</p>
                    <p className="text-[10px] text-slate-400">UPI, Credit/Debit Cards, Net Banking</p>
                  </div>
                </div>
                <Check className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          )}

          {step === 10 && (
            <div className="space-y-3 text-center">
              <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="text-lg font-extrabold text-white">Order Summary Confirmation</h4>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-left text-xs space-y-1">
                <p>Tailor: <strong>{tailor?.shop_name}</strong></p>
                <p>Garment: <strong>{garmentType}</strong></p>
                <p>Total: <strong>₹{totalAmount}</strong> (Advance: ₹{advanceAmount})</p>
                <p>Est. Delivery: <strong>{deliveryDate}</strong></p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-800">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : <div />}

          {step < 10 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-lg shadow-indigo-600/30"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handlePlaceOrder}
              disabled={isLoading}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg shadow-amber-500/20"
            >
              {isLoading ? 'Creating Order...' : 'CONFIRM & PLACE ORDER'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
