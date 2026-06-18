import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Compass, 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Wallet, 
  Users, 
  Bike, 
  Flame, 
  Calendar,
  UtensilsCrossed
} from 'lucide-react';
import { mockDb } from '../lib/supabase';

interface InterviewProps {
  onNavigate: (page: string, params?: any) => void;
  user: any;
}

interface Question {
  id: string;
  field: string;
  questionText: string;
  placeholder: string;
  type: 'text' | 'number' | 'select' | 'multi-select' | 'boolean' | 'slider';
  options?: string[];
  min?: number;
  max?: number;
}

export default function Interview({ onNavigate, user }: InterviewProps) {
  // Questions schema
  const questions: Question[] = [
    { id: 'start', field: 'start_location', questionText: "Where are you starting your journey from?", placeholder: "e.g. Ahmedabad, Delhi, Mumbai...", type: 'text' },
    { id: 'destinations', field: 'destinations', questionText: "Which destinations do you want to visit? (Enter one or more separated by commas)", placeholder: "e.g. Delhi, Rishikesh, Kedarnath, Leh-Ladakh...", type: 'text' },
    { id: 'days', field: 'total_days', questionText: "How many total days do you have available for this trip?", placeholder: "e.g. 18, 10, 7...", type: 'number' },
    { id: 'budget', field: 'budget', questionText: "What is your total estimated budget (in ₹)?", placeholder: "e.g. 60000, 30000...", type: 'slider', min: 10000, max: 200000 },
    { id: 'group', field: 'group_type', questionText: "Who are you traveling with?", type: 'select', options: ['Solo', 'Couple', 'Family', 'Group'], placeholder: '' },
    { id: 'style', field: 'travel_style', questionText: "What is your preferred travel style?", type: 'select', options: ['Adventure', 'Luxury', 'Family', 'Religious', 'Nature', 'Backpacking'], placeholder: '' },
    { id: 'transport', field: 'preferred_transport', questionText: "What is your preferred mode of transportation?", type: 'select', options: ['Bike', 'Car', 'Flight', 'Train', 'Bus', 'Mixed'], placeholder: '' },
    { id: 'rental', field: 'vehicle_rental', questionText: "Do you need to rent a vehicle at the starting/mid point?", type: 'boolean', placeholder: '' },
    { id: 'accommodation', field: 'accommodation_preference', questionText: "What is your accommodation preference?", type: 'select', options: ['Budget Stays', 'Mid-Range Hotels', 'Luxury Resorts'], placeholder: '' },
    { id: 'must_visit', field: 'must_visit', questionText: "Are there any specific must-visit attractions or sights?", placeholder: "e.g. Ganga Aarti, Leh Palace, Trekking to temple...", type: 'text' },
    { id: 'avoid', field: 'places_to_avoid', questionText: "Are there any locations or areas you wish to avoid?", placeholder: "e.g. Heavy traffic areas, high pass nights...", type: 'text' },
    { id: 'food', field: 'food_preference', questionText: "What are your food preferences?", type: 'select', options: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Jain', 'No Preference'], placeholder: '' },
    { id: 'driving', field: 'driving_hours', questionText: "What is the maximum number of driving/riding hours you want to cover per day?", type: 'slider', min: 2, max: 12, placeholder: '' }
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({
    start_location: '',
    destinations: '',
    total_days: '',
    budget: 60000,
    group_type: 'Solo',
    travel_style: 'Adventure',
    preferred_transport: 'Mixed',
    vehicle_rental: false,
    accommodation_preference: 'Mid-Range Hotels',
    must_visit: '',
    places_to_avoid: '',
    food_preference: 'No Preference',
    driving_hours: 6
  });

  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; widget?: React.ReactNode }>>([
    { sender: 'ai', text: "Hello! I am your TripPilot AI travel advisor. Let's design your perfect custom travel plan. First, where will you be starting your journey from?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeQuestion = questions[currentStep];

  const handleNext = async (valueToSend: any) => {
    const fieldName = activeQuestion.field;
    let formattedResponse = String(valueToSend);
    
    if (activeQuestion.type === 'boolean') {
      formattedResponse = valueToSend ? 'Yes' : 'No';
    } else if (activeQuestion.type === 'slider') {
      formattedResponse = `₹${Number(valueToSend).toLocaleString()}`;
      if (fieldName === 'driving_hours') {
        formattedResponse = `${valueToSend} Hours`;
      }
    }

    // Save data
    const updatedData = { ...formData, [fieldName]: valueToSend };
    setFormData(updatedData);

    // Push User message
    setMessages(prev => [...prev, { sender: 'user', text: formattedResponse }]);

    // Move to next step
    if (currentStep < questions.length - 1) {
      const nextQ = questions[currentStep + 1];
      setCurrentStep(prev => prev + 1);
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          sender: 'ai', 
          text: nextQ.questionText 
        }]);
      }, 500);
    } else {
      // Completed interview! Run generator
      triggerItineraryGeneration(updatedData);
    }
  };

  const triggerItineraryGeneration = async (finalData: any) => {
    setIsGenerating(true);
    setGenerationStep(1); // Routing
    
    // Simulate generation logs for high premium visual effect
    const timer1 = setTimeout(() => setGenerationStep(2), 1500); // Hotels
    const timer2 = setTimeout(() => setGenerationStep(3), 3000); // Budgets
    const timer3 = setTimeout(() => setGenerationStep(4), 4500); // Finishing

    try {
      // Format destinations from string comma list to array
      const parsedDestinations = finalData.destinations
        .split(',')
        .map((d: string) => d.trim())
        .filter((d: string) => d.length > 0);

      const requestPayload = {
        ...finalData,
        destinations: parsedDestinations,
        total_days: Number(finalData.total_days),
        budget: Number(finalData.budget),
        vehicle_rental: Boolean(finalData.vehicle_rental),
        driving_hours: Number(finalData.driving_hours)
      };

      // Retrieve OpenAI key override from local storage
      const userOpenaiKey = localStorage.getItem('VITE_OPENAI_API_KEY') || '';

      // Call API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-openai-key': userOpenaiKey
        },
        body: JSON.stringify(requestPayload)
      });
      const fullItinerary = await response.json();

      // Create trip in mock/local storage DB
      const { data, error } = await mockDb.trips.create({
        title: fullItinerary.title || `Trip from ${finalData.start_location} to ${parsedDestinations.join(' & ')}`,
        start_location: finalData.start_location,
        destinations: parsedDestinations,
        total_days: Number(finalData.total_days),
        budget: Number(finalData.budget),
        travel_style: finalData.travel_style,
        preferred_transport: finalData.preferred_transport,
        vehicle_rental: Boolean(finalData.vehicle_rental),
        summary: fullItinerary.summary,
        itinerary: fullItinerary.itinerary,
        budgetBreakdown: fullItinerary.budgetBreakdown,
        vehicleDetails: fullItinerary.vehicleDetails,
        destinationsDetails: fullItinerary.destinationsDetails,
        packingList: fullItinerary.packingList,
        hiddenGems: fullItinerary.hiddenGems || [],
        weatherForecast: fullItinerary.weatherForecast || []
      });

      if (error) throw error;
      
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      onNavigate('trip-details', { tripId: data.id });
    } catch (err) {
      console.error("Itinerary generation failed: ", err);
      // Fail-safe redirect
      onNavigate('dashboard');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      const val = activeQuestion.type === 'number' ? Number(inputValue) : inputValue;
      handleNext(val);
      setInputValue('');
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col justify-between max-w-3xl mx-auto p-4 animate-slide-up">
      {/* Upper details */}
      <div className="flex justify-between items-center pb-3 border-b border-white/5">
        <button 
          onClick={() => onNavigate('dashboard')} 
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Interview</span>
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-xs text-gray-400">Step {currentStep + 1} of {questions.length}</span>
        </div>
      </div>

      {/* Generation Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-filter backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
            <Compass className="w-10 h-10 text-indigo-400 absolute top-5 left-5 animate-pulse-glow" />
          </div>
          <h2 className="text-2xl font-black font-display text-white">Consulting TripPilot AI Planner</h2>
          <p className="text-gray-400 text-sm max-w-sm mx-auto mt-2 leading-relaxed">
            {generationStep === 1 && "Analyzing terrain routes & map elevations..."}
            {generationStep === 2 && "Curating budget, mid-range, and luxury hotels..."}
            {generationStep === 3 && "Calculating fuel rates and toll estimations..."}
            {generationStep >= 4 && "Assembling your day-by-day dashboard itinerary..."}
          </p>
          
          {/* Progress loader */}
          <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden mt-6">
            <div 
              className="h-full bg-gradient-glow transition-all duration-1000"
              style={{ width: `${(generationStep / 4) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="grow overflow-y-auto space-y-4 my-4 pr-2">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'} animate-slide-up`}
          >
            <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}
              <div className={`p-4 rounded-2xl text-sm leading-relaxed border ${
                msg.sender === 'ai' 
                  ? 'bg-slate-900/40 border-white/5 text-gray-200 rounded-tl-sm' 
                  : 'bg-indigo-600 border-indigo-500 text-white rounded-tr-sm shadow-md'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef}></div>
      </div>

      {/* Visual Input Assistant Controls */}
      <div className="p-4 rounded-2xl glass-panel border-white/5 space-y-4 shadow-xl">
        {/* Text Input Type */}
        {(activeQuestion.type === 'text' || activeQuestion.type === 'number') && (
          <div className="flex gap-2">
            <input 
              type={activeQuestion.type}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={activeQuestion.placeholder}
              className="grow px-4 py-3.5 glass-input text-sm"
              autoFocus
            />
            <button 
              onClick={() => {
                if (inputValue.trim()) {
                  const val = activeQuestion.type === 'number' ? Number(inputValue) : inputValue;
                  handleNext(val);
                  setInputValue('');
                }
              }}
              className="p-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white transition shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Options Selection Grid (Select Type) */}
        {activeQuestion.type === 'select' && activeQuestion.options && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {activeQuestion.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleNext(opt)}
                className="py-3 px-4 bg-white/5 hover:bg-indigo-600/20 border border-white/5 hover:border-indigo-500/30 rounded-xl text-sm font-semibold text-gray-300 hover:text-white transition duration-200 text-center"
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Toggles (Boolean Type) */}
        {activeQuestion.type === 'boolean' && (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleNext(true)}
              className="py-4 bg-white/5 hover:bg-indigo-600/20 border border-white/5 hover:border-indigo-500/30 rounded-2xl font-bold text-sm text-gray-300 hover:text-white transition duration-200 text-center"
            >
              Yes, I need to rent
            </button>
            <button
              onClick={() => handleNext(false)}
              className="py-4 bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/30 rounded-2xl font-bold text-sm text-gray-300 hover:text-white transition duration-200 text-center"
            >
              No, using own transport
            </button>
          </div>
        )}

        {/* Range Slider Type */}
        {activeQuestion.type === 'slider' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs text-gray-400 font-semibold">
              <span>Min: {activeQuestion.field === 'driving_hours' ? `${activeQuestion.min} Hrs` : `₹${activeQuestion.min?.toLocaleString()}`}</span>
              <span className="text-indigo-400 text-sm font-black">
                Current: {activeQuestion.field === 'driving_hours' ? `${formData[activeQuestion.field]} Hours` : `₹${formData[activeQuestion.field].toLocaleString()}`}
              </span>
              <span>Max: {activeQuestion.field === 'driving_hours' ? `${activeQuestion.max} Hrs` : `₹${activeQuestion.max?.toLocaleString()}`}</span>
            </div>
            
            <input 
              type="range"
              min={activeQuestion.min}
              max={activeQuestion.max}
              step={activeQuestion.field === 'driving_hours' ? 1 : 5000}
              value={formData[activeQuestion.field]}
              onChange={(e) => setFormData({ ...formData, [activeQuestion.field]: Number(e.target.value) })}
              className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            
            <button
              onClick={() => handleNext(formData[activeQuestion.field])}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition"
            >
              Confirm and Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
