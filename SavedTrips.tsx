import React, { useState, useEffect } from 'react';
import { 
  Map, 
  Search, 
  Filter, 
  Trash2, 
  Copy, 
  Eye, 
  Calendar, 
  Wallet, 
  Navigation,
  Compass,
  ArrowUpDown
} from 'lucide-react';
import { mockDb } from '../lib/supabase';

interface SavedTripsProps {
  onNavigate: (page: string, params?: any) => void;
  user: any;
}

export default function SavedTrips({ onNavigate, user }: SavedTripsProps) {
  const [trips, setTrips] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStyle, setFilterStyle] = useState('All');
  const [sortBy, setSortBy] = useState<'date' | 'budget' | 'days'>('date');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrips();
  }, [user]);

  const loadTrips = async () => {
    setLoading(true);
    const { data } = await mockDb.trips.list();
    if (data) setTrips(data);
    setLoading(false);
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const { error } = await mockDb.trips.duplicate(id);
    if (!error) loadTrips();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this trip itinerary?")) {
      const { error } = await mockDb.trips.delete(id);
      if (!error) loadTrips();
    }
  };

  // Filter and Sort logic
  const filteredTrips = trips
    .filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.start_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.destinations.some((d: string) => d.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStyle = filterStyle === 'All' || t.travel_style === filterStyle;
      return matchesSearch && matchesStyle;
    })
    .sort((a, b) => {
      if (sortBy === 'budget') return b.budget - a.budget;
      if (sortBy === 'days') return b.total_days - a.total_days;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const travelStylesList = ['All', 'Adventure', 'Luxury', 'Family', 'Religious', 'Nature', 'Backpacking'];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white font-display">My Saved Trips</h1>
        <p className="text-gray-400 text-sm mt-1">Browse, duplicate, or inspect your planned travel routes.</p>
      </div>

      {/* Control bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search starting city or stops..."
            className="w-full pl-11 pr-4 py-3 glass-input text-xs"
          />
        </div>

        {/* Style selector */}
        <div className="relative">
          <Filter className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
          <select
            value={filterStyle}
            onChange={(e) => setFilterStyle(e.target.value)}
            className="w-full pl-11 pr-4 py-3 glass-input text-xs appearance-none"
          >
            {travelStylesList.map((style, idx) => (
              <option key={idx} value={style} className="bg-slate-900 text-gray-200">{style} Styles</option>
            ))}
          </select>
        </div>

        {/* Sort selector */}
        <div className="relative">
          <ArrowUpDown className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="w-full pl-11 pr-4 py-3 glass-input text-xs appearance-none"
          >
            <option value="date" className="bg-slate-900 text-gray-200">Sort: Date Created</option>
            <option value="budget" className="bg-slate-900 text-gray-200">Sort: Highest Budget</option>
            <option value="days" className="bg-slate-900 text-gray-200">Sort: Longest Duration</option>
          </select>
        </div>
      </div>

      {/* Listing Grid */}
      {loading ? (
        <div className="h-[30vh] flex flex-col items-center justify-center text-center">
          <span className="w-8 h-8 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></span>
          <p className="text-gray-400 text-xs mt-3">Loading travel archives...</p>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="glass-panel p-16 rounded-3xl text-center border-white/5">
          <Compass className="w-12 h-12 text-gray-500 mx-auto mb-4 animate-pulse-glow" />
          <h3 className="font-bold text-gray-200">No matching itineraries found</h3>
          <p className="text-gray-400 text-xs mt-1">Adjust search parameters or design a new route.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTrips.map((trip) => (
            <div 
              key={trip.id} 
              onClick={() => onNavigate('trip-details', { tripId: trip.id })}
              className="glass-panel border-white/5 p-6 rounded-2xl hover:bg-slate-900/60 transition cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    trip.travel_style === 'Adventure' ? 'bg-amber-500/10 text-amber-400' : 'bg-indigo-500/10 text-indigo-400'
                  }`}>
                    {trip.travel_style}
                  </span>
                  <div className="flex gap-1.5 opacity-80 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => { e.stopPropagation(); onNavigate('trip-details', { tripId: trip.id }); }}
                      className="p-1.5 rounded-md hover:bg-indigo-600/10 text-indigo-400 border border-indigo-500/10"
                      title="Open View"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDuplicate(trip.id, e)}
                      className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 border border-white/5"
                      title="Clone"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(trip.id, e)}
                      className="p-1.5 rounded-md hover:bg-red-500/10 text-red-400 border border-red-500/20"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-extrabold text-base text-white mt-3 group-hover:text-indigo-400 transition truncate">{trip.title}</h3>
                
                {/* Visual Route Stops */}
                <div className="flex flex-wrap items-center gap-1.5 mt-3 text-xs text-gray-400">
                  <span className="font-bold text-gray-300">{trip.start_location}</span>
                  {trip.destinations?.slice(0, 3).map((d: string, i: number) => (
                    <React.Fragment key={i}>
                      <span>→</span>
                      <span className="truncate max-w-[80px]">{d}</span>
                    </React.Fragment>
                  ))}
                  {trip.destinations?.length > 3 && (
                    <span className="text-[10px] text-indigo-400 font-bold">+{trip.destinations.length - 3} stops</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4 mt-5 text-[11px] text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>{trip.total_days} Days</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-gray-400" />
                  <span>₹{trip.budget?.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 justify-end">
                  <Navigation className="w-3.5 h-3.5 text-gray-400" />
                  <span>{trip.summary?.totalDistance || 0} km</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
