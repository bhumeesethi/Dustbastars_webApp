import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb, CleanerRatesMap } from '../../../../lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || 'usr_cleaner_1';
  
  const db = getDb();
  const profile = db.cleaner_profiles.find(p => p.user_id === userId);

  if (!profile) {
    return NextResponse.json({ error: 'Cleaner profile not found' }, { status: 404 });
  }

  return NextResponse.json({ profile });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      baseHourlyRate,
      serviceCenterPostcode,
      serviceCenterLat,
      serviceCenterLng,
      serviceRadiusMiles,
      bio,
      rates,
      optInEmergency,
      optInAfterhours,
      optInQuotes,
      payoutFrequency
    } = body;

    const db = getDb();
    let profileIndex = db.cleaner_profiles.findIndex(p => p.user_id === userId);

    if (profileIndex === -1) {
      // Create new cleaner profile
      const newProfile = {
        id: `cln_prof_${Date.now()}`,
        user_id: userId,
        base_hourly_rate: baseHourlyRate || 16.0,
        min_booking_duration_hrs: 2,
        accepts_short_jobs: true,
        short_job_flat_rate: 35.0,
        dbs_status: 'pending' as const,
        dbs_payment_status: 'unpaid' as const,
        dbs_provider: 'ucheck' as const,
        service_center_postcode: serviceCenterPostcode || 'EC1M 3HA',
        service_center_lat: serviceCenterLat || 51.5205,
        service_center_lng: serviceCenterLng || -0.1051,
        service_radius_miles: serviceRadiusMiles || 5,
        bio: bio || '',
        specialisms: ['#standard', '#deep-clean'],
        rates: rates,
        opt_in_emergency: optInEmergency ?? true,
        opt_in_afterhours: optInAfterhours ?? true,
        opt_in_quotes: optInQuotes ?? true,
        payout_frequency: payoutFrequency || '48_hours',
        weekly_availability: {
          Mon: ['08:00-18:00'],
          Tue: ['08:00-18:00'],
          Wed: ['08:00-18:00'],
          Thu: ['08:00-18:00'],
          Fri: ['08:00-18:00']
        },
        average_rating: 5.0,
        total_completed_jobs: 0,
        payout_enabled: true
      };
      db.cleaner_profiles.push(newProfile);
      saveDb(db);
      return NextResponse.json({ success: true, profile: newProfile });
    } else {
      // Update existing profile
      const p = db.cleaner_profiles[profileIndex];
      p.base_hourly_rate = baseHourlyRate ?? p.base_hourly_rate;
      p.service_center_postcode = serviceCenterPostcode ?? p.service_center_postcode;
      p.service_center_lat = serviceCenterLat ?? p.service_center_lat;
      p.service_center_lng = serviceCenterLng ?? p.service_center_lng;
      p.service_radius_miles = serviceRadiusMiles ?? p.service_radius_miles;
      if (bio !== undefined) p.bio = bio;
      if (rates) p.rates = rates;
      if (optInEmergency !== undefined) p.opt_in_emergency = optInEmergency;
      if (optInAfterhours !== undefined) p.opt_in_afterhours = optInAfterhours;
      if (optInQuotes !== undefined) p.opt_in_quotes = optInQuotes;
      if (payoutFrequency) p.payout_frequency = payoutFrequency;

      saveDb(db);
      return NextResponse.json({ success: true, profile: p });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
