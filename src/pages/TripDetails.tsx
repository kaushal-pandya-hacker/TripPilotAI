import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  MapPin, 
  Calendar, 
  Wallet, 
  Bike, 
  CloudSun, 
  CheckSquare, 
  Gem, 
  FileDown, 
  ChevronRight, 
  Compass, 
  AlertCircle, 
  Star, 
  ChevronLeft,
  Navigation,
  Check,
  Fuel,
  Printer
} from 'lucide-react';
import { mockDb } from '../lib/supabase';
import TripMap from '../components/TripMap';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface TripDetailsProps {
  tripId: string;
  onNavigate: (page: string) => void;
  user: any;
}

export default function TripDetails({ tripId, onNavigate, user }: TripDetailsProps) {
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'budget' | 'vehicle' | 'hotels' | 'weather' | 'packing' | 'gems'>('itinerary');
  
  // AI Editing Chat variables
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    { sender: 'ai', text: "Welcome to your active Trip Dashboard! You can ask me to edit this plan anytime. Try typing 'Make it cheaper', 'Avoid night travel', 'Upgrade hotels', or 'Add Goa'." }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Packing checklist state (persisted locally)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadTripDetails();
  }, [tripId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const loadTripDetails = async () => {
    setLoading(true);
    const { data, error } = await mockDb.trips.get(tripId);
    if (!error && data) {
      setTrip(data);
      // Setup initial checked items
      const initialChecked: Record<string, boolean> = {};
      data.packingList?.forEach((cat: any) => {
        cat.items?.forEach((item: string) => {
          initialChecked[`${cat.category}-${item}`] = false;
        });
      });
      setCheckedItems(initialChecked);
    }
    setLoading(false);
  };

  const handleToggleCheck = (key: string) => {
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // AI Edit Itinerary Trigger
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setIsEditing(true);

    try {
      const userOpenaiKey = localStorage.getItem('VITE_OPENAI_API_KEY') || '';
      const response = await fetch('/api/edit', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-openai-key': userOpenaiKey
        },
        body: JSON.stringify({
          currentItinerary: trip,
          message: userText
        })
      });
      const updatedItinerary = await response.json();

      // Update in Local DB
      const { data, error } = await mockDb.trips.update(tripId, updatedItinerary);
      if (!error && data) {
        setTrip(data);
        setChatMessages(prev => [...prev, { sender: 'ai', text: `I have updated your itinerary successfully! Applied: "${userText}"` }]);
        
        // Log API call in Admin Analytics
        mockDb.admin.logApiCall('Edit Trip Itinerary');
      }
    } catch (err) {
      console.error("AI edit request failed", err);
      setChatMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I encountered an issue updating your itinerary. Please try again." }]);
    } finally {
      setIsEditing(false);
    }
  };

  // PDF Export logic
  const exportToPDF = async () => {
    const element = document.getElementById('itinerary-pdf-target');
    if (!element) return;
    
    // Alert premium members check
    const plan = user?.user_metadata?.subscription_status || 'Free';
    if (plan === 'Free') {
      alert("PDF download is a premium feature! Go to Profile & Billing to upgrade to Pro.");
      return;
    }

    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#080b11' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; 
      const pageHeight = 295;  
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`TripPilot_${trip.title.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center text-center">
        <span className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></span>
        <p className="text-gray-400 text-sm mt-4">Consulting active coordinates...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center border-red-500/25 text-red-400 max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 mx-auto mb-3" />
        <h3 className="font-bold">Trip Not Found</h3>
        <p className="text-xs text-gray-400 mt-1">Verify your database or storage reference.</p>
        <button onClick={() => onNavigate('dashboard')} className="mt-4 py-2 px-4 bg-white/5 border border-white/10 rounded-xl text-xs">Return Home</button>
      </div>
    );
  }

  // Calculate sum of budget elements
  const budgetSum: number = Object.values(trip.budgetBreakdown || {}).reduce((a: any, b: any) => Number(a) + Number(b), 0) as number;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
        <div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-indigo-600/10 text-indigo-400 border border-indigo-500/15">
            {trip.travel_style} • {trip.preferred_transport} Mode
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 font-display">{trip.title}</h1>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
            <span>Origin: <strong>{trip.start_location}</strong></span>
            <span>•</span>
            <span>Duration: <strong>{trip.total_days} Days</strong></span>
            <span>•</span>
            <span>Expected Budget: <strong>₹{trip.budget?.toLocaleString()}</strong></span>
          </p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={exportToPDF}
            className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/15 transition"
            title="Download PDF"
          >
            <FileDown className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
          <button 
            onClick={handlePrint}
            className="py-2.5 px-4 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
            title="Print Plan"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Main panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Tabs Navigator and contents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs header */}
          <div className="flex overflow-x-auto border-b border-white/5 pb-1 gap-2 scrollbar-none">
            {[
              { id: 'itinerary', label: 'Itinerary', icon: Calendar },
              { id: 'budget', label: 'Budget Tracker', icon: Wallet },
              { id: 'vehicle', label: 'Vehicle & Fuel', icon: Bike },
              { id: 'hotels', label: 'Hotels', icon: Star },
              { id: 'weather', label: 'Weather', icon: CloudSun },
              { id: 'packing', label: 'Packing Checklist', icon: CheckSquare },
              { id: 'gems', label: 'Hidden Gems', icon: Gem },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 transition duration-200 ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Tab Body */}
          <div className="min-h-[400px]">
            
            {/* 1. Day-wise Itinerary */}
            {activeTab === 'itinerary' && (
              <div id="itinerary-pdf-target" className="space-y-4 animate-slide-up p-1">
                {trip.itinerary?.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 text-indigo-500 animate-spin" />
                    <p className="text-xs">Itinerary formatting has been updated. Press 'Edit Itinerary' or refresh.</p>
                  </div>
                ) : (
                  trip.itinerary?.map((day: any) => (
                    <div key={day.day} className="glass-panel border-white/5 p-6 rounded-2xl space-y-4">
                      <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <h3 className="font-bold text-base text-white font-display">Day {day.day}: {day.title}</h3>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300">
                          {day.transport?.type} Mode
                        </span>
                      </div>

                      {/* Activities */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest block">Activities Schedule</span>
                        <ul className="space-y-2">
                          {day.activities?.map((act: string, i: number) => (
                            <li key={i} className="text-xs text-gray-300 flex items-start gap-2.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5"></span>
                              <span>{act}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Day Stats Footer */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/5 pt-4 text-xs">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Navigation className="w-4 h-4 text-emerald-400" />
                          <span>Distance: <strong>{day.transport?.distance} km</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Check className="w-4 h-4 text-indigo-400" />
                          <span>Travel Time: <strong>{day.transport?.duration}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span>Hotel: <strong className="text-amber-400">{day.hotel?.name} (₹{day.hotel?.price})</strong></span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 2. Budget breakdown */}
            {activeTab === 'budget' && (
              <div className="glass-panel border-white/5 p-6 rounded-3xl space-y-6 animate-slide-up">
                <div>
                  <h3 className="font-bold text-lg text-white font-display">Itinerary Cost Estimator</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Calculated breakdown based on dynamic pricing tables and distance profiles.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    {Object.entries(trip.budgetBreakdown || {}).map(([key, val]: [string, any]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-gray-300">
                          <span className="capitalize">{key}</span>
                          <span>₹{val.toLocaleString()}</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500"
                            style={{ width: `${(Number(val) / (Number(budgetSum) || 1)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col justify-center items-center p-6 bg-white/5 border border-white/5 rounded-2xl text-center">
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Total Cumulative Cost</span>
                    <span className="text-3xl font-black text-white my-2 font-display">₹{Number(budgetSum).toLocaleString()}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      Number(budgetSum) <= Number(trip.budget) ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {Number(budgetSum) <= Number(trip.budget) 
                        ? `Within Budget (Saved ₹${(Number(trip.budget) - Number(budgetSum)).toLocaleString()})`
                        : `Over Budget by ₹${(Number(budgetSum) - Number(trip.budget)).toLocaleString()}`
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Vehicle & Fuel Planner */}
            {activeTab === 'vehicle' && (
              <div className="glass-panel border-white/5 p-6 rounded-3xl space-y-6 animate-slide-up">
                <div>
                  <h3 className="font-bold text-lg text-white font-display">Vehicle Rental & Fuel Tracker</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Custom calculations tailored for road trips, cruisers, and bikes.</p>
                </div>

                {!trip.vehicle_rental ? (
                  <div className="py-8 text-center text-gray-500 text-xs">
                    <Bike className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <span>No vehicle rental selected. Edit the trip using Chat to enable vehicle logistics.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 bg-white/5 border border-white/5 rounded-2xl space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400 font-semibold">Suggested Ride:</span>
                        <span className="text-sm font-bold text-white">{trip.vehicleDetails?.suggestedVehicle || 'Himalayan 411cc'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400 font-semibold">Base Rental Rate:</span>
                        <span className="text-sm font-bold text-white">₹{trip.vehicleDetails?.rentalPerDay || 1200}/day</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400 font-semibold">Rental Duration:</span>
                        <span className="text-sm font-bold text-white">{trip.vehicleDetails?.totalRentalDays || trip.total_days} Days</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/5 pt-3">
                        <span className="text-xs text-gray-400 font-semibold">Total Hire Cost:</span>
                        <span className="text-sm font-bold text-indigo-400">₹{((trip.vehicleDetails?.rentalPerDay || 1200) * (trip.vehicleDetails?.totalRentalDays || trip.total_days)).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="p-5 bg-white/5 border border-white/5 rounded-2xl space-y-4">
                      <div className="flex items-center gap-2 text-indigo-400 border-b border-white/5 pb-2">
                        <Fuel className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Fuel Consumption Calculator</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400 font-semibold">Mileage Efficiency:</span>
                        <span className="text-sm font-bold text-white">{trip.vehicleDetails?.fuelEfficiency || '30 km/l'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400 font-semibold">Estimated Liters:</span>
                        <span className="text-sm font-bold text-white">{trip.vehicleDetails?.estimatedFuelLitres || 85} L</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400 font-semibold">Current Fuel Price:</span>
                        <span className="text-sm font-bold text-white">₹{trip.vehicleDetails?.fuelPrice || 105}/L</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/5 pt-3">
                        <span className="text-xs text-gray-400 font-semibold">Total Fuel Cost:</span>
                        <span className="text-sm font-bold text-indigo-400">₹{(trip.vehicleDetails?.totalFuelCost || 8925).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. Hotel Recommendations */}
            {activeTab === 'hotels' && (
              <div className="space-y-4 animate-slide-up">
                {trip.destinationsDetails?.map((dest: any, i: number) => {
                  if (i === 0) return null; // Skip origin
                  return (
                    <div key={i} className="glass-panel border-white/5 p-6 rounded-2xl space-y-4">
                      <h3 className="font-bold text-base text-white font-display flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-indigo-400" />
                        <span>Hotels in {dest.name}</span>
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { tier: 'Budget Stay', name: `${dest.name} Backpackers Hostel`, price: Math.round(Number(budgetSum) * 0.1 / Number(trip.total_days)), rating: 4.1 },
                          { tier: 'Mid-Range', name: `${dest.name} Grand View Inn`, price: Math.round(Number(budgetSum) * 0.22 / Number(trip.total_days)), rating: 4.4 },
                          { tier: 'Luxury Resort', name: `The Imperial Resorts ${dest.name}`, price: Math.round(Number(budgetSum) * 0.45 / Number(trip.total_days)), rating: 4.8 },
                        ].map((hotel, hIdx) => (
                          <div key={hIdx} className="p-4 bg-white/5 border border-white/5 rounded-xl flex flex-col justify-between">
                            <div>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                hIdx === 0 ? 'bg-emerald-500/10 text-emerald-400' : hIdx === 1 ? 'bg-indigo-500/10 text-indigo-400' : 'bg-purple-500/10 text-purple-400'
                              }`}>{hotel.tier}</span>
                              <h4 className="font-bold text-xs text-gray-200 mt-2.5 truncate">{hotel.name}</h4>
                            </div>
                            <div className="flex justify-between items-center mt-4 border-t border-white/5 pt-2">
                              <span className="text-xs font-bold text-white">₹{hotel.price}/night</span>
                              <span className="flex items-center gap-0.5 text-[10px] text-amber-400 font-semibold">
                                <Star className="w-3 h-3 fill-amber-400" />
                                <span>{hotel.rating}</span>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 5. Weather Forecast */}
            {activeTab === 'weather' && (
              <div className="glass-panel border-white/5 p-6 rounded-3xl space-y-6 animate-slide-up">
                <div>
                  <h3 className="font-bold text-lg text-white font-display">Weather & Safety Intelligence</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Route warning updates provided by localized meteorology datasets.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {trip.weatherForecast?.map((wf: any, idx: number) => (
                    <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-xl text-center">
                      <span className="text-[10px] text-gray-500 font-semibold block">Day {wf.day}</span>
                      <CloudSun className="w-6 h-6 text-sky-400 mx-auto my-2" />
                      <span className="text-sm font-bold text-white block">{wf.temp}</span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">Rain: {wf.rainProb}</span>
                    </div>
                  ))}
                </div>

                {/* Warnings list */}
                <div className="space-y-2 border-t border-white/5 pt-5">
                  <span className="text-[10px] font-semibold text-red-500 uppercase tracking-widest block">Route Travel Advisory Warnings</span>
                  {trip.weatherForecast?.filter((wf: any) => wf.warning).map((wf: any, idx: number) => (
                    <div key={idx} className="flex gap-3 p-3 rounded-xl bg-red-950/20 border border-red-500/20 text-red-300 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                      <span><strong>Day {wf.day} Alert:</strong> {wf.warning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Packing checklist */}
            {activeTab === 'packing' && (
              <div className="space-y-4 animate-slide-up">
                {trip.packingList?.map((cat: any, i: number) => (
                  <div key={i} className="glass-panel border-white/5 p-6 rounded-2xl">
                    <h3 className="font-bold text-sm text-white border-b border-white/5 pb-2 mb-3 uppercase tracking-wider">{cat.category} Checklist</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {cat.items?.map((item: string, idx: number) => {
                        const key = `${cat.category}-${item}`;
                        const isChecked = checkedItems[key] || false;
                        return (
                          <div 
                            key={idx}
                            onClick={() => handleToggleCheck(key)}
                            className="flex items-center gap-3 p-2 bg-white/5 border border-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition"
                          >
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-gray-600 focus:ring-indigo-500"
                            />
                            <span className={`text-xs ${isChecked ? 'line-through text-gray-500' : 'text-gray-300'}`}>{item}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 7. Hidden Gems */}
            {activeTab === 'gems' && (
              <div className="space-y-4 animate-slide-up">
                {trip.hiddenGems?.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 text-xs">
                    <Gem className="w-8 h-8 mx-auto mb-2 opacity-50 text-indigo-400" />
                    <span>No hidden gems registered for this route preset.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {trip.hiddenGems?.map((gem: any, idx: number) => (
                      <div key={idx} className="glass-panel border-white/5 p-5 rounded-2xl flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-indigo-400 font-bold uppercase">{gem.destination}</span>
                            <span className="text-[9px] font-bold px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full capitalize">{gem.type}</span>
                          </div>
                          <h4 className="font-bold text-sm text-gray-200 mt-2">{gem.title}</h4>
                          <p className="text-xs text-gray-400 mt-2.5 leading-relaxed">{gem.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Right Side: Split map and AI Assistant feedback log */}
        <div className="space-y-6">
          {/* Map Viewer */}
          <div className="h-[300px] w-full rounded-2xl overflow-hidden shadow-lg border border-white/5">
            <TripMap destinations={trip.destinationsDetails} />
          </div>

          {/* Chat Modifier */}
          <div className="glass-panel border-white/5 rounded-3xl p-5 flex flex-col justify-between h-[380px] shadow-2xl relative">
            
            {/* Editor loading overlay */}
            {isEditing && (
              <div className="absolute inset-0 z-30 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
                <span className="w-8 h-8 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></span>
                <p className="text-xs text-gray-300 mt-3 font-semibold">AI Assistant is modifying your itinerary...</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Recalculating fuel rates & map tracks</p>
              </div>
            )}

            {/* Title */}
            <div className="flex items-center gap-2 border-b border-white/5 pb-2.5 mb-3 shrink-0">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse-glow" />
              <span className="text-xs font-bold text-gray-200 uppercase tracking-wide">Itinerary AI Assistant</span>
            </div>

            {/* Message log */}
            <div className="grow overflow-y-auto space-y-3 pr-1">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] border ${
                    msg.sender === 'ai' 
                      ? 'bg-slate-900/60 border-white/5 text-gray-300 rounded-tl-sm'
                      : 'bg-indigo-600 border-indigo-500 text-white rounded-tr-sm shadow-md'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef}></div>
            </div>

            {/* Input bar */}
            <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-white/5 pt-3 mt-3 shrink-0">
              <input 
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask AI to modify (e.g. 'make it cheaper')"
                className="grow px-3.5 py-2.5 glass-input text-xs"
              />
              <button 
                type="submit"
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white transition shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
