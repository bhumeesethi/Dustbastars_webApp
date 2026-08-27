import { getDb, saveDb, User, CleanerRatesMap } from '../db';

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

export function sendOtp(phoneOrEmail: string): { success: boolean; message: string; otp_debug?: string } {
  const db = getDb();
  const otpCode = '123456';
  const expiresAt = Date.now() + 10 * 60 * 1000;

  db.otp_codes[phoneOrEmail] = {
    code: otpCode,
    expires_at: expiresAt,
  };
  saveDb(db);

  return {
    success: true,
    message: `OTP sent successfully to ${phoneOrEmail}. (Demo code: ${otpCode})`,
    otp_debug: otpCode,
  };
}

export function verifyOtp(phoneOrEmail: string, code: string, role: 'customer' | 'cleaner' | 'admin' = 'customer'): { success: boolean; user?: User; message: string } {
  const db = getDb();
  const stored = db.otp_codes[phoneOrEmail];

  if (code !== '123456' && (!stored || stored.code !== code || Date.now() > stored.expires_at)) {
    return { success: false, message: 'Invalid or expired OTP code. (Hint: Use demo code 123456)' };
  }

  let user = db.users.find(u => u.phone === phoneOrEmail || u.email === phoneOrEmail);
  if (!user) {
    user = {
      id: `usr_${Date.now()}`,
      role: role,
      phone: phoneOrEmail.includes('@') ? '+447700' + Math.floor(100000 + Math.random() * 900000) : phoneOrEmail,
      email: phoneOrEmail.includes('@') ? phoneOrEmail : `user_${Date.now()}@dustbustars.co.uk`,
      full_name: phoneOrEmail.split('@')[0] || 'Marketplace User',
      id_verified: false,
      status: 'active',
      created_at: new Date().toISOString(),
    };
    db.users.push(user);

    if (role === 'cleaner') {
      db.cleaner_profiles.push({
        id: `cln_prof_${Date.now()}`,
        user_id: user.id,
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
        bio: 'New independent cleaner registered on DustBustars.',
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
      });
    }
    saveDb(db);
  }

  return {
    success: true,
    user,
    message: `User ${user.full_name} logged in successfully as ${user.role}.`,
  };
}
