import React, { useState, useEffect } from 'react';
import { Users, Search, Camera, Plus, Phone, Ruler, Calendar, ArrowRight, ShieldCheck, FileText, Check, Clock, Edit2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { apiRequest } from '../services/apiClient';
import { useLanguage } from '../context/LanguageContext';

interface CustomerManagementProps {
  onOpenLens: () => void;
  onOpenNewOrderWithCustomer?: (customer: any, measurement?: any) => void;
}

export const TailorCustomerManagement: React.FC<CustomerManagementProps> = ({ onOpenLens, onOpenNewOrderWithCustomer }) => {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Selected customer details modal
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerDetails, setCustomerDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Manual Customer Add Modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    garment_type: 'Shirt',
    chest: '',
    waist: '',
    shoulder: '',
    sleeve: '',
    neck: '',
    pant_length: '',
    price: '',
    notes: ''
  });
  const [isSavingManual, setIsSavingManual] = useState(false);

  // Image preview modal for scanned document
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const fetchCustomers = async (search = '') => {
    setIsLoading(true);
    try {
      const url = search ? `/tailor/customers?search=${encodeURIComponent(search)}` : '/tailor/customers';
      const res = await apiRequest(url);
      setCustomers(res.customers || []);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(searchQuery);
  }, [searchQuery]);

  const handleOpenCustomer = async (id: string) => {
    setSelectedCustomerId(id);
    setLoadingDetails(true);
    try {
      const res = await apiRequest(`/tailor/customers/${id}`);
      setCustomerDetails(res);
    } catch (err) {
      console.error('Failed to load customer details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSaveManualCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.name || !manualForm.phone) {
      alert('Please enter customer name and phone number.');
      return;
    }

    setIsSavingManual(true);
    try {
      const payload = {
        name: manualForm.name,
        phone: manualForm.phone,
        email: manualForm.email,
        address: manualForm.address,
        garment_type: manualForm.garment_type,
        upper_body: {
          chest: manualForm.chest ? parseFloat(manualForm.chest) : undefined,
          shoulder: manualForm.shoulder ? parseFloat(manualForm.shoulder) : undefined,
          sleeve: manualForm.sleeve ? parseFloat(manualForm.sleeve) : undefined,
          neck: manualForm.neck ? parseFloat(manualForm.neck) : undefined
        },
        lower_body: {
          waist: manualForm.waist ? parseFloat(manualForm.waist) : undefined,
          pant_length: manualForm.pant_length ? parseFloat(manualForm.pant_length) : undefined
        },
        notes: manualForm.notes,
        price: manualForm.price ? parseFloat(manualForm.price) : undefined
      };

      await apiRequest('/tailor/customers/manual', {
        method: 'POST',
        body: payload
      });

      setShowManualModal(false);
      setManualForm({
        name: '',
        phone: '',
        email: '',
        address: '',
        garment_type: 'Shirt',
        chest: '',
        waist: '',
        shoulder: '',
        sleeve: '',
        neck: '',
        pant_length: '',
        price: '',
        notes: ''
      });
      fetchCustomers();
    } catch (err: any) {
      alert(err.message || 'Failed to save customer');
    } finally {
      setIsSavingManual(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner with Lens CTA */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Customer CRM & Records</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30">
                TailorHub Lens Integrated
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 flex items-center gap-2">
              <Users className="w-6 h-6 text-amber-400" />
              Customer Database & Measurement Registry
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Search customers, view measurement version history, and digitize paper registers with AI OCR.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={onOpenLens}
              className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold rounded-2xl text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all transform active:scale-95"
            >
              <Camera className="w-4 h-4" />
              TAILORHUB LENS (SCAN OLD RECORD)
            </button>
            <button
              onClick={() => setShowManualModal(true)}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl text-xs border border-slate-700 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Customer Manually
            </button>
          </div>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, 10-digit phone, garment type, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-500 transition-all outline-none"
          />
        </div>
        <span className="text-xs text-slate-400 font-semibold px-2 hidden sm:inline">
          {customers.length} customer(s) found
        </span>
      </div>

      {/* Customers List */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 text-xs font-semibold animate-pulse">
          Loading customer registry...
        </div>
      ) : customers.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <h4 className="text-base font-bold text-white">No customers found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Scan your physical tailoring notebooks with TailorHub Lens or add a new customer manually.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={onOpenLens}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-2"
            >
              <Camera className="w-4 h-4" /> Scan Old Register
            </button>
            <button
              onClick={() => setShowManualModal(true)}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs border border-slate-700"
            >
              Add Manually
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((c) => {
            const isDigitized = c.latest_source === 'SCANNED_RECORD' || (c.notes && c.notes.toLowerCase().includes('digitized'));
            return (
              <div
                key={c.id}
                onClick={() => handleOpenCustomer(c.id)}
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 text-white shadow-lg cursor-pointer transition-all hover:scale-[1.01] group flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-extrabold text-white group-hover:text-amber-400 transition-colors">
                        {c.name}
                      </h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                        <Phone className="w-3 h-3 text-slate-500" /> {c.phone}
                      </p>
                    </div>

                    {isDigitized ? (
                      <span className="text-[9px] bg-amber-500/10 text-amber-400 font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1 uppercase tracking-wider shrink-0">
                        <ShieldCheck className="w-3 h-3" /> Lens Digitized
                      </span>
                    ) : (
                      <span className="text-[9px] bg-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded-full uppercase shrink-0">
                        Manual Entry
                      </span>
                    )}
                  </div>

                  {c.location && (
                    <p className="text-[11px] text-slate-500 mt-2 truncate">
                      📍 {c.location}
                    </p>
                  )}

                  {c.notes && (
                    <p className="text-[11px] text-slate-400 bg-slate-950 p-2 rounded-xl mt-3 line-clamp-2 border border-slate-800/80 italic">
                      "{c.notes}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex gap-3 text-[11px] text-slate-400 font-medium">
                    <span><strong>{c.active_orders_count || 0}</strong> Orders</span>
                    <span><strong>{c.historical_orders_count || 0}</strong> Past Books</span>
                    <span><strong>{c.measurements_count || 0}</strong> Profiles</span>
                  </div>

                  <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px] group-hover:translate-x-0.5 transition-transform">
                    View Profile <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Customer Profile Deep Modal */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 text-white space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider">
                  Customer Profile & Historical Registry
                </span>
                <h3 className="text-xl font-extrabold text-white mt-0.5">
                  {customerDetails?.customer?.name || 'Customer Profile'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {loadingDetails ? (
              <div className="py-16 text-center text-slate-400 text-xs animate-pulse">
                Loading complete customer history and measurements...
              </div>
            ) : customerDetails ? (
              <div className="space-y-6">
                {/* Contact & Meta Header */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <p className="text-xs font-mono text-slate-300">📱 Mobile: <strong className="text-white">{customerDetails.customer.phone}</strong></p>
                    {customerDetails.customer.email && <p className="text-xs text-slate-400">✉️ Email: {customerDetails.customer.email}</p>}
                    {customerDetails.customer.location && <p className="text-xs text-slate-400">📍 Location: {customerDetails.customer.location}</p>}
                  </div>

                  <button
                    onClick={() => {
                      const latestMeas = customerDetails.measurements?.[0];
                      if (onOpenNewOrderWithCustomer) {
                        onOpenNewOrderWithCustomer(customerDetails.customer, latestMeas);
                      }
                      setSelectedCustomerId(null);
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    <Plus className="w-4 h-4" />
                    CREATE NEW ORDER WITH THESE MEASUREMENTS
                  </button>
                </div>

                {/* Measurements with Version History */}
                <div>
                  <h4 className="text-sm font-extrabold text-white mb-3 flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-amber-400" />
                    Digital Measurement Profiles & Versions
                  </h4>

                  {customerDetails.measurements?.length === 0 ? (
                    <p className="text-xs text-slate-500 italic bg-slate-950 p-4 rounded-xl">No measurements recorded yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {customerDetails.measurements.map((m: any) => (
                        <div key={m.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold text-white">{m.profile_name}</span>
                              <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-extrabold px-2 py-0.5 rounded border border-indigo-500/30 uppercase">
                                Version {m.version}
                              </span>
                              <span className="text-[9px] bg-amber-500/10 text-amber-400 font-bold px-2 py-0.5 rounded uppercase">
                                {m.source || 'MANUAL'}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500">Updated: {new Date(m.updated_at || m.created_at).toLocaleDateString()}</span>
                          </div>

                          {/* Upper Body Grid */}
                          {m.measurement_data?.upper_body && Object.keys(m.measurement_data.upper_body).length > 0 && (
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Upper Body (Inches)</span>
                              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                {Object.entries(m.measurement_data.upper_body).map(([key, val]) => (
                                  <div key={key} className="bg-slate-900 border border-slate-800/80 p-2 rounded-xl text-center">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase block">{key.replace('_', ' ')}</span>
                                    <span className="text-xs font-extrabold text-amber-400">{String(val)}″</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Lower Body Grid */}
                          {m.measurement_data?.lower_body && Object.keys(m.measurement_data.lower_body).length > 0 && (
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Lower Body (Inches)</span>
                              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                {Object.entries(m.measurement_data.lower_body).map(([key, val]) => (
                                  <div key={key} className="bg-slate-900 border border-slate-800/80 p-2 rounded-xl text-center">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase block">{key.replace('_', ' ')}</span>
                                    <span className="text-xs font-extrabold text-amber-400">{String(val)}″</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Historical Orders imported from Old Books */}
                {customerDetails.historicalOrders?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-extrabold text-white mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      Historical Orders (Imported from Old Paper Registers)
                    </h4>

                    <div className="space-y-2">
                      {customerDetails.historicalOrders.map((ho: any) => (
                        <div key={ho.id} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-white">{ho.garment_type}</span>
                              <span className="text-[9px] bg-amber-500/10 text-amber-400 font-bold px-1.5 py-0.5 rounded border border-amber-500/20">
                                Imported from Old Book
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Date: {ho.order_date || 'Past Record'} {ho.notes ? `• "${ho.notes}"` : ''}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="font-extrabold text-white block">₹{ho.price || 0}</span>
                            {ho.advance > 0 && <span className="text-[10px] text-emerald-400 font-semibold">Adv: ₹{ho.advance}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Associated Scanned Register Documents */}
                {customerDetails.scannedRecords?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-extrabold text-white mb-3 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-amber-400" />
                      Original Handwritten Register Scan Archive
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {customerDetails.scannedRecords.map((sr: any) => (
                        <div
                          key={sr.id}
                          onClick={() => setPreviewImageUrl(sr.original_image_url)}
                          className="group relative h-28 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 hover:border-amber-400 cursor-pointer transition-all"
                        >
                          <img src={sr.original_image_url} alt="Scanned Register" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-transparent transition-colors" />
                          <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold bg-slate-950/80 text-amber-300 px-1.5 py-0.5 rounded">
                            🔍 View Scan
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Manual Customer Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSaveManualCustomer} className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                Add New Customer Manually
              </h3>
              <button type="button" onClick={() => setShowManualModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Kumar"
                    value={manualForm.name}
                    onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Mobile Number (10 Digits) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9876543210"
                    value={manualForm.phone}
                    onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Garment Category</label>
                <select
                  value={manualForm.garment_type}
                  onChange={(e) => setManualForm({ ...manualForm, garment_type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                >
                  <option value="Shirt">Shirt</option>
                  <option value="Pant">Pant</option>
                  <option value="Kurta">Kurta</option>
                  <option value="Blouse">Blouse</option>
                  <option value="Suit">Suit</option>
                  <option value="Safari">Safari</option>
                  <option value="Uniform">Uniform</option>
                </select>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <span className="font-bold text-amber-400 uppercase text-[10px]">Initial Measurements (Inches)</span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  <div>
                    <span className="text-[9px] text-slate-400 block">Chest</span>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="40"
                      value={manualForm.chest}
                      onChange={(e) => setManualForm({ ...manualForm, chest: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-center text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">Waist</span>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="34"
                      value={manualForm.waist}
                      onChange={(e) => setManualForm({ ...manualForm, waist: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-center text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">Shoulder</span>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="18"
                      value={manualForm.shoulder}
                      onChange={(e) => setManualForm({ ...manualForm, shoulder: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-center text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">Sleeve</span>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="25"
                      value={manualForm.sleeve}
                      onChange={(e) => setManualForm({ ...manualForm, sleeve: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-center text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">Neck</span>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="16"
                      value={manualForm.neck}
                      onChange={(e) => setManualForm({ ...manualForm, neck: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-center text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">Pant L</span>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="40"
                      value={manualForm.pant_length}
                      onChange={(e) => setManualForm({ ...manualForm, pant_length: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-center text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Tailoring Notes & Stitching Preferences</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Regular fit, double pocket with flaps, loose sleeve..."
                  value={manualForm.notes}
                  onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingManual}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg shadow-amber-500/20"
              >
                {isSavingManual ? 'Saving Customer...' : 'Save to Customer Registry'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Full Image Preview Modal */}
      {previewImageUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl p-2 overflow-hidden flex flex-col items-center">
            <button
              onClick={() => setPreviewImageUrl(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 bg-black/70 hover:bg-black text-white rounded-full flex items-center justify-center font-bold"
            >
              ✕
            </button>
            <img src={previewImageUrl} alt="Full scan" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
};
