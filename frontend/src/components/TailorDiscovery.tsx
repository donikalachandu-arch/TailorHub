import React, { useEffect, useState } from 'react';
import { Search, Filter, Star, MapPin, Phone, ArrowRight, Map as MapIcon, SlidersHorizontal } from 'lucide-react';
import { apiRequest } from '../services/apiClient';

export const TailorDiscovery: React.FC<{ onSelectTailor: (id: string) => void }> = ({ onSelectTailor }) => {
  const [tailors, setTailors] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [minRating, setMinRating] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showMapView, setShowMapView] = useState(false);

  const categories = ['All', 'Men', 'Women', 'Kids', 'Alterations', 'Shirt', 'Pant', 'Kurta', 'Blouse', 'Suit'];

  useEffect(() => {
    async function loadTailors() {
      setIsLoading(true);
      try {
        let endpoint = `/tailors?search=${encodeURIComponent(searchTerm)}`;
        if (selectedCategory !== 'All') {
          endpoint += `&category=${encodeURIComponent(selectedCategory)}`;
        }
        if (minRating > 0) {
          endpoint += `&minRating=${minRating}`;
        }
        const res = await apiRequest(endpoint);
        setTailors(res.tailors);
      } catch (err) {
        console.error('Error discovering tailors:', err);
      } finally {
        setIsLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadTailors();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, minRating]);

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Tailor & Boutique Marketplace</h2>
          <p className="text-xs text-slate-400">Discover verified local tailor master craftsmanship near you</p>
        </div>

        <button
          onClick={() => setShowMapView(!showMapView)}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
            showMapView
              ? 'bg-amber-500 text-slate-950 border-amber-400'
              : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
          }`}
        >
          <MapIcon className="w-4 h-4" />
          {showMapView ? 'List View' : 'Map View'}
        </button>
      </div>

      {/* Search & Category Filter bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by tailor name, shop, location or garment type..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Map View Simulation */}
      {showMapView && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center relative overflow-hidden h-72 flex flex-col items-center justify-center">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
          <MapIcon className="w-12 h-12 text-indigo-400 mb-2 animate-bounce" />
          <h4 className="text-sm font-bold text-white">Interactive Location Map Active</h4>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            Displaying {tailors.length} verified tailor shops across Banjara Hills, Jubilee Hills, Ameerpet & Madhapur.
          </p>
        </div>
      )}

      {/* Tailor Cards Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400 text-xs font-semibold">
          Searching TailorHub Database...
        </div>
      ) : tailors.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
          <p className="text-sm font-bold text-white mb-1">No tailors found matching your search</p>
          <p className="text-xs">Try selecting a different category or clearing search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tailors.map((t) => (
            <div
              key={t.id}
              onClick={() => onSelectTailor(t.id)}
              className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 text-white cursor-pointer transition-all hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-44 rounded-xl overflow-hidden mb-3 bg-slate-800">
                  <img
                    src={t.shop_images[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80'}
                    alt={t.shop_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-amber-400 text-xs font-extrabold flex items-center gap-1 shadow-lg">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {t.rating} ({t.review_count})
                  </div>
                </div>

                <h3 className="text-base font-bold group-hover:text-amber-400 transition-colors line-clamp-1">
                  {t.shop_name}
                </h3>
                <p className="text-xs text-indigo-300 font-semibold mb-2">Master Tailor: {t.tailor_name}</p>

                <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                  {t.description}
                </p>

                <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="line-clamp-1">{t.address}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {t.categories.map((cat: string) => (
                    <span key={cat} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-lg border border-slate-700">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Starting from</span>
                  <span className="text-sm font-extrabold text-white">₹{t.starting_price}</span>
                </div>

                <span className="px-3 py-1.5 bg-indigo-600/20 group-hover:bg-indigo-600 text-indigo-300 group-hover:text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all">
                  View Profile <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
