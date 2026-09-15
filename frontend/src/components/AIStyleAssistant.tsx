import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, Shirt, AlertCircle } from 'lucide-react';
import { apiRequest } from '../services/apiClient';

export const AIStyleAssistant: React.FC<{ onUseRecommendation?: (rec: any) => void }> = ({ onUseRecommendation }) => {
  const [garment, setGarment] = useState('Wedding Kurta');
  const [occasion, setOccasion] = useState('Wedding');
  const [colorPref, setColorPref] = useState('Royal Indigo');
  const [sleevePref, setSleevePref] = useState('Full Sleeve with Cuff');
  const [neckPref, setNeckPref] = useState('Mandarin Collar');

  const [recommendation, setRecommendation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await apiRequest('/ai/style-recommendation', {
        method: 'POST',
        body: {
          garment,
          occasion,
          color_preference: colorPref,
          sleeve_preference: sleevePref,
          neck_preference: neckPref
        }
      });

      setRecommendation(res.recommendation);
    } catch (err: any) {
      alert(err.message || 'AI recommendation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Personalized Fashion Tech</span>
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-400" />
          AI Tailoring Style Assistant
        </h2>
        <p className="text-xs text-slate-400">Get AI-generated neck designs, sleeve patterns, and fabric color combinations tailored to your occasion.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Input */}
        <form onSubmit={handleGenerate} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-2">1. Style Input Parameters</h3>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Select Garment</label>
            <select
              value={garment}
              onChange={(e) => setGarment(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="Wedding Kurta">Wedding Kurta</option>
              <option value="Designer Blouse">Designer Blouse</option>
              <option value="Formal Shirt">Formal Shirt</option>
              <option value="Blazer Suit">Blazer Suit</option>
              <option value="Anarkali Dress">Anarkali Dress</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Occasion</label>
            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="Wedding">Wedding / Sangeet</option>
              <option value="Festival">Festival Celebration</option>
              <option value="Office">Office / Corporate Formal</option>
              <option value="Party">Evening Cocktail Party</option>
              <option value="Casual">Casual Tailored Fit</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Preferred Color Scheme</label>
            <input
              type="text"
              value={colorPref}
              onChange={(e) => setColorPref(e.target.value)}
              placeholder="e.g. Royal Indigo, Emerald Green, Gold"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {isLoading ? 'Generating AI Recommendations...' : 'GENERATE AI STYLE SPECIFICATION'}
          </button>
        </form>

        {/* AI Output Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-3">2. AI Style Specification</h3>

            {!recommendation ? (
              <div className="py-20 text-center text-slate-500 text-xs font-semibold">
                Configure style parameters and click generate.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-xs font-extrabold">
                  {recommendation.title}
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Neck Design</span>
                    <span className="font-bold text-white">{recommendation.neck_design}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Sleeve Pattern</span>
                    <span className="font-bold text-white">{recommendation.sleeve_design}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Color Combination</span>
                    <span className="font-bold text-amber-300">{recommendation.color_combination}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Occasion Suitability</span>
                    <span className="text-slate-300">{recommendation.occasion_suitability}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-300">
                  <span className="text-amber-400 font-bold block mb-1">Styling Suggestions:</span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {recommendation.styling_tips.map((tip: string, idx: number) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800">
            <p className="text-[10px] text-slate-500 mb-2 italic">
              Disclaimer: AI suggestions are recommendations and may not guarantee fit, appearance, or suitability.
            </p>
            {recommendation && onUseRecommendation && (
              <button
                onClick={() => onUseRecommendation(recommendation)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 text-amber-400" /> USE THIS RECOMMENDATION FOR ORDER
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
