'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Smartphone, 
  UserCheck, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Building2,
  Tag,
  Clock,
  ArrowRight,
  RefreshCw,
  Award,
  Lock,
  Camera,
  FileText,
  DollarSign,
  Calendar,
  MessageSquare,
  Star,
  Users,
  Search,
  Check,
  Plus,
  HelpCircle,
  AlertCircle,
  FileSpreadsheet,
  Send,
  Upload,
  Heart,
  Zap,
  CheckSquare,
  CreditCard,
  ExternalLink,
  X,
  Loader2,
  Trash2,
  Maximize2,
  Image as ImageIcon,
  Database,
  Menu
} from 'lucide-react';
import PublicCoverageMap from '@/components/PublicCoverageMap';
import CleanerCoverageMap from '@/components/CleanerCoverageMap';
import LiveJobTrackingMap from '@/components/LiveJobTrackingMap';
import HeroLocationPicker from '@/components/HeroLocationPicker';
import CustomerPropertyLocationPicker from '@/components/CustomerPropertyLocationPicker';
import MobileBottomNav from '@/components/MobileBottomNav';
import MobileDrawerMenu from '@/components/MobileDrawerMenu';
import { initNativeApp, registerBackButtonHandler, triggerHaptic } from '@/lib/mobile/native';

export default function DustBustarsApp() {
  // Navigation & Role State
  const [activeTab, setActiveTab] = useState<'landing' | 'cleaner' | 'customer' | 'pricing' | 'execution' | 'admin'>('landing');
  const [landingSubTab, setLandingSubTab] = useState<'home' | 'how-it-works' | 'pricing' | 'for-cleaners' | 'about' | 'faqs' | 'contact'>('home');
  const [faqAudienceTab, setFaqAudienceTab] = useState<'customer' | 'cleaner'>('customer');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactRole, setContactRole] = useState('Customer');
  const [contactReason, setContactReason] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  // Authentication & Login State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authFullName, setAuthFullName] = useState('');
  const [authEmail, setAuthEmail] = useState('james.homeowner@gmail.com');
  const [authPassword, setAuthPassword] = useState('password123');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('password123');
  const [authRole, setAuthRole] = useState<'customer' | 'cleaner' | 'admin'>('customer');
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pendingRedirectTab, setPendingRedirectTab] = useState<string | null>(null);

  // Mobile App Navigation & Hardware Listeners
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Initialize native status bar and dismiss splash screen on mobile
    initNativeApp();
  }, []);

  useEffect(() => {
    // Hardware Android back button handler
    const unregister = registerBackButtonHandler(() => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        return true;
      }
      if (showAuthModal) {
        setShowAuthModal(false);
        return true;
      }
      if (activeTab !== 'landing') {
        setActiveTab('landing');
        return true;
      }
      return false;
    });
    return unregister;
  }, [isMobileMenuOpen, showAuthModal, activeTab]);

  // Persistent Auth Session & Tab/Page Restore on Browser Reload
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedTab = localStorage.getItem('dustbustars_active_tab');
    const savedSubTab = localStorage.getItem('dustbustars_landing_subtab');
    if (savedSubTab) {
      setLandingSubTab(savedSubTab as any);
    }

    const savedToken = localStorage.getItem('dustbustars_auth_token');
    if (savedToken) {
      console.log('[Frontend Auth] Found saved auth token in localStorage. Verifying session via GET /api/auth/me...');
      fetch(`/api/auth/me?token=${encodeURIComponent(savedToken)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            console.log(`[Frontend Auth] Session verified! Logged in as "${data.user.full_name}" (${data.user.role}).`);
            setIsLoggedIn(true);
            setCurrentUser(data.user);
            setAuthRole(data.user.role);
            if (savedTab && savedTab !== 'landing') {
              setActiveTab(savedTab as any);
            } else {
              setActiveTab(data.user.role);
            }
          } else {
            console.log('[Frontend Auth] Session token invalid or expired. Clearing localStorage.');
            localStorage.removeItem('dustbustars_auth_token');
            setIsLoggedIn(false);
            setCurrentUser(null);
            setActiveTab('landing');
          }
        })
        .catch(err => {
          console.error('[Frontend Auth] Session restore error:', err);
          setIsLoggedIn(false);
          setActiveTab('landing');
        });
    } else {
      setIsLoggedIn(false);
      setCurrentUser(null);
      setActiveTab('landing');
    }
  }, []);

  // Save activeTab & landingSubTab changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dustbustars_active_tab', activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dustbustars_landing_subtab', landingSubTab);
    }
  }, [landingSubTab]);

  // Hero Search Card State (Figma Home Page)
  const [heroPostcode, setHeroPostcode] = useState('EC1M 3HA');
  const [heroType, setHeroType] = useState('std_domestic');
  const [heroDate, setHeroDate] = useState(new Date().toISOString().split('T')[0]);
  const [heroTime, setHeroTime] = useState('14:00');
  const [heroIsEmergency, setHeroIsEmergency] = useState(false);

  // Customer State
  const [customerName, setCustomerName] = useState('James Harrington');
  const [customerEmail, setCustomerEmail] = useState('james.homeowner@gmail.com');
  const [customerPhone, setCustomerPhone] = useState('+447700900004');

  // Property Manager State
  const [properties, setProperties] = useState<any[]>([
    { id: 'prop_1', name: 'EC1 Penthouse', property_type: 'flat', bedrooms_count: 2, bathrooms_count: 2, sqft_area: 850 },
    { id: 'prop_2', name: 'Highbury House', property_type: 'house', bedrooms_count: 4, bathrooms_count: 3, sqft_area: 1800 }
  ]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('prop_1');
  const [newPropType, setNewPropType] = useState<'house' | 'flat' | 'office' | 'other'>('flat');
  const [newPropName, setNewPropName] = useState('');
  const [newPropOtherDesc, setNewPropOtherDesc] = useState('');

  // Booking Builder State
  const [cleaningCategory, setCleaningCategory] = useState<'residential' | 'commercial' | 'other'>('residential');
  const [cleaningType, setCleaningType] = useState<string>('std_domestic');
  const [bookingMode, setBookingMode] = useState<'calendar_post' | 'direct_cleaner'>('direct_cleaner');
  const [selectedCleanerId, setSelectedCleanerId] = useState<string>('usr_cleaner_1');
  const [unitsCount, setUnitsCount] = useState<number>(3);
  const [cleanerCount, setCleanerCount] = useState<number>(1);
  const [scheduledDate, setScheduledDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState<string>('14:00');
  const [specialNotes, setSpecialNotes] = useState('');
  const [customQuoteInput, setCustomQuoteInput] = useState<string>('');
  const [favorites, setFavorites] = useState<string[]>(['usr_cleaner_1']);

  // Cleaner Profile & Rates State
  const [cleanerUserId, setCleanerUserId] = useState<string>('usr_cleaner_1');
  const [cleanerProfile, setCleanerProfile] = useState<any>(null);
  const [dbsProvider, setDbsProvider] = useState<'ucheck' | 'first_advantage'>('ucheck');
  const [serviceRadius, setServiceRadius] = useState<number>(5);
  const [servicePostcode, setServicePostcode] = useState('EC1M 3HA');
  const [optInEmergency, setOptInEmergency] = useState(true);
  const [optInAfterhours, setOptInAfterhours] = useState(true);
  const [optInQuotes, setOptInQuotes] = useState(true);
  const [payoutFreq, setPayoutFreq] = useState<'48_hours' | 'weekly'>('48_hours');
  const [rateCard, setRateCard] = useState<any>({
    std_domestic: { enabled: true, charge_model: 'per_hour', amount: 16.00 },
    deep_clean: { enabled: true, charge_model: 'per_hour', amount: 22.00 },
    end_of_tenancy: { enabled: true, charge_model: 'per_room', amount: 35.00 },
    end_of_tenancy_removal: { enabled: true, charge_model: 'quote', amount: 0 },
    airbnb: { enabled: true, charge_model: 'per_room', amount: 28.00 },
    office_retail: { enabled: true, charge_model: 'per_hour', amount: 20.00 },
    educational: { enabled: true, charge_model: 'per_hour', amount: 24.00 },
    medical_clinical: { enabled: true, charge_model: 'quote', amount: 0 },
    events: { enabled: true, charge_model: 'quote', amount: 0 },
    other_specialized: { enabled: true, charge_model: 'quote', amount: 0 }
  });

  // Verified Cleaners Roster for Single & Multi-Cleaner Team Assignments
  const availableCleanersPool = [
    { id: 'usr_cleaner_1', name: 'Elena Rostova', roleLabel: 'Team Leader', rating: 4.95, jobs: 142, distance: '1.2 miles away', coverage: 'EC1 & N7 Coverage', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' },
    { id: 'usr_cleaner_2', name: 'Marcus Vance', roleLabel: 'Cleaner 2', rating: 4.85, jobs: 95, distance: '1.8 miles away', coverage: 'E1 & EC1 Coverage', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150' },
    { id: 'usr_cleaner_3', name: 'Priya Sharma', roleLabel: 'Cleaner 3', rating: 5.00, jobs: 64, distance: '2.4 miles away', coverage: 'N1 & NW1 Coverage', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150' },
    { id: 'usr_cleaner_4', name: 'Sarah Jenkins', roleLabel: 'Cleaner 4', rating: 4.90, jobs: 88, distance: '3.1 miles away', coverage: 'SW1 & W1 Coverage', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
    { id: 'usr_cleaner_5', name: 'David Miller', roleLabel: 'Cleaner 5', rating: 4.88, jobs: 110, distance: '3.5 miles away', coverage: 'SE1 & EC2 Coverage', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' }
  ];

  // Bookings & Execution State
  const [allBookings, setAllBookings] = useState<any[]>([
    {
      id: 'bk_demo_101',
      status: 'booked',
      cleaning_category: 'residential',
      cleaning_type: 'std_domestic',
      units_count: 3,
      cleaner_count: 1,
      base_amount: 48,
      surge_bonus: 0,
      final_total: 54,
      deposit_amount: 54,
      customer_name: 'James Harrington',
      cleaner_name: 'Elena Rostova',
      scheduled_date: new Date().toISOString().split('T')[0],
      scheduled_time: '14:00',
      is_emergency: false,
      before_photos: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500'],
      after_photos: ['https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=500']
    },
    {
      id: 'bk_demo_102',
      status: 'booked',
      cleaning_category: 'residential',
      cleaning_type: 'deep_clean',
      units_count: 3,
      cleaner_count: 3,
      base_amount: 144,
      surge_bonus: 14.40,
      emergency_surcharge_amount: 45.00,
      final_total: 233.91,
      deposit_amount: 233.91,
      customer_name: 'James Harrington',
      cleaner_name: 'Elena Rostova & Team (3 Cleaners)',
      scheduled_date: new Date().toISOString().split('T')[0],
      scheduled_time: '16:30',
      is_emergency: true,
      before_photos: [],
      after_photos: []
    }
  ]);
  const [activeBookingId, setActiveBookingId] = useState<string>('bk_demo_101');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newChatMessage, setNewChatMessage] = useState<string>('');
  const [chatUnlocked, setChatUnlocked] = useState<boolean>(true);
  const [minutesUntilChatUnlock, setMinutesUntilChatUnlock] = useState<number>(0);
  
  // Photo Evidence Upload States
  const [beforePhotoUrl, setBeforePhotoUrl] = useState('');
  const [afterPhotoUrl, setAfterPhotoUrl] = useState('');
  const [photoErrorMsg, setPhotoErrorMsg] = useState<string | null>(null);
  const [isUploadingBefore, setIsUploadingBefore] = useState(false);
  const [isUploadingAfter, setIsUploadingAfter] = useState(false);
  const [enlargedPhotoUrl, setEnlargedPhotoUrl] = useState<string | null>(null);

  // Hidden File Input Refs for direct local file upload
  const beforeFileInputRef = useRef<HTMLInputElement | null>(null);
  const afterFileInputRef = useRef<HTMLInputElement | null>(null);

  // Review State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Cancellation Simulator State
  const [simHoursSinceBooking, setSimHoursSinceBooking] = useState(1);
  const [simHoursUntilJob, setSimHoursUntilJob] = useState(12);
  const [simIsEmergency, setSimIsEmergency] = useState(false);
  const [simJobTotal, setSimJobTotal] = useState(100);

  // Admin Approval Queue State
  const [adminCleanerStatus, setAdminCleanerStatus] = useState<'approved' | 'pending' | 'rejected'>('approved');

  // MongoDB Connection State
  const [mongoInputUri, setMongoInputUri] = useState('mongodb+srv://makshat2003_db_user:<your_password>@cluster0.jlcwmtn.mongodb.net/dustbustars?retryWrites=true&w=majority');
  const [isConnectingMongo, setIsConnectingMongo] = useState(false);
  const [mongoStats, setMongoStats] = useState<any>(null);

  // MODAL POPUP STATES
  const [showStripeCheckoutModal, setShowStripeCheckoutModal] = useState(false);
  const [showStripeConnectModal, setShowStripeConnectModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);

  // Stripe Checkout Form Inputs inside Modal
  const [cardHolderName, setCardHolderName] = useState('James Harrington');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Stripe Connect Form Inputs inside Modal
  const [sortCode, setSortCode] = useState('20-40-60');
  const [accountNumber, setAccountNumber] = useState('87654321');
  const [isSavingConnect, setIsSavingConnect] = useState(false);

  // Commercial Contract Form Inputs inside Modal
  const [companyName, setCompanyName] = useState('Harrington Property Management Ltd');
  const [cleaningFreq, setCleaningFreq] = useState('weekly');
  const [contractNotes, setContractNotes] = useState('Weekly office sanitation & kitchen deep clean.');

  // Status Alerts
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  useEffect(() => {
    fetchProperties();
    fetchCleanerProfile();
    fetchBookings();
  }, []);

  useEffect(() => {
    if (activeBookingId) {
      fetchChatMessages(activeBookingId);
    }
  }, [activeBookingId]);

  const showAlert = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 8000);
  };

  const fetchProperties = async () => {
    try {
      const res = await fetch(`/api/customer/properties?userId=usr_customer_1`);
      if (!res.ok) return;
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) return;
      const data = await res.json();
      if (data.properties && data.properties.length > 0) {
        setProperties(data.properties);
        if (!selectedPropertyId) setSelectedPropertyId(data.properties[0].id);
      }
    } catch (e: any) {
      // silent fallback
    }
  };

  const fetchCleanerProfile = async () => {
    try {
      const res = await fetch(`/api/cleaner/profile?userId=usr_cleaner_1`);
      if (!res.ok) return;
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) return;
      const data = await res.json();
      if (data.profile) {
        setCleanerProfile(data.profile);
        if (data.profile.rates) setRateCard(data.profile.rates);
        setServiceRadius(data.profile.service_radius_miles || 5);
        setOptInEmergency(data.profile.opt_in_emergency ?? true);
        setOptInAfterhours(data.profile.opt_in_afterhours ?? true);
        setOptInQuotes(data.profile.opt_in_quotes ?? true);
      }
    } catch (e: any) {
      // silent fallback
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch(`/api/bookings?userId=usr_customer_1`);
      if (!res.ok) return;
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) return;
      const data = await res.json();
      if (data.bookings) setAllBookings(data.bookings);
    } catch (e: any) {
      // silent fallback
    }
  };

  const [isFetchingChat, setIsFetchingChat] = useState<boolean>(false);

  const fetchChatMessages = async (bId: string) => {
    setIsFetchingChat(true);
    try {
      const res = await fetch(`/api/chat?bookingId=${bId}`);
      const data = await res.json();
      if (data.messages) setChatMessages(data.messages);
      setChatUnlocked(data.is_portal_unlocked ?? true);
    } catch (e: any) {
      console.error('Fetch chat error:', e);
    } finally {
      setIsFetchingChat(false);
    }
  };

  // Pricing Engine Live Calculator (Client Rules Enforced)
  const calculateLivePricing = () => {
    const isQuote = ['end_of_tenancy_removal', 'medical_clinical', 'events', 'other_specialized'].includes(cleaningType);
    let unitRate = 0;
    if (isQuote) {
      unitRate = customQuoteInput ? parseFloat(customQuoteInput) : 0;
    } else if (rateCard[cleaningType]?.enabled) {
      unitRate = rateCard[cleaningType].amount;
    } else {
      unitRate = ['end_of_tenancy', 'airbnb'].includes(cleaningType) ? 30 : 18;
    }

    const count = Math.max(1, cleanerCount || 1);
    const perCleanerBase = isQuote ? unitRate : unitRate * Math.max(1, unitsCount);
    const baseTotal = perCleanerBase * count;

    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`);
    const now = new Date();
    const diffHours = (scheduledDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    const isEmergency = 
      (bookingMode === 'calendar_post' && diffHours > 0 && diffHours <= 4) ||
      (bookingMode === 'direct_cleaner' && diffHours > 0 && diffHours <= 2) ||
      heroIsEmergency;

    const hourOfDay = parseInt(scheduledTime.split(':')[0] || '0', 10);
    const isAfterhours = hourOfDay >= 20;

    // Client Rule 2: Emergency surcharge £5/hr per cleaner
    const emergencySurcharge = isEmergency ? (5.00 * Math.max(1, unitsCount) * count) : 0;

    const surgePct = (isEmergency || isAfterhours) ? 0.10 : 0.0;
    const surgeBonus = baseTotal * surgePct;
    const subtotal = baseTotal + emergencySurcharge + surgeBonus;

    // Client Rule 3 & 2: 12.5% standard fee (for single or multi-cleaner), 15% for emergency
    const commissionPct = isEmergency ? 0.15 : 0.125;
    const platformComm = Number((subtotal * commissionPct).toFixed(2));
    const finalTotal = Number((subtotal + platformComm).toFixed(2));

    // Client Rule 4: Pay first upfront everything (100% upfront)
    const deposit = finalTotal;
    const cleanerPayout = Number((finalTotal - platformComm).toFixed(2));

    return {
      isQuote,
      unitRate,
      cleanerCount: count,
      baseTotal,
      isEmergency,
      isAfterhours,
      emergencySurcharge,
      surgeBonus,
      finalTotal,
      deposit,
      platformComm,
      cleanerPayout,
      contractRequired: cleaningCategory === 'commercial'
    };
  };

  const livePricing = calculateLivePricing();

  // Handlers
  const handleAddProperty = async () => {
    const defaultName = `${newPropType.toUpperCase()} Property ${properties.length + 1}`;
    const nameToUse = newPropName.trim() || defaultName;
    const otherDescToUse = newPropOtherDesc.trim() || (newPropType === 'other' ? 'Specialized residential or commercial cleaning space' : '');

    try {
      const res = await fetch('/api/customer/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'usr_customer_1',
          propertyType: newPropType,
          name: nameToUse,
          otherDescription: otherDescToUse
        })
      });
      const data = await res.json();
      if (data.success) {
        showAlert(`Property "${nameToUse}" added successfully!`, 'success');
        setNewPropName('');
        setNewPropOtherDesc('');
        fetchProperties();
        setSelectedPropertyId(data.property.id);
      } else {
        showAlert(`Error: ${data.error || 'Failed to add property'}`, 'error');
      }
    } catch (e: any) {
      showAlert(`Error adding property: ${e.message}`, 'error');
    }
  };

  // Local Demo Checkout Handler
  const handleCreateBooking = async () => {
    const targetPropId = selectedPropertyId || (properties.length > 0 ? properties[0].id : 'prop_1');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: 'usr_customer_1',
          cleanerId: bookingMode === 'direct_cleaner' ? selectedCleanerId : undefined,
          propertyId: targetPropId,
          bookingType: bookingMode,
          cleaningCategory,
          cleaningType,
          unitsCount,
          cleanerCount,
          scheduledDate,
          scheduledTime,
          specialInstructions: specialNotes,
          customQuoteAmount: customQuoteInput ? parseFloat(customQuoteInput) : 0
        })
      });
      const data = await res.json();
      if (data.success) {
        showAlert(`Booking created! 100% Upfront Payment (£${data.booking.total_amount.toFixed(2)}) processed. Total: £${data.booking.total_amount.toFixed(2)}`, 'success');
        fetchBookings();
        setActiveBookingId(data.booking.id);
        setActiveTab('execution');
      } else {
        showAlert(`Booking error: ${data.error || 'Booking creation failed'}`, 'error');
      }
    } catch (e: any) {
      showAlert(`Error: ${e.message}`, 'error');
    }
  };

  // MongoDB Live Connect & Seed Handler
  const handleConnectMongo = async (uriToTest?: string) => {
    setIsConnectingMongo(true);
    const targetUri = (uriToTest || mongoInputUri).trim();

    try {
      const res = await fetch('/api/db/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mongoUri: targetUri })
      });
      const data = await res.json();
      setIsConnectingMongo(false);

      if (data.success) {
        setMongoStats(data.stats);
        showAlert(`🎉 ${data.message}`, 'success');
      } else {
        showAlert(`❌ ${data.error || data.message || 'MongoDB connection failed'}`, 'error');
      }
    } catch (e: any) {
      setIsConnectingMongo(false);
      showAlert(`❌ Connection Exception: ${e.message}`, 'error');
    }
  };

  // Modal Stripe Payment Confirmation Handler
  const handleProcessStripePaymentModal = async () => {
    setIsProcessingPayment(true);
    const targetPropId = selectedPropertyId || (properties.length > 0 ? properties[0].id : 'prop_1');

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: 'usr_customer_1',
          cleanerId: bookingMode === 'direct_cleaner' ? selectedCleanerId : undefined,
          propertyId: targetPropId,
          bookingType: bookingMode,
          cleaningCategory,
          cleaningType,
          unitsCount,
          cleanerCount,
          scheduledDate,
          scheduledTime,
          specialInstructions: specialNotes,
          customQuoteAmount: customQuoteInput ? parseFloat(customQuoteInput) : 0
        })
      });
      const data = await res.json();

      setTimeout(() => {
        setIsProcessingPayment(false);
        if (data.success) {
          setPaymentSuccess(true);
          fetchBookings();
          setActiveBookingId(data.booking.id);
          setTimeout(() => {
            setShowStripeCheckoutModal(false);
            setPaymentSuccess(false);
            setActiveTab('execution');
            showAlert(`🎉 Stripe Payment Verified! Full 100% Upfront Payment (£${data.booking.total_amount.toFixed(2)}) paid. Booking Confirmed.`, 'success');
          }, 1500);
        } else {
          showAlert(`Stripe Payment Error: ${data.error || 'Payment authorization failed'}`, 'error');
        }
      }, 1200);
    } catch (e: any) {
      setIsProcessingPayment(false);
      showAlert(`Stripe Payment Exception: ${e.message}`, 'error');
    }
  };

  // Cleaner Stripe Connect Save Handler inside Modal
  const handleSaveStripeConnectModal = async () => {
    setIsSavingConnect(true);
    try {
      const res = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: cleanerUserId,
          returnUrl: window.location.origin
        })
      });
      const data = await res.json();
      setTimeout(() => {
        setIsSavingConnect(false);
        setShowStripeConnectModal(false);
        if (data.success) {
          showAlert(`🎉 Stripe Express Account connected! Payouts enabled for Sort Code ${sortCode}.`, 'success');
          fetchCleanerProfile();
        } else {
          showAlert(`Stripe Connect Error: ${data.error || 'Failed to connect Stripe account'}`, 'error');
        }
      }, 1000);
    } catch (e: any) {
      setIsSavingConnect(false);
      showAlert(`Stripe Connect Error: ${e.message}`, 'error');
    }
  };

  // Commercial Contract Request Handler
  const handleSaveContractModal = () => {
    setShowContractModal(false);
    showAlert(`Commercial Maintenance Contract requested for "${companyName}" (${cleaningFreq})! Our ops team will contact you.`, 'success');
  };

  const handlePayDbsFee = async () => {
    try {
      const res = await fetch('/api/cleaner/dbs-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: cleanerUserId, dbsProvider, simulateApproval: true })
      });
      const data = await res.json();
      if (data.success) {
        showAlert(data.message, 'success');
        fetchCleanerProfile();
      } else {
        showAlert(`DBS Payment Error: ${data.error || 'Payment failed'}`, 'error');
      }
    } catch (e: any) {
      showAlert(`DBS Payment Exception: ${e.message}`, 'error');
    }
  };

  const handleSaveCleanerRates = async () => {
    try {
      const res = await fetch('/api/cleaner/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: cleanerUserId,
          serviceRadiusMiles: serviceRadius,
          rates: rateCard,
          optInEmergency,
          optInAfterhours,
          optInQuotes,
          payoutFrequency: payoutFreq
        })
      });
      const data = await res.json();
      if (data.success) {
        showAlert('Cleaner profile & rates updated successfully!', 'success');
        fetchCleanerProfile();
      } else {
        showAlert(`Save Error: ${data.error || 'Failed to update rate card'}`, 'error');
      }
    } catch (e: any) {
      showAlert(`Rate Card Error: ${e.message}`, 'error');
    }
  };

  const handleSendChatMessage = async () => {
    if (!newChatMessage.trim()) return;
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: activeBookingId,
          senderId: 'usr_customer_1',
          senderRole: 'customer',
          senderName: customerName,
          message: newChatMessage
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewChatMessage('');
        fetchChatMessages(activeBookingId);
      } else {
        showAlert(`Chat Error: ${data.error || 'Chat failed to send'}`, 'error');
      }
    } catch (e: any) {
      showAlert(`Chat Exception: ${e.message}`, 'error');
    }
  };

  // Dedicated BEFORE Photo Upload Handler
  const handleUploadBeforePhoto = async (overrideUrl?: string) => {
    setPhotoErrorMsg(null);
    const targetUrl = (overrideUrl || beforePhotoUrl).trim();
    if (!targetUrl) {
      setPhotoErrorMsg('❌ Please enter a valid Before Photo URL or pick an image file!');
      showAlert('❌ Please enter a valid Before Photo URL or pick an image file!', 'error');
      return;
    }

    setIsUploadingBefore(true);
    try {
      const res = await fetch('/api/bookings/execution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: activeBookingId,
          action: 'upload_photos',
          role: 'cleaner',
          beforePhotos: [targetUrl],
          afterPhotos: []
        })
      });
      const data = await res.json();
      setIsUploadingBefore(false);

      if (data.success) {
        setBeforePhotoUrl('');
        showAlert('📸 "Before Clean" photo uploaded & saved successfully!', 'success');
        fetchBookings();
      } else {
        setPhotoErrorMsg(`Upload Failed: ${data.error || 'Failed to upload photo'}`);
        showAlert(`Photo Upload Error: ${data.error || 'Failed to upload photo'}`, 'error');
      }
    } catch (e: any) {
      setIsUploadingBefore(false);
      setPhotoErrorMsg(`Upload Error: ${e.message}`);
      showAlert(`Photo Upload Error: ${e.message}`, 'error');
    }
  };

  // Dedicated AFTER Photo Upload Handler
  const handleUploadAfterPhoto = async (overrideUrl?: string) => {
    setPhotoErrorMsg(null);
    const targetUrl = (overrideUrl || afterPhotoUrl).trim();
    if (!targetUrl) {
      setPhotoErrorMsg('❌ Please enter a valid After Photo URL or pick an image file!');
      showAlert('❌ Please enter a valid After Photo URL or pick an image file!', 'error');
      return;
    }

    setIsUploadingAfter(true);
    try {
      const res = await fetch('/api/bookings/execution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: activeBookingId,
          action: 'upload_photos',
          role: 'cleaner',
          beforePhotos: [],
          afterPhotos: [targetUrl]
        })
      });
      const data = await res.json();
      setIsUploadingAfter(false);

      if (data.success) {
        setAfterPhotoUrl('');
        showAlert('✨ "After Clean" photo uploaded & saved successfully!', 'success');
        fetchBookings();
      } else {
        setPhotoErrorMsg(`Upload Failed: ${data.error || 'Failed to upload photo'}`);
        showAlert(`Photo Upload Error: ${data.error || 'Failed to upload photo'}`, 'error');
      }
    } catch (e: any) {
      setIsUploadingAfter(false);
      setPhotoErrorMsg(`Upload Error: ${e.message}`);
      showAlert(`Photo Upload Error: ${e.message}`, 'error');
    }
  };

  // Delete Photo Handler
  const handleDeletePhoto = async (photoUrl: string, photoType: 'before' | 'after') => {
    try {
      const res = await fetch('/api/bookings/execution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: activeBookingId,
          action: 'delete_photo',
          photoUrl,
          photoType
        })
      });
      const data = await res.json();
      if (data.success) {
        if (enlargedPhotoUrl === photoUrl) setEnlargedPhotoUrl(null);
        showAlert(`🗑️ ${photoType === 'before' ? 'Before' : 'After'} clean photo removed successfully`, 'info');
        fetchBookings();
      } else {
        showAlert(`Delete Error: ${data.error || 'Failed to remove photo'}`, 'error');
      }
    } catch (e: any) {
      showAlert(`Delete Error: ${e.message}`, 'error');
    }
  };

  // Local File Picker Convert to Data URL and Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, photoType: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64DataUrl = event.target?.result as string;
      if (base64DataUrl) {
        if (photoType === 'before') {
          handleUploadBeforePhoto(base64DataUrl);
        } else {
          handleUploadAfterPhoto(base64DataUrl);
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleJobAction = async (action: 'start_job' | 'finish_job' | 'submit_review') => {
    try {
      const res = await fetch('/api/bookings/execution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: activeBookingId,
          action,
          role: 'customer',
          rating: reviewRating,
          comment: reviewComment
        })
      });
      const data = await res.json();
      if (data.success) {
        showAlert(`Action "${action.replace('_', ' ')}" executed successfully!`, 'success');
        fetchBookings();
      } else {
        showAlert(`Action Error: ${data.error || 'Failed to execute action'}`, 'error');
      }
    } catch (e: any) {
      showAlert(`Action Error: ${e.message}`, 'error');
    }
  };

  const handleCancelBooking = async (cancelledBy: 'customer' | 'cleaner') => {
    try {
      const res = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: activeBookingId,
          cancelledBy,
          cancellationReason: 'User initiated cancellation'
        })
      });
      const data = await res.json();
      if (data.success) {
        const evalRes = data.cancellationEvaluation;
        showAlert(`Cancelled: ${evalRes.explanation} (Refund: £${evalRes.refundAmount.toFixed(2)})`, 'info');
        fetchBookings();
      } else {
        showAlert(`Cancellation Error: ${data.error || 'Failed to cancel booking'}`, 'error');
      }
    } catch (e: any) {
      showAlert(`Cancellation Exception: ${e.message}`, 'error');
    }
  };

  // Simulator Calculation
  const evalSimCancellation = () => {
    const deposit = simJobTotal * 0.30;
    if (simIsEmergency) {
      return { refund: 0, penalty: simJobTotal, reason: 'Emergency jobs are non-refundable by default.' };
    }
    if (simHoursSinceBooking <= 2) {
      return { refund: simJobTotal, penalty: 0, reason: 'Cancelled within 2 hours of booking creation. 100% Free Refund.' };
    }
    if (simHoursUntilJob < 6) {
      return { refund: 0, penalty: simJobTotal, reason: 'Cancelled within 6 hours of cleaning start time. 0% Refund (100% kept).' };
    }
    return { refund: simJobTotal - deposit, penalty: deposit, reason: 'Cancelled after 2 hours of creation. 30% Deposit retained.' };
  };

  const simEval = evalSimCancellation();
  const currentBooking = allBookings.find(b => b.id === activeBookingId) || allBookings[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased mobile-nav-spacer">
      {/* Hidden File Picker Inputs */}
      <input
        type="file"
        ref={beforeFileInputRef}
        accept="image/*"
        onChange={(e) => handleFileChange(e, 'before')}
        className="hidden"
      />
      <input
        type="file"
        ref={afterFileInputRef}
        accept="image/*"
        onChange={(e) => handleFileChange(e, 'after')}
        className="hidden"
      />

      {/* Header Bar: Public Website vs Logged-In Web Application */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-slate-200/80 shadow-xs px-4 sm:px-6 py-3 sm:py-4 pt-[max(0.75rem,env(safe-area-inset-top))] flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => {
            if (isLoggedIn) {
              setActiveTab('customer');
            } else {
              setActiveTab('landing');
              setLandingSubTab('home');
            }
          }}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer hover:opacity-90 active:scale-95 transition-all group"
          title="DustBustars Platform"
        >
          <img
            src="/logo.png"
            alt="DustBustars Logo"
            className="h-10 sm:h-12 w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-all"
          />
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-[#0f1a38]">
              DustBustars
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Home, Commercial & Emergency Cleaning</p>
          </div>
        </div>

        {/* Public Website Navigation Bar (When NOT Logged In) */}
        {!isLoggedIn ? (
          <div className="flex items-center gap-3 sm:gap-6">
            <nav className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-700">
              <button 
                onClick={() => {
                  setActiveTab('landing');
                  setLandingSubTab('home');
                }} 
                className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  activeTab === 'landing' && landingSubTab === 'home' 
                    ? 'bg-slate-800 text-white shadow-xs' 
                    : 'hover:text-[#ff6b00]'
                }`}
              >
                Home
              </button>

              <button 
                onClick={() => {
                  setActiveTab('landing');
                  setLandingSubTab('how-it-works');
                }} 
                className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                  activeTab === 'landing' && landingSubTab === 'how-it-works' 
                    ? 'bg-slate-800 text-white shadow-xs' 
                    : 'hover:text-[#ff6b00]'
                }`}
              >
                How It Works
              </button>

              <button 
                onClick={() => {
                  setActiveTab('landing');
                  setLandingSubTab('pricing');
                }} 
                className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  activeTab === 'landing' && landingSubTab === 'pricing' 
                    ? 'bg-slate-800 text-white shadow-xs' 
                    : 'hover:text-[#ff6b00]'
                }`}
              >
                Pricing
              </button>

              <button 
                onClick={() => {
                  setActiveTab('landing');
                  setLandingSubTab('for-cleaners');
                }} 
                className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  activeTab === 'landing' && landingSubTab === 'for-cleaners' 
                    ? 'bg-slate-800 text-white shadow-xs' 
                    : 'hover:text-[#ff6b00]'
                }`}
              >
                For Cleaners
              </button>

              <button 
                onClick={() => {
                  setActiveTab('landing');
                  setLandingSubTab('about');
                }} 
                className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  activeTab === 'landing' && landingSubTab === 'about' 
                    ? 'bg-slate-800 text-white shadow-xs' 
                    : 'hover:text-[#ff6b00]'
                }`}
              >
                About
              </button>

              <button 
                onClick={() => {
                  setActiveTab('landing');
                  setLandingSubTab('faqs');
                }} 
                className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  activeTab === 'landing' && landingSubTab === 'faqs' 
                    ? 'bg-slate-800 text-white shadow-xs' 
                    : 'hover:text-[#ff6b00]'
                }`}
              >
                FAQs
              </button>

              <button 
                onClick={() => {
                  setActiveTab('landing');
                  setLandingSubTab('contact');
                }} 
                className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  activeTab === 'landing' && landingSubTab === 'contact' 
                    ? 'bg-slate-800 text-white shadow-xs' 
                    : 'hover:text-[#ff6b00]'
                }`}
              >
                Contact
              </button>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setAuthRole('customer');
                  setShowAuthModal(true);
                }}
                className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#ff6b00] hover:bg-[#e05e00] text-white font-black text-xs transition-all shadow-md shadow-orange-500/20 cursor-pointer active:scale-95"
              >
                Book a Cleaner
              </button>

              {/* Mobile Drawer Trigger */}
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setIsMobileMenuOpen(true);
                }}
                className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          /* Logged-In Web Application Navigation Bar */
          <div className="flex items-center gap-3">
            <nav className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
              {[
                { id: 'landing', label: 'Website Home', icon: Sparkles, color: 'from-slate-800 to-slate-950' },
                { id: 'customer', label: 'Customer Portal', icon: Building2, color: 'from-cyan-600 to-blue-600' },
                { id: 'cleaner', label: 'Cleaner Portal', icon: UserCheck, color: 'from-emerald-600 to-teal-600' },
                { id: 'pricing', label: 'Surge & Refunds Engine', icon: Zap, color: 'from-amber-600 to-orange-600' },
                { id: 'execution', label: 'Job Hub & Chat', icon: Clock, color: 'from-purple-600 to-pink-600' }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                      isActive 
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-sm` 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3 sm:pl-2 sm:border-l sm:border-slate-200">
              <span className="text-xs font-bold text-[#0f1a38] hidden lg:inline">
                👤 {currentUser?.full_name || (authRole === 'cleaner' ? 'Elena (Cleaner)' : 'James (Customer)')}
              </span>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('dustbustars_auth_token');
                    localStorage.removeItem('dustbustars_active_tab');
                  }
                  setIsLoggedIn(false);
                  setCurrentUser(null);
                  setActiveTab('landing');
                  setLandingSubTab('home');
                  showAlert('Signed out successfully. Returned to Home Landing Page.', 'info');
                }}
                className="hidden sm:flex px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs border border-rose-200 cursor-pointer active:scale-95 items-center gap-1.5 shadow-xs"
              >
                Sign Out 🚪
              </button>

              {/* Mobile Drawer Trigger for Logged-In User */}
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setIsMobileMenuOpen(true);
                }}
                className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
                aria-label="Open mobile menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Global Alert Banner with Enhanced Red Error Highlight */}
      {alertMsg && (
        <div className={`px-6 py-3 font-medium text-sm flex items-center justify-between border-b shadow-lg transition-all animate-fadeIn ${
          alertMsg.type === 'success' ? 'bg-emerald-950/95 border-emerald-600 text-emerald-200 shadow-emerald-950/50' :
          alertMsg.type === 'error' ? 'bg-rose-950/95 border-rose-600 text-rose-100 shadow-rose-950/50 font-bold' :
          'bg-cyan-950/95 border-cyan-600 text-cyan-200 shadow-cyan-950/50'
        }`}>
          <div className="flex items-center gap-3">
            {alertMsg.type === 'error' ? (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : alertMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-cyan-400 shrink-0" />
            )}
            <span>{alertMsg.text}</span>
          </div>
          <button 
            onClick={() => setAlertMsg(null)} 
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 cursor-pointer border border-slate-700"
          >
            Dismiss ✕
          </button>
        </div>
      )}

      {/* 1. PUBLIC FIGMA HOME LANDING PAGE (100% Full-Width Edge-to-Edge) */}
      {activeTab === 'landing' && (
        <div className="w-full space-y-0 text-slate-900 bg-slate-50 animate-fadeIn font-sans overflow-x-hidden">
          
          {/* ========================================================= */}
          {/* SUBPAGE 1: HOW DUSTBUSTARS WORKS (Figma Mockup) */}
          {/* ========================================================= */}
          {landingSubTab === 'how-it-works' ? (
            <div className="space-y-0 text-slate-900 bg-slate-50 animate-fadeIn font-sans">
              
              {/* Top Subpage Banner (Dark Navy #0b1736) */}
              <section className="w-full bg-[#0b1736] text-white px-6 py-16 md:py-20 border-b border-slate-800 text-center">
                <div className="max-w-4xl mx-auto space-y-4">
                  <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                    How DustBustars Works
                  </h1>
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
                    DustBustars is a marketplace connecting customers with vetted, DBS-checked independent cleaners across London.
                  </p>
                </div>
              </section>

              {/* Main Content Area */}
              <div className="max-w-4xl mx-auto px-6 py-16 space-y-16">
                
                {/* 1. FOR CUSTOMERS SECTION */}
                <section className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#ff6b00] text-white flex items-center justify-center shadow-md shadow-orange-500/20">
                      <Search className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-black text-[#0f1a38]">For Customers</h2>
                  </div>

                  <div className="space-y-4">
                    {[
                      { num: "1", title: "Search", desc: "Enter your postcode, select a cleaning type, and choose your preferred date and time." },
                      { num: "2", title: "Compare cleaners", desc: "Browse DBS-checked cleaner profiles, customer ratings, hourly rates, and postcode coverage." },
                      { num: "3", title: "Review the full price", desc: "Before booking, you will see the cleaner's hourly rate plus transparent 18.5% DustBustars service fee." },
                      { num: "4", title: "Complete the booking", desc: "Confirm your booking and your cleaner will arrive at the agreed time." },
                      { num: "5", title: "Leave a review", desc: "After the clean, rate your experience. Your feedback helps maintain a trusted platform." }
                    ].map((step, idx) => (
                      <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-start gap-4 hover:shadow-md transition-all">
                        <div className="w-9 h-9 rounded-full bg-[#0b1736] text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                          {step.num}
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-base font-extrabold text-[#0f1a38]">
                            {step.title}
                          </h3>
                          <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <button
                      onClick={() => {
                        setAuthRole('customer');
                        setShowAuthModal(true);
                      }}
                      className="px-8 py-3.5 rounded-xl bg-[#ff6b00] hover:bg-[#e05e00] text-white font-extrabold text-sm transition-all shadow-lg shadow-orange-500/20 cursor-pointer active:scale-95"
                    >
                      Book a Cleaner
                    </button>
                  </div>
                </section>

                {/* 2. FOR CLEANERS SECTION */}
                <section className="space-y-8 pt-6 border-t border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0b1736] text-white flex items-center justify-center shadow-md">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-black text-[#0f1a38]">For Cleaners</h2>
                  </div>

                  <div className="space-y-4">
                    {[
                      { num: "1", title: "Apply to join", desc: "Submit your application to become a DustBustars cleaner. All applicants must have the right to work." },
                      { num: "2", title: "Complete DBS and vetting", desc: "A valid DBS check is required before you can accept bookings. Identity checks are performed during onboarding." },
                      { num: "3", title: "Set your services, availability, and postcodes", desc: "Choose which cleaning types you offer, set your hourly price rates, and select your coverage. Your hourly rate is paid directly to your account." },
                      { num: "4", title: "Manage your availability", desc: "Control your schedule, set service radius, and opt-in to emergency call-out jobs directly from your profile." },
                      { num: "5", title: "Accept and complete bookings", desc: "Receive booking requests and perform cleaning services to high standards." },
                      { num: "6", title: "Receive reviews", desc: "Customers review your work. You can also review customers. Mutual trust protects everyone." }
                    ].map((step, idx) => (
                      <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-start gap-4 hover:shadow-md transition-all">
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 text-slate-800 font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                          {step.num}
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-base font-extrabold text-[#0f1a38]">
                            {step.title}
                          </h3>
                          <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <button
                      onClick={() => {
                        setAuthRole('cleaner');
                        setShowAuthModal(true);
                      }}
                      className="px-8 py-3.5 rounded-xl bg-[#0b1736] hover:bg-[#070f24] text-white font-extrabold text-sm transition-all shadow-lg shadow-slate-900/20 cursor-pointer active:scale-95"
                    >
                      Apply to Join as a Cleaner
                    </button>
                  </div>
                </section>

                {/* 3. ADDITIONAL FEATURES SECTION */}
                <section className="space-y-8 pt-6 border-t border-slate-200">
                  <h2 className="text-2xl font-black text-[#0f1a38]">Additional Features</h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1 */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
                      <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#ff6b00] flex items-center justify-center">
                        <Zap className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-extrabold text-[#0f1a38]">Emergency Call-out</h3>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        Customers can request urgent cleaning. Cleaners individually choose whether to accept emergency jobs. Emergency availability is shown on cleaner profiles.
                      </p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Star className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-extrabold text-[#0f1a38]">Mutual Reviews</h3>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        After every booking, customers can leave a 5-star review and comment. Cleaners can also review customers. Accountability works both ways on a trusted platform.
                      </p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                          Protected Rates
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-[#0f1a38]">Refund Safeguards</h3>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        In case of issues, platform policies apply to protect both booking schedules and cleaner cancellation rights. Transparency is key to customer trust.
                      </p>
                    </div>
                  </div>
                </section>

              </div>
            </div>
          ) : landingSubTab === 'pricing' ? (
            /* ========================================================= */
            /* SUBPAGE 2: TRANSPARENT PRICING (Figma Mockup) */
            /* ========================================================= */
            <div className="space-y-0 text-slate-900 bg-slate-50 animate-fadeIn font-sans">
              
              {/* Top Subpage Banner (Dark Navy #0b1736) */}
              <section className="w-full bg-[#0b1736] text-white px-6 py-16 md:py-20 border-b border-slate-800 text-center">
                <div className="max-w-4xl mx-auto space-y-4">
                  <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                    Transparent Pricing
                  </h1>
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
                    No hidden fees. The full price is always shown before you confirm a booking.
                  </p>
                </div>
              </section>

              {/* Main Content Area */}
              <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
                
                {/* 1. HOW PRICING WORKS ON DUSTBUSTARS */}
                <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-8">
                  <h2 className="text-2xl font-black text-[#0f1a38]">
                    How Pricing Works on DustBustars
                  </h2>

                  <div className="space-y-6">
                    {[
                      {
                        title: "Rates are set by cleaners",
                        desc: "Each cleaner's hourly rate is set by them and displayed on their profile. You can compare rates across cleaners before booking."
                      },
                      {
                        title: "Transparent 12.5% customer fee",
                        desc: "DustBustars adds a 12.5% fee on top of the cleaning subtotal. This is the only charge added by DustBustars. It is shown clearly on the checkout page before you confirm."
                      },
                      {
                        title: "No hidden charges",
                        desc: "The base rate and the 12.5% fee are the only costs. There are no booking fees, search fees, or additional platform charges."
                      },
                      {
                        title: "Full price before confirmation",
                        desc: "You will always see the complete breakdown — cleaner rate, hours, subtotal, 12.5% fee, and total — on the checkout page before you confirm."
                      }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-4">
                        <div className="w-6 h-6 rounded-full bg-orange-100 border border-orange-200 text-[#ff6b00] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          ✓
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-base font-extrabold text-[#0f1a38]">{item.title}</h3>
                          <p className="text-slate-600 text-xs md:text-sm leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. ILLUSTRATIVE PRICING EXAMPLE */}
                <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-6">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl font-black text-[#0f1a38]">
                      Illustrative Pricing Example
                    </h2>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      Example only
                    </span>
                  </div>

                  <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                    The following is a worked example to illustrate how the 12.5% commission is applied. Actual prices depend on the cleaner you choose and the duration you book.
                  </p>

                  {/* Worked Example Table / Line Items */}
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-4">
                    <div className="flex items-center justify-between text-xs md:text-sm py-1 border-b border-slate-200/60">
                      <span className="text-slate-600 font-medium">Cleaner hourly rate (example)</span>
                      <span className="font-bold text-[#0f1a38]">£17.00/hr</span>
                    </div>

                    <div className="flex items-center justify-between text-xs md:text-sm py-1 border-b border-slate-200/60">
                      <span className="text-slate-600 font-medium">Duration (example)</span>
                      <span className="font-bold text-[#0f1a38]">3 hours</span>
                    </div>

                    <div className="flex items-center justify-between text-xs md:text-sm py-1 border-b border-slate-200/60">
                      <span className="text-slate-600 font-medium">Cleaning subtotal</span>
                      <span className="font-bold text-[#0f1a38]">£51.00</span>
                    </div>

                    <div className="flex items-center justify-between text-xs md:text-sm py-1 border-b border-slate-200/60">
                      <span className="text-slate-600 font-medium">DustBustars customer fee (12.5%)</span>
                      <span className="font-bold text-[#0f1a38]">£6.38</span>
                    </div>

                    <div className="flex items-center justify-between text-sm md:text-base pt-2">
                      <span className="font-black text-[#0f1a38]">Customer total</span>
                      <span className="font-black text-xl text-[#0f1a38]">£57.38</span>
                    </div>
                  </div>

                  {/* Informational Footnote Box */}
                  <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-3 text-xs text-slate-600 leading-relaxed">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      i
                    </div>
                    <span>
                      All numbers in this example are illustrative. Actual costs depend on your selected cleaner's hourly rate and the duration of your booking. No other fees are charged.
                    </span>
                  </div>
                </div>

                {/* 3. READY TO FIND YOUR CLEANER BANNER (Dark Navy Card) */}
                <div className="bg-[#0b1736] text-white rounded-3xl p-10 text-center space-y-6 border border-slate-800 shadow-xl">
                  <h2 className="text-2xl md:text-3xl font-black text-white">
                    Ready to find your cleaner?
                  </h2>
                  <p className="text-slate-300 text-sm max-w-md mx-auto">
                    Compare prices and availability across London's independent cleaners.
                  </p>
                  <button
                    onClick={() => {
                      setAuthRole('customer');
                      setShowAuthModal(true);
                    }}
                    className="px-8 py-4 rounded-xl bg-[#ff6b00] hover:bg-[#e05e00] text-white font-extrabold text-sm transition-all shadow-xl shadow-orange-600/30 cursor-pointer active:scale-95 inline-block"
                  >
                    Book a Cleaner
                  </button>
                </div>

              </div>
            </div>
          ) : landingSubTab === 'for-cleaners' ? (
            /* ========================================================= */
            /* SUBPAGE 3: FOR CLEANERS (Figma Mockup) */
            /* ========================================================= */
            <div className="space-y-0 text-slate-900 bg-slate-50 animate-fadeIn font-sans">
              
              {/* Top Subpage Hero Banner (Dark Navy #0b1736) */}
              <section className="w-full bg-[#0b1736] text-white px-6 py-16 md:py-20 border-b border-slate-800 text-center">
                <div className="max-w-4xl mx-auto space-y-6">
                  <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                    Work as an Independent Cleaner in London
                  </h1>
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
                    DustBustars is a marketplace that connects vetted, DBS-checked independent cleaners with customers across London. Join to find new clients, control your availability and postcode coverage, and grow your reputation.
                  </p>
                  <div>
                    <button
                      onClick={() => {
                        setAuthRole('cleaner');
                        setShowAuthModal(true);
                      }}
                      className="px-8 py-4 rounded-xl bg-[#ff6b00] hover:bg-[#e05e00] text-white font-extrabold text-sm transition-all shadow-xl shadow-orange-600/30 cursor-pointer active:scale-95 inline-block"
                    >
                      Apply to Join
                    </button>
                  </div>
                </div>
              </section>

              {/* Main Content Area */}
              <div className="max-w-4xl mx-auto px-6 py-16 space-y-16">
                
                {/* 1. YOU'RE IN CONTROL SECTION */}
                <section className="space-y-8">
                  <h2 className="text-2xl font-black text-[#0f1a38]">
                    You're in control
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      {
                        icon: MapPin,
                        color: "bg-purple-100 text-purple-600",
                        title: "Work in your postcodes",
                        desc: "You choose which London postcodes you cover. You will only receive booking requests from customers in your selected areas."
                      },
                      {
                        icon: DollarSign,
                        color: "bg-emerald-100 text-emerald-600",
                        title: "Transparent hourly rates",
                        desc: "Hourly rates are set by DustBustars and shown clearly on your profile. Customers see the rate plus the 12.5% DustBustars fee before booking."
                      },
                      {
                        icon: Tag,
                        color: "bg-blue-100 text-blue-600",
                        title: "Choose your cleaning types",
                        desc: "Select the services you offer — standard domestic, deep cleaning, end-of-tenancy, Airbnb turnover, or office cleaning."
                      },
                      {
                        icon: Clock,
                        color: "bg-[#ff6b00]/10 text-[#ff6b00]",
                        title: "Manage your availability",
                        desc: "Set your working days and times, and control your minimum booking hours per session."
                      },
                      {
                        icon: Zap,
                        color: "bg-amber-100 text-amber-700",
                        title: "Choose emergency call-outs",
                        desc: "Opt in or out of emergency call-out requests at any time from your profile."
                      },
                      {
                        icon: Star,
                        color: "bg-yellow-100 text-yellow-700",
                        title: "Build your reputation",
                        desc: "Customer reviews on your public profile help you build credibility and attract new clients."
                      }
                    ].map((card, idx) => {
                      const IconComp = card.icon;
                      return (
                        <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3 hover:shadow-md transition-all">
                          <div className={`w-9 h-9 rounded-xl ${card.color} flex items-center justify-center`}>
                            <IconComp className="w-5 h-5" />
                          </div>
                          <h3 className="text-base font-extrabold text-[#0f1a38]">{card.title}</h3>
                          <p className="text-slate-600 text-xs leading-relaxed">{card.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* 2. DBS CHECK AND VETTING REQUIREMENTS SECTION */}
                <section className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-[#0f1a38]" />
                    </div>
                    <h3 className="text-xl font-black text-[#0f1a38]">
                      DBS Check and Vetting Requirements
                    </h3>
                  </div>

                  <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                    All cleaners on DustBustars must hold a valid DBS (Disclosure and Barring Service) check. This is a condition of joining the platform.
                  </p>

                  <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                    Liability insurance details are confirmed during onboarding.
                  </p>

                  <p className="text-slate-500 text-xs italic">
                    Placeholder content (Vetting Policy)
                  </p>
                </section>

                {/* 3. HOW TO JOIN SECTION */}
                <section className="space-y-8">
                  <h2 className="text-2xl font-black text-[#0f1a38]">
                    How to join
                  </h2>

                  <div className="space-y-4">
                    {[
                      { num: "1", title: "Apply online", desc: "Complete the application form with your experience and the services you offer. This form is a design placeholder." },
                      { num: "2", title: "DBS check and vetting", desc: "A valid DBS check is required before you can accept bookings. DustBustars will guide you through the process." },
                      { num: "3", title: "Set up your profile", desc: "Add your photo, biography, cleaning types, postcodes, and availability. Your hourly rate is assigned by DustBustars and shown on your profile." },
                      { num: "4", title: "Start receiving bookings", desc: "Once approved, you will appear in search results for customers in your postcodes." }
                    ].map((step, idx) => (
                      <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-start gap-4 hover:shadow-md transition-all">
                        <div className="w-9 h-9 rounded-full bg-[#ff6b00] text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20 mt-0.5">
                          {step.num}
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-base font-extrabold text-[#0f1a38]">
                            {step.title}
                          </h3>
                          <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 4. READY TO JOIN DUSTBUSTARS BANNER (Dark Navy Card) */}
                <div className="bg-[#0b1736] text-white rounded-3xl p-10 text-center space-y-6 border border-slate-800 shadow-xl">
                  <h2 className="text-2xl md:text-3xl font-black text-white">
                    Ready to join DustBustars?
                  </h2>
                  <p className="text-slate-300 text-sm max-w-md mx-auto">
                    Applications are reviewed before approval. A valid DBS check is required.
                  </p>
                  <div>
                    <button
                      onClick={() => {
                        setAuthRole('cleaner');
                        setShowAuthModal(true);
                      }}
                      className="px-8 py-4 rounded-xl bg-[#ff6b00] hover:bg-[#e05e00] text-white font-extrabold text-sm transition-all shadow-xl shadow-orange-600/30 cursor-pointer active:scale-95 inline-block"
                    >
                      Apply to Join
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={() => showAlert('Cleaner Agreement Policy: Independent contractor terms & transparent 12.5% fee structure.', 'info')}
                      className="text-slate-400 hover:text-white text-xs underline transition-all cursor-pointer"
                    >
                      View Cleaner Agreement
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ) : landingSubTab === 'about' ? (
            /* ========================================================= */
            /* SUBPAGE 4: ABOUT DUSTBUSTARS (Figma Mockup) */
            /* ========================================================= */
            <div className="space-y-0 text-slate-900 bg-slate-50 animate-fadeIn font-sans">
              
              {/* Top Subpage Hero Banner (Dark Navy #0b1736) */}
              <section className="w-full bg-[#0b1736] text-white px-6 py-16 md:py-20 border-b border-slate-800 text-center">
                <div className="max-w-4xl mx-auto space-y-4">
                  <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                    About DustBustars
                  </h1>
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
                    A London cleaning marketplace built on transparency and trust.
                  </p>
                </div>
              </section>

              {/* Main Content Area */}
              <div className="max-w-4xl mx-auto px-6 py-16 space-y-8">
                
                {/* 1. OUR STORY CARD */}
                <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-3">
                  <h2 className="text-2xl font-black text-[#0f1a38]">Our Story</h2>
                  <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                    DustBustars was founded in London to transform how homeowners, Airbnb hosts, and businesses connect with trusted, independent cleaners. We set out to eliminate hidden platform fees, provide fair rates for cleaners, and offer seamless online booking with DBS-checked verification.
                  </p>
                </div>

                {/* 2. OUR MISSION CARD */}
                <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-3">
                  <h2 className="text-2xl font-black text-[#0f1a38]">Our Mission</h2>
                  <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                    Our mission is to build London's most transparent and reliable cleaning marketplace — empowering independent cleaners to earn higher rates while giving customers complete peace of mind through DBS vetting, insurance protection, and upfront pricing.
                  </p>
                </div>

                {/* 3. LONDON AND BEYOND CARD */}
                <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-3">
                  <h2 className="text-2xl font-black text-[#0f1a38]">London and Beyond</h2>
                  <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                    Starting across central London postcodes (EC, WC, N, E, SE, SW, W, NW), DustBustars is expanding coverage across all 32 boroughs, connecting local communities with vetted cleaning professionals.
                  </p>
                </div>

                {/* 4. WHY A MARKETPLACE? CARD */}
                <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-3">
                  <h2 className="text-2xl font-black text-[#0f1a38]">Why a Marketplace?</h2>
                  <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                    Unlike traditional cleaning agencies that take massive cuts and control schedules, DustBustars operates as an open marketplace. Cleaners set their own hourly rates and working hours, while customers choose who enters their home based on real reviews, ratings, and DBS credentials.
                  </p>
                </div>

                {/* 5. HAVE A QUESTION? BANNER (Dark Navy Card) */}
                <div className="bg-[#0b1736] text-white rounded-3xl p-10 text-center space-y-6 border border-slate-800 shadow-xl mt-12">
                  <h2 className="text-2xl md:text-3xl font-black text-white">
                    Have a question?
                  </h2>
                  <p className="text-slate-300 text-sm max-w-md mx-auto">
                    We would love to hear from you.
                  </p>
                  <div>
                    <button
                      onClick={() => {
                        setActiveTab('landing');
                        setLandingSubTab('contact');
                      }}
                      className="px-8 py-4 rounded-xl bg-[#ff6b00] hover:bg-[#e05e00] text-white font-extrabold text-sm transition-all shadow-xl shadow-orange-600/30 cursor-pointer active:scale-95 inline-block"
                    >
                      Contact Us
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ) : landingSubTab === 'faqs' ? (
            /* ========================================================= */
            /* SUBPAGE 5: FREQUENTLY ASKED QUESTIONS (Figma Mockup) */
            /* ========================================================= */
            <div className="space-y-0 text-slate-900 bg-slate-50 animate-fadeIn font-sans">
              
              {/* Top Subpage Hero Banner (Dark Navy #0b1736) */}
              <section className="w-full bg-[#0b1736] text-white px-6 py-16 md:py-20 border-b border-slate-800 text-center">
                <div className="max-w-4xl mx-auto space-y-4">
                  <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                    Frequently Asked Questions
                  </h1>
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
                    Questions from customers and cleaners.
                  </p>
                </div>
              </section>

              {/* Main Content Area */}
              <div className="max-w-4xl mx-auto px-6 py-16 space-y-10">
                
                {/* Audience Tab Switcher Pills */}
                <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-xs max-w-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setFaqAudienceTab('customer');
                      setOpenFaqIndex(0);
                    }}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      faqAudienceTab === 'customer'
                        ? 'bg-[#0b1736] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    For Customers
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFaqAudienceTab('cleaner');
                      setOpenFaqIndex(0);
                    }}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      faqAudienceTab === 'cleaner'
                        ? 'bg-[#0b1736] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    For Cleaners
                  </button>
                </div>

                {/* FAQ Accordion Item List */}
                <div className="space-y-4">
                  {(faqAudienceTab === 'customer' ? [
                    {
                      q: "How do I find a cleaner?",
                      a: "Enter your London postcode on the home page or customer portal to instantly search available DBS-checked cleaners covering your area."
                    },
                    {
                      q: "How are cleaners vetted?",
                      a: "All cleaners undergo identity verification and must hold a valid DBS (Disclosure & Barring Service) check before accepting bookings."
                    },
                    {
                      q: "What does the 12.5% fee cover?",
                      a: "The 12.5% DustBustars service fee covers customer support, platform maintenance, secure payment processing, and insurance protection."
                    },
                    {
                      q: "Will I see the full price before I confirm?",
                      a: "Yes! You will always see an exact line-by-line price breakdown — cleaner hourly rate, hours, subtotal, and 12.5% fee — before confirming."
                    },
                    {
                      q: "Can I request an emergency clean?",
                      a: "Yes, you can toggle the emergency (<4h call-out) switch during search to filter cleaners available for immediate dispatch."
                    },
                    {
                      q: "Can I review my cleaner?",
                      a: "Yes! After every completed booking, you can leave a 5-star rating and detailed written review on the cleaner's public profile."
                    },
                    {
                      q: "What cleaning types are available?",
                      a: "Standard domestic cleaning, deep cleaning, end-of-tenancy, Airbnb turnover, office/retail cleaning, medical/clinical, and event cleaning."
                    },
                    {
                      q: "What is the cancellation policy?",
                      a: "Free 100% refund if cancelled within 2 hours of booking creation. Cancellations made >6h before start receive a full refund minus 30% deposit."
                    },
                    {
                      q: "What happens if I am unhappy with the clean?",
                      a: "If any issues arise, contact support within 24 hours with photos. Our admin resolution team will review and process re-cleans or partial refunds."
                    },
                    {
                      q: "Is Airbnb integration available?",
                      a: "Yes! We support automated checkout calendar syncing for Airbnb hosts in London to schedule turnover cleans effortlessly."
                    }
                  ] : [
                    {
                      q: "How do I join DustBustars?",
                      a: "Click 'Apply to Join as a Cleaner' on our website or cleaner portal, complete your profile details, submit your right to work documentation, and upload your valid DBS check certificate."
                    },
                    {
                      q: "Do I need a DBS check?",
                      a: "Yes. A valid DBS (Disclosure & Barring Service) check is a mandatory requirement for all independent cleaners operating on DustBustars."
                    },
                    {
                      q: "How is my hourly rate decided?",
                      a: "You are in full control! You set your own hourly rate per service type on your profile. Customers see your base rate plus the 12.5% DustBustars fee."
                    },
                    {
                      q: "How do I get paid?",
                      a: "Payouts are transferred automatically via Stripe Express UK directly into your bank account within 48 hours of job completion."
                    },
                    {
                      q: "Can I choose which postcodes I cover?",
                      a: "Yes! You select your exact London postcode coverage and service radius. You will only receive booking requests for properties in your chosen areas."
                    },
                    {
                      q: "Can I set my availability?",
                      a: "Yes. You control your working days, start times, and minimum booking hours per session from your Cleaner Portal calendar."
                    },
                    {
                      q: "Do I need liability insurance?",
                      a: "Yes, public liability insurance is required to protect both you and your clients. Details are verified during cleaner onboarding."
                    },
                    {
                      q: "Can I review customers?",
                      a: "Yes! Accountability works both ways on DustBustars. After completing a job, you can rate and review your customer experience."
                    },
                    {
                      q: "What happens if a customer cancels?",
                      a: "If a customer cancels within 6 hours of the job start time, you receive 100% of the cleaning fee as cancellation compensation."
                    }
                  ]).map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div
                        key={idx}
                        className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs transition-all cursor-pointer hover:shadow-md"
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <h3 className="text-base font-extrabold text-[#0f1a38]">
                            {faq.q}
                          </h3>
                          <div className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 transition-transform ${isOpen ? 'rotate-180 bg-orange-100 text-[#ff6b00]' : ''}`}>
                            <span className="text-sm font-bold">⌄</span>
                          </div>
                        </div>

                        {isOpen && (
                          <div className="pt-3 border-t border-slate-100 mt-3 text-xs md:text-sm text-slate-600 leading-relaxed animate-fadeIn">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
          ) : landingSubTab === 'contact' ? (
            /* ========================================================= */
            /* SUBPAGE 6: CONTACT US (Figma Mockup) */
            /* ========================================================= */
            <div className="space-y-0 text-slate-900 bg-slate-50 animate-fadeIn font-sans">
              
              {/* Top Subpage Hero Banner (Dark Navy #0b1736) */}
              <section className="w-full bg-[#0b1736] text-white px-6 py-16 md:py-20 border-b border-slate-800 text-center">
                <div className="max-w-4xl mx-auto space-y-4">
                  <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                    Contact Us
                  </h1>
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
                    Get in touch with the DustBustars team.
                  </p>
                </div>
              </section>

              {/* Main Content Area */}
              <div className="max-w-5xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Send a Message Form (7 Cols) */}
                  <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-6">
                    <h2 className="text-2xl font-black text-[#0f1a38]">
                      Send a Message
                    </h2>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setIsSubmittingContact(true);
                        setTimeout(() => {
                          setIsSubmittingContact(false);
                          showAlert('Message submitted successfully! Our London team will respond within 2 hours.', 'success');
                          setContactName('');
                          setContactEmail('');
                          setContactReason('');
                          setContactMessage('');
                        }, 1200);
                      }}
                      className="space-y-4 text-xs"
                    >
                      {/* Name & Email Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="font-extrabold text-slate-700 uppercase tracking-wider block mb-1">Name</label>
                          <input
                            type="text"
                            required
                            placeholder="Your name"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#ff6b00] focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="font-extrabold text-slate-700 uppercase tracking-wider block mb-1">Email</label>
                          <input
                            type="email"
                            required
                            placeholder="your@email.com"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#ff6b00] focus:bg-white"
                          />
                        </div>
                      </div>

                      {/* I AM A Field */}
                      <div>
                        <label className="font-extrabold text-slate-700 uppercase tracking-wider block mb-1">I AM A</label>
                        <select
                          value={contactRole}
                          onChange={(e) => setContactRole(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#ff6b00] focus:bg-white cursor-pointer"
                        >
                          <option value="Customer">Customer (Homeowner / Business)</option>
                          <option value="Cleaner">Independent Cleaner</option>
                          <option value="Cleaner Applicant">Cleaner Applicant</option>
                          <option value="Corporate / Partnership">Corporate / Partnership</option>
                        </select>
                      </div>

                      {/* REASON FOR CONTACT */}
                      <div>
                        <label className="font-extrabold text-slate-700 uppercase tracking-wider block mb-1">Reason for contact</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Booking inquiry, feedback, support"
                          value={contactReason}
                          onChange={(e) => setContactReason(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#ff6b00] focus:bg-white"
                        />
                      </div>

                      {/* MESSAGE */}
                      <div>
                        <label className="font-extrabold text-slate-700 uppercase tracking-wider block mb-1">Message</label>
                        <textarea
                          rows={5}
                          required
                          placeholder="Your message..."
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#ff6b00] focus:bg-white resize-y"
                        />
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmittingContact}
                        className="w-full py-4 rounded-xl bg-[#ff6b00] hover:bg-[#e05e00] text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-orange-500/20 cursor-pointer active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmittingContact ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            Submitting Message...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 text-white" />
                            Submit
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Right Column: Contact Details & For Cleaners Box (5 Cols) */}
                  <div className="lg:col-span-5 space-y-6">
                    
                    {/* Card 1: Contact Details */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                      <h3 className="text-xl font-black text-[#0f1a38]">
                        Contact Details
                      </h3>

                      <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                        <div>
                          <strong className="text-[#0f1a38] block">Email:</strong>
                          <span className="text-slate-600">ops@dustbustars.co.uk</span>
                        </div>

                        <div>
                          <strong className="text-[#0f1a38] block">Telephone:</strong>
                          <span className="text-slate-600">+44 20 7946 0912</span>
                        </div>

                        <div>
                          <strong className="text-[#0f1a38] block">Address:</strong>
                          <span className="text-slate-600">DustBustars UK Ops, Central London, EC1M 3HA</span>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: For Cleaners Box */}
                    <div className="bg-blue-50/60 rounded-3xl p-6 border border-blue-100 space-y-3">
                      <h4 className="text-base font-extrabold text-[#0f1a38]">
                        For Cleaners
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Interested in joining the DustBustars platform? Select "Cleaner Applicant" above or visit the{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('landing');
                            setLandingSubTab('for-cleaners');
                          }}
                          className="text-[#ff6b00] font-extrabold underline hover:text-[#e05e00] cursor-pointer"
                        >
                          For Cleaners
                        </button>{' '}
                        page.
                      </p>
                    </div>

                  </div>

                </div>
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* HOME LANDING PAGE VIEW */
            /* ========================================================= */
            <>
          {/* 1. HERO SECTION (Dark Navy #0b1736) */}
          <section className="w-full bg-[#0b1736] text-white px-6 py-16 md:py-24 border-b border-slate-800">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Left Column: Heading & CTA */}
                <div className="lg:col-span-7 space-y-6">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
                    Find trusted, DBS–checked cleaners across London.
                  </h1>
                  <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-xl">
                    Search, compare and book independent cleaners for your home, Airbnb property or small business with transparent pricing and flexible scheduling.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button
                      onClick={() => setActiveTab('customer')}
                      className="px-6 py-3.5 rounded-xl bg-[#ff6b00] hover:bg-[#e05e00] text-white font-extrabold text-sm transition-all shadow-xl shadow-orange-600/30 cursor-pointer active:scale-95 flex items-center gap-2"
                    >
                      Book a Cleaner
                    </button>
                    <button
                      onClick={() => {
                        const el = document.getElementById('how-it-works');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-bold text-sm border border-slate-700 transition-all cursor-pointer active:scale-95"
                    >
                      How It Works
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    Designed for Londoners, busy professionals, Airbnb hosts, and small businesses.
                  </p>
                </div>

                {/* Right Column: Floating Interactive "Find a Cleaner" Search Card */}
                <div className="lg:col-span-5">
                  <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-slate-900 space-y-4">
                    <h3 className="text-xl font-black text-slate-900">Find a Cleaner</h3>
                    
                    <div className="space-y-3 text-xs">
                      {/* Interactive Postcode Location Picker with Mini-Map & Autocomplete */}
                      <HeroLocationPicker
                        value={heroPostcode}
                        onChange={(postcode) => setHeroPostcode(postcode)}
                      />

                      {/* Cleaning Type */}
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Cleaning Type</label>
                        <select
                          value={heroType}
                          onChange={(e) => setHeroType(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-[#ff6b00]"
                        >
                          <option value="std_domestic">Standard Domestic Cleaning (£16/hr)</option>
                          <option value="deep_cleaning">Deep Cleaning (£22/hr)</option>
                          <option value="end_of_tenancy">End of Tenancy Clean (£35/room)</option>
                          <option value="airbnb">Airbnb Turnover Clean (£28/room)</option>
                          <option value="office_retail">Office & Retail Cleaning (£20/hr)</option>
                          <option value="medical_clinical">Medical / Clinical Clean (Custom Quote)</option>
                          <option value="events">Events & After-Party Clean (Custom Quote)</option>
                        </select>
                      </div>

                      {/* Date & Time */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Date</label>
                          <input
                            type="date"
                            value={heroDate}
                            onChange={(e) => setHeroDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-xs"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Time</label>
                          <input
                            type="time"
                            value={heroTime}
                            onChange={(e) => setHeroTime(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-xs"
                          />
                        </div>
                      </div>

                      {/* Emergency Switch */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50 border border-orange-100">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-[#ff6b00]" />
                          <span className="font-bold text-slate-800 text-xs">Emergency (&lt;4h call-out)</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={heroIsEmergency}
                          onChange={(e) => setHeroIsEmergency(e.target.checked)}
                          className="w-4 h-4 accent-[#ff6b00] cursor-pointer"
                        />
                      </div>

                      {/* Search Button */}
                      <button
                        onClick={() => {
                          setCleaningType(heroType);
                          setScheduledDate(heroDate);
                          setScheduledTime(heroTime);
                          
                          if (!isLoggedIn) {
                            showAlert('Please sign in or create an account to view available cleaners and complete your booking.', 'info');
                            setAuthRole('customer');
                            setPendingRedirectTab('customer');
                            setShowAuthModal(true);
                          } else {
                            setActiveTab('customer');
                          }
                        }}
                        className="w-full py-3.5 rounded-xl bg-[#ff6b00] hover:bg-[#e05e00] text-white font-extrabold text-sm transition-all shadow-lg shadow-orange-500/30 cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Search className="w-4 h-4" /> Search Cleaners
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. BUILT AROUND TRUST SECTION */}
            <section className="max-w-6xl mx-auto px-6 py-16 space-y-10">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <h2 className="text-3xl font-black text-[#0f1a38]">Built around trust</h2>
                <p className="text-slate-600 text-sm">Every cleaner on DustBustars is thoroughly vetted before listing on the platform.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: ShieldCheck, title: 'DBS Checked', desc: 'Every cleaner on DustBustars has completed a DBS background check before joining the platform.' },
                  { icon: Building2, title: 'Liability Insurance', desc: 'Cleaners on the platform carry liability insurance. Details are confirmed at onboarding.' },
                  { icon: DollarSign, title: 'Transparent Pricing', desc: 'You see the full price — including our 15% commission — before you confirm any booking.' },
                  { icon: Star, title: 'Mutual Reviews', desc: 'Customers review cleaners; cleaners review customers. Accountability works both ways.' }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3 hover:shadow-md transition-all">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0f1a38] flex items-center justify-center font-bold">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4 className="font-extrabold text-[#0f1a38] text-base">{item.title}</h4>
                      <p className="text-slate-600 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 3. HOW DUSTBUSTARS WORKS SECTION */}
            <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-16 space-y-10">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <h2 className="text-3xl font-black text-[#0f1a38]">How DustBustars Works</h2>
                <p className="text-slate-600 text-sm">Simple 4-step process from booking to a spotless home.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { step: '1', title: 'Enter your postcode and requirements', desc: 'Tell us your location, cleaning type, and preferred date and time.' },
                  { step: '2', title: 'Compare suitable cleaners', desc: 'Browse cleaner profiles, ratings, rates and availability in your area.' },
                  { step: '3', title: 'Review the full price before booking', desc: 'See the cleaner\'s rate plus the transparent 15% DustBustars commission before confirming.' },
                  { step: '4', title: 'Complete the clean and leave a review', desc: 'Your cleaner attends; both parties can leave a review to maintain trust on the platform.' }
                ].map((stepItem, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3 relative">
                    <div className="w-8 h-8 rounded-full bg-[#ff6b00] text-white font-black text-sm flex items-center justify-center">
                      {stepItem.step}
                    </div>
                    <h4 className="font-extrabold text-[#0f1a38] text-sm leading-snug">{stepItem.title}</h4>
                    <p className="text-slate-600 text-xs leading-relaxed">{stepItem.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. FEATURED CLEANERS SECTION */}
            <section className="max-w-6xl mx-auto px-6 py-16 space-y-10">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <h2 className="text-3xl font-black text-[#0f1a38]">Featured Cleaners</h2>
                <p className="text-slate-600 text-sm">Top-rated independent cleaners ready for instant booking.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { id: 'usr_cleaner_1', name: 'Elena Rostova', rating: 4.9, reviews: 128, rate: 16.00, postcodes: 'EC1, EC2, WC1, SW1', badge: 'Direct booking available' },
                  { id: 'usr_cleaner_2', name: 'Marcus Vance', rating: 4.8, reviews: 95, rate: 18.00, postcodes: 'E1, E2, E3, EC1', badge: 'Direct booking available' },
                  { id: 'usr_cleaner_3', name: 'Priya Sharma', rating: 5.0, reviews: 64, rate: 16.00, postcodes: 'N1, N2, N7, NW1', badge: 'Emergency available' }
                ].map((cleaner, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-700 text-xl border-2 border-slate-100 shadow-inner">
                        {cleaner.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-[#0f1a38] text-base">{cleaner.name}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold mt-0.5">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span>{cleaner.rating}</span>
                          <span className="text-slate-400 font-medium">({cleaner.reviews} reviews)</span>
                        </div>
                      </div>
                      <div className="text-[#0f1a38] font-black text-lg">
                        £{cleaner.rate.toFixed(2)}<span className="text-xs text-slate-500 font-medium">/hr</span>
                      </div>
                      <div className="text-xs text-slate-500 space-y-0.5">
                        <div>Postcodes: {cleaner.postcodes}</div>
                        <div className="text-[#ff6b00] font-bold text-[11px]">✓ {cleaner.badge}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedCleanerId(cleaner.id);
                        setBookingMode('direct_cleaner');
                        setActiveTab('customer');
                      }}
                      className="w-full py-2.5 rounded-xl bg-[#0f1a38] hover:bg-[#1a2954] text-white font-bold text-xs transition-all cursor-pointer active:scale-95"
                    >
                      View Profile
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-8">
                <PublicCoverageMap />
              </div>

              <div className="text-center pt-4">
                <button
                  onClick={() => setActiveTab('customer')}
                  className="px-8 py-3.5 rounded-xl bg-[#0f1a38] hover:bg-[#1a2954] text-white font-extrabold text-xs transition-all cursor-pointer active:scale-95 shadow-md"
                >
                  Search All Cleaners
                </button>
              </div>
            </section>

            {/* 5. WHO WE HELP SECTION */}
            <section className="max-w-6xl mx-auto px-6 py-16 space-y-10">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <h2 className="text-3xl font-black text-[#0f1a38]">Who We Help</h2>
                <p className="text-slate-600 text-sm">Tailored cleaning solutions across London.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: Building2, title: 'Homeowners', desc: 'Regular or one-off domestic cleaning tailored to your schedule.' },
                  { icon: Users, title: 'Busy Professionals', desc: 'Reliable weekly or fortnight cleans so you focus on what matters.' },
                  { icon: Sparkles, title: 'Airbnb Hosts', desc: 'Fast turn-around turnover cleans between guest check-ins.' },
                  { icon: Smartphone, title: 'Small Businesses', desc: 'Office and retail cleaning from independent professionals.' }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3 text-center">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0f1a38] mx-auto flex items-center justify-center font-bold">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4 className="font-extrabold text-[#0f1a38] text-base">{item.title}</h4>
                      <p className="text-slate-600 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 6. WHAT CUSTOMERS SAY SECTION */}
            <section className="max-w-6xl mx-auto px-6 py-16 space-y-10">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <h2 className="text-3xl font-black text-[#0f1a38]">What Customers Say</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { text: "DustBustars made finding a DBS-checked cleaner for our EC1 flat completely hassle-free. Elena was brilliant!", author: "David M.", location: "Islington" },
                  { text: "As an Airbnb host in Shoreditch, speed and reliability are everything. DustBustars turnover cleans never disappoint!", author: "Sophia T.", location: "Hackney" },
                  { text: "Transparent pricing with no hidden fees. I could see the exact deposit breakdown before confirming.", author: "Alexander R.", location: "Kensington" }
                ].map((rev, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-700 text-xs leading-relaxed italic">"{rev.text}"</p>
                    <div className="pt-2 text-xs font-bold text-[#0f1a38]">
                      {rev.author} <span className="text-slate-400 font-normal">— {rev.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 7. CLEANER RECRUITMENT CTA BANNER */}
            <section className="bg-[#0b1736] text-white px-6 py-16 border-t border-slate-800">
              <div className="max-w-4xl mx-auto text-center space-y-6">
                <h2 className="text-3xl md:text-4xl font-black text-white">
                  Are you an independent cleaner in London?
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed max-w-xl mx-auto">
                  Join DustBustars to find new customers, manage your availability and postcode coverage, and grow your reputation. DBS check and vetting required.
                </p>
                <button
                  onClick={() => setActiveTab('cleaner')}
                  className="px-8 py-4 rounded-xl bg-[#ff6b00] hover:bg-[#e05e00] text-white font-extrabold text-sm transition-all shadow-xl shadow-orange-600/30 cursor-pointer active:scale-95"
                >
                  Apply to Join as a Cleaner
                </button>
              </div>
            </section>

            </>
          )}

          {/* 8. SHARED FOOTER SECTION */}
          <footer className="bg-[#070f24] text-slate-400 text-xs px-6 py-12 border-t border-slate-900">
            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
              <div className="col-span-2 space-y-3">
                <div className="flex items-center gap-2 text-white font-black text-lg">
                  <img src="/logo.png" alt="DustBustars Logo" className="h-9 w-auto object-contain" />
                  DustBustars
                </div>
                <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
                  A London cleaning marketplace connecting homeowners and business with vetted, DBS-checked independent cleaners.
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-white uppercase text-[11px] tracking-wider mb-1">Services</div>
                <div><button onClick={() => { setAuthRole('customer'); setShowAuthModal(true); }} className="hover:text-white text-left cursor-pointer">Book a Cleaner</button></div>
                <div><button onClick={() => { setActiveTab('landing'); setLandingSubTab('how-it-works'); }} className="hover:text-white text-left cursor-pointer">How It Works</button></div>
                <div><button onClick={() => { setActiveTab('landing'); setLandingSubTab('pricing'); }} className="hover:text-white text-left cursor-pointer">Pricing</button></div>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-white uppercase text-[11px] tracking-wider mb-1">Support</div>
                <div><button onClick={() => { setActiveTab('landing'); setLandingSubTab('how-it-works'); }} className="hover:text-white text-left cursor-pointer">Trust & Safety</button></div>
                <div><button onClick={() => { setActiveTab('landing'); setLandingSubTab('faqs'); }} className="hover:text-white text-left cursor-pointer">FAQs</button></div>
                <div><button onClick={() => { setActiveTab('landing'); setLandingSubTab('contact'); }} className="hover:text-white text-left cursor-pointer">Contact</button></div>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-white uppercase text-[11px] tracking-wider mb-1">Company & Legal</div>
                <div><button onClick={() => { setActiveTab('landing'); setLandingSubTab('for-cleaners'); }} className="hover:text-white text-left cursor-pointer">For Cleaners</button></div>
                <div><button onClick={() => showAlert('Terms & Conditions: Transparent 12.5% platform fee, DBS verification requirement for all cleaners, 48h payout terms via Stripe Express.', 'info')} className="hover:text-white text-left cursor-pointer">Terms & Conditions</button></div>
                <div><button onClick={() => showAlert('Privacy Policy: GDPR compliant. Passwords stored securely with scrypt hashing + salt, user data encrypted in MongoDB Atlas.', 'info')} className="hover:text-white text-left cursor-pointer">Privacy Policy</button></div>
              </div>
            </div>

            <div className="max-w-6xl mx-auto pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
              <div>© 2026 DustBustars. Marketplace for independent cleaning professionals.</div>
              <div className="flex items-center gap-4">
                <span>Privacy Policy</span>
                <span>Terms of Service</span>
                <span>Cookie Settings</span>
              </div>
            </div>
          </footer>

        </div>
      )}

      {/* 2. LOGGED-IN APPLICATION DASHBOARD PORTALS */}
      {activeTab !== 'landing' && (
        <main className="max-w-7xl mx-auto p-6 space-y-8">
          {/* TAB 1: CUSTOMER PORTAL */}
          {activeTab === 'customer' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Step 1 Header Banner */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-cyan-50 text-cyan-800 border border-cyan-200 uppercase tracking-wider">
                  Customer Onboarding & Booking
                </span>
                <h2 className="text-2xl font-black text-[#0f1a38] mt-2">Book Your Clean in Minutes</h2>
                <p className="text-slate-600 text-sm mt-1">No ID document required for customers! Simply verify your phone/email.</p>
              </div>

              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-[#0f1a38]">{customerName}</div>
                  <div className="text-xs text-emerald-700 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Phone Verified (+44 7700 900004)
                  </div>
                </div>
              </div>
            </div>

            {/* Grid Layout: Property Manager & Booking Engine */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Properties */}
              <div className="lg:col-span-5 space-y-6">
                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6 text-slate-900">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-[#0f1a38] flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-cyan-600" />
                      Your Properties
                    </h3>
                    <span className="text-xs font-bold text-slate-500">{properties.length} Registered</span>
                  </div>

                  {/* List of Existing Properties */}
                  <div className="space-y-3">
                    {properties.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPropertyId(p.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer active:scale-[0.98] ${
                          selectedPropertyId === p.id 
                            ? 'bg-cyan-50/80 border-cyan-500 shadow-sm' 
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm text-[#0f1a38] flex items-center gap-2">
                            {selectedPropertyId === p.id && <CheckSquare className="w-4 h-4 text-cyan-600" />}
                            {p.name}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-cyan-800 border border-slate-300">
                            {p.property_type}
                          </span>
                        </div>
                        {p.other_description && (
                          <p className="text-xs text-slate-600 mt-2 bg-slate-100 p-2.5 rounded-xl border border-slate-200 italic">
                            &quot;{p.other_description}&quot;
                          </p>
                        )}
                        <div className="text-xs text-slate-500 mt-2 flex items-center gap-3 font-semibold">
                          {p.bedrooms_count && <span>🛏️ {p.bedrooms_count} Beds</span>}
                          {p.bathrooms_count && <span>🚿 {p.bathrooms_count} Baths</span>}
                          {p.sqft_area && <span>📏 {p.sqft_area} sqft</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Interactive Property Location Selector Map */}
                  <div className="pt-3 border-t border-slate-200">
                    <CustomerPropertyLocationPicker
                      selectedPostcode={heroPostcode}
                      onPostcodeChange={(postcode) => setHeroPostcode(postcode)}
                      propertyName={properties.find(p => p.id === selectedPropertyId)?.name || 'EC1 Penthouse'}
                    />
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-500">Quick Property Presets:</span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'EC1 Penthouse', type: 'flat' },
                        { label: 'Highbury House', type: 'house' },
                        { label: 'City Office 4B', type: 'office' },
                        { label: 'Catering Trailer (OTHER)', type: 'other', desc: 'Commercial mobile catering unit needing degreasing.' }
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setNewPropName(preset.label);
                            setNewPropType(preset.type as any);
                            if (preset.desc) setNewPropOtherDesc(preset.desc);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[11px] text-slate-800 font-bold transition-all cursor-pointer"
                        >
                          + {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Add Property Form */}
                  <div className="pt-4 border-t border-slate-200 space-y-4">
                    <h4 className="text-sm font-extrabold text-[#0f1a38]">Add New Property</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1">Property Type</label>
                        <div className="grid grid-cols-4 gap-2">
                          {(['house', 'flat', 'office', 'other'] as const).map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setNewPropType(type)}
                              className={`py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider border transition-all cursor-pointer ${
                                newPropType === type 
                                  ? 'bg-cyan-600 text-white border-cyan-600' 
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1">Property Name / Label</label>
                        <input
                          type="text"
                          placeholder="e.g. EC1 Penthouse, City Office 4B"
                          value={newPropName}
                          onChange={(e) => setNewPropName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:border-[#ff6b00]"
                        />
                      </div>

                      {newPropType === 'other' && (
                        <div>
                          <label className="text-xs font-bold text-cyan-800 block mb-1">
                            Description Required for OTHER (Residential/Commercial Space, Car, Furniture, etc.)
                          </label>
                          <textarea
                            placeholder="Provide full description of the special space/item to clean..."
                            value={newPropOtherDesc}
                            onChange={(e) => setNewPropOtherDesc(e.target.value)}
                            rows={3}
                            className="w-full bg-slate-50 border border-cyan-300 rounded-xl p-3 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#ff6b00]"
                          />
                        </div>
                      )}

                      <button
                        onClick={handleAddProperty}
                        className="w-full py-3 rounded-xl bg-[#ff6b00] hover:bg-[#e05e00] active:scale-95 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-orange-500/20"
                      >
                        <Plus className="w-4 h-4 text-white font-bold" /> Add Property Now
                      </button>
                    </div>
                  </div>
                </div>

                {/* My Active & Emergency Bookings List Card */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 text-slate-900">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-[#0f1a38] flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#ff6b00]" />
                      My Active & Emergency Bookings
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300">
                      {allBookings.length} Active
                    </span>
                  </div>

                  <div className="space-y-3">
                    {allBookings.map((bk) => (
                      <div 
                        key={bk.id}
                        onClick={() => {
                          setActiveBookingId(bk.id);
                          setActiveTab('execution');
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 hover:border-[#ff6b00] ${
                          activeBookingId === bk.id 
                            ? 'bg-slate-50 border-[#ff6b00] shadow-2xs' 
                            : 'bg-slate-50/60 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-[#0f1a38] font-mono">{bk.id}</span>
                          {bk.is_emergency ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-800 font-extrabold border border-rose-300 flex items-center gap-1">
                              <Zap className="w-3 h-3 fill-rose-600 text-rose-600" />
                              EMERGENCY BOOKING
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-300">
                              Standard Booking
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-700 font-semibold flex items-center justify-between">
                          <span className="capitalize">{bk.cleaning_type.replace(/_/g, ' ')} ({bk.cleaner_count || 1} Cleaner{bk.cleaner_count > 1 ? 's' : ''})</span>
                          <span className="font-black text-[#ff6b00]">£{(bk.final_total || bk.total_amount || 0).toFixed(2)}</span>
                        </div>

                        <div className="text-[11px] text-slate-500 flex items-center justify-between font-medium">
                          <span>Scheduled: {bk.scheduled_date} at {bk.scheduled_time || bk.scheduled_start_time}</span>
                          <span className="text-blue-700 font-bold hover:underline">View Live Job Hub ↗</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Booking Engine */}
              <div className="lg:col-span-7 space-y-6">
                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6 text-slate-900">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-[#0f1a38] flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#ff6b00]" />
                      Configure Cleaning Job
                    </h3>
                    <span className="text-xs font-bold text-orange-800 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                      Step 2 of 2
                    </span>
                  </div>

                  {/* Cleaning Category Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600">1. Cleaning Category</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { key: 'residential', label: 'Residential', icon: '🏡' },
                        { key: 'commercial', label: 'Commercial*', icon: '🏢' },
                        { key: 'other', label: 'OTHER (Specialized)', icon: '✨' }
                      ].map((cat) => (
                        <button
                          key={cat.key}
                          onClick={() => {
                            setCleaningCategory(cat.key as any);
                            if (cat.key === 'commercial') setCleaningType('office_retail');
                            else if (cat.key === 'other') setCleaningType('other_specialized');
                            else setCleaningType('std_domestic');
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer active:scale-95 ${
                            cleaningCategory === cat.key 
                              ? 'bg-[#0b1736] text-white border-[#0b1736] shadow-sm' 
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="text-xl mb-1">{cat.icon}</div>
                          <div className="text-sm font-extrabold">{cat.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Commercial Contract Warning Callout */}
                  {cleaningCategory === 'commercial' && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                      <div className="font-bold flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-amber-900 font-extrabold">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          Commercial Cleaning Contract Notice
                        </span>
                        <button
                          onClick={() => setShowContractModal(true)}
                          className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-extrabold text-[11px] hover:bg-amber-700 transition-all cursor-pointer"
                        >
                          Request Corporate Contract ↗
                        </button>
                      </div>
                      <p className="text-slate-700">For all commercial bookings (offices, schools, clinics, events), we can set up ongoing maintenance contracts for discounted recurring rates.</p>
                    </div>
                  )}

                  {/* Specific Cleaning Type Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600">2. Select Cleaning Type & Pricing Model</label>
                    <select
                      value={cleaningType}
                      onChange={(e) => setCleaningType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:border-[#ff6b00] cursor-pointer"
                    >
                      {cleaningCategory === 'residential' && (
                        <>
                          <option value="std_domestic">Standard Domestic Cleaning (Charged Per Hour)</option>
                          <option value="deep_clean">Deep Cleaning (Charged Per Hour)</option>
                          <option value="end_of_tenancy">End of Tenancy (Charged Per Room)</option>
                          <option value="end_of_tenancy_removal">End of Tenancy Removal (Quote Required)</option>
                          <option value="airbnb">Airbnb Turnover (Charged Per Room)</option>
                        </>
                      )}
                      {cleaningCategory === 'commercial' && (
                        <>
                          <option value="office_retail">Normal Office / Retail Space (Charged Per Hour)</option>
                          <option value="educational">Educational Facility (Charged Per Hour)</option>
                          <option value="medical_clinical">Medical / Clinical Facility (Quote Required)</option>
                          <option value="events">Event Venue Cleaning (Quote Required)</option>
                        </>
                      )}
                      {cleaningCategory === 'other' && (
                        <>
                          <option value="other_specialized">Any OTHER Specialized Cleaning (Quote Required)</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Quantity & Cleaner Count Controls */}
                  {livePricing.isQuote ? (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-amber-800">Enter Your Preferred Quote Budget (£)</label>
                      <input
                        type="number"
                        placeholder="e.g. 150.00"
                        value={customQuoteInput}
                        onChange={(e) => setCustomQuoteInput(e.target.value)}
                        className="w-full bg-slate-50 border border-amber-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:border-[#ff6b00]"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Duration / Rooms */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600">
                          {['end_of_tenancy', 'airbnb'].includes(cleaningType) ? 'Number of Rooms' : 'Duration (Hours)'}
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setUnitsCount(Math.max(1, unitsCount - 1))}
                            className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 font-extrabold text-base text-slate-800 hover:bg-slate-200 cursor-pointer active:scale-95"
                          >
                            -
                          </button>
                          <span className="text-base font-black w-8 text-center text-[#0f1a38]">{unitsCount}</span>
                          <button
                            type="button"
                            onClick={() => setUnitsCount(unitsCount + 1)}
                            className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 font-extrabold text-base text-slate-800 hover:bg-slate-200 cursor-pointer active:scale-95"
                          >
                            +
                          </button>
                          <span className="text-[11px] text-slate-600 font-bold">
                            @ £{livePricing.unitRate.toFixed(2)}/{['end_of_tenancy', 'airbnb'].includes(cleaningType) ? 'rm' : 'hr'}
                          </span>
                        </div>
                      </div>

                      {/* Number of Cleaners Selector (Rule 5 & 3) */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 flex items-center justify-between">
                          <span>Number of Cleaners</span>
                          <span className="text-[10px] text-blue-700 font-extrabold">Fee stays 12.5%</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setCleanerCount(Math.max(1, cleanerCount - 1))}
                            className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 font-extrabold text-base text-slate-800 hover:bg-slate-200 cursor-pointer active:scale-95"
                          >
                            -
                          </button>
                          <span className="text-base font-black w-8 text-center text-[#0f1a38]">{cleanerCount}</span>
                          <button
                            type="button"
                            onClick={() => setCleanerCount(cleanerCount + 1)}
                            className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 font-extrabold text-base text-slate-800 hover:bg-slate-200 cursor-pointer active:scale-95"
                          >
                            +
                          </button>
                          <span className="text-[11px] text-slate-600 font-bold">
                            {cleanerCount > 1 ? `${cleanerCount} Cleaners Team` : '1 Cleaner'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Date & Start Time Selector */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">Scheduled Date</label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:border-[#ff6b00] cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">Start Time</label>
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:border-[#ff6b00] cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Logged-In Emergency Express Call-out Toggle */}
                  <div className={`p-4 rounded-2xl border transition-all space-y-2 ${
                    heroIsEmergency 
                      ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-2xs' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={heroIsEmergency}
                          onChange={(e) => setHeroIsEmergency(e.target.checked)}
                          className="w-4 h-4 accent-rose-600 cursor-pointer"
                        />
                        <span className="font-extrabold text-xs text-[#0f1a38] flex items-center gap-1.5">
                          <Zap className={`w-4 h-4 ${heroIsEmergency ? 'text-rose-600 fill-rose-600' : 'text-amber-500'}`} />
                          Emergency Express Booking (&lt;4h / &lt;2h Priority Callout)
                        </span>
                      </label>
                      {heroIsEmergency && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white uppercase tracking-wider">
                          ⚡ Emergency Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium pl-6">
                      Need urgent cleaning? Toggle Emergency mode for rapid cleaner dispatch within 2-4 hours (+£5/hr per cleaner surcharge & 15% platform fee).
                    </p>
                  </div>

                  {/* Booking Mode Selector */}
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-bold text-slate-600">3. Booking Route</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setBookingMode('calendar_post')}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer active:scale-95 ${
                          bookingMode === 'calendar_post' 
                            ? 'bg-[#0b1736] text-white border-[#0b1736]' 
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-extrabold text-sm flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#ff6b00]" />
                          Post Job to Calendar
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Available cleaners nearby can view and accept your job.</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBookingMode('direct_cleaner')}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer active:scale-95 ${
                          bookingMode === 'direct_cleaner' 
                            ? 'bg-[#0b1736] text-white border-[#0b1736]' 
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-extrabold text-sm flex items-center gap-2">
                          <Search className="w-4 h-4 text-[#ff6b00]" />
                          Search & Book Cleaner Directly
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Choose top-rated cleaner(s) from your favorites or search list.</p>
                      </button>
                    </div>
                  </div>

                  {/* Direct Cleaner / Multi-Cleaner Team Selection Cards */}
                  {bookingMode === 'direct_cleaner' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-600">
                          {cleanerCount > 1 ? `Selected Cleaners Team (${cleanerCount} Cleaners Assigned)` : 'Selected Cleaner (1 Cleaner)'}
                        </label>
                        <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          ✓ DBS Verified Team
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {availableCleanersPool.slice(0, Math.min(cleanerCount, availableCleanersPool.length)).map((cl, idx) => (
                          <div 
                            key={cl.id}
                            onClick={() => setSelectedCleanerId(cl.id)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                              selectedCleanerId === cl.id || idx === 0
                                ? 'bg-slate-50 border-[#ff6b00] shadow-2xs' 
                                : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                              <span className="font-extrabold text-[#0f1a38] flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-200 text-slate-800 font-extrabold">
                                  {cleanerCount > 1 ? `${cl.roleLabel}` : 'Selected Cleaner'}
                                </span>
                                {cl.name}
                              </span>
                              <span className="text-emerald-700 font-extrabold">{cl.distance}</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <img
                                src={cl.avatar}
                                alt={cl.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shrink-0"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 font-black text-xs text-[#0f1a38]">
                                  <span>{cl.name}</span>
                                  <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-300">
                                    DBS Verified ✓
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-slate-600 mt-0.5 font-bold">
                                  <span className="flex items-center text-amber-600">★ {cl.rating} ({cl.jobs} jobs)</span>
                                  <span>• {cl.coverage}</span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (favorites.includes(cl.id)) {
                                    setFavorites(favorites.filter(f => f !== cl.id));
                                    showAlert(`Removed ${cl.name} from Favorites`, 'info');
                                  } else {
                                    setFavorites([...favorites, cl.id]);
                                    showAlert(`Added ${cl.name} to Favorites for future bookings!`, 'success');
                                  }
                                }}
                                className="p-2 rounded-xl bg-white border border-slate-200 hover:border-pink-500 transition-all text-pink-600 cursor-pointer active:scale-95"
                              >
                                <Heart className={`w-4 h-4 ${favorites.includes(cl.id) ? 'fill-pink-500 text-pink-500' : ''}`} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Emergency Express Callout Banner */}
                  {livePricing.isEmergency && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 text-white text-xs font-bold flex items-center justify-between shadow-md">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 fill-white shrink-0" />
                        <span>⚡ EMERGENCY EXPRESS DISPATCH APPLIED (+£5/hr per cleaner surcharge)</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-white/20 text-[10px] uppercase font-black">Priority 1</span>
                    </div>
                  )}

                  {/* Checkout & Price Summary Card */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-slate-900">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 font-semibold">
                        Base Clean Price ({livePricing.cleanerCount} {livePricing.cleanerCount === 1 ? 'Cleaner' : 'Cleaners'} × {unitsCount} hrs)
                      </span>
                      <span className="font-extrabold text-[#0f1a38]">£{livePricing.baseTotal.toFixed(2)}</span>
                    </div>

                    {livePricing.emergencySurcharge > 0 && (
                      <div className="flex items-center justify-between text-sm text-rose-700 font-bold">
                        <span>Emergency Surcharge (£5/hr × {livePricing.cleanerCount} cleaner{livePricing.cleanerCount > 1 ? 's' : ''})</span>
                        <span>+£{livePricing.emergencySurcharge.toFixed(2)}</span>
                      </div>
                    )}

                    {livePricing.surgeBonus > 0 && (
                      <div className="flex items-center justify-between text-sm text-amber-700 font-bold">
                        <span>Afterhours Bonus (10%)</span>
                        <span>+£{livePricing.surgeBonus.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 font-semibold">
                        Platform Fee ({livePricing.isEmergency ? '15% Emergency' : '12.5% Standard'})
                      </span>
                      <span className="font-extrabold text-[#0f1a38]">£{livePricing.platformComm.toFixed(2)}</span>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-base font-black">
                      <span className="text-[#0f1a38]">Total Price</span>
                      <span className="text-[#ff6b00] text-xl">£{livePricing.finalTotal.toFixed(2)}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-slate-700 flex items-center justify-between font-medium">
                      <span>100% Upfront Payment Required:</span>
                      <span className="font-extrabold text-blue-900">£{livePricing.deposit.toFixed(2)}</span>
                    </div>

                    <button
                      onClick={() => setShowStripeCheckoutModal(true)}
                      className="w-full py-4 rounded-xl bg-[#ff6b00] hover:bg-[#e05e00] active:scale-95 text-white font-black text-sm transition-all shadow-lg shadow-orange-500/20 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-5 h-5 text-white" />
                      Proceed to Secure Stripe Checkout (£{livePricing.deposit.toFixed(2)})
                    </button>
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: CLEANER PORTAL */}
        {activeTab === 'cleaner' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Cleaner Header Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/60 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                  Cleaner Profile & Verification Hub
                </span>
                <h2 className="text-2xl font-bold mt-2">Manage Your Services, DBS & Rates</h2>
                <p className="text-slate-400 text-sm mt-1">Set custom rates per cleaning type, service radius, and opt-in to emergency call-outs.</p>
              </div>

              <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
                  alt="Cleaner Avatar"
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400"
                />
                <div>
                  <div className="text-sm font-semibold">Elena Rostova</div>
                  <div className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> DBS Approved ({cleanerProfile?.dbs_provider || 'uCheck'})
                  </div>
                </div>
              </div>
            </div>

            {/* Incoming Emergency Callouts & Priority Dispatch Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950/70 to-slate-900 border border-rose-800/60 shadow-xl space-y-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-rose-600/30 border border-rose-500/50 text-white">
                    <Zap className="w-6 h-6 text-rose-400 fill-rose-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      Incoming Emergency Callouts & Priority Dispatch
                      <span className="px-2 py-0.5 rounded text-[10px] bg-rose-600 text-white font-extrabold uppercase">Live Hub</span>
                    </h3>
                    <p className="text-xs text-rose-200 mt-0.5">High-priority emergency jobs within your 5-mile service radius (+10% Surge Pay Bonus)</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white border border-rose-400 uppercase tracking-wider">
                  ⚡ 1 Emergency Call-out Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {allBookings.filter(b => b.is_emergency || b.id === 'bk_demo_102').map((emBk) => (
                  <div key={emBk.id} className="p-4 rounded-2xl bg-slate-950/80 border border-rose-800/80 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-rose-300">{emBk.id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-rose-600 text-white font-extrabold uppercase">
                        ⚡ EMERGENCY (&lt;2h EXPRESS)
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="font-extrabold text-sm text-white capitalize">{emBk.cleaning_type.replace(/_/g, ' ')} ({emBk.cleaner_count || 3} Cleaners Required)</div>
                      <div className="text-xs text-slate-300 font-medium">EC1M 3HA (Highbury House) • Scheduled {emBk.scheduled_date} at {emBk.scheduled_time || emBk.scheduled_start_time || '16:30'}</div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Estimated Cleaner Payout:</span>
                        <span className="font-extrabold text-emerald-400 text-sm">£{(emBk.final_total ? emBk.final_total * 0.85 : 198.82).toFixed(2)}</span>
                      </div>

                      <button
                        onClick={() => {
                          setActiveBookingId(emBk.id);
                          setActiveTab('execution');
                          showAlert(`Accepted Emergency Callout (${emBk.id})! Dispatched team to location.`, 'success');
                        }}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs transition-all shadow-md shadow-rose-600/30 cursor-pointer active:scale-95"
                      >
                        Accept Emergency Job ⚡
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cleaner Settings Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: ID, DBS & Stripe Connect */}
              <div className="lg:col-span-5 space-y-6">

                {/* Stripe Connect Express Account Integration Card */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 text-slate-900">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black flex items-center gap-2 text-[#0f1a38]">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                      Stripe Connect Payout Account
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-300 uppercase">
                      Stripe Express
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    Connect your bank account via Stripe Connect Express to receive automated 48-hour or weekly payout transfers.
                  </p>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-semibold">Stripe Account ID:</span>
                      <span className="font-mono text-purple-700 font-bold">
                        {cleanerProfile?.stripe_account_id || 'acct_mock_elena_123'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-semibold">Payout Status:</span>
                      <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Enabled (48h Schedule)
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowStripeConnectModal(true)}
                    className="w-full py-3 rounded-xl bg-purple-700 hover:bg-purple-800 active:scale-95 text-white font-extrabold text-xs transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-white" /> Connect Bank Account with Stripe Express Modal
                  </button>
                </div>
                
                {/* ID & Photo Proof */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 text-slate-900">
                  <h3 className="text-base font-black flex items-center gap-2 text-[#0f1a38]">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    1. ID Document & Selfie Verification
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                      <FileText className="w-6 h-6 text-cyan-600 mx-auto" />
                      <span className="block font-extrabold text-slate-800">Passport / ID Uploaded</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-300">Verified ✓</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                      <Camera className="w-6 h-6 text-purple-600 mx-auto" />
                      <span className="block font-extrabold text-slate-800">Selfie Match Uploaded</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-300">Verified ✓</span>
                    </div>
                  </div>
                </div>

                {/* DBS Check & Provider Selection */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 text-slate-900">
                  <h3 className="text-base font-black flex items-center gap-2 text-[#0f1a38]">
                    <Award className="w-5 h-5 text-emerald-600" />
                    2. DBS Background Check & Fee Payment
                  </h3>
                  
                  <p className="text-xs text-slate-600">
                    Cleaners cover the standard DBS background check fee (£23.00) during onboarding via your preferred provider.
                  </p>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-600">Select DBS Provider</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'ucheck', label: 'uCheck DBS', desc: 'Fast digital processing' },
                        { key: 'first_advantage', label: 'First Advantage', desc: 'Global background checks' }
                      ].map((prov) => (
                        <button
                          key={prov.key}
                          type="button"
                          onClick={() => setDbsProvider(prov.key as any)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer active:scale-95 ${
                            dbsProvider === prov.key 
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-900' 
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="font-extrabold text-xs">{prov.label}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{prov.desc}</div>
                        </button>
                      ))}
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-extrabold text-[#0f1a38]">DBS Check Standard Fee</div>
                        <div className="text-slate-500">Required before receiving bookings</div>
                      </div>
                      <div className="text-base font-black text-emerald-700">£23.00</div>
                    </div>

                    <button
                      onClick={handlePayDbsFee}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-md shadow-emerald-500/20 cursor-pointer active:scale-95"
                    >
                      Pay £23.00 DBS Fee & Submit Verification
                    </button>
                  </div>
                </div>

                {/* Location & Service Radius */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 text-slate-900">
                  <h3 className="text-base font-black flex items-center gap-2 text-[#0f1a38]">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    3. Location & Service Distance Radius
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">Base Postcode</label>
                      <input
                        type="text"
                        value={servicePostcode}
                        onChange={(e) => setServicePostcode(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:border-[#ff6b00]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
                        <span>Coverage Distance Radius around Location</span>
                        <span className="text-emerald-700 font-black">{serviceRadius} miles</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={25}
                        value={serviceRadius}
                        onChange={(e) => setServiceRadius(parseInt(e.target.value, 10))}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </div>

                    {/* Interactive Google Map with Dynamic Coverage Circle */}
                    <div className="pt-2">
                      <CleanerCoverageMap postcode={servicePostcode} radiusMiles={serviceRadius} />
                    </div>
                  </div>
                </div>

                {/* Payout & Opt-ins */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 text-slate-900">
                  <h3 className="text-base font-black flex items-center gap-2 text-[#0f1a38]">
                    <Zap className="w-5 h-5 text-amber-600" />
                    4. Job Preferences & Payout Frequency
                  </h3>

                  <div className="space-y-3 text-xs">
                    <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-emerald-500 transition-all">
                      <div>
                        <div className="font-extrabold text-[#0f1a38]">Accept Emergency Jobs (&lt;4h / &lt;2h)</div>
                        <div className="text-slate-500 text-[11px]">Earn +10% extra surge pay on call-outs</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={optInEmergency}
                        onChange={(e) => setOptInEmergency(e.target.checked)}
                        className="w-4 h-4 accent-emerald-600 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-emerald-500 transition-all">
                      <div>
                        <div className="font-extrabold text-[#0f1a38]">Accept Afterhours Jobs (&ge; 20:00)</div>
                        <div className="text-slate-500 text-[11px]">Surge rate applied automatically</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={optInAfterhours}
                        onChange={(e) => setOptInAfterhours(e.target.checked)}
                        className="w-4 h-4 accent-emerald-600 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-emerald-500 transition-all">
                      <div>
                        <div className="font-extrabold text-[#0f1a38]">Accept Custom Quoted Cleanings</div>
                        <div className="text-slate-500 text-[11px]">Receive quote requests for specialized jobs</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={optInQuotes}
                        onChange={(e) => setOptInQuotes(e.target.checked)}
                        className="w-4 h-4 accent-emerald-500 cursor-pointer"
                      />
                    </label>

                    <div className="pt-2">
                      <label className="text-xs font-medium text-slate-400 block mb-1">Payout Schedule</label>
                      <select
                        value={payoutFreq}
                        onChange={(e) => setPayoutFreq(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="48_hours">Every 48 Hours (Fast Payout)</option>
                        <option value="weekly">Standard Weekly Payout (Every Friday)</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Custom Rate Card for Each Cleaning Type */}
              <div className="lg:col-span-7 space-y-6">
                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6 text-slate-900">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black flex items-center gap-2 text-[#0f1a38]">
                      <Tag className="w-5 h-5 text-emerald-600" />
                      Rate Card Configuration
                    </h3>
                    <button
                      onClick={handleSaveCleanerRates}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-md shadow-emerald-500/20 cursor-pointer active:scale-95"
                    >
                      Save Rates
                    </button>
                  </div>

                  <p className="text-xs text-slate-600">
                    Set your custom pricing for each cleaning type. Enable/disable types you are willing to clean.
                  </p>

                  <div className="space-y-4">
                    {Object.entries(rateCard).map(([typeKey, item]: [string, any]) => (
                      <div key={typeKey} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={item.enabled}
                              onChange={(e) => setRateCard({
                                ...rateCard,
                                [typeKey]: { ...item, enabled: e.target.checked }
                              })}
                              className="w-4 h-4 accent-emerald-600 cursor-pointer"
                            />
                            <span className="font-extrabold text-sm text-[#0f1a38] capitalize">
                              {typeKey.replace(/_/g, ' ')}
                            </span>
                          </div>

                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                            {item.charge_model.replace('_', ' ')}
                          </span>
                        </div>

                        {item.enabled && item.charge_model !== 'quote' && (
                          <div className="flex items-center gap-3 pl-7">
                            <span className="text-xs text-slate-600 font-bold">Your Rate:</span>
                            <div className="flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                              <span className="text-emerald-700 font-black">£</span>
                              <input
                                type="number"
                                value={item.amount}
                                onChange={(e) => setRateCard({
                                  ...rateCard,
                                  [typeKey]: { ...item, amount: parseFloat(e.target.value) || 0 }
                                })}
                                className="w-16 bg-transparent text-slate-900 font-bold focus:outline-none"
                              />
                              <span className="text-slate-500">
                                / {item.charge_model === 'per_room' ? 'room' : 'hr'}
                              </span>
                            </div>
                          </div>
                        )}

                        {item.enabled && item.charge_model === 'quote' && (
                          <p className="text-[11px] text-amber-800 pl-7 italic font-semibold">
                            Quotes requested by customers will be forwarded for your custom quote estimate.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleSaveCleanerRates}
                    className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-sm shadow-xl shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    Save All Rates & Service Radius Settings
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: SURGE & REFUNDS ENGINE SIMULATOR */}
        {activeTab === 'pricing' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header Banner */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs text-slate-900">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 uppercase tracking-wider">
                System Business Logic Rules Simulator
              </span>
              <h2 className="text-2xl font-black mt-2 text-[#0f1a38]">Emergency, Afterhours & Refund Logic Matrix</h2>
              <p className="text-slate-600 text-sm mt-1">Interactive engine verifying all exact rules for surge pay, deposit retention, and cancellations.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Emergency & Surge Calculator */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6 text-slate-900">
                <h3 className="text-lg font-black flex items-center gap-2 text-[#0f1a38]">
                  <Zap className="w-5 h-5 text-amber-600" />
                  1. Emergency & Afterhours Surge Rules
                </h3>

                <div className="space-y-4 text-xs text-slate-700">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="font-extrabold text-amber-900">Emergency Call-Out Definition</div>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600 font-medium">
                      <li><strong>Calendar Posted Job:</strong> Scheduled to start within the next 4 hours.</li>
                      <li><strong>Direct Cleaner Booking:</strong> Scheduled to start within the next 2 hours.</li>
                      <li><strong>Surcharge:</strong> +15% platform commission + 10% extra surge bonus to cleaner.</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="font-extrabold text-purple-900">Afterhours Definition</div>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600 font-medium">
                      <li>Jobs scheduled to start at or after <strong>20:00</strong>.</li>
                      <li>Charged at the same surge multiplier as Emergency jobs.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Cancellation & Refund Simulator */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6 text-slate-900">
                <h3 className="text-lg font-black flex items-center gap-2 text-[#0f1a38]">
                  <RefreshCw className="w-5 h-5 text-[#ff6b00]" />
                  2. Refund & Cancellation Rules Simulator
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Hours Elapsed Since Booking Creation: <span className="text-[#ff6b00] font-extrabold">{simHoursSinceBooking}h</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={24}
                      value={simHoursSinceBooking}
                      onChange={(e) => setSimHoursSinceBooking(parseFloat(e.target.value))}
                      className="w-full accent-[#ff6b00] cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Hours Remaining Until Scheduled Job Start: <span className="text-[#ff6b00] font-extrabold">{simHoursUntilJob}h</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={48}
                      value={simHoursUntilJob}
                      onChange={(e) => setSimHoursUntilJob(parseFloat(e.target.value))}
                      className="w-full accent-[#ff6b00] cursor-pointer"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={simIsEmergency}
                      onChange={(e) => setSimIsEmergency(e.target.checked)}
                      className="w-4 h-4 accent-rose-600 cursor-pointer"
                    />
                    <span>Is Emergency Booking?</span>
                  </label>

                  {/* Simulator Outcome Display */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs text-slate-900">
                    <div className="flex items-center justify-between font-extrabold text-sm">
                      <span className="text-[#0f1a38]">Simulated Result</span>
                      <span className={simEval.refund > 0 ? 'text-emerald-700' : 'text-rose-700'}>
                        {simEval.refund > 0 ? 'Partial/Full Refund' : 'No Refund (0%)'}
                      </span>
                    </div>

                    <p className="text-slate-700 italic bg-white p-2.5 rounded-xl border border-slate-200 font-medium">
                      &quot;{simEval.reason}&quot;
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                        <span className="text-[10px] text-slate-600 block font-bold">Customer Refunded</span>
                        <span className="text-base font-black text-emerald-800">£{simEval.refund.toFixed(2)}</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                        <span className="text-[10px] text-slate-600 block font-bold">Penalty / Retained</span>
                        <span className="text-base font-black text-rose-800">£{simEval.penalty.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: JOB EXECUTION HUB & LIVE CHAT */}
        {activeTab === 'execution' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header Banner */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs text-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300 uppercase tracking-wider">
                  Live Job Execution & Chat
                </span>
                <h2 className="text-2xl font-black mt-2 text-[#0f1a38]">Active Booking Execution ({currentBooking?.id || 'bk_demo_101'})</h2>
                <p className="text-slate-600 text-sm mt-1">Dual job acceptance, before/after photo proof, and 20-min pre-job unlock live chat.</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleCancelBooking('customer')}
                  className="px-4 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 font-bold text-xs transition-all cursor-pointer active:scale-95"
                >
                  Cancel Booking
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Job Execution Controls & Photo Upload */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Dual Acceptance Controls */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6 text-slate-900">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black flex items-center gap-2 text-[#0f1a38]">
                      <Clock className="w-5 h-5 text-purple-600" />
                      Start & Finish Acceptance
                    </h3>
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                      Status: {currentBooking?.status || 'booked'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleJobAction('start_job')}
                      className="py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 cursor-pointer active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Confirm Job Started
                    </button>

                    <button
                      onClick={() => handleJobAction('finish_job')}
                      className="py-3.5 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-600/20 cursor-pointer active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Confirm Job Finished
                    </button>
                  </div>
                </div>

                {/* Real-Time Google Maps Live Cleaner GPS Dispatch Tracking */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 text-slate-900">
                  <LiveJobTrackingMap
                    cleanerName={currentBooking?.cleaner_name || 'Elena Rostova'}
                    propertyName="EC1 Penthouse"
                  />
                </div>

                {/* Before & After Photo Upload Proof Card */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6 text-slate-900">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black flex items-center gap-2 text-[#0f1a38]">
                      <Camera className="w-5 h-5 text-purple-600" />
                      Cleaner Photo Evidence
                    </h3>
                    <span className="text-xs font-bold text-purple-800 bg-purple-100 px-3 py-1 rounded-full border border-purple-300">
                      {((currentBooking?.before_photos?.length || 0) + (currentBooking?.after_photos?.length || 0))} Photos Uploaded
                    </span>
                  </div>

                  {/* Local Inline Error Box for Photos */}
                  {photoErrorMsg && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between animate-fadeIn">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{photoErrorMsg}</span>
                      </div>
                      <button onClick={() => setPhotoErrorMsg(null)} className="text-[11px] underline opacity-80 hover:opacity-100">
                        Dismiss
                      </button>
                    </div>
                  )}

                  {/* Upload Controls Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Before Photo Box */}
                    <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-extrabold text-cyan-800 flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-cyan-600" /> Before Photo
                        </label>
                        <span className="text-[10px] text-slate-500 font-mono font-bold">
                          {currentBooking?.before_photos?.length || 0} attached
                        </span>
                      </div>

                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Paste image URL (https://...)"
                          value={beforePhotoUrl}
                          onChange={(e) => setBeforePhotoUrl(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-cyan-500"
                        />

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleUploadBeforePhoto()}
                            disabled={isUploadingBefore}
                            className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {isUploadingBefore ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                            Upload URL
                          </button>

                          <button
                            type="button"
                            onClick={() => beforeFileInputRef.current?.click()}
                            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all flex items-center gap-1 cursor-pointer active:scale-95 border border-slate-200"
                            title="Choose local image file from device"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-cyan-600" /> File
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleUploadBeforePhoto('https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500')}
                        className="text-[11px] text-cyan-700 hover:text-cyan-800 underline font-bold block pt-1 cursor-pointer"
                      >
                        + Add Demo &quot;Before Clean&quot; Sample Photo
                      </button>
                    </div>

                    {/* After Photo Box */}
                    <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-extrabold text-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> After Photo
                        </label>
                        <span className="text-[10px] text-slate-500 font-mono font-bold">
                          {currentBooking?.after_photos?.length || 0} attached
                        </span>
                      </div>

                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Paste image URL (https://...)"
                          value={afterPhotoUrl}
                          onChange={(e) => setAfterPhotoUrl(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                        />

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleUploadAfterPhoto()}
                            disabled={isUploadingAfter}
                            className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {isUploadingAfter ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                            Upload URL
                          </button>

                          <button
                            type="button"
                            onClick={() => afterFileInputRef.current?.click()}
                            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all flex items-center gap-1 cursor-pointer active:scale-95 border border-slate-200"
                            title="Choose local image file from device"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-emerald-600" /> File
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleUploadAfterPhoto('https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=500')}
                        className="text-[11px] text-emerald-700 hover:text-emerald-800 underline font-bold block pt-1 cursor-pointer"
                      >
                        + Add Demo &quot;After Clean&quot; Sample Photo
                      </button>
                    </div>
                  </div>

                  {/* Uploaded Photos Gallery Preview Grid */}
                  {((currentBooking?.before_photos?.length || 0) > 0 || (currentBooking?.after_photos?.length || 0) > 0) && (
                    <div className="space-y-3 pt-3 border-t border-slate-200">
                      <h4 className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>Uploaded Photo Proof Gallery ({activeBookingId})</span>
                        <span className="text-[11px] text-purple-700 font-bold">Click photo to zoom</span>
                      </h4>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {currentBooking?.before_photos?.map((imgUrl: string, idx: number) => (
                          <div
                            key={`before_${idx}`}
                            className="relative group rounded-xl overflow-hidden border-2 border-cyan-500 bg-slate-100 aspect-video cursor-pointer"
                            onClick={() => setEnlargedPhotoUrl(imgUrl)}
                          >
                            <img src={imgUrl} alt="Before Clean" className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                            
                            <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[9px] font-black bg-cyan-700 text-white uppercase">
                              BEFORE
                            </span>

                            {/* Remove Trash Icon Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePhoto(imgUrl, 'before');
                              }}
                              className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition-all cursor-pointer shadow-lg z-20 active:scale-90"
                              title="Remove Before Photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                              <Maximize2 className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        ))}

                        {currentBooking?.after_photos?.map((imgUrl: string, idx: number) => (
                          <div
                            key={`after_${idx}`}
                            className="relative group rounded-xl overflow-hidden border-2 border-emerald-500 bg-slate-100 aspect-video cursor-pointer"
                            onClick={() => setEnlargedPhotoUrl(imgUrl)}
                          >
                            <img src={imgUrl} alt="After Clean" className="w-full h-full object-cover group-hover:scale-105 transition-all" />

                            <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[9px] font-black bg-emerald-700 text-white uppercase">
                              AFTER
                            </span>

                            {/* Remove Trash Icon Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePhoto(imgUrl, 'after');
                              }}
                              className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition-all cursor-pointer shadow-lg z-20 active:scale-90"
                              title="Remove After Photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                              <Maximize2 className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Two-Way Rating & Review Form */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 text-slate-900">
                  <h3 className="text-base font-black flex items-center gap-2 text-[#0f1a38]">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    Submit Review & Star Rating
                  </h3>

                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className={`text-2xl transition-all cursor-pointer ${star <= reviewRating ? 'text-amber-500 scale-110' : 'text-slate-300'}`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="text-xs text-slate-600 font-bold ml-2">({reviewRating} / 5 Stars)</span>
                  </div>

                  <textarea
                    placeholder="Write your review comment for the cleaner..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#ff6b00]"
                  />

                  <button
                    onClick={() => handleJobAction('submit_review')}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs transition-all cursor-pointer active:scale-95 shadow-md shadow-amber-500/20"
                  >
                    Submit Review
                  </button>
                </div>



              </div>

              {/* Right Column: Live Chat Box */}
              <div className="lg:col-span-5 space-y-6">
                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 flex flex-col h-[520px] text-slate-900">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <h3 className="text-base font-black flex items-center gap-2 text-[#0f1a38]">
                        <MessageSquare className="w-5 h-5 text-purple-600" />
                        Masked Communication Portal
                      </h3>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                        🔒 Contact details hidden. Portal unlocks 30 mins before job begins.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setChatUnlocked(!chatUnlocked)}
                        className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-300 text-[10px] font-bold cursor-pointer hover:bg-purple-200"
                        title="Toggle chat unlock state for testing"
                      >
                        ⚡ Toggle Portal
                      </button>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        chatUnlocked ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {chatUnlocked ? 'Unlocked (Active)' : 'Locked (30m Before Start)'}
                      </span>
                    </div>
                  </div>

                  {/* Chat Messages Log */}
                  <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 relative">
                    {isFetchingChat ? (
                      <div className="flex flex-col items-center justify-center h-full py-12 space-y-2 text-purple-700">
                        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                        <span className="text-xs font-bold">Syncing live chat messages...</span>
                      </div>
                    ) : chatMessages.length === 0 ? (
                      <div className="text-center text-xs text-slate-500 py-10 font-medium">No chat messages yet. Communication portal active.</div>
                    ) : (
                      chatMessages.map((m) => (
                        <div
                          key={m.id}
                          className={`p-3 rounded-2xl text-xs space-y-1 max-w-[85%] ${
                            m.sender_role === 'customer' 
                              ? 'bg-purple-700 text-white ml-auto shadow-xs' 
                              : 'bg-white border border-slate-200 text-slate-800 mr-auto shadow-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] opacity-80 font-bold">
                            <span>{m.sender_name}</span>
                            <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="font-medium">{m.message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Input Box */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    <input
                      type="text"
                      placeholder={chatUnlocked ? "Type message (phone/email masked)..." : "Portal unlocks 30m before job start time..."}
                      disabled={!chatUnlocked}
                      value={newChatMessage}
                      onChange={(e) => setNewChatMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-purple-600 disabled:opacity-50"
                    />
                    <button
                      onClick={handleSendChatMessage}
                      disabled={!chatUnlocked}
                      className="p-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white transition-all disabled:opacity-50 cursor-pointer active:scale-95 shadow-md shadow-purple-600/20"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: ADMIN PANEL */}
        {activeTab === 'admin' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between text-slate-900">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 uppercase tracking-wider">
                  Admin Support Operations
                </span>
                <h2 className="text-2xl font-black mt-2 text-[#0f1a38]">System Operations & Verification Queue</h2>
              </div>
              <span className="text-xs text-rose-800 font-extrabold bg-rose-100 px-3 py-1.5 rounded-full border border-rose-300">
                Sarah Ops Manager (Admin)
              </span>
            </div>

            {/* MongoDB Database Status & Monitoring Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6 text-slate-900">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black flex items-center gap-2 text-emerald-700">
                    <Database className="w-5 h-5 text-emerald-600" />
                    MongoDB Atlas Database Synchronizer
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">
                    Real-time MongoDB Atlas database connection status and live collection monitor. Credentials secured in <code className="text-emerald-700 font-mono font-bold">.env.local</code>.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleConnectMongo()}
                    disabled={isConnectingMongo}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all shadow-md shadow-emerald-500/20 cursor-pointer active:scale-95 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isConnectingMongo ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        Verifying & Syncing MongoDB Atlas...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        Sync & Verify MongoDB Connection
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Collections Grid Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {[
                  { key: 'users', label: 'Registered Users', icon: '👤', desc: 'Customers & Cleaners' },
                  { key: 'cleaner_profiles', label: 'Cleaner Profiles', icon: '🧹', desc: 'Rates & Radius' },
                  { key: 'properties', label: 'Properties', icon: '🏡', desc: 'House, Flat, OTHER' },
                  { key: 'bookings', label: 'Bookings', icon: '📅', desc: 'Category & Deposits' },
                  { key: 'chat_messages', label: 'Chat Messages', icon: '💬', desc: '20-Min Lock' },
                  { key: 'reviews', label: 'Reviews', icon: '⭐', desc: 'Two-Way Ratings' },
                  { key: 'commercial_contracts', label: 'Contracts', icon: '🏢', desc: 'Maintenance Quotes' },
                  { key: 'payment_logs', label: 'Payment Logs', icon: '💳', desc: 'Stripe Payouts' }
                ].map((col, idx) => {
                  const docCount = mongoStats ? mongoStats[col.key] : undefined;
                  return (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-base">{col.icon}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                          docCount !== undefined 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                            : 'bg-slate-200 text-slate-700 border border-slate-300'
                        }`}>
                          {docCount !== undefined ? `${docCount} Docs` : 'Collection Ready'}
                        </span>
                      </div>
                      <div className="font-extrabold text-[#0f1a38] text-xs pt-1">{col.label}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{col.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 text-slate-900">
              <h3 className="text-lg font-black flex items-center gap-2 text-[#0f1a38]">
                <Users className="w-5 h-5 text-rose-600" />
                Vetting & DBS Approvals Queue
              </h3>
              <p className="text-xs text-slate-600 font-medium">Review pending cleaner applications, DBS checks, and resolve support queries.</p>
              
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-extrabold text-sm text-[#0f1a38]">Elena Rostova</div>
                  <div className="text-slate-600 font-medium">uCheck DBS (£23 Paid) • Passport Uploaded</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setAdminCleanerStatus('approved');
                      showAlert('Elena Rostova DBS approved by Admin!', 'success');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold cursor-pointer hover:bg-emerald-200 active:scale-95"
                  >
                    Approve ✓
                  </button>

                  <button
                    onClick={() => {
                      setAdminCleanerStatus('rejected');
                      showAlert('Elena Rostova DBS rejected by Admin.', 'error');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 border border-rose-300 font-extrabold cursor-pointer hover:bg-rose-200 active:scale-95"
                  >
                    Reject ✕
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        </main>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: PHOTO ENLARGEMENT LIGHTBOX */}
      {/* ------------------------------------------------------------- */}
      {enlargedPhotoUrl && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setEnlargedPhotoUrl(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] bg-white border border-slate-200 rounded-3xl p-3 overflow-hidden shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
              <button
                type="button"
                onClick={() => {
                  const isBefore = currentBooking?.before_photos?.includes(enlargedPhotoUrl);
                  handleDeletePhoto(enlargedPhotoUrl, isBefore ? 'before' : 'after');
                }}
                className="px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg active:scale-95"
              >
                <Trash2 className="w-4 h-4" /> Remove Photo
              </button>
              <button
                type="button"
                onClick={() => setEnlargedPhotoUrl(null)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img src={enlargedPhotoUrl} alt="Enlarged Proof" className="max-w-full max-h-[82vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: STRIPE CHECKOUT PAYMENT POPUP */}
      {/* ------------------------------------------------------------- */}
      {showStripeCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-6 shadow-2xl relative text-slate-900">
            <button
              onClick={() => setShowStripeCheckoutModal(false)}
              className="absolute top-5 right-5 p-1 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#0f1a38] flex items-center gap-2">
                  Stripe Checkout
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-300 uppercase">
                    256-bit SSL
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">DustBustars Secure Payment Processing</p>
              </div>
            </div>

            {paymentSuccess ? (
              <div className="py-8 text-center space-y-3 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-300">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-black text-emerald-800">Payment Successful!</h4>
                <p className="text-xs text-slate-600 font-medium">Booking Confirmed & 30% Deposit Paid. Redirecting to Job Hub...</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Price Breakdown Box */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-slate-600 font-semibold">
                    <span>Clean Category / Type:</span>
                    <span className="font-extrabold text-[#0f1a38] capitalize">{cleaningType.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 font-semibold">
                    <span>Base Amount:</span>
                    <span className="font-extrabold text-[#0f1a38]">£{livePricing.baseTotal.toFixed(2)}</span>
                  </div>
                  {livePricing.surgeBonus > 0 && (
                    <div className="flex items-center justify-between text-rose-700 font-bold">
                      <span>Emergency Surge Bonus (+10%):</span>
                      <span>+£{livePricing.surgeBonus.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between font-extrabold text-sm text-[#0f1a38] border-t border-slate-200 pt-2">
                    <span>Total Amount Charged:</span>
                    <span className="text-base text-[#ff6b00] font-black">£{livePricing.finalTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-emerald-700 pt-1 font-bold">
                    <span>Includes 30% Deposit:</span>
                    <span>£{livePricing.deposit.toFixed(2)}</span>
                  </div>
                </div>

                {/* Card Input Form */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardHolderName}
                      onChange={(e) => setCardHolderName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#ff6b00]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#ff6b00]"
                      />
                      <CreditCard className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">CVC / CVC2</label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleProcessStripePaymentModal}
                  disabled={isProcessingPayment}
                  className="w-full py-3.5 rounded-2xl bg-[#ff6b00] hover:bg-[#e05e00] active:scale-95 text-white font-extrabold text-xs shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      Authorizing Stripe Payment...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-white" />
                      Pay £{livePricing.finalTotal.toFixed(2)} Now via Stripe
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: STRIPE CONNECT EXPRESS ONBOARDING POPUP */}
      {/* ------------------------------------------------------------- */}
      {showStripeConnectModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-6 shadow-2xl relative text-slate-900">
            <button
              onClick={() => setShowStripeConnectModal(false)}
              className="absolute top-5 right-5 p-1 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <ExternalLink className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#0f1a38]">Stripe Express Payout Onboarding</h3>
                <p className="text-xs text-slate-500 font-medium">Connect UK Bank Account for Cleaner Payouts</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-slate-600 font-semibold">
                  <span>Account Type:</span>
                  <span className="font-extrabold text-purple-700">Stripe Express UK</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 font-semibold">
                  <span>Current Account ID:</span>
                  <span className="font-mono text-slate-900 font-bold">acct_mock_elena_123</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 font-semibold">
                  <span>Payout Schedule:</span>
                  <span className="font-extrabold text-slate-900">48-Hour Automated Transfer</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">UK Bank Sort Code</label>
                  <input
                    type="text"
                    value={sortCode}
                    onChange={(e) => setSortCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">8-Digit Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveStripeConnectModal}
                disabled={isSavingConnect}
                className="w-full py-3.5 rounded-2xl bg-purple-700 hover:bg-purple-800 active:scale-95 text-white font-extrabold text-xs transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSavingConnect ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Linking Stripe Express Account...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    Link Bank Account & Enable Payouts
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: COMMERCIAL CONTRACT POPUP */}
      {/* ------------------------------------------------------------- */}
      {showContractModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-6 shadow-2xl relative text-slate-900">
            <button
              onClick={() => setShowContractModal(false)}
              className="absolute top-5 right-5 p-1 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#0f1a38]">Commercial Contract Request</h3>
                <p className="text-xs text-slate-500 font-medium">Discounted Maintenance Rates for Businesses</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Company / Business Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#ff6b00]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Cleaning Frequency</label>
                  <select
                    value={cleaningFreq}
                    onChange={(e) => setCleaningFreq(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="daily">Daily Maintenance Clean</option>
                    <option value="weekly">Weekly Office Clean</option>
                    <option value="bi-weekly">Bi-Weekly Clean</option>
                    <option value="monthly">Monthly Deep Clean</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Special Corporate Requirements</label>
                  <textarea
                    rows={3}
                    value={contractNotes}
                    onChange={(e) => setContractNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#ff6b00]"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveContractModal}
                className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-extrabold text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4 text-white" />
                Submit Corporate Contract Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: AUTHENTICATION (SIGN UP & LOGIN) POPUP MODAL */}
      {/* ------------------------------------------------------------- */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative text-slate-900">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 p-1 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="DustBustars Logo"
                className="w-12 h-12 rounded-2xl object-contain shadow-lg shadow-orange-500/20 bg-[#0b1736] p-1 border border-slate-700"
              />
              <div>
                <h3 className="text-xl font-black text-[#0f1a38]">
                  {authMode === 'signup' ? 'Create Your Account' : 'Sign In to DustBustars'}
                </h3>
                <p className="text-xs text-slate-500">
                  {authMode === 'signup' ? 'Join London’s Vetted Cleaning Marketplace' : 'Access your Portal Dashboard & Manage Cleanings'}
                </p>
              </div>
            </div>

            {/* Mode Toggle: Sign In vs Sign Up */}
            <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 rounded-xl font-extrabold transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-white text-[#0f1a38] shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-2 rounded-xl font-extrabold transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-white text-[#0f1a38] shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Sign Up / Register
              </button>
            </div>

            {/* Role Selector Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              {[
                { id: 'customer', label: '👤 Customer' },
                { id: 'cleaner', label: '🧹 Cleaner' },
                { id: 'admin', label: '🛡️ Admin' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    if (tab.id === 'admin') {
                      window.location.href = '/admin/login';
                      return;
                    }
                    setAuthRole(tab.id as any);
                    if (authMode === 'login') {
                      if (tab.id === 'customer') {
                        setAuthEmail('james.homeowner@gmail.com');
                      } else {
                        setAuthEmail('elena.rostova@dustbustars.co.uk');
                      }
                    }
                  }}
                  className={`py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    authRole === tab.id
                      ? 'bg-[#0b1736] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Form Inputs */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsAuthSubmitting(true);

                if (authMode === 'signup') {
                  // Registration Handler
                  if (!authFullName.trim()) {
                    showAlert('Please enter your full name.', 'error');
                    setIsAuthSubmitting(false);
                    return;
                  }
                  if (authPassword !== authConfirmPassword) {
                    showAlert('Passwords do not match. Please re-enter your password.', 'error');
                    setIsAuthSubmitting(false);
                    return;
                  }

                  console.log(`[Frontend Auth] Register API triggered for email: "${authEmail}", role: "${authRole}"`);
                  try {
                    const res = await fetch('/api/auth/register', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        full_name: authFullName,
                        email: authEmail,
                        password: authPassword,
                        role: authRole,
                      }),
                    });
                    const data = await res.json();
                    if (data.success && data.token) {
                      console.log(`[Frontend Auth] User registered & saved in database! Token: ${data.token.substring(0, 15)}...`);
                      localStorage.setItem('dustbustars_auth_token', data.token);
                      setIsLoggedIn(true);
                      setCurrentUser(data.user);
                      const targetTab = pendingRedirectTab || authRole;
                      setActiveTab(targetTab as any);
                      setPendingRedirectTab(null);
                      setShowAuthModal(false);
                      showAlert(`Account created & saved in Database! Welcome, ${data.user.full_name}!`, 'success');
                    } else {
                      console.error('[Frontend Auth] Registration failed:', data.error);
                      showAlert(data.error || 'Registration failed.', 'error');
                    }
                  } catch (err: any) {
                    console.error('[Frontend Auth] Registration error:', err);
                    showAlert('Server connection error. Please try again.', 'error');
                  } finally {
                    setIsAuthSubmitting(false);
                  }
                } else {
                  // Login Handler
                  console.log(`[Frontend Auth] Login API triggered for email: "${authEmail}"`);
                  try {
                    const res = await fetch('/api/auth/login', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        email: authEmail,
                        password: authPassword,
                      }),
                    });
                    const data = await res.json();
                    if (data.success && data.token) {
                      console.log(`[Frontend Auth] Password verified! Token saved to localStorage.`);
                      localStorage.setItem('dustbustars_auth_token', data.token);
                      setIsLoggedIn(true);
                      setCurrentUser(data.user);
                      setAuthRole(data.user.role);
                      const targetTab = pendingRedirectTab || data.user.role || 'customer';
                      setActiveTab(targetTab as any);
                      setPendingRedirectTab(null);
                      setShowAuthModal(false);
                      showAlert(`Signed in successfully! Welcome back, ${data.user.full_name}!`, 'success');
                    } else {
                      console.error('[Frontend Auth] Login failed:', data.error);
                      showAlert(data.error || 'Invalid credentials.', 'error');
                    }
                  } catch (err: any) {
                    console.error('[Frontend Auth] Login error:', err);
                    showAlert('Server connection error. Please try again.', 'error');
                  } finally {
                    setIsAuthSubmitting(false);
                  }
                }
              }}
              className="space-y-3 text-xs"
            >
              {authMode === 'signup' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. James Harrington"
                    value={authFullName}
                    onChange={(e) => setAuthFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#ff6b00]"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#ff6b00]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#ff6b00]"
                />
              </div>

              {authMode === 'signup' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={authConfirmPassword}
                    onChange={(e) => setAuthConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#ff6b00]"
                  />
                </div>
              )}

              {/* 1-Click Demo Login Preset Button */}
              {authMode === 'login' && (
                <div className="p-3 rounded-2xl bg-orange-50 border border-orange-100 space-y-1.5">
                  <span className="text-[11px] font-bold text-[#ff6b00] block">⚡ 1-Click Demo Login API:</span>
                  <button
                    type="button"
                    onClick={async () => {
                      setIsAuthSubmitting(true);
                      try {
                        const demoEmail = authRole === 'admin' ? 'ops@dustbustars.co.uk' : authRole === 'cleaner' ? 'elena.rostova@dustbustars.co.uk' : 'james.homeowner@gmail.com';
                        const res = await fetch('/api/auth/login', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: demoEmail, password: 'password123' }),
                        });
                        const data = await res.json();
                        if (data.success && data.token) {
                          localStorage.setItem('dustbustars_auth_token', data.token);
                          setIsLoggedIn(true);
                          setCurrentUser(data.user);
                          const targetTab = pendingRedirectTab || authRole;
                          setActiveTab(targetTab as any);
                          setPendingRedirectTab(null);
                          setShowAuthModal(false);
                          showAlert(`Demo login successful! Logged in as ${data.user.full_name}`, 'success');
                        }
                      } catch (err) {
                        setIsLoggedIn(true);
                        const targetTab = pendingRedirectTab || authRole;
                        setActiveTab(targetTab as any);
                        setPendingRedirectTab(null);
                        setShowAuthModal(false);
                      } finally {
                        setIsAuthSubmitting(false);
                      }
                    }}
                    className="w-full py-2 rounded-xl bg-white border border-orange-200 text-slate-800 font-bold text-xs hover:bg-orange-100 transition-all cursor-pointer shadow-xs"
                  >
                    Authenticate Demo Account ({authRole.toUpperCase()}) & Open Dashboard →
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isAuthSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#ff6b00] hover:bg-[#e05e00] text-white font-extrabold text-xs transition-all shadow-lg shadow-orange-500/20 cursor-pointer active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAuthSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Processing...
                  </>
                ) : authMode === 'signup' ? (
                  'Create Account & Save to Database'
                ) : (
                  'Sign In & Open Dashboard'
                )}
              </button>
            </form>

            {/* Dedicated Admin Portal Direct Access Button */}
            <div className="pt-3 border-t border-slate-100 text-center">
              <a
                href="/admin/login"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0f1a38] hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
              >
                <ShieldCheck className="w-4 h-4 text-[#ff6b00]" /> Access Standalone Enterprise Admin Portal &rarr;
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation Drawer for Public & Logged In User */}
      <MobileDrawerMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        landingSubTab={landingSubTab}
        setLandingSubTab={setLandingSubTab}
        onOpenAuth={(role) => {
          if (role) setAuthRole(role);
          setShowAuthModal(true);
        }}
        onLogout={() => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('dustbustars_auth_token');
            localStorage.removeItem('dustbustars_active_tab');
          }
          setIsLoggedIn(false);
          setCurrentUser(null);
          setActiveTab('landing');
          setLandingSubTab('home');
          showAlert('Signed out successfully. Returned to Home Landing Page.', 'info');
        }}
      />

      {/* Mobile Bottom Navigation Bar (iOS / Android) */}
      <MobileBottomNav
        isLoggedIn={isLoggedIn}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        landingSubTab={landingSubTab}
        setLandingSubTab={setLandingSubTab}
        onOpenAuth={(role) => {
          if (role) setAuthRole(role);
          setShowAuthModal(true);
        }}
        currentUser={currentUser}
      />

    </div>
  );
}

