'use client';

import React from 'react';
import {
  Sparkles,
  Building2,
  UserCheck,
  Clock,
  Zap,
  HelpCircle,
  LogIn,
  Tag,
  Briefcase
} from 'lucide-react';
import { triggerHaptic } from '@/lib/mobile/native';

interface MobileBottomNavProps {
  isLoggedIn: boolean;
  activeTab: 'landing' | 'cleaner' | 'customer' | 'pricing' | 'execution' | 'admin';
  setActiveTab: (tab: 'landing' | 'cleaner' | 'customer' | 'pricing' | 'execution' | 'admin') => void;
  landingSubTab: 'home' | 'how-it-works' | 'pricing' | 'for-cleaners' | 'about' | 'faqs' | 'contact';
  setLandingSubTab: (subTab: 'home' | 'how-it-works' | 'pricing' | 'for-cleaners' | 'about' | 'faqs' | 'contact') => void;
  onOpenAuth: (role?: 'customer' | 'cleaner') => void;
  currentUser?: any;
}

export default function MobileBottomNav({
  isLoggedIn,
  activeTab,
  setActiveTab,
  landingSubTab,
  setLandingSubTab,
  onOpenAuth,
  currentUser,
}: MobileBottomNavProps) {
  const handleTabClick = (tabId: any, subTabId?: any) => {
    triggerHaptic('light');
    setActiveTab(tabId);
    if (subTabId) {
      setLandingSubTab(subTabId);
    }
  };

  if (!isLoggedIn) {
    // Navigation for guests / public visitors
    const navItems = [
      { id: 'home', label: 'Home', icon: Sparkles },
      { id: 'how-it-works', label: 'Steps', icon: HelpCircle },
      { id: 'pricing', label: 'Pricing', icon: Tag },
      { id: 'for-cleaners', label: 'Cleaners', icon: Briefcase },
    ];

    return (
      <aside aria-label="Mobile Navigation Bar" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0f172a]/95 backdrop-blur-lg border-t border-slate-800/80 px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-2xl">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === 'landing' && landingSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick('landing', item.id)}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all active:scale-90 ${
                  isActive
                    ? 'text-cyan-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${
                  isActive ? 'bg-cyan-500/20 text-cyan-400 shadow-sm shadow-cyan-500/20' : ''
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => {
              triggerHaptic('medium');
              onOpenAuth('customer');
            }}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[#ff6b00] active:scale-90 transition-all font-bold"
          >
            <div className="p-1.5 rounded-xl bg-orange-500/20 text-[#ff6b00] shadow-sm shadow-orange-500/20">
              <LogIn className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Login</span>
          </button>
        </div>
      </aside>
    );
  }

  // Navigation for logged-in users
  const loggedInItems = [
    { id: 'landing', label: 'Explore', icon: Sparkles },
    { id: 'customer', label: 'Customer', icon: Building2 },
    { id: 'cleaner', label: 'Cleaner', icon: UserCheck },
    { id: 'execution', label: 'Job Hub', icon: Clock },
    { id: 'pricing', label: 'Rates', icon: Zap },
  ];

  return (
    <aside aria-label="Mobile Navigation Bar" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0f172a]/95 backdrop-blur-lg border-t border-slate-800/80 px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {loggedInItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all active:scale-90 ${
                isActive
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${
                isActive ? 'bg-cyan-500/20 text-cyan-400 shadow-sm shadow-cyan-500/30 ring-1 ring-cyan-500/30' : ''
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
