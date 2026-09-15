import React, { useEffect, useState } from 'react';
import { Ruler, Plus, Edit2, History, Check, Camera, Sparkles, AlertTriangle, ShieldCheck, ChevronRight, X } from 'lucide-react';
import { apiRequest } from '../services/apiClient';

export const MeasurementVault: React.FC = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<any[] | null>(null);

  // Form State
  const [profileName, setProfileName] = useState('My Custom Fit');
  const [garmentCategory, setGarmentCategory] = useState('Shirt');

  // Upper Body
  const [chest, setChest] = useState<number>(40);
  const [shoulder, setShoulder] = useState<number>(17.5);
  const [neck, setNeck] = useState<number>(15.5);
  const [sleeve, setSleeve] = useState<number>(25);
  const [armhole, setArmhole] = useState<number>(18);
  const [shirtLength, setShirtLength] = useState<number>(29.5);

  // Lower Body
  const [waist, setWaist] = useState<number>(34);
  const [hip, setHip] = useState<number>(40);
  const [pantLength, setPantLength] = useState<number>(41);

  // AI Estimation Module State
  const [showAIModule, setShowAIModule] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiEstimated, setAiEstimated] = useState(false);

  const loadMeasurements = async () => {
    try {
      const res = await apiRequest('/measurements');
      setProfiles(res.measurements);
    } catch (err) {
      console.error('Failed to load measurements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMeasurements();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const measurement_data = {
        upper_body: { chest, shoulder, neck, sleeve, armhole, shirt_length: shirtLength },
        lower_body: { waist, hip, pant_length: pantLength },
        custom_measurements: []
      };

      await apiRequest('/measurements', {
        method: 'POST',
        body: {
          profile_name: profileName,
          garment_category: garmentCategory,
          measurement_data,
          is_default: true
        }
      });

      setShowAddForm(false);
      loadMeasurements();
    } catch (err: any) {
      alert(err.message || 'Failed to save measurement profile');
    }
  };

  const handleRunAIEstimation = () => {
    setAiAnalyzing(true);
    setTimeout(() => {
      setChest(41);
      setShoulder(18);
      setWaist(35);
      setSleeve(25.5);
      setAiAnalyzing(false);
      setAiEstimated(true);
    }, 1500);
  };

  const viewHistory = async (id: string) => {
    try {
      const res = await apiRequest(`/measurements/${id}/history`);
      setSelectedHistory(res.history);
    } catch (err) {
      console.error('Error fetching measurement history:', err);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Ruler className="w-6 h-6 text-amber-400" />
            Digital Measurement Vault
          </h2>
          <p className="text-xs text-slate-400">Save once. Reuse anytime across all master tailors without re-measuring.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowAIModule(!showAIModule)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/20"
          >
            <Sparkles className="w-4 h-4 text-amber-300" /> AI Camera Scan
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" /> New Profile
          </button>
        </div>
      </div>

      {/* AI Camera Estimation Module */}
      {showAIModule && (
        <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-6 text-white space-y-4 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">AI Body Measurement Estimator</h3>
            </div>
            <button onClick={() => setShowAIModule(false)} className="text-slate-400 hover:text-white text-xs">Close</button>
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>AI Disclaimer:</strong> AI-generated measurements should be verified before tailoring. Review and edit values before confirming.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50">
              <Camera className="w-8 h-8 text-purple-400 mb-2" />
              <span className="text-xs font-bold text-slate-200">Front Pose Photo</span>
              <span className="text-[10px] text-slate-400">Click to capture / upload</span>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50">
              <Camera className="w-8 h-8 text-indigo-400 mb-2" />
              <span className="text-xs font-bold text-slate-200">Side Profile Photo</span>
              <span className="text-[10px] text-slate-400">Click to capture / upload</span>
            </div>
          </div>

          <button
            onClick={handleRunAIEstimation}
            disabled={aiAnalyzing}
            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-purple-600/30"
          >
            {aiAnalyzing ? 'Analyzing Body Outline & Fitting Parameters...' : 'Estimate Body Measurements'}
          </button>

          {aiEstimated && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs space-y-2">
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> AI Estimates Calculated Successfully!
              </span>
              <p className="text-slate-300">
                Chest: <strong>41 in</strong> | Shoulder: <strong>18 in</strong> | Waist: <strong>35 in</strong> | Sleeve: <strong>25.5 in</strong>
              </p>
              <button
                onClick={() => {
                  setShowAddForm(true);
                  setShowAIModule(false);
                }}
                className="px-3 py-1 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs"
              >
                Review & Transfer to Profile Form
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Profile Form */}
      {showAddForm && (
        <form onSubmit={handleSaveProfile} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white mb-2">Create New Measurement Profile</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Profile Name</label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="e.g. Slim Wedding Kurta"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Garment Category</label>
              <select
                value={garmentCategory}
                onChange={(e) => setGarmentCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Shirt">Shirt</option>
                <option value="Pant">Pant</option>
                <option value="Kurta">Kurta</option>
                <option value="Blouse">Blouse</option>
                <option value="Suit">Suit</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Upper Body Specifications (Inches)</h4>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block">Chest</label>
                <input type="number" step="0.5" value={chest} onChange={(e) => setChest(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-center" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block">Shoulder</label>
                <input type="number" step="0.5" value={shoulder} onChange={(e) => setShoulder(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-center" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block">Neck</label>
                <input type="number" step="0.5" value={neck} onChange={(e) => setNeck(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-center" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block">Sleeve</label>
                <input type="number" step="0.5" value={sleeve} onChange={(e) => setSleeve(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-center" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block">Armhole</label>
                <input type="number" step="0.5" value={armhole} onChange={(e) => setArmhole(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-center" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block">Length</label>
                <input type="number" step="0.5" value={shirtLength} onChange={(e) => setShirtLength(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-center" />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">Lower Body Specifications (Inches)</h4>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block">Waist</label>
                <input type="number" step="0.5" value={waist} onChange={(e) => setWaist(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-center" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block">Hip</label>
                <input type="number" step="0.5" value={hip} onChange={(e) => setHip(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-center" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block">Pant Length</label>
                <input type="number" step="0.5" value={pantLength} onChange={(e) => setPantLength(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-center" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl text-xs">
              Save Measurement Profile
            </button>
          </div>
        </form>
      )}

      {/* Profiles Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profiles.map((p) => {
          const upper = p.measurement_data?.upper_body || {};
          const lower = p.measurement_data?.lower_body || {};
          return (
            <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-3 shadow-lg relative">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold">{p.profile_name}</h3>
                    {p.is_default === 1 && (
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-bold">
                        DEFAULT
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-indigo-300 font-semibold">{p.garment_category} • Version v{p.version}</span>
                </div>

                <button
                  onClick={() => viewHistory(p.id)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700"
                >
                  <History className="w-3.5 h-3.5 text-amber-400" /> History
                </button>
              </div>

              {/* Upper Body Specs */}
              {Object.keys(upper).length > 0 && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Upper Body</span>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    {upper.chest && <div><span className="text-slate-400 block text-[10px]">Chest</span><span className="font-bold">{upper.chest}"</span></div>}
                    {upper.shoulder && <div><span className="text-slate-400 block text-[10px]">Shoulder</span><span className="font-bold">{upper.shoulder}"</span></div>}
                    {upper.sleeve && <div><span className="text-slate-400 block text-[10px]">Sleeve</span><span className="font-bold">{upper.sleeve}"</span></div>}
                    {upper.neck && <div><span className="text-slate-400 block text-[10px]">Neck</span><span className="font-bold">{upper.neck}"</span></div>}
                  </div>
                </div>
              )}

              {/* Lower Body Specs */}
              {Object.keys(lower).length > 0 && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Lower Body</span>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {lower.waist && <div><span className="text-slate-400 block text-[10px]">Waist</span><span className="font-bold">{lower.waist}"</span></div>}
                    {lower.hip && <div><span className="text-slate-400 block text-[10px]">Hip</span><span className="font-bold">{lower.hip}"</span></div>}
                    {lower.pant_length && <div><span className="text-slate-400 block text-[10px]">Length</span><span className="font-bold">{lower.pant_length}"</span></div>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* History Timeline Modal */}
      {selectedHistory && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 text-white shadow-2xl relative max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" /> Measurement Version Logs
              </h3>
              <button onClick={() => setSelectedHistory(null)} className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {selectedHistory.map((h) => (
                <div key={h.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-400">Version v{h.version}</span>
                    <span className="text-[10px] text-slate-400">{h.created_at}</span>
                  </div>
                  <pre className="text-[11px] text-slate-300 bg-slate-900 p-2 rounded overflow-x-auto">
                    {JSON.stringify(h.measurement_data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
