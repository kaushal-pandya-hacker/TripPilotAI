import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Key, 
  MapPin, 
  Sliders, 
  CheckCircle2, 
  Info 
} from 'lucide-react';

export default function Settings() {
  const [openaiKey, setOpenaiKey] = useState('');
  const [googleKey, setGoogleKey] = useState('');
  const [defaultDrivingLimit, setDefaultDrivingLimit] = useState(6);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Load local overrides if present
    setOpenaiKey(localStorage.getItem('VITE_OPENAI_API_KEY') || '');
    setGoogleKey(localStorage.getItem('VITE_GOOGLE_MAPS_API_KEY') || '');
    const savedLimit = localStorage.getItem('DEFAULT_DRIVING_LIMIT');
    if (savedLimit) setDefaultDrivingLimit(Number(savedLimit));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('VITE_OPENAI_API_KEY', openaiKey);
    localStorage.setItem('VITE_GOOGLE_MAPS_API_KEY', googleKey);
    localStorage.setItem('DEFAULT_DRIVING_LIMIT', String(defaultDrivingLimit));
    
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="space-y-8 animate-slide-up max-w-2xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">System Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Configure your API integrations and global travel defaults.</p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-green-950/30 border border-green-500/20 text-green-300 text-xs">
          Configuration settings updated successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* API Credentials */}
        <div className="glass-panel border-white/5 p-6 rounded-2xl space-y-4">
          <h3 className="font-bold text-sm text-white border-b border-white/5 pb-2.5 flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-400" />
            <span>API Credentials (Browser Overrides)</span>
          </h3>

          <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-indigo-300 text-xs flex gap-3">
            <Info className="w-5 h-5 shrink-0 text-indigo-400" />
            <span>By default, TripPilot AI executes queries in simulated sandbox mode. Inputting your keys here overrides the sandbox and connects directly to live APIs. Keys are stored safely in your local session cache.</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">OpenAI API Key</label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full px-4 py-3.5 glass-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Google Maps Embed Key</label>
              <input
                type="password"
                value={googleKey}
                onChange={(e) => setGoogleKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-3.5 glass-input text-xs"
              />
            </div>
          </div>
        </div>

        {/* System Defaults */}
        <div className="glass-panel border-white/5 p-6 rounded-2xl space-y-4">
          <h3 className="font-bold text-sm text-white border-b border-white/5 pb-2.5 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            <span>Travel Engine Defaults</span>
          </h3>

          <div>
            <div className="flex justify-between items-center text-xs text-gray-400 font-semibold mb-2">
              <span>Standard Daily Driving Limit</span>
              <span className="text-purple-400 font-bold">{defaultDrivingLimit} Hours</span>
            </div>
            <input
              type="range"
              min={3}
              max={10}
              value={defaultDrivingLimit}
              onChange={(e) => setDefaultDrivingLimit(Number(e.target.value))}
              className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-indigo-600/10"
        >
          Save Configuration Overrides
        </button>
      </form>
    </div>
  );
}
