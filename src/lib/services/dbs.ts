import { getDb, saveDb, CleanerProfile, CleanerRatesMap } from '../db';

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

export interface DbsCheckResponse {
  reference_id: string;
  status: 'pending' | 'approved' | 'rejected';
  verified_at?: string;
  certificate_number?: string;
  provider: 'uCheck External DBS API Stub';
}

export function requestUCheckDbsCheck(cleanerUserId: string): { success: boolean; profile?: CleanerProfile; dbs: DbsCheckResponse } {
  const db = getDb();
  let profile = db.cleaner_profiles.find(p => p.user_id === cleanerUserId);

  if (!profile) {
    profile = {
      id: `cln_prof_${Date.now()}`,
      user_id: cleanerUserId,
      base_hourly_rate: 14.50,
      min_booking_duration_hrs: 2,
      accepts_short_jobs: false,
      short_job_flat_rate: 35.00,
      dbs_status: 'pending',
      dbs_payment_status: 'unpaid',
      dbs_provider: 'ucheck',
      service_center_postcode: 'EC1M 3HA',
      service_center_lat: 51.5205,
      service_center_lng: -0.1051,
      service_radius_miles: 5,
      bio: 'Independent cleaner',
      specialisms: ['#deep-clean'],
      rates: DEFAULT_RATES,
      opt_in_emergency: true,
      opt_in_afterhours: true,
      opt_in_quotes: true,
      payout_frequency: '48_hours',
      weekly_availability: { Mon: ['08:00-18:00'] },
      average_rating: 5.0,
      total_completed_jobs: 0,
      payout_enabled: false,
    };
    db.cleaner_profiles.push(profile);
  } else {
    profile.dbs_status = 'pending';
  }
  saveDb(db);

  return {
    success: true,
    profile,
    dbs: {
      reference_id: `UCHK_${Date.now().toString().slice(-6)}`,
      status: 'pending',
      provider: 'uCheck External DBS API Stub',
    },
  };
}

export function updateUCheckDbsStatus(cleanerUserId: string, status: 'approved' | 'rejected' | 'pending'): { success: boolean; profile?: CleanerProfile } {
  const db = getDb();
  const profile = db.cleaner_profiles.find(p => p.user_id === cleanerUserId);
  if (!profile) return { success: false };

  profile.dbs_status = status;
  if (status === 'approved') {
    profile.dbs_verified_at = new Date().toISOString();
  }
  saveDb(db);
  return { success: true, profile };
}
