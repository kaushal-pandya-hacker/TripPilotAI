import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Map, 
  MessageSquare, 
  UserCircle, 
  Settings, 
  ShieldAlert 
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isAdmin: boolean;
}

export default function Sidebar({ currentPage, onNavigate, isAdmin }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-trip', label: 'New Trip', icon: PlusCircle, highlight: true },
    { id: 'saved-trips', label: 'Saved Trips', icon: Map },
    { id: 'ai-assistant', label: 'AI Assistant', icon: MessageSquare },
    { id: 'profile', label: 'Profile & Billing', icon: UserCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-white/5 bg-slate-950/40 p-4 flex flex-col justify-between h-[calc(100vh-65px)]">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Explorer Panel</p>
          <div className="mt-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : item.highlight
                        ? 'text-indigo-400 hover:bg-indigo-600/10 hover:text-indigo-300'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {isAdmin && (
          <div>
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-red-500">System Control</p>
            <button
              onClick={() => onNavigate('admin')}
              className={`mt-2 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition duration-200 ${
                currentPage === 'admin'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/10'
                  : 'text-red-400 hover:bg-red-600/10 hover:text-red-300'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Admin Console</span>
            </button>
          </div>
        )}

        <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
            <span className="text-xs text-gray-400 font-medium">TripPilot Engine Active</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">Version 1.2.0 (Stable)</p>
        </div>
      </div>
    </aside>
  );
}
