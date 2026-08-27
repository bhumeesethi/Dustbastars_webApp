import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface ICleanerProfileDoc extends Document {
  id: string;
  user_id: string;
  base_hourly_rate: number;
  min_booking_duration_hrs: number;
  accepts_short_jobs: boolean;
  short_job_flat_rate: number;
  dbs_status: 'pending' | 'approved' | 'rejected';
  dbs_payment_status: 'unpaid' | 'paid';
  dbs_provider: 'ucheck' | 'first_advantage';
  dbs_verified_at?: Date;
  service_center_postcode: string;
  service_center_lat: number;
  service_center_lng: number;
  service_radius_miles: number;
  bio: string;
  specialisms: string[];
  rates: Record<string, { enabled: boolean; charge_model: string; amount: number }>;
  opt_in_emergency: boolean;
  opt_in_afterhours: boolean;
  opt_in_quotes: boolean;
  payout_frequency: '48_hours' | 'weekly';
  weekly_availability: Record<string, string[]>;
  average_rating: number;
  total_completed_jobs: number;
  stripe_account_id?: string;
  payout_enabled: boolean;
}

const CleanerProfileSchema = new Schema<ICleanerProfileDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    user_id: { type: String, required: true, index: true },
    base_hourly_rate: { type: Number, default: 16.0 },
    min_booking_duration_hrs: { type: Number, default: 2 },
    accepts_short_jobs: { type: Boolean, default: true },
    short_job_flat_rate: { type: Number, default: 25.0 },
    dbs_status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
    dbs_payment_status: { type: String, enum: ['unpaid', 'paid'], default: 'paid' },
    dbs_provider: { type: String, enum: ['ucheck', 'first_advantage'], default: 'ucheck' },
    dbs_verified_at: { type: Date },
    service_center_postcode: { type: String, required: true },
    service_center_lat: { type: Number, default: 51.523 },
    service_center_lng: { type: Number, default: -0.095 },
    service_radius_miles: { type: Number, default: 5 },
    bio: { type: String, default: '' },
    specialisms: [{ type: String }],
    rates: { type: Schema.Types.Mixed, default: {} },
    opt_in_emergency: { type: Boolean, default: true },
    opt_in_afterhours: { type: Boolean, default: true },
    opt_in_quotes: { type: Boolean, default: true },
    payout_frequency: { type: String, enum: ['48_hours', 'weekly'], default: '48_hours' },
    weekly_availability: { type: Schema.Types.Mixed, default: {} },
    average_rating: { type: Number, default: 5.0 },
    total_completed_jobs: { type: Number, default: 0 },
    stripe_account_id: { type: String },
    payout_enabled: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const CleanerProfileModel = models.CleanerProfile || model<ICleanerProfileDoc>('CleanerProfile', CleanerProfileSchema);
