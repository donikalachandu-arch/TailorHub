import React, { useState, useEffect } from 'react';
import { Users, Search, Camera, Plus, Phone, Ruler, Calendar, ArrowRight, ShieldCheck, FileText, Check, Clock, Edit2, AlertCircle, RefreshCw, X, Save, Mail, MapPin } from 'lucide-react';
import { apiRequest } from '../services/apiClient';
import { useLanguage } from '../context/LanguageContext';
import { useMode } from '../context/ModeContext';

interface CustomerManagementProps {
  onOpenLens: () => void;
  onOpenNewOrderWithCustomer?: (customer: any, measurement?: any) => void;
}

export const TailorCustomerManagement: React.FC<CustomerManagementProps> = ({ onOpenLens, onOpenNewOrderWithCustomer }) => {
  const { t } = useLanguage();
  const { isDemo } = useMode();

  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected customer details modal
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerDetails, setCustomerDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Edit Customer Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    notes: ''
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

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

  const fetchCustomers = async (search = '') => {
    setIsLoading(true);
    setError(null);
    try {
      const url = search ? `/tailor/customers?search=${encodeURIComponent(search)}` : '/tailor/customers';
      const res = await apiRequest(url);
      setCustomers(res.customers || []);
    } catch (err: any) {
      console.error('Failed to fetch customers:', err);
      setError(err.message || 'Unable to load customers from TailorHub services.');
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
      if (res?.customer) {
        setEditForm({
          name: res.customer.name || '',
          phone: res.customer.phone || '',
          email: res.customer.email || '',
          location: res.customer.location || '',
          notes: res.customer.notes || ''
        });
      }
    } catch (err: any) {
      console.error('Failed to load customer details:', err);
      alert(err.message || 'Unable to load customer details.');
      setSelectedCustomerId(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) return;

    setIsSavingEdit(true);
    try {
      await apiRequest(`/tailor/customers/${selectedCustomerId}`, {
        method: 'PATCH',
        body: editForm
      });
      setIsEditing(false);
      await handleOpenCustomer(selectedCustomerId);
      fetchCustomers(searchQuery);
    } catch (err: any) {
      alert(err.message || 'Failed to update customer details.');
    } finally {
      setIsSavingEdit(false);
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
      alert(err.message || 'Failed to add customer.');
    } finally {
      setIsSavingManual(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header section with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">CRM & Measurement Vault</span>
            {isDemo && (
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                10 Demo Customers Active
              </span>
            )}
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            Boutique Customer Directory
          </h2>
          <p className="text-xs text-slate-400">Manage client measurement profiles, previous order histories, and digitized register sheets.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenLens}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <Camera className="w-4 h-4" />
            Digitize Old Record
          </button>
          <button
            onClick={() => setShowManualModal(true)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Search and filter bar */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center gap-3 shadow-md">
        <Search className="w-5 h-5 text-slate-400 ml-2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by customer name, mobile number, or notes..."
          className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none w-full"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-xs text-slate-400 hover:text-white px-2">
            Clear
          </button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchCustomers(searchQuery)}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="text-center py-20 bg-slate-900/50 border border-slate-800 rounded-3xl space-y-3">
          <RefreshCw className="w-6 h-6 text-amber-400 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-400">Loading boutique client directory...</p>
        </div>
      ) : customers.length === 0 ? (
        /* Empty state */
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-3 shadow-xl">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Customers Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? `No matching records found for "${searchQuery}". Try searching with another name or phone number.`
              : 'Add your first customer manually or scan handwritten notebook pages using TailorHub Lens.'}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => setShowManualModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl"
            >
              Add New Customer
            </button>
            <button
              onClick={onOpenLens}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl"
            >
              Scan Old Register Book
            </button>
          </div>
        </div>
      ) : (
        /* Customer Table Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((cust) => (
            <div
              key={cust.id}
              onClick={() => handleOpenCustomer(cust.id)}
              className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/5 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border border-slate-700 flex items-center justify-center font-black text-sm text-amber-400">
                      {cust.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                        {cust.name}
                      </h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-500" />
                        {cust.phone}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                    {cust.latest_garment || 'Profile'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
                  {cust.notes || 'No notes added'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 text-[11px]">
                  <Ruler className="w-3.5 h-3.5 text-amber-400" />
                  {cust.measurements_count || 1} Meas.
                </span>
                <span className="flex items-center gap-1 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  {cust.active_orders_count || 0} Orders
                </span>
                <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5 text-xs">
                  View <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customer Details Modal */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 text-white space-y-6 shadow-2xl my-8">
            {loadingDetails ? (
              <div className="text-center py-12 space-y-2">
                <RefreshCw className="w-6 h-6 text-amber-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Loading full customer profile...</p>
              </div>
            ) : customerDetails ? (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-black text-lg text-amber-400">
                      {customerDetails.customer?.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                        {customerDetails.customer?.name}
                        <button
                          onClick={() => setIsEditing(!isEditing)}
                          className="p-1 text-slate-400 hover:text-amber-400 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-3">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {customerDetails.customer?.phone}</span>
                        {customerDetails.customer?.email && (
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {customerDetails.customer?.email}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCustomerId(null);
                      setIsEditing(false);
                    }}
                    className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Edit Form */}
                {isEditing ? (
                  <form onSubmit={handleSaveEdit} className="p-4 bg-slate-950 border border-amber-500/30 rounded-2xl space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Edit2 className="w-3.5 h-3.5" /> Edit Customer Record
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-slate-400 block mb-1">Full Name</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Phone Number</label>
                        <input
                          type="text"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Email</label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Location / City</label>
                        <input
                          type="text"
                          value={editForm.location}
                          onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-slate-400 block mb-1">Tailor Notes & Preferences</label>
                        <textarea
                          value={editForm.notes}
                          onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                          rows={2}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingEdit}
                        className="px-4 py-1.5 bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5"
                      >
                        {isSavingEdit ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                ) : null}

                {/* Measurements Vault Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5" /> Measurement Profiles ({customerDetails.measurements?.length || 0})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {customerDetails.measurements?.map((meas: any) => (
                      <div key={meas.id} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">{meas.profile_name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 font-bold">
                            v{meas.version}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 text-[11px] text-slate-300">
                          {meas.measurement_data?.upper_body?.chest && <span>Chest: <b>{meas.measurement_data.upper_body.chest}"</b></span>}
                          {meas.measurement_data?.upper_body?.shoulder && <span>Shoulder: <b>{meas.measurement_data.upper_body.shoulder}"</b></span>}
                          {meas.measurement_data?.upper_body?.sleeve && <span>Sleeve: <b>{meas.measurement_data.upper_body.sleeve}"</b></span>}
                          {meas.measurement_data?.lower_body?.waist && <span>Waist: <b>{meas.measurement_data.lower_body.waist}"</b></span>}
                          {meas.measurement_data?.lower_body?.pant_length && <span>Length: <b>{meas.measurement_data.lower_body.pant_length}"</b></span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Orders History */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Platform Orders ({customerDetails.platformOrders?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {customerDetails.platformOrders?.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No active orders placed with this shop.</p>
                    ) : (
                      customerDetails.platformOrders?.map((ord: any) => (
                        <div key={ord.id} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-white">{ord.order_number} • {ord.garment_type}</p>
                            <p className="text-[11px] text-slate-400">Delivery: {ord.delivery_date || 'Standard'}</p>
                          </div>
                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              {ord.status}
                            </span>
                            <p className="text-xs font-bold text-emerald-400 mt-1">₹{ord.total_amount}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Manual Customer Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-white space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                Register New Customer in Boutique
              </h3>
              <button onClick={() => setShowManualModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualCustomer} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Customer Name *</label>
                  <input
                    type="text"
                    value={manualForm.name}
                    onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                    placeholder="e.g. Anand Varma"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Mobile Number *</label>
                  <input
                    type="tel"
                    value={manualForm.phone}
                    onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                    placeholder="10 digit mobile"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Chest (in)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={manualForm.chest}
                    onChange={(e) => setManualForm({ ...manualForm, chest: e.target.value })}
                    placeholder="40"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Waist (in)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={manualForm.waist}
                    onChange={(e) => setManualForm({ ...manualForm, waist: e.target.value })}
                    placeholder="34"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Sleeve (in)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={manualForm.sleeve}
                    onChange={(e) => setManualForm({ ...manualForm, sleeve: e.target.value })}
                    placeholder="25"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Stitching Notes / Preferences</label>
                <textarea
                  value={manualForm.notes}
                  onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                  placeholder="e.g. Prefers French cuffs, double pockets with flaps"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingManual}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-amber-500/20"
                >
                  {isSavingManual ? 'Saving Customer...' : 'Save to CRM'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
