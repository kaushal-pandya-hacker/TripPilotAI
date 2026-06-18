import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Map, 
  Calendar, 
  TrendingUp, 
  ChevronRight, 
  Copy, 
  Trash2, 
  Eye, 
  Compass, 
  Activity, 
  AlertTriangle 
} from 'lucide-react';
import { mockDb } from '../lib/supabase';

interface DashboardProps {
  user: any;
  onNavigate: (page: string, params?: any) => void;
}

export default function Dashboard({ user, onNavigate }: DashboardProps) {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalDays: 0,
    totalBudget: 0,
    totalDistance: 0
  });

  const loadTrips = async () => {
    setLoading(true);
    const { data, error } = await mockDb.trips.list();
    if (!error && data) {
      setTrips(data);
      
      // Calculate Stats
      const totalTrips = data.length;
      const totalDays = data.reduce((sum, t) => sum + (t.total_days || 0), 0);
      const totalBudget = data.reduce((sum, t) => sum + (t.budget || 0), 0);
      const totalDistance = data.reduce((sum, t) => sum + (t.summary?.totalDistance || 0), 0);
      
      setStats({ totalTrips, totalDays, totalBudget, totalDistance });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTrips();
  }, [user]);

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const { error } = await mockDb.trips.duplicate(id);
    if (!error) {
      loadTrips();
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this trip itinerary?")) {
      const { error } = await mockDb.trips.delete(id);
      if (!error) {
        loadTrips();
      }
    }
  };

  const quickStartTemplates = [
    {
      title: "Epic Leh-Ladakh & Himachal Ride",
      desc: "18 Days from Ahmedabad via Delhi, Rishikesh, Kedarnath, Manali, and Leh.",
      start_location: "Ahmedabad",
      destinations: ['Delhi', 'Haridwar', 'Rishikesh', 'Kedarnath', 'Badrinath', 'Manali', 'Leh-Ladakh'],
      total_days: 18,
      budget: 60000,
      travel_style: "Adventure",
      preferred_transport: "Mixed",
      vehicle_rental: true
    },
    {
      title: "Golden Triangle Cultural Tour",
      desc: "6 Days exploring Delhi, the Taj Mahal in Agra, and the pink city Jaipur.",
      start_location: "Delhi",
      destinations: ["Agra", "Jaipur"],
      total_days: 6,
      budget: 18000,
      travel_style: "Family",
      preferred_transport: "Car",
      vehicle_rental: true
    },
    {
      title: "Kerala Backwaters & Nature",
      desc: "8 Days backpacking through Kochi, Munnar hills, and Alleppey houseboats.",
      start_location: "Kochi",
      destinations: ["Munnar", "Thekkady", "Alleppey"],
      total_days: 8,
      budget: 25000,
      travel_style: "Nature",
      preferred_transport: "Bus",
      vehicle_rental: false
    }
  ];

  const handleQuickTemplate = async (template: any) => {
    setLoading(true);
    // Create new trip directly
    const { data, error } = await mockDb.trips.create({
      title: template.title,
      start_location: template.start_location,
      destinations: template.destinations,
      total_days: template.total_days,
      budget: template.budget,
      travel_style: template.travel_style,
      preferred_transport: template.preferred_transport,
      vehicle_rental: template.vehicle_rental,
      summary: {
        totalDays: template.total_days,
        totalDistance: template.total_days * 120,
        totalCost: template.budget,
        bestPeriod: "October to March"
      },
      itinerary: [],
      budgetBreakdown: {},
      vehicleDetails: {},
      destinationsDetails: [],
      packingList: []
    });
    if (!error && data) {
      // Direct call to generate values through backend API
      try {
        const userOpenaiKey = localStorage.getItem('VITE_OPENAI_API_KEY') || '';
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-openai-key': userOpenaiKey
          },
          body: JSON.stringify(data)
        });
        const fullTrip = await response.json();
        await mockDb.trips.update(data.id, fullTrip);
        onNavigate('trip-details', { tripId: data.id });
      } catch (err) {
        console.error("Backend generation error", err);
        onNavigate('trip-details', { tripId: data.id });
      }
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Welcome Back, Explorer</h1>
          <p className="text-gray-400 text-sm mt-1">Plan new routes or modify saved itineraries instantly.</p>
        </div>
        <button
          onClick={() => onNavigate('new-trip')}
          className="py-3 px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Plan New Trip</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Planned Trips', val: stats.totalTrips, icon: Map, color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5' },
          { label: 'Total Travel Days', val: stats.totalDays, icon: Calendar, color: 'text-purple-400 border-purple-500/20 bg-purple-500/5' },
          { label: 'Estimated Budget Spent', val: `₹${stats.totalBudget.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' },
          { label: 'Calculated Distance (km)', val: `${stats.totalDistance.toLocaleString()} km`, icon: Compass, color: 'text-sky-400 border-sky-500/20 bg-sky-500/5' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`p-5 rounded-2xl border glass-panel ${stat.color} flex items-center justify-between`}>
              <div>
                <span className="text-xs text-gray-400 font-medium block uppercase tracking-wider">{stat.label}</span>
                <span className="text-xl sm:text-2xl font-black text-white mt-1 block font-display">{stat.val}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Saved Trips List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <span>Active & Saved Itineraries</span>
          </h2>

          {loading ? (
            <div className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center text-center">
              <span className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></span>
              <p className="text-gray-400 text-sm mt-4">Consulting TripPilot AI Engine...</p>
            </div>
          ) : trips.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl text-center border-white/5">
              <Compass className="w-12 h-12 text-gray-500 mx-auto mb-4 animate-bounce" />
              <h3 className="font-bold text-gray-200">No trips planned yet</h3>
              <p className="text-gray-400 text-xs mt-1 max-w-sm mx-auto">Create a personalized itinerary by starting our conversational AI interview.</p>
              <button
                onClick={() => onNavigate('new-trip')}
                className="mt-5 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
              >
                Plan First Journey
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {trips.map((trip) => (
                <div 
                  key={trip.id}
                  onClick={() => onNavigate('trip-details', { tripId: trip.id })}
                  className="glass-panel border-white/5 p-5 rounded-2xl flex items-center justify-between hover:bg-slate-900/60 transition cursor-pointer group"
                >
                  <div className="space-y-1.5 max-w-[70%]">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      trip.travel_style === 'Adventure' ? 'bg-amber-500/10 text-amber-400' : 'bg-indigo-500/10 text-indigo-400'
                    }`}>
                      {trip.travel_style} • {trip.preferred_transport}
                    </span>
                    <h3 className="font-bold text-base text-white group-hover:text-indigo-400 transition truncate">{trip.title}</h3>
                    <p className="text-xs text-gray-400 flex items-center gap-2">
                      <span>Start: <strong>{trip.start_location}</strong></span>
                      <span>•</span>
                      <span>Stops: <strong>{trip.destinations?.length || 0}</strong></span>
                      <span>•</span>
                      <span>Duration: <strong>{trip.total_days} Days</strong></span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onNavigate('trip-details', { tripId: trip.id }); }}
                      className="p-2 rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/10 hover:bg-indigo-600 hover:text-white transition"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleDuplicate(trip.id, e)}
                      className="p-2 rounded-lg bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:text-white transition"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(trip.id, e)}
                      className="p-2 rounded-lg bg-red-950/20 text-red-400 border border-red-500/20 hover:bg-red-600 hover:text-white transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Plan Suggestion Templates */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            <span>AI Travel Suggestions</span>
          </h2>

          <div className="space-y-3">
            {quickStartTemplates.map((temp, i) => (
              <div 
                key={i} 
                onClick={() => handleQuickTemplate(temp)}
                className="glass-panel border-white/5 p-5 rounded-2xl hover:bg-indigo-950/10 hover:border-indigo-500/20 cursor-pointer group transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-bold text-sm text-gray-200 group-hover:text-indigo-400 transition">{temp.title}</h3>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{temp.desc}</p>
                </div>
                <div className="flex justify-between items-center mt-4 border-t border-white/5 pt-3 text-[11px] text-gray-500">
                  <span>Budget: ₹{temp.budget.toLocaleString()}</span>
                  <span className="flex items-center gap-1 text-indigo-400 group-hover:text-indigo-300 font-semibold transition">
                    Generate Plan <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
