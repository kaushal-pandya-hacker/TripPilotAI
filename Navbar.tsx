import React, { useState, useEffect } from 'react';
import { Compass, User, LogOut, Shield } from 'lucide-react';
import { mockDb } from '../lib/supabase';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  user: any;
  onLogout: () => void;
}

export default function Navbar({ onNavigate, currentPage, user, onLogout }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/5 glass-panel py-3 px-6 flex justify-between items-center">
      {/* Brand logo */}
      <div 
        onClick={() => onNavigate(user ? 'dashboard' : 'landing')} 
        className="flex items-center gap-2.5 cursor-pointer group"
      >
        <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-600/30 group-hover:text-indigo-300 transition duration-300">
          <Compass className="w-6 h-6 animate-pulse-glow" />
        </div>
        <div>
          <span className="font-bold text-xl tracking-tight text-white font-display">TripPilot <span className="text-indigo-400">AI</span></span>
          <p className="text-[10px] text-gray-400 tracking-wider hidden sm:block uppercase">Plan Your Entire Journey With AI</p>
        </div>
      </div>

      {/* Menu links / User actions */}
      <div className="flex items-center gap-4">
        {!user ? (
          <>
            <button 
              onClick={() => onNavigate('landing')}
              className={`text-sm font-medium transition duration-200 hidden md:block hover:text-indigo-400 ${currentPage === 'landing' ? 'text-indigo-400' : 'text-gray-300'}`}
            >
              Home
            </button>
            <button 
              onClick={() => onNavigate('login')}
              className="text-sm font-medium py-2 px-4 rounded-xl border border-white/10 hover:bg-white/5 transition duration-200 text-gray-300"
            >
              Sign In
            </button>
            <button 
              onClick={() => onNavigate('register')}
              className="text-sm font-medium py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition duration-200 shadow-lg shadow-indigo-600/20"
            >
              Start Planning
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            {/* Display user plan */}
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
              user.user_metadata?.subscription_status === 'Enterprise' 
                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                : user.user_metadata?.subscription_status === 'Pro'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'bg-gray-700/30 text-gray-400 border border-gray-600/30'
            }`}>
              {user.user_metadata?.subscription_status || 'Free'} Plan
            </span>

            {/* Profile email */}
            <span className="text-sm text-gray-300 font-medium hidden sm:inline-block max-w-[150px] truncate">
              {user.email}
            </span>

            {/* Logged in buttons */}
            <button 
              onClick={() => onNavigate('profile')}
              title="Profile & Billing"
              className="p-2 rounded-lg border border-white/5 hover:bg-white/5 transition text-gray-300"
            >
              <User className="w-4 h-4" />
            </button>
            
            {user.email === 'admin@trippilot.ai' && (
              <button 
                onClick={() => onNavigate('admin')}
                title="Admin Console"
                className="p-2 rounded-lg bg-red-950/20 border border-red-500/20 hover:bg-red-900/30 transition text-red-400"
              >
                <Shield className="w-4 h-4" />
              </button>
            )}

            <button 
              onClick={onLogout}
              title="Log Out"
              className="p-2 rounded-lg border border-white/5 hover:bg-red-500/10 hover:text-red-400 transition text-gray-400"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
