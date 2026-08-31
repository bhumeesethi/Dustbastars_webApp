import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  role: 'customer' | 'cleaner' | 'admin';
  phone: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  id_document_url?: string;
  selfie_url?: string;
  id_verified: boolean;
  status: 'active' | 'pending_approval' | 'suspended';
  created_at: string;
}

export type CleaningCategory = 'residential' | 'commercial' | 'other';

export type CleaningType = 
  // Residential
  | 'std_domestic' 
  | 'deep_clean' 
  | 'end_of_tenancy' 
  | 'end_of_tenancy_removal' 
  | 'airbnb' 
  // Commercial
  | 'office_retail' 
  | 'educational' 
  | 'medical_clinical' 
  | 'events' 
  // Specialized / Other
  | 'other_specialized';

export type ChargeModel = 'per_hour' | 'per_room' | 'quote';

export interface CleanerRateItem {
  enabled: boolean;
  charge_model: ChargeModel;
  amount: number; // £/hr or £/room, or 0 if quote
}

export type CleanerRatesMap = Record<CleaningType, CleanerRateItem>;

export interface CleanerProfile {
  id: string;
  user_id: string;
  base_hourly_rate: number;
  min_booking_duration_hrs: number;
  accepts_short_jobs: boolean;
  short_job_flat_rate: number;
  dbs_status: 'pending' | 'approved' | 'rejected';
  dbs_payment_status: 'unpaid' | 'paid';
  dbs_provider: 'ucheck' | 'first_advantage';
  dbs_verified_at?: string;
  service_center_postcode: string;
  service_center_lat: number;
  service_center_lng: number;
  service_radius_miles: number;
  bio: string;
  specialisms: string[];
  rates: CleanerRatesMap;
  opt_in_emergency: boolean;
  opt_in_afterhours: boolean;
  opt_in_quotes: boolean;
  payout_frequency: '48_hours' | 'weekly';
  weekly_availability: Record<string, string[]>; // e.g. { "Mon": ["08:00-12:00", "13:00-17:00"] }
  average_rating: number;
  total_completed_jobs: number;
  stripe_account_id?: string;
  payout_enabled: boolean;
}

export interface Address {
  id: string;
  user_id: string;
  address_line1: string;
  address_line2?: string;
  postcode: string;
  city: string;
  lat: number;
  lng: number;
  is_verified: boolean;
  is_in_launch_area: boolean;
  launch_area_code?: 'EC1' | 'N7' | 'OUT_OF_AREA';
}

export type PropertyType = 'house' | 'flat' | 'office' | 'other';

export interface Property {
  id: string;
  user_id: string;
  property_type: PropertyType;
  name: string;
  other_description?: string; // Required if property_type is 'other' (e.g. Food Truck, Yacht, Cinema)
  address_id: string;
  bedrooms_count?: number;
  bathrooms_count?: number;
  sqft_area?: number;
  created_at: string;
}

export type BookingStatus = 
  | 'pending_match'
  | 'booked'
  | 'in_progress'
  | 'completed'
  | 'cancelled_by_customer'
  | 'cancelled_by_cleaner'
  | 'disputed';

export interface Booking {
  id: string;
  customer_id: string;
  cleaner_id?: string; // Assigned cleaner or unassigned calendar post
  property_id: string;
  booking_type: 'calendar_post' | 'direct_cleaner';
  cleaning_category: CleaningCategory;
  cleaning_type: CleaningType;
  pricing_model: ChargeModel;
  units_count: number; // hours or rooms
  scheduled_date: string; // YYYY-MM-DD
  scheduled_start_time: string; // HH:mm
  is_emergency: boolean; // Requested within 4h (calendar) or 2h (direct)
  is_afterhours: boolean; // Start time >= 20:00
  total_amount: number;
  deposit_amount: number; // 100% upfront
  cleaner_payout_amount: number;
  platform_commission: number;
  surge_bonus_amount: number;
  emergency_surcharge_amount?: number; // £5/hr per cleaner for emergency bookings
  cleaner_count?: number; // Number of cleaners booked for the job (default 1)
  cleaners_assigned?: string[]; // Array of assigned cleaner IDs
  special_instructions?: string;
  quote_details?: string;
  quote_status?: 'pending' | 'submitted' | 'accepted' | 'declined';
  status: BookingStatus;
  customer_started_at?: string;
  customer_finished_at?: string;
  cleaner_started_at?: string;
  cleaner_finished_at?: string;
  before_photos: string[];
  after_photos: string[];
  chat_unlocked_at?: string; // 30 mins prior to start time
  cancellation_reason?: string;
  cancellation_penalty_fee?: number;
  refunded_amount?: number;
  created_at: string;
}

