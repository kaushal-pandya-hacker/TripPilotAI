import React, { useState } from 'react';
import { 
  User, 
  CreditCard, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert, 
  MessageSquare,
  Star,
  Check
} from 'lucide-react';
import { mockDb } from '../lib/supabase';

interface ProfileProps {
  user: any;
  onUpdateUser: (updatedUser: any) => void;
}

export default function Profile({ user, onUpdateUser }: ProfileProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const activePlan = user?.user_metadata?.subscription_status || 'Free';

  const handleUpgrade = async (plan: 'Free' | 'Pro' | 'Enterprise') => {
    setLoading(true);
    setSuccess('');
    
    // Call mock database subscription updater
    const { data, error } = await mockDb.subscriptions.updatePlan(plan);
    if (!error && data) {
      onUpdateUser(data);
      setSuccess(`Successfully switched your account to the ${plan} Plan!`);
    }
    setLoading(false);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackComment.trim()) return;

    const { error } = await mockDb.feedback.submit(feedbackRating, feedbackComment);
    if (!error) {
      setFeedbackSuccess(true);
      setFeedbackComment('');
      setTimeout(() => setFeedbackSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-8 animate-slide-up max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Profile & Billing</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your active subscription plan and audit your invoice ledger.</p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-green-950/30 border border-green-500/20 text-green-300 text-xs">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Card */}
        <div className="glass-panel border-white/5 p-6 rounded-2xl space-y-4">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-2xl font-display mb-3">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <h3 className="font-bold text-base text-white truncate max-w-full">{user?.email}</h3>
            <span className="text-[10px] text-gray-500">ID: {user?.id}</span>
          </div>

          <div className="border-t border-white/5 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Member Since:</span>
              <span className="text-gray-200">June 2026</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Account Status:</span>
              <span className="text-emerald-400 font-semibold">Active</span>
            </div>
          </div>
        </div>

        {/* Plan Upgrade Selector */}
        <div className="md:col-span-2 glass-panel border-white/5 p-6 rounded-2xl space-y-5">
          <h3 className="font-bold text-sm text-white border-b border-white/5 pb-2.5 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-400" />
            <span>Active Subscription Tier</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { id: 'Free', name: 'Free Plan', price: '₹0' },
              { id: 'Pro', name: 'Pro Plan', price: '₹1,500/yr' },
              { id: 'Enterprise', name: 'Enterprise', price: '₹4,000/yr' }
            ].map(plan => {
              const isCurrent = activePlan === plan.id;
              return (
                <div 
                  key={plan.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    isCurrent 
                      ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400'
                      : 'bg-white/5 border-white/5 text-gray-300'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-sm text-white">{plan.name}</h4>
                    <span className="text-xs text-gray-400 mt-1 block">{plan.price}</span>
                  </div>
                  <button
                    disabled={isCurrent || loading}
                    onClick={() => handleUpgrade(plan.id as any)}
                    className={`mt-4 w-full py-1.5 rounded-lg text-xs font-semibold transition ${
                      isCurrent
                        ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 cursor-default'
                        : 'bg-white/10 hover:bg-white/20 border border-white/5 text-white'
                    }`}
                  >
                    {isCurrent ? 'Current Plan' : 'Select Plan'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Feedback Form */}
      <div className="glass-panel border-white/5 p-6 rounded-2xl max-w-2xl">
        <h3 className="font-bold text-sm text-white border-b border-white/5 pb-2.5 flex items-center gap-2 mb-4">
          <MessageSquare className="w-4 h-4 text-sky-400" />
          <span>TripPilot AI Customer Feedback survey</span>
        </h3>

        {feedbackSuccess ? (
          <div className="p-4 rounded-xl bg-green-950/20 border border-green-500/20 text-green-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span>Thank you for your response! We review all comments to improve our AI planner.</span>
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackRating(star)}
                    className="p-1 text-amber-400"
                  >
                    <Star className={`w-6 h-6 ${star <= feedbackRating ? 'fill-amber-400' : 'text-gray-600'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Comments / Suggestions</label>
              <textarea
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="What could we make better? Tell us about your itinerary generation quality..."
                className="w-full px-4 py-3.5 glass-input text-xs h-24 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/10 transition"
            >
              Submit Feedback
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
