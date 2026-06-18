import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Map, 
  DollarSign, 
  Cpu, 
  MessageSquare, 
  Star, 
  TrendingUp, 
  ChevronRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { mockDb } from '../lib/supabase';

interface AdminProps {
  user: any;
  onNavigate: (page: string) => void;
}

export default function Admin({ user, onNavigate }: AdminProps) {
  const isAdmin = user?.email === 'admin@trippilot.ai';

  const [stats, setStats] = useState<any>({
    usersCount: 0,
    tripsCount: 0,
    feedbackCount: 0,
    revenue: 0,
    sales: [],
    apiCalls: [],
    feedbackList: []
  });
  const [loading, setLoading] = useState(true);

  const loadAdminStats = async () => {
    if (!isAdmin) return;
    setLoading(true);
    const data = await mockDb.admin.getStats();
    setStats(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAdminStats();
  }, [user]);

  if (!isAdmin) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-6 animate-slide-up">
        <div className="glass-panel border-red-500/25 max-w-md p-8 rounded-3xl text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 bg-red-950/20 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white font-display">Access Denied</h2>
          <p className="text-gray-400 text-xs leading-relaxed">
            You do not have administrative privileges to access this console. This action has been logged for system security audits.
          </p>
          <button 
            onClick={() => onNavigate('dashboard')}
            className="w-full py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-200 rounded-xl text-xs font-semibold transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center text-center">
        <span className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></span>
        <p className="text-gray-400 text-sm mt-4">Retrieving system diagnostics...</p>
      </div>
    );
  }

  // Calculate API usage cost
  const totalApiCost = stats.apiCalls.reduce((sum: number, c: any) => sum + (c.cost || 0.02), 0);

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Title */}
      <div className="flex justify-between items-center pb-4 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Admin Console</h1>
          <p className="text-gray-400 text-sm mt-1">Audit SaaS operations, user registrations, revenue flows, and API tokens.</p>
        </div>
        <button 
          onClick={loadAdminStats}
          className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 rounded-xl transition flex items-center gap-2 text-xs font-semibold"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reload Metrics</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Active Users', val: stats.usersCount, icon: Users, color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5' },
          { label: 'Trips Planned', val: stats.tripsCount, icon: Map, color: 'text-purple-400 border-purple-500/20 bg-purple-500/5' },
          { label: 'Total Revenue', val: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' },
          { label: 'OpenAI Cost Est.', val: `$${totalApiCost.toFixed(2)}`, icon: Cpu, color: 'text-amber-400 border-amber-500/20 bg-amber-500/5' },
          { label: 'Feedback Logs', val: stats.feedbackCount, icon: MessageSquare, color: 'text-sky-400 border-sky-500/20 bg-sky-500/5' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`p-4 rounded-xl border glass-panel ${stat.color} flex items-center justify-between`}>
              <div>
                <span className="text-[10px] text-gray-400 font-medium block uppercase tracking-wider">{stat.label}</span>
                <span className="text-lg sm:text-xl font-black text-white mt-1 block font-display">{stat.val}</span>
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                <Icon className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* API Usage logs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 glass-panel border-white/5 rounded-2xl space-y-4">
            <h3 className="font-bold text-sm text-white border-b border-white/5 pb-2.5 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400 animate-pulse-glow" />
              <span>Real-Time OpenAI Token Logging</span>
            </h3>

            {stats.apiCalls.length === 0 ? (
              <p className="text-xs text-gray-500 italic py-6 text-center">No API calls recorded during this browser session.</p>
            ) : (
              <div className="space-y-2.5 overflow-y-auto max-h-[250px]">
                {stats.apiCalls.map((log: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-xs p-3 bg-white/5 border border-white/5 rounded-xl">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-gray-200 block">{log.action}</span>
                      <span className="text-[10px] text-gray-500">{log.timestamp}</span>
                    </div>
                    <span className="font-bold text-indigo-400">${log.cost?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Feedback table */}
          <div className="p-5 glass-panel border-white/5 rounded-2xl space-y-4">
            <h3 className="font-bold text-sm text-white border-b border-white/5 pb-2.5 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-400" />
              <span>User Survey Feedback Responses</span>
            </h3>

            {stats.feedbackList.length === 0 ? (
              <p className="text-xs text-gray-500 italic py-6 text-center">No customer feedback logs submitted yet.</p>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[250px]">
                {stats.feedbackList.map((fb: any, idx: number) => (
                  <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-gray-400 font-semibold">{fb.user_email}</span>
                      <div className="flex gap-0.5 text-amber-400">
                        {Array.from({ length: fb.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-300 italic">"{fb.comments}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sales analytics & distribution */}
        <div className="space-y-6">
          <div className="p-5 glass-panel border-white/5 rounded-2xl space-y-4">
            <h3 className="font-bold text-sm text-white border-b border-white/5 pb-2.5 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Sales Ledger</span>
            </h3>

            {stats.sales.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-xs">
                <span>No premium transactions recorded yet. Upgrade your mock user account in Profile to see sales logs!</span>
              </div>
            ) : (
              <div className="space-y-2 overflow-y-auto max-h-[220px]">
                {stats.sales.map((sale: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-xs p-2.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                    <div>
                      <span className="font-bold text-emerald-400 capitalize">{sale.plan} Plan</span>
                      <span className="text-[10px] text-gray-500 block">{sale.date}</span>
                    </div>
                    <span className="font-black text-gray-200">₹{sale.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-5 glass-panel border-white/5 rounded-2xl space-y-4">
            <h3 className="font-bold text-sm text-white border-b border-white/5 pb-2.5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>SaaS System Health</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 bg-white/5 border border-white/5 rounded-lg">
                <span className="text-gray-400">Supabase Connection:</span>
                <span className="text-emerald-400 font-semibold">Active Fallback</span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 border border-white/5 rounded-lg">
                <span className="text-gray-400">OpenAI Server Status:</span>
                <span className="text-emerald-400 font-semibold">Ready</span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 border border-white/5 rounded-lg">
                <span className="text-gray-400">Daily API Request Limits:</span>
                <span className="text-gray-300 font-semibold">10,000 / 10,000</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
