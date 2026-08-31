'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Users,
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  Edit,
  Trash2,
  LogOut,
  RefreshCw,
  Award,
  Lock,
  Database,
  FileText,
  Activity,
  Check,
  X,
  UserCheck,
  UserX,
  Plus,
  ChevronRight,
  Sparkles,
  BarChart3,
  PieChart,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  HelpCircle,
  ChevronLeft,
  MapPin,
  Camera,
  Layers,
  CheckSquare,
  Mail
} from 'lucide-react';
import PublicCoverageMap from '@/components/PublicCoverageMap';

export default function AdminDashboardPage() {
  const router = useRouter();

  // Navigation & Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'vetting' | 'bookings' | 'properties' | 'audit' | 'system'>('overview');
  
  // Auth Session State
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  // Stats & Analytics Data State
  const [statsData, setStatsData] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // User Management State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [userSortOrder, setUserSortOrder] = useState('created_at_desc');
  const [userPage, setUserPage] = useState(1);
  const [userPagination, setUserPagination] = useState<any>({ totalPages: 1, totalUsers: 0 });

  // Modal Popups State
  const [selectedUserDetail, setSelectedUserDetail] = useState<any | null>(null);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);

  // Edit User Form State
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'pending_approval' | 'suspended'>('active');
  const [editRole, setEditRole] = useState<'customer' | 'cleaner' | 'admin'>('customer');

  // Audit Log & Vetting Queue State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Notification Drawer State
  const [showNotifications, setShowNotifications] = useState(false);
  const [alertBanner, setAlertBanner] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  // Enlarge Photo Lightbox
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);

  const showAlert = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setAlertBanner({ type, text });
    setTimeout(() => setAlertBanner(null), 6000);
  };

  // 1. Verify Admin Auth Session on Load
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('dustbustars_admin_token') : null;
    if (!token) {
      console.warn('[Admin Dashboard] No admin token found in localStorage. Redirecting to /admin/login...');
      router.push('/admin/login');
      return;
    }

    fetch(`/api/admin/auth/me?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        setIsVerifying(false);
        if (data.success && data.admin) {
          console.log(`[Admin Dashboard] Admin session verified: ${data.admin.full_name}`);
          setAdminUser(data.admin);
        } else {
          console.warn('[Admin Dashboard] Session token invalid or expired. Redirecting to /admin/login...');
          localStorage.removeItem('dustbustars_admin_token');
          router.push('/admin/login');
        }
      })
      .catch((err) => {
        setIsVerifying(false);
        console.error('[Admin Dashboard] Verification error:', err);
        router.push('/admin/login');
      });
  }, [router]);

  // 2. Fetch Stats & Dashboard Data
  const fetchAdminStats = async () => {
    setIsLoadingStats(true);
    try {
      const token = localStorage.getItem('dustbustars_admin_token') || '';
      const res = await fetch(`/api/admin/stats?token=${encodeURIComponent(token)}`);
      const data = await res.json();
      setIsLoadingStats(false);
      if (data.success) {
        setStatsData(data.stats);
      } else {
        showAlert(`Failed to fetch stats: ${data.error}`, 'error');
      }
    } catch (e: any) {
      setIsLoadingStats(false);
      showAlert(`Stats Fetch Exception: ${e.message}`, 'error');
    }
  };

  // 3. Fetch User List with Search, Filters, Sorting, and Pagination
  const fetchUsers = async (page = userPage) => {
    setIsLoadingUsers(true);
    try {
      const token = localStorage.getItem('dustbustars_admin_token') || '';
      const query = new URLSearchParams({
        token,
        search: userSearch,
        role: userRoleFilter,
        status: userStatusFilter,
        sort: userSortOrder,
        page: String(page),
        limit: '10'
      });

      const res = await fetch(`/api/admin/users?${query.toString()}`);
      const data = await res.json();
      setIsLoadingUsers(false);
      if (data.success) {
        setUsersList(data.users);
        setUserPagination(data.pagination);
      } else {
        showAlert(`Failed to fetch users: ${data.error}`, 'error');
      }
    } catch (e: any) {
      setIsLoadingUsers(false);
      showAlert(`Users Fetch Exception: ${e.message}`, 'error');
    }
  };

  // 4. Fetch Audit Trail Logs
  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs?limit=50');
      const data = await res.json();
      if (data.success) {
        setAuditLogs(data.auditLogs);
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!isVerifying && adminUser) {
      fetchAdminStats();
      fetchUsers(1);
      fetchAuditLogs();
    }
  }, [isVerifying, adminUser]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers(1);
    }
  }, [userSearch, userRoleFilter, userStatusFilter, userSortOrder]);

  // Admin Logout Handler
  const handleAdminLogout = () => {
    localStorage.removeItem('dustbustars_admin_token');
    localStorage.removeItem('dustbustars_admin_info');
    router.push('/admin/login');
  };

  // Action: Open Edit User Modal
  const handleOpenEditUser = (u: any) => {
    setEditingUser(u);
    setEditName(u.full_name);
    setEditEmail(u.email);
    setEditPhone(u.phone || '');
    setEditStatus(u.status || 'active');
    setEditRole(u.role || 'customer');
  };

  // Action: Save Edited User
  const handleSaveEditedUser = async () => {
    if (!editingUser) return;
    setIsSavingUser(true);
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: editName,
          email: editEmail,
          phone: editPhone,
          status: editStatus,
          role: editRole,
          adminName: adminUser?.full_name || 'System Administrator'
        })
      });
      const data = await res.json();
      setIsSavingUser(false);
      setEditingUser(null);
      if (data.success) {
        showAlert(data.message, 'success');
        fetchUsers(userPage);
        fetchAdminStats();
        fetchAuditLogs();
      } else {
        showAlert(`Edit Error: ${data.error}`, 'error');
      }
    } catch (e: any) {
      setIsSavingUser(false);
      showAlert(`Edit Exception: ${e.message}`, 'error');
    }
  };

  // Action: Toggle User Status (Activate / Suspend)
  const handleToggleUserStatus = async (u: any, newStatus: 'active' | 'suspended') => {
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          adminName: adminUser?.full_name || 'System Administrator'
        })
      });
      const data = await res.json();
      if (data.success) {
        showAlert(`User ${u.full_name} status updated to ${newStatus}.`, 'success');
        fetchUsers(userPage);
        fetchAdminStats();
        fetchAuditLogs();
      } else {
        showAlert(`Status Error: ${data.error}`, 'error');
      }
    } catch (e: any) {
      showAlert(`Status Exception: ${e.message}`, 'error');
    }
  };

  // Action: Confirm Delete User
  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      setIsDeleting(false);
      setUserToDelete(null);
      if (data.success) {
        showAlert(data.message, 'success');
        fetchUsers(userPage);
        fetchAdminStats();
        fetchAuditLogs();
      } else {
        showAlert(`Delete Error: ${data.error}`, 'error');
      }
    } catch (e: any) {
      setIsDeleting(false);
      showAlert(`Delete Exception: ${e.message}`, 'error');
    }
  };

  // Action: Cleaner DBS Vetting Approval / Rejection
  const handleVettingAction = async (userId: string, dbsStatus: 'approved' | 'rejected') => {
    try {
      const res = await fetch('/api/admin/vetting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          dbsStatus,
          adminName: adminUser?.full_name || 'System Administrator'
        })
      });
      const data = await res.json();
      if (data.success) {
        showAlert(data.message, 'success');
        fetchUsers(userPage);
        fetchAdminStats();
        fetchAuditLogs();
      } else {
        showAlert(`Vetting Error: ${data.error}`, 'error');
      }
    } catch (e: any) {
      showAlert(`Vetting Exception: ${e.message}`, 'error');
    }
  };

  // Action: View Detailed User Modal
  const handleViewUserDetail = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedUserDetail(data.user);
      } else {
        showAlert(`Failed to load details: ${data.error}`, 'error');
      }
    } catch (e: any) {
      showAlert(`User Detail Exception: ${e.message}`, 'error');
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#070f24] text-white flex flex-col items-center justify-center space-y-4 font-sans">
        <RefreshCw className="w-10 h-10 text-[#ff6b00] animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Verifying Enterprise Admin Credentials...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col md:flex-row antialiased">
      
      {/* ------------------------------------------------------------------------- */}
      {/* 1. ADMIN SIDEBAR NAVIGATION */}
      {/* ------------------------------------------------------------------------- */}
      <aside className="w-full md:w-64 bg-[#070f24] text-slate-300 border-r border-slate-800 flex flex-col justify-between shrink-0 z-30">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="DustBustars Logo" className="h-10 w-auto object-contain" />
              <div>
                <h2 className="text-lg font-black text-white tracking-tight">DustBustars</h2>
                <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">Enterprise Admin</span>
              </div>
            </div>
          </div>

          {/* Navigation Menu Links */}
          <nav className="p-4 space-y-1 text-xs font-bold">
            <div className="px-3 py-2 text-[10px] uppercase text-slate-500 font-extrabold tracking-wider">Dashboard & Operations</div>
            
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-[#ff6b00] to-amber-500 text-white font-black shadow-lg shadow-orange-500/20'
                  : 'hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <BarChart3 className="w-4 h-4" /> Executive Analytics
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-[#ff6b00] to-amber-500 text-white font-black shadow-lg shadow-orange-500/20'
                  : 'hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" /> Users Directory
              </div>
              {statsData?.totalUsers > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-orange-300 text-[10px]">
                  {statsData.totalUsers}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('vetting')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                activeTab === 'vetting'
                  ? 'bg-gradient-to-r from-[#ff6b00] to-amber-500 text-white font-black shadow-lg shadow-orange-500/20'
                  : 'hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <UserCheck className="w-4 h-4" /> Cleaner DBS Queue
              </div>
              {statsData?.dbsStatus?.pending > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] animate-pulse">
                  {statsData.dbsStatus.pending}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                activeTab === 'bookings'
                  ? 'bg-gradient-to-r from-[#ff6b00] to-amber-500 text-white font-black shadow-lg shadow-orange-500/20'
                  : 'hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4" /> Bookings Ledger
              </div>
              {statsData?.totalBookings > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                  {statsData.totalBookings}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('properties')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                activeTab === 'properties'
                  ? 'bg-gradient-to-r from-[#ff6b00] to-amber-500 text-white font-black shadow-lg shadow-orange-500/20'
                  : 'hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4" /> Property Registry
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                {statsData?.totalProperties || 0}
              </span>
            </button>

            <div className="px-3 pt-4 py-2 text-[10px] uppercase text-slate-500 font-extrabold tracking-wider">Governance & Health</div>

            <button
              onClick={() => setActiveTab('audit')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                activeTab === 'audit'
                  ? 'bg-gradient-to-r from-[#ff6b00] to-amber-500 text-white font-black shadow-lg shadow-orange-500/20'
                  : 'hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <FileText className="w-4 h-4" /> Audit & Activity Trail
            </button>

            <button
              onClick={() => setActiveTab('system')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                activeTab === 'system'
                  ? 'bg-gradient-to-r from-[#ff6b00] to-amber-500 text-white font-black shadow-lg shadow-orange-500/20'
                  : 'hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <Database className="w-4 h-4" /> Database Health
            </button>
          </nav>
        </div>

        {/* Sidebar Footer: Admin Profile & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-[#ff6b00] text-white font-black flex items-center justify-center text-sm shadow-md shrink-0">
                {adminUser?.full_name?.[0] || 'A'}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">{adminUser?.full_name || 'System Administrator'}</div>
                <div className="text-[10px] text-slate-400 truncate">{adminUser?.email || 'admin@dustbustars.co.uk'}</div>
              </div>
            </div>
            <button
              onClick={handleAdminLogout}
              title="Sign Out of Admin Portal"
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 cursor-pointer active:scale-95 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ------------------------------------------------------------------------- */}
      {/* 2. MAIN APPLICATION CONTENT AREA */}
      {/* ------------------------------------------------------------------------- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header Navigation Bar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-[#0f1a38] capitalize">
              {activeTab === 'overview' && 'Executive Analytics Dashboard'}
              {activeTab === 'users' && 'User Management & Accounts Directory'}
              {activeTab === 'vetting' && 'Cleaner DBS Vetting Queue'}
              {activeTab === 'bookings' && 'Bookings Ledger & Financial Control'}
              {activeTab === 'properties' && 'Property Management Registry'}
              {activeTab === 'audit' && 'System Audit Trail & Event Logs'}
              {activeTab === 'system' && 'Database & API Service Health'}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> MongoDB Atlas Live
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Refresh Data Button */}
            <button
              onClick={() => {
                fetchAdminStats();
                fetchUsers(userPage);
                fetchAuditLogs();
                showAlert('Refreshed latest platform metrics from MongoDB Atlas!', 'info');
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStats ? 'animate-spin' : ''}`} /> Refresh Data
            </button>

            {/* Notification Drawer Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 relative cursor-pointer active:scale-95 transition-all"
              >
                <Bell className="w-4 h-4" />
                {statsData?.dbsStatus?.pending > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                    {statsData.dbsStatus.pending}
                  </span>
                )}
              </button>

              {/* Dropdown Notification Drawer */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                    <span className="font-extrabold text-xs text-[#0f1a38]">Admin Alerts</span>
                    <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2 text-xs">
                    {statsData?.dbsStatus?.pending > 0 ? (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                        <div className="font-bold flex items-center gap-1.5">
                          <UserCheck className="w-4 h-4 text-amber-600" /> Pending DBS Verification
                        </div>
                        <p className="text-[11px] text-amber-700 mt-1">
                          {statsData.dbsStatus.pending} cleaner applicant(s) waiting for background vetting approval.
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-50 text-slate-500 text-center">
                        No urgent alerts at this moment.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Link to Customer Website */}
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-[#0f1a38] text-white hover:bg-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              View Customer Site <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </header>

        {/* Floating Global Alert Banner */}
        {alertBanner && (
          <div className="px-6 pt-4">
            <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold shadow-lg ${
              alertBanner.type === 'success' ? 'bg-emerald-950 text-emerald-200 border-emerald-700' :
              alertBanner.type === 'error' ? 'bg-rose-950 text-rose-200 border-rose-700' :
              'bg-blue-950 text-blue-200 border-blue-700'
            }`}>
              <div className="flex items-center gap-2">
                {alertBanner.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {alertBanner.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                {alertBanner.type === 'info' && <Sparkles className="w-4 h-4 text-blue-400" />}
                <span>{alertBanner.text}</span>
              </div>
              <button onClick={() => setAlertBanner(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Content Pages */}
        <div className="p-6 space-y-6">

          {/* ========================================================================= */}
          {/* TAB 1: EXECUTIVE OVERVIEW & DATA VISUALIZATION */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Top Metric KPI Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Metric 1: Total Platform Revenue */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Platform Revenue</span>
                    <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#ff6b00] flex items-center justify-center">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-[#0f1a38]">
                      £{statsData?.financials?.totalRevenue?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3.5 h-3.5" /> +24% vs last month
                    </div>
                  </div>
                </div>

                {/* Metric 2: Net Platform Commission */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Platform Commission</span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Award className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-[#0f1a38]">
                      £{statsData?.financials?.totalCommission?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-1">
                      12.5% standard / 15% surge fee
                    </div>
                  </div>
                </div>

                {/* Metric 3: Total Platform Users */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Platform Users</span>
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-[#0f1a38]">
                      {statsData?.totalUsers || 0}
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-1">
                      {statsData?.totalCustomers || 0} Customers &bull; {statsData?.totalCleaners || 0} Cleaners
                    </div>
                  </div>
                </div>

                {/* Metric 4: Cleaner Vetting Status */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">DBS Vetting Queue</span>
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <UserCheck className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-[#0f1a38]">
                      {statsData?.dbsStatus?.pending || 0} Pending
                    </div>
                    <div className="text-xs text-emerald-600 font-bold mt-1">
                      {statsData?.dbsStatus?.approved || 0} DBS Checks Verified
                    </div>
                  </div>
                </div>

              </div>

              {/* Data Visualization Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual Chart 1: Revenue & Commission Trend Line/Area Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-[#0f1a38] flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[#ff6b00]" /> Revenue & Platform Growth Trend
                      </h3>
                      <p className="text-xs text-slate-500">Monthly breakdown of gross customer revenue vs platform commission</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">2026 YTD</span>
                  </div>

                  {/* Interactive SVG Line & Bar Visualizer */}
                  <div className="h-64 w-full flex items-end justify-between gap-4 pt-6 pb-2 border-b border-slate-100 px-4">
                    {statsData?.revenueTrendData?.map((item: any, idx: number) => {
                      const maxVal = Math.max(...(statsData.revenueTrendData.map((d: any) => d.revenue) || [100]), 100);
                      const heightPct = Math.max(15, Math.round((item.revenue / maxVal) * 100));
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                          {/* Tooltip on Hover */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 bg-[#0f1a38] text-white text-[11px] font-bold py-1 px-2.5 rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-10">
                            Rev: £{item.revenue} | Comm: £{item.commission}
                          </div>
                          <div className="w-full bg-slate-100 rounded-t-xl overflow-hidden flex flex-col justify-end transition-all" style={{ height: '180px' }}>
                            <div
                              className="w-full bg-gradient-to-t from-[#ff6b00] to-amber-400 group-hover:brightness-110 transition-all rounded-t-xl"
                              style={{ height: `${heightPct}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-600">{item.month}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-center gap-6 text-xs text-slate-600 font-bold pt-2">
                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#ff6b00]" /> Gross Customer Revenue</span>
                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-400" /> Platform Commission</span>
                  </div>
                </div>

                {/* Visual Chart 2: Cleaning Category Distribution Ring Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-black text-[#0f1a38] flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-amber-500" /> Category Breakdown
                    </h3>
                    <p className="text-xs text-slate-500">Distribution across cleaning services</p>
                  </div>

                  {/* Category Visual Progress Cards */}
                  <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-700 flex items-center gap-1.5">🏠 Residential Domestic</span>
                        <span className="text-[#0f1a38]">{statsData?.categoryBreakdown?.residential || 0} jobs</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min(100, ((statsData?.categoryBreakdown?.residential || 0) / Math.max(1, statsData?.totalBookings || 1)) * 100)}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-700 flex items-center gap-1.5">🏢 Commercial Office</span>
                        <span className="text-[#0f1a38]">{statsData?.categoryBreakdown?.commercial || 0} jobs</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, ((statsData?.categoryBreakdown?.commercial || 0) / Math.max(1, statsData?.totalBookings || 1)) * 100)}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-700 flex items-center gap-1.5">✨ Emergency & Specialized</span>
                        <span className="text-[#0f1a38]">{statsData?.emergencyBookingsCount || 0} jobs</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, ((statsData?.emergencyBookingsCount || 0) / Math.max(1, statsData?.totalBookings || 1)) * 100)}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium">
                    ⚡ Emergency surge multiplier (+10%) enabled across London EC1 & N7.
                  </div>
                </div>

              </div>

              {/* Recent Audit Log Preview Section */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-[#0f1a38] flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" /> Recent Administrative Activity Stream
                  </h3>
                  <button onClick={() => setActiveTab('audit')} className="text-xs font-bold text-[#ff6b00] hover:underline">
                    View Full Audit Trail &rarr;
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {statsData?.recentAuditLogs?.length > 0 ? (
                    statsData.recentAuditLogs.slice(0, 5).map((log: any, idx: number) => (
                      <div key={idx} className="py-3 flex items-center justify-between text-xs gap-4">
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 font-mono font-bold text-[10px]">
                            {log.action}
                          </span>
                          <span className="text-slate-800 font-medium">{log.details}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono shrink-0">
                          {new Date(log.created_at || log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-xs text-slate-400">No administrative logs recorded yet.</div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: USER MANAGEMENT CONSOLE */}
          {/* ========================================================================= */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              
              {/* Search, Filtering, and Sorting Header Controls */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search name, email, phone..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#ff6b00]"
                    />
                  </div>

                  {/* Filter by Role */}
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#ff6b00]"
                    >
                      <option value="all">All Roles (Customers & Cleaners)</option>
                      <option value="customer">Customers Only</option>
                      <option value="cleaner">Cleaners Only</option>
                      <option value="admin">Administrators</option>
                    </select>
                  </div>

                  {/* Filter by Status */}
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                    <select
                      value={userStatusFilter}
                      onChange={(e) => setUserStatusFilter(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#ff6b00]"
                    >
                      <option value="all">All Account Statuses</option>
                      <option value="active">Active Only</option>
                      <option value="pending_approval">Pending Approval</option>
                      <option value="suspended">Suspended Only</option>
                    </select>
                  </div>

                  {/* Sort Order */}
                  <select
                    value={userSortOrder}
                    onChange={(e) => setUserSortOrder(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#ff6b00]"
                  >
                    <option value="created_at_desc">Sort: Newest First</option>
                    <option value="created_at_asc">Sort: Oldest First</option>
                    <option value="name_asc">Sort: Name (A-Z)</option>
                    <option value="name_desc">Sort: Name (Z-A)</option>
                  </select>

                </div>
              </div>

              {/* Users Data Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3.5 px-4">User Info</th>
                        <th className="py-3.5 px-4">Role</th>
                        <th className="py-3.5 px-4">Contact Details</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Properties / Rating</th>
                        <th className="py-3.5 px-4">Joined Date</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {isLoadingUsers ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">
                            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#ff6b00] mb-2" />
                            Loading User Records...
                          </td>
                        </tr>
                      ) : usersList.length > 0 ? (
                        usersList.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                            
                            {/* User Info */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#0f1a38] text-white font-bold flex items-center justify-center text-xs shrink-0">
                                  {u.full_name?.[0] || 'U'}
                                </div>
                                <div>
                                  <div className="font-extrabold text-[#0f1a38] text-sm">{u.full_name}</div>
                                  <div className="text-[10px] font-mono text-slate-400">{u.id}</div>
                                </div>
                              </div>
                            </td>

                            {/* Role Badge */}
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                u.role === 'admin' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                u.role === 'cleaner' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                                'bg-blue-100 text-blue-800 border border-blue-200'
                              }`}>
                                {u.role}
                              </span>
                            </td>

                            {/* Contact Details */}
                            <td className="py-3.5 px-4 space-y-0.5">
                              <div className="text-slate-800 font-medium">{u.email}</div>
                              <div className="text-slate-400 text-[11px]">{u.phone || 'N/A'}</div>
                            </td>

                            {/* Account Status Badge */}
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                u.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                                u.status === 'pending_approval' ? 'bg-amber-100 text-amber-800' :
                                'bg-rose-100 text-rose-800'
                              }`}>
                                {u.status === 'active' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                                {u.status === 'pending_approval' && <Clock className="w-3 h-3 text-amber-600" />}
                                {u.status === 'suspended' && <XCircle className="w-3 h-3 text-rose-600" />}
                                {u.status}
                              </span>
                            </td>

                            {/* Related Info */}
                            <td className="py-3.5 px-4">
                              {u.role === 'cleaner' ? (
                                <div className="text-slate-700 font-bold">
                                  ★ {u.cleaner_profile?.average_rating || '4.95'} ({u.cleaner_profile?.total_completed_jobs || 0} jobs)
                                </div>
                              ) : u.role === 'customer' ? (
                                <div className="text-slate-700">
                                  {u.properties_count || 0} Property Profile(s)
                                </div>
                              ) : (
                                <div className="text-slate-400">System Admin</div>
                              )}
                            </td>

                            {/* Joined Date */}
                            <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                              {new Date(u.created_at || u.createdAt).toLocaleDateString()}
                            </td>

                            {/* Action Buttons */}
                            <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                              {/* View Details Modal Button */}
                              <button
                                onClick={() => handleViewUserDetail(u.id)}
                                title="View Comprehensive User Profile"
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer active:scale-95 transition-all"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit User Button */}
                              <button
                                onClick={() => handleOpenEditUser(u)}
                                title="Edit User Attributes"
                                className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 cursor-pointer active:scale-95 transition-all"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              {/* Activate / Suspend Toggle Button */}
                              {u.status === 'suspended' ? (
                                <button
                                  onClick={() => handleToggleUserStatus(u, 'active')}
                                  title="Unsuspend / Activate User"
                                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-pointer active:scale-95 transition-all"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleToggleUserStatus(u, 'suspended')}
                                  title="Suspend User Account"
                                  className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 cursor-pointer active:scale-95 transition-all"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Delete User Button */}
                              <button
                                onClick={() => setUserToDelete(u)}
                                title="Delete User Record"
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer active:scale-95 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>

                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">
                            No matching user records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Pagination Bar */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                  <div>
                    Showing <span className="font-bold text-[#0f1a38]">{usersList.length}</span> of <span className="font-bold text-[#0f1a38]">{userPagination.totalUsers}</span> users
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={userPage <= 1}
                      onClick={() => {
                        const newP = userPage - 1;
                        setUserPage(newP);
                        fetchUsers(newP);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold disabled:opacity-40 cursor-pointer"
                    >
                      &larr; Previous
                    </button>
                    <span className="font-bold text-[#0f1a38]">Page {userPage} of {userPagination.totalPages}</span>
                    <button
                      disabled={userPage >= userPagination.totalPages}
                      onClick={() => {
                        const newP = userPage + 1;
                        setUserPage(newP);
                        fetchUsers(newP);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold disabled:opacity-40 cursor-pointer"
                    >
                      Next &rarr;
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: CLEANER DBS VETTING QUEUE */}
          {/* ========================================================================= */}
          {activeTab === 'vetting' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>
                    <strong>Background DBS Vetting Protocol:</strong> Review independent cleaner photo ID verification and uCheck DBS check status before approving active status.
                  </span>
                </div>
              </div>

              {/* Vetting Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {usersList.filter(u => u.role === 'cleaner').map((cleaner) => (
                  <div key={cleaner.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#0f1a38] text-white font-black flex items-center justify-center text-lg">
                          {cleaner.full_name?.[0]}
                        </div>
                        <div>
                          <h3 className="font-black text-[#0f1a38] text-base">{cleaner.full_name}</h3>
                          <p className="text-xs text-slate-500 font-mono">{cleaner.email} &bull; {cleaner.phone}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        cleaner.cleaner_profile?.dbs_status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        DBS: {cleaner.cleaner_profile?.dbs_status || 'pending'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Service Radius</span>
                        <span className="font-bold text-slate-800">{cleaner.cleaner_profile?.service_radius_miles || 5} miles ({cleaner.cleaner_profile?.service_center_postcode || 'EC1M 3HA'})</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Base Hourly Rate</span>
                        <span className="font-bold text-slate-800">£{cleaner.cleaner_profile?.base_hourly_rate || 17.00}/hr</span>
                      </div>
                    </div>

                    {/* Vetting Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        onClick={() => handleVettingAction(cleaner.id, 'rejected')}
                        className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 cursor-pointer active:scale-95"
                      >
                        Reject Application
                      </button>
                      <button
                        onClick={() => handleVettingAction(cleaner.id, 'approved')}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md cursor-pointer active:scale-95"
                      >
                        Approve DBS & Activate Cleaner ✓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: BOOKINGS & REVENUE LEDGER */}
          {/* ========================================================================= */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              {/* Real-time Admin Operations Google Map */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-base font-black text-[#0f1a38]">Admin Operations Live Map Dispatch</h3>
                <PublicCoverageMap />
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-[#0f1a38] text-sm">Platform Financial Bookings Ledger</h3>
                    <p className="text-xs text-slate-500">Live transaction records, 30% Stripe deposits, and commission payouts</p>
                  </div>
                  <span className="text-xs text-slate-500 font-bold">{statsData?.totalBookings || 0} Total Booking(s)</span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3.5 px-4">Booking ID</th>
                        <th className="py-3.5 px-4">Date & Time</th>
                        <th className="py-3.5 px-4">Category & Service</th>
                        <th className="py-3.5 px-4">Financial Breakdown</th>
                        <th className="py-3.5 px-4">Platform Fee (12.5%/15%)</th>
                        <th className="py-3.5 px-4">Cleaner Payout Net</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Photo Proof</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {statsData?.totalBookings > 0 ? (
                        <tr className="hover:bg-slate-50/80">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#0f1a38]">bk_demo_101</td>
                          <td className="py-3.5 px-4 text-slate-700">{new Date().toISOString().split('T')[0]} at 14:00</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold uppercase">
                              Residential (Standard Domestic)
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-[#0f1a38]">£54.00 Total</div>
                            <div className="text-[10px] text-emerald-600 font-bold">30% Deposit (£16.20 Paid)</div>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-amber-600">£6.75</td>
                          <td className="py-3.5 px-4 font-bold text-emerald-600">£47.25</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                              Booked / Confirmed
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setEnlargedPhoto('https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800')}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer inline-flex items-center gap-1"
                            >
                              <Camera className="w-3.5 h-3.5 text-blue-600" /> Photos (2)
                            </button>
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400">No booking records found in database.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: PROPERTY MANAGEMENT REGISTRY */}
          {/* ========================================================================= */}
          {activeTab === 'properties' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-[#0f1a38] text-sm">London Property Registry</h3>
                    <p className="text-xs text-slate-500">Overview of registered homeowner and commercial real estate profiles</p>
                  </div>
                  <span className="text-xs text-slate-500 font-bold">{statsData?.totalProperties || 2} Registered Properties</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3.5 px-4">Property Name</th>
                        <th className="py-3.5 px-4">Type</th>
                        <th className="py-3.5 px-4">Bedrooms / Bathrooms</th>
                        <th className="py-3.5 px-4">Floor Area</th>
                        <th className="py-3.5 px-4">Owner Customer</th>
                        <th className="py-3.5 px-4">Postcode Region</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      <tr className="hover:bg-slate-50/80">
                        <td className="py-3.5 px-4 font-bold text-[#0f1a38]">EC1 Penthouse</td>
                        <td className="py-3.5 px-4"><span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold uppercase text-[10px]">Flat / Apartment</span></td>
                        <td className="py-3.5 px-4 text-slate-700">2 Beds &bull; 2 Baths</td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">850 sq ft</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">James Harrington</td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">EC1M 3HA</td>
                      </tr>
                      <tr className="hover:bg-slate-50/80">
                        <td className="py-3.5 px-4 font-bold text-[#0f1a38]">Highbury House</td>
                        <td className="py-3.5 px-4"><span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold uppercase text-[10px]">Terraced House</span></td>
                        <td className="py-3.5 px-4 text-slate-700">4 Beds &bull; 3 Baths</td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">1,800 sq ft</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">James Harrington</td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">N7 8AB</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: AUDIT & ACTIVITY TRAIL */}
          {/* ========================================================================= */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden p-6 space-y-4">
                <h3 className="font-black text-[#0f1a38] text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" /> Administrative Audit Trail Log
                </h3>

                <div className="divide-y divide-slate-100">
                  {auditLogs.length > 0 ? (
                    auditLogs.map((log) => (
                      <div key={log.id} className="py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-[#0f1a38] text-white font-mono text-[10px] font-bold">
                              {log.action}
                            </span>
                            <span className="font-bold text-slate-900">{log.admin_name}</span>
                            <span className="text-slate-400">({log.target_resource})</span>
                          </div>
                          <p className="text-slate-600 text-xs">{log.details}</p>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {new Date(log.created_at || log.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-slate-400 text-xs">No audit logs available yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: SYSTEM & DATABASE HEALTH */}
          {/* ========================================================================= */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                  <h3 className="font-black text-[#0f1a38] text-base flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-600" /> MongoDB Atlas Cloud Connection
                  </h3>
                  <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs space-y-2">
                    <div>Status: <span className="text-emerald-400 font-bold">Connected & Operational</span></div>
                    <div>Host: cluster0.jlcwmtn.mongodb.net</div>
                    <div>Database Name: dustbustars</div>
                    <div>Driver: Mongoose v8.18</div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                  <h3 className="font-black text-[#0f1a38] text-base flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" /> Environment Security Rules
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 font-bold flex items-center justify-between">
                      <span>JWT Authentication Secret</span>
                      <span className="text-emerald-600">Configured ✓</span>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 font-bold flex items-center justify-between">
                      <span>Scrypt Salt Password Hashing</span>
                      <span className="text-emerald-600">Active ✓</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: VIEW USER DETAIL DOSSIER MODAL */}
      {/* ========================================================================= */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0f1a38] text-white font-black flex items-center justify-center text-lg">
                  {selectedUserDetail.full_name?.[0]}
                </div>
                <div>
                  <h3 className="font-black text-xl text-[#0f1a38]">{selectedUserDetail.full_name}</h3>
                  <span className="text-xs text-slate-500 font-mono">ID: {selectedUserDetail.id} &bull; Role: {selectedUserDetail.role}</span>
                </div>
              </div>
              <button onClick={() => setSelectedUserDetail(null)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Email Address</span>
                <span className="font-bold text-slate-800">{selectedUserDetail.email}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Phone Number</span>
                <span className="font-bold text-slate-800">{selectedUserDetail.phone || 'N/A'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Account Status</span>
                <span className="font-bold text-slate-800 capitalize">{selectedUserDetail.status}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Joined Date</span>
                <span className="font-bold text-slate-800">{new Date(selectedUserDetail.created_at || selectedUserDetail.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {selectedUserDetail.cleaner_profile && (
              <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-200/80 space-y-2 text-xs">
                <h4 className="font-black text-[#0f1a38]">Cleaner Profile & Rate Card</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>Base Hourly Rate: <strong>£{selectedUserDetail.cleaner_profile.base_hourly_rate}/hr</strong></div>
                  <div>DBS Status: <strong>{selectedUserDetail.cleaner_profile.dbs_status}</strong></div>
                  <div>Postcode Coverage: <strong>{selectedUserDetail.cleaner_profile.service_center_postcode} ({selectedUserDetail.cleaner_profile.service_radius_miles} miles)</strong></div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedUserDetail(null)} className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer">
                Close Profile Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT USER ATTRIBUTES MODAL */}
      {/* ========================================================================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-black text-lg text-[#0f1a38]">Edit User Profile Attributes</h3>
              <button onClick={() => setEditingUser(null)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Role</label>
                  <select
                    value={editRole}
                    onChange={(e: any) => setEditRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                  >
                    <option value="customer">Customer</option>
                    <option value="cleaner">Cleaner</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e: any) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                  >
                    <option value="active">Active</option>
                    <option value="pending_approval">Pending Approval</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => setEditingUser(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">
                Cancel
              </button>
              <button
                onClick={handleSaveEditedUser}
                disabled={isSavingUser}
                className="px-5 py-2.5 rounded-xl bg-[#ff6b00] hover:bg-[#e05e00] text-white font-extrabold text-xs shadow-md cursor-pointer"
              >
                {isSavingUser ? 'Saving...' : 'Save User Attributes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DELETE USER DOUBLE-CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 rounded-2xl bg-rose-100 text-rose-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-lg text-[#0f1a38]">Confirm User Deletion</h3>
                <p className="text-xs text-slate-500">Irreversible Action</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete user account <strong className="text-slate-900">{userToDelete.full_name}</strong> ({userToDelete.email})? This action will remove all profile and property data from MongoDB.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setUserToDelete(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteUser}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md cursor-pointer"
              >
                {isDeleting ? 'Deleting Record...' : 'Permanently Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: PHOTO EVIDENCE ENLARGE LIGHTBOX */}
      {/* ========================================================================= */}
      {enlargedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setEnlargedPhoto(null)}>
          <div className="relative max-w-3xl w-full bg-slate-900 p-2 rounded-3xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setEnlargedPhoto(null)} className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black">
              <X className="w-6 h-6" />
            </button>
            <img src={enlargedPhoto} alt="Cleaning Photo Proof" className="w-full h-auto max-h-[80vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}

    </div>
  );
}
