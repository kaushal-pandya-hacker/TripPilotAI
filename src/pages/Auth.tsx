import React, { useState } from 'react';
import { Compass, Mail, Lock, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { mockDb } from '../lib/supabase';

interface AuthProps {
  initialMode: 'login' | 'register' | 'forgot';
  onAuthSuccess: (user: any) => void;
  onNavigate: (page: string) => void;
}

export default function Auth({ initialMode, onAuthSuccess, onNavigate }: AuthProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'login') {
        const { data, error } = await mockDb.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuthSuccess(data.user);
      } else if (mode === 'register') {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        const { data, error } = await mockDb.auth.signUp({ email, password });
        if (error) throw error;
        setSuccessMsg("Registration successful! Welcome to TripPilot AI.");
        setTimeout(() => {
          onAuthSuccess(data.user);
        }, 1200);
      } else if (mode === 'forgot') {
        const { error } = await mockDb.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setSuccessMsg("Password reset email sent! Check your inbox.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { data, error } = await mockDb.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
      // Fetch mock user immediately to trigger navigation
      const userRes = await mockDb.auth.getUser();
      onAuthSuccess(userRes.data.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Google OAuth failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center p-6 relative">
      {/* Background blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border-white/5 shadow-2xl relative animate-slide-up">
        {/* Header logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 mb-3">
            <Compass className="w-8 h-8 animate-pulse-glow" />
          </div>
          <h2 className="text-2xl font-bold font-display text-white">
            {mode === 'login' && 'Sign In to TripPilot AI'}
            {mode === 'register' && 'Create Your Account'}
            {mode === 'forgot' && 'Reset Your Password'}
          </h2>
          <p className="text-gray-400 text-xs mt-1.5 text-center">
            {mode === 'login' && 'Enter your credentials to manage your itineraries.'}
            {mode === 'register' && 'Get access to premium AI travel routing engines.'}
            {mode === 'forgot' && "We will email you a secure link to reset it."}
          </p>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="mb-5 p-4 rounded-xl bg-red-950/30 border border-red-500/20 text-red-300 text-xs leading-relaxed">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-5 p-4 rounded-xl bg-green-950/30 border border-green-500/20 text-green-300 text-xs leading-relaxed flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-green-400" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" 
                className="w-full pl-11 pr-4 py-3.5 glass-input text-sm"
              />
            </div>
            {mode === 'login' && (
              <p className="text-[10px] text-gray-500 mt-1">Hint: Type <code className="bg-white/5 px-1 py-0.5 rounded text-indigo-300">admin@trippilot.ai</code> to test the administrator mode, or <code className="bg-white/5 px-1 py-0.5 rounded text-indigo-300">demo@trippilot.ai</code> for standard client accounts.</p>
            )}
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
                {mode === 'login' && (
                  <button 
                    type="button" 
                    onClick={() => { setMode('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-11 pr-4 py-3.5 glass-input text-sm"
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                <input 
                  type="password" 
                  required 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-11 pr-4 py-3.5 glass-input text-sm"
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 rounded-xl font-semibold text-sm transition duration-200 flex items-center justify-center gap-2 text-white shadow-lg shadow-indigo-600/25"
          >
            <span>{loading ? 'Processing...' : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Register Account' : 'Send Reset Link'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Divider */}
        {mode !== 'forgot' && (
          <>
            <div className="flex items-center my-6">
              <div className="grow border-t border-white/5"></div>
              <span className="px-3 text-xs text-gray-500 uppercase tracking-widest">Or Continue With</span>
              <div className="grow border-t border-white/5"></div>
            </div>

            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition duration-200 flex items-center justify-center gap-2.5 text-gray-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.19-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              <span>Google Account</span>
            </button>
          </>
        )}

        {/* Footer toggles */}
        <div className="mt-8 text-center text-xs text-gray-400 border-t border-white/5 pt-6">
          {mode === 'login' && (
            <span>
              Don't have an account?{' '}
              <button 
                onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition"
              >
                Sign Up
              </button>
            </span>
          )}
          {mode === 'register' && (
            <span>
              Already have an account?{' '}
              <button 
                onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition"
              >
                Sign In
              </button>
            </span>
          )}
          {mode === 'forgot' && (
            <button 
              onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition"
            >
              Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