export function maskContactInfo(text: string): string {
  if (!text) return text;
  // Mask UK & international phone numbers
  let masked = text.replace(/(\+?\d{1,4}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g, '[masked contact info]');
  // Mask email addresses
  masked = masked.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[masked contact info]');
  // Mask website URLs / social handles
  masked = masked.replace(/(https?:\/\/[^\s]+|www\.[^\s]+)/g, '[masked link]');
  return masked;
}

export interface ChatMessage {
  id: string;
  booking_id: string;
  sender_id: string;
  sender_role: 'customer' | 'cleaner' | 'admin';
  sender_name: string;
  message: string;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  reviewee_id: string;
  reviewer_role: 'customer' | 'cleaner';
  rating: number;
  comment: string;
  created_at: string;
}

export interface SystemSetting {
  key: string;
  value: string;
  description: string;
  updated_at: string;
}

export interface CMSPage {
  slug: string;
  title: string;
  content_markdown: string;
  updated_at: string;
}

export interface DatabaseSchema {
  users: User[];
  cleaner_profiles: CleanerProfile[];
  addresses: Address[];
  properties: Property[];
  customer_favorites: { customer_id: string; cleaner_id: string }[];
  bookings: Booking[];
  chat_messages: ChatMessage[];
  reviews: Review[];
  quotes: any[];
  payments: any[];
  cancellations: any[];
  disputes: any[];
  system_settings: SystemSetting[];
  cms_pages: CMSPage[];
  otp_codes: Record<string, { code: string; expires_at: number }>;
}

const DB_FILE = path.join(process.cwd(), 'data_db.json');

const DEFAULT_RATES: CleanerRatesMap = {
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
};

export const INITIAL_DB: DatabaseSchema = {
  users: [
    {
      id: 'usr_admin_1',
      role: 'admin',
      phone: '+447700900001',
      email: 'ops@dustbustars.co.uk',
      full_name: 'Sarah Ops Manager',
      id_verified: true,
      status: 'active',
      created_at: new Date().toISOString(),
    },
    {
      id: 'usr_cleaner_1',
      role: 'cleaner',
      phone: '+447700900002',
      email: 'elena.cleaner@dustbustars.co.uk',
      full_name: 'Elena Rostova',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      id_document_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
      selfie_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
      id_verified: true,
      status: 'active',
      created_at: new Date().toISOString(),
    },
    {
      id: 'usr_cleaner_2',
      role: 'cleaner',
      phone: '+447700900003',
      email: 'marcus.cleaner@dustbustars.co.uk',
      full_name: 'Marcus Vance',
      avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
      id_document_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
      selfie_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
      id_verified: true,
      status: 'active',
      created_at: new Date().toISOString(),
    },
    {
      id: 'usr_customer_1',
      role: 'customer',
      phone: '+447700900004',
      email: 'james.homeowner@gmail.com',
      full_name: 'James Harrington',
      id_verified: true,
      status: 'active',
      created_at: new Date().toISOString(),
    },
  ],
  cleaner_profiles: [
    {
      id: 'cln_prof_1',
      user_id: 'usr_cleaner_1',
      base_hourly_rate: 16.00,
      min_booking_duration_hrs: 2,
      accepts_short_jobs: true,
      short_job_flat_rate: 35.00,
      dbs_status: 'approved',
      dbs_payment_status: 'paid',
      dbs_provider: 'ucheck',
      dbs_verified_at: new Date().toISOString(),
      service_center_postcode: 'EC1M 3HA',
      service_center_lat: 51.5205,
      service_center_lng: -0.1051,
      service_radius_miles: 5,
      bio: 'Experienced independent specialist cleaner covering EC1 & N7. 5+ years expertise in deep cleans and tenancy turnarounds.',
      specialisms: ['#deep-clean', '#end-of-tenancy', '#emergency', '#pet-friendly'],
      rates: DEFAULT_RATES,
      opt_in_emergency: true,
      opt_in_afterhours: true,
      opt_in_quotes: true,
      payout_frequency: '48_hours',
      weekly_availability: {
        Mon: ['08:00-12:00', '13:00-18:00', '19:00-23:00'],
        Tue: ['08:00-12:00', '13:00-18:00'],
        Wed: ['08:00-12:00', '13:00-18:00', '19:00-23:00'],
        Thu: ['08:00-12:00', '13:00-18:00'],
        Fri: ['08:00-12:00', '13:00-18:00', '19:00-23:00'],
        Sat: ['09:00-17:00'],
        Sun: ['10:00-16:00']
      },
      average_rating: 4.95,
      total_completed_jobs: 142,
      stripe_account_id: 'acct_mock_elena_123',
      payout_enabled: true,
    },
    {
      id: 'cln_prof_2',
      user_id: 'usr_cleaner_2',
      base_hourly_rate: 15.00,
      min_booking_duration_hrs: 2,
      accepts_short_jobs: false,
      short_job_flat_rate: 35.00,
      dbs_status: 'approved',
      dbs_payment_status: 'paid',
      dbs_provider: 'first_advantage',
      dbs_verified_at: new Date().toISOString(),
      service_center_postcode: 'N7 7HE',
      service_center_lat: 51.5542,
      service_center_lng: -0.1034,
      service_radius_miles: 8,
      bio: 'Highbury local cleaner specializing in eco-friendly domestic cleaning and post-renovation cleans.',
      specialisms: ['#post-build', '#deep-clean', '#airbnb-turnover'],
      rates: {
        ...DEFAULT_RATES,
        std_domestic: { enabled: true, charge_model: 'per_hour', amount: 15.00 },
        deep_clean: { enabled: true, charge_model: 'per_hour', amount: 20.00 }
      },
      opt_in_emergency: false,
      opt_in_afterhours: false,
      opt_in_quotes: true,
      payout_frequency: 'weekly',
      weekly_availability: {
        Mon: ['09:00-17:00'],
        Tue: ['09:00-17:00'],
        Wed: ['09:00-17:00'],
        Thu: ['09:00-17:00'],
        Fri: ['09:00-17:00']
      },
      average_rating: 4.88,
      total_completed_jobs: 89,
      stripe_account_id: 'acct_mock_marcus_456',
      payout_enabled: true,
    },
  ],
  addresses: [
    {
      id: 'addr_cust_1',
      user_id: 'usr_customer_1',
      address_line1: '14 Farringdon Road',
      address_line2: 'Flat 3B',
      postcode: 'EC1M 3HA',
      city: 'London',
      lat: 51.5205,
      lng: -0.1051,
      is_verified: true,
      is_in_launch_area: true,
      launch_area_code: 'EC1',
    },
  ],
  properties: [
    {
      id: 'prop_1',
      user_id: 'usr_customer_1',
      property_type: 'flat',
      name: 'Farringdon Penthouse Flat',
      address_id: 'addr_cust_1',
      bedrooms_count: 2,
      bathrooms_count: 2,
      sqft_area: 850,
      created_at: new Date().toISOString()
    },
    {
      id: 'prop_2',
      user_id: 'usr_customer_1',
      property_type: 'other',
      name: 'Custom Mobile Food Truck & Trailer',
      other_description: 'Commercial mobile catering trailer needing interior deep degrease & stainless steel sanitation.',
      address_id: 'addr_cust_1',
      created_at: new Date().toISOString()
    }
  ],
  customer_favorites: [
    { customer_id: 'usr_customer_1', cleaner_id: 'usr_cleaner_1' },
  ],
  bookings: [
    {
      id: 'bk_demo_101',
      customer_id: 'usr_customer_1',
      cleaner_id: 'usr_cleaner_1',
      property_id: 'prop_1',
      booking_type: 'direct_cleaner',
      cleaning_category: 'residential',
      cleaning_type: 'deep_clean',
      pricing_model: 'per_hour',
      units_count: 3,
      scheduled_date: new Date().toISOString().split('T')[0],
      scheduled_start_time: '14:00',
      is_emergency: false,
      is_afterhours: false,
      total_amount: 66.00,
      deposit_amount: 66.00, // 100% upfront
      cleaner_payout_amount: 57.75,
      platform_commission: 8.25,
      surge_bonus_amount: 0,
      emergency_surcharge_amount: 0,
      cleaner_count: 1,
      cleaners_assigned: ['usr_cleaner_1'],
      special_instructions: 'Please bring eco-friendly limescale remover for bathroom tiles.',
      status: 'booked',
      before_photos: [],
      after_photos: [],
      chat_unlocked_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min ago (unlocked!)
      created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString() // 2 hours ago
    }
  ],
  chat_messages: [
    {
      id: 'msg_1',
      booking_id: 'bk_demo_101',
      sender_id: 'usr_customer_1',
      sender_role: 'customer',
      sender_name: 'James Harrington',
      message: 'Hi Elena! Just wanted to let you know the key is under the door mat if you arrive early.',
      created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString()
    },
    {
      id: 'msg_2',
      booking_id: 'bk_demo_101',
      sender_id: 'usr_cleaner_1',
      sender_role: 'cleaner',
      sender_name: 'Elena Rostova',
      message: 'Perfect, thank you James! I am on my way with all eco-friendly supplies.',
      created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString()
    }
  ],
  reviews: [
    {
      id: 'rev_1',
      booking_id: 'bk_demo_101',
      reviewer_id: 'usr_customer_1',
      reviewee_id: 'usr_cleaner_1',
      reviewer_role: 'customer',
      rating: 5,
      comment: 'Elena did an incredible job! Spotless kitchen and bathroom.',
      created_at: new Date().toISOString()
    }
  ],
  quotes: [],
  payments: [],
  cancellations: [],
  disputes: [],
  system_settings: [
    { key: 'standard_commission_pct', value: '12.5', description: 'Standard platform commission percentage', updated_at: new Date().toISOString() },
    { key: 'emergency_commission_pct', value: '15.0', description: 'Emergency call-out commission percentage (<2 hours)', updated_at: new Date().toISOString() },
    { key: 'emergency_surcharge_per_hour_gbp', value: '5.00', description: 'Emergency call-out surcharge rate (£5/hr per cleaner)', updated_at: new Date().toISOString() },
    { key: 'emergency_cleaner_bonus_pct', value: '10.0', description: 'Extra surge bonus percentage paid to cleaner for emergency/afterhours', updated_at: new Date().toISOString() },
    { key: 'dbs_check_fee_gbp', value: '23.00', description: 'Upfront DBS check fee charged to cleaner', updated_at: new Date().toISOString() },
    { key: 'booking_deposit_pct', value: '100.0', description: 'Upfront booking deposit percentage (100% upfront)', updated_at: new Date().toISOString() },
  ],
  cms_pages: [
    { slug: 'about-us', title: 'About DustBustars', content_markdown: '# About DustBustars\n\nWe connect London residents with trusted, independent local cleaners.', updated_at: new Date().toISOString() },
  ],
  otp_codes: {},
};

export function getDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf-8');
      return INITIAL_DB;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    // Ensure new collections exist in case file was generated with an older schema
    if (!parsed.properties) parsed.properties = INITIAL_DB.properties;
    if (!parsed.chat_messages) parsed.chat_messages = INITIAL_DB.chat_messages;
    if (!parsed.reviews) parsed.reviews = INITIAL_DB.reviews;
    return parsed;
  } catch (err) {
    console.error('Error reading database file, returning initial schema:', err);
    return INITIAL_DB;
  }
}

export function saveDb(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}
