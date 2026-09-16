'use client';

import React from 'react';
import {
  X,
  Sparkles,
  HelpCircle,
  Tag,
  Briefcase,
  Info,
  MessageSquare,
  PhoneCall,
  User,
  LogOut,
  Shield,
  Building2,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import { triggerHaptic } from '@/lib/mobile/native';

interface MobileDrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  currentUser: any;
  activeTab: 'landing' | 'cleaner' | 'customer' | 'pricing' | 'execution' | 'admin';
  setActiveTab: (tab: 'landing' | 'cleaner' | 'customer' | 'pricing' | 'execution' | 'admin') => void;
  landingSubTab: 'home' | 'how-it-works' | 'pricing' | 'for-cleaners' | 'about' | 'faqs' | 'contact';
  setLandingSubTab: (subTab: 'home' | 'how-it-works' | 'pricing' | 'for-cleaners' | 'about' | 'faqs' | 'contact') => void;
  onOpenAuth: (role?: 'customer' | 'cleaner') => void;
  onLogout: () => void;
}

export default function MobileDrawerMenu({
  isOpen,
  onClose,
  isLoggedIn,
  currentUser,
  activeTab,
  setActiveTab,
  landingSubTab,
  setLandingSubTab,
  onOpenAuth,
  onLogout,
}: MobileDrawerMenuProps) {
  if (!isOpen) return null;

  const publicLinks = [
    { id: 'home', label: 'Home & Instant Booking', icon: Sparkles },
    { id: 'how-it-works', label: 'How It Works (6-Step Guarantee)', icon: HelpCircle },
    { id: 'pricing', label: 'Transparent Pricing & Rates', icon: Tag },
    { id: 'for-cleaners', label: 'For Cleaners (Keep 85%)', icon: Briefcase },
    { id: 'about', label: 'About DustBustars London', icon: Info },
    { id: 'faqs', label: 'Frequently Asked Questions', icon: MessageSquare },
    { id: 'contact', label: 'Customer & Support Team', icon: PhoneCall },
  ];

  const handleLinkClick = (subTabId: any) => {
    triggerHaptic('light');
    setActiveTab('landing');
    setLandingSubTab(subTabId);
    onClose();
  };

  const handlePortalSwitch = (tab: any) => {
    triggerHaptic('light');
    setActiveTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => {
          triggerHaptic('light');
          onClose();
        }}
      />

      {/* Drawer Panel */}
      <div className="relative w-4/5 max-w-sm h-full bg-[#0b0f19] border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="DustBustars Logo" className="h-8 w-auto object-contain" />
              <div>
                <h2 className="text-base font-extrabold text-white tracking-tight">DustBustars</h2>
                <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">Mobile App</span>
              </div>
            </div>
            <button
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white transition-all active:scale-90"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Card (if logged in) */}
          {isLoggedIn && currentUser ? (
            <div className="mt-4 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-md">
                  {currentUser.full_name ? currentUser.full_name[0].toUpperCase() : 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-white truncate">{currentUser.full_name}</p>
                  <p className="text-xs text-slate-400 truncate capitalize">{currentUser.role} Account</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60">
                <button
                  onClick={() => handlePortalSwitch('customer')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold ${
                    activeTab === 'customer'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-slate-800/50 text-slate-300'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  Customer
                </button>
                <button
                  onClick={() => handlePortalSwitch('cleaner')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold ${
                    activeTab === 'cleaner'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800/50 text-slate-300'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Cleaner
                </button>
              </div>
            </div>
          ) : null}

          {/* Navigation Links */}
          <div className="mt-5 space-y-1">
            <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Navigation
            </p>
            {publicLinks.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === 'landing' && landingSubTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleLinkClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-sm transition-all active:scale-98 ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/20'
                      : 'text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          {!isLoggedIn ? (
            <div className="space-y-2">
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  handlePortalSwitch('customer');
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-sm shadow-lg shadow-orange-500/25 active:scale-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Book a Cleaner Now
              </button>
              <button
                onClick={() => {
                  triggerHaptic('light');
                  handlePortalSwitch('cleaner');
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-bold text-xs active:scale-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-emerald-400" />
                Cleaner Portal / Dashboard
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                triggerHaptic('medium');
                onClose();
                onLogout();
              }}
              className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs border border-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          )}

          <div className="text-center pt-2">
            <a
              href="/admin/login"
              onClick={() => onClose()}
              className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-400 font-medium"
            >
              <Shield className="w-3 h-3" />
              Admin Portal
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
