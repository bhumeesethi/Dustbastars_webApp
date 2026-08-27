import mongoose, { Schema, Document, Model } from 'mongoose';

// ---------------------------------------------------------------------------
// 1. USER SCHEMA & MODEL
// ---------------------------------------------------------------------------
export interface IUser extends Document {
  id: string;
  role: 'customer' | 'cleaner' | 'admin';
  phone: string;
  email: string;
  full_name: string;
  password_hash?: string;
  password_salt?: string;
  avatar_url?: string;
  id_document_url?: string;
  selfie_url?: string;
  id_verified: boolean;
  status: 'active' | 'pending_approval' | 'suspended';
  created_at: string;
}

const UserSchema: Schema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true },
    role: { type: String, required: true, enum: ['customer', 'cleaner', 'admin'] },
    phone: { type: String, default: '+44 7900 000000' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    full_name: { type: String, required: true },
    password_hash: { type: String },
    password_salt: { type: String },
    avatar_url: { type: String },
    id_document_url: { type: String },
    selfie_url: { type: String },
    id_verified: { type: Boolean, default: true },
    status: { type: String, default: 'active', enum: ['active', 'pending_approval', 'suspended'] },
    created_at: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// ---------------------------------------------------------------------------
// 2. CLEANER PROFILE SCHEMA & MODEL
// ---------------------------------------------------------------------------
export interface ICleanerProfile extends Document {
  id: string;
  user_id: string;
  base_hourly_rate: number;
  min_booking_duration_hrs: number;
  accepts_short_jobs: boolean;
  short_job_flat_rate: number;
  dbs_status: 'pending' | 'approved' | 'rejected';
  dbs_payment_status: 'unpaid' | 'paid';
  dbs_provider: string;
  dbs_verified_at?: string;
  service_center_postcode: string;
  service_center_lat: number;
  service_center_lng: number;
  service_radius_miles: number;
  bio: string;
  specialisms: string[];
  rates: Record<string, any>;
  opt_in_emergency: boolean;
  opt_in_afterhours: boolean;
  opt_in_quotes: boolean;
  payout_frequency: string;
  weekly_availability: Record<string, string[]>;
  average_rating: number;
  total_completed_jobs: number;
  stripe_account_id?: string;
  payout_enabled: boolean;
}

const CleanerProfileSchema: Schema = new Schema<ICleanerProfile>(
  {
    id: { type: String, required: true, unique: true },
    user_id: { type: String, required: true, ref: 'User' },
    base_hourly_rate: { type: Number, default: 17.0 },
    min_booking_duration_hrs: { type: Number, default: 2 },
    accepts_short_jobs: { type: Boolean, default: true },
    short_job_flat_rate: { type: Number, default: 35.0 },
    dbs_status: { type: String, default: 'approved' },
    dbs_payment_status: { type: String, default: 'paid' },
    dbs_provider: { type: String, default: 'ucheck' },
    dbs_verified_at: { type: String, default: () => new Date().toISOString() },
    service_center_postcode: { type: String, default: 'EC1M 3HA' },
    service_center_lat: { type: Number, default: 51.5205 },
    service_center_lng: { type: Number, default: -0.1051 },
    service_radius_miles: { type: Number, default: 5 },
    bio: { type: String, default: 'Experienced professional cleaner in London.' },
    specialisms: { type: [String], default: ['#domestic', '#deep-clean', '#airbnb'] },
    rates: { type: Schema.Types.Mixed, default: {} },
    opt_in_emergency: { type: Boolean, default: true },
    opt_in_afterhours: { type: Boolean, default: true },
    opt_in_quotes: { type: Boolean, default: true },
    payout_frequency: { type: String, default: '48_hours' },
    weekly_availability: { type: Schema.Types.Mixed, default: {} },
    average_rating: { type: Number, default: 4.95 },
    total_completed_jobs: { type: Number, default: 142 },
    stripe_account_id: { type: String },
    payout_enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const CleanerProfileModel: Model<ICleanerProfile> =
  mongoose.models.CleanerProfile || mongoose.model<ICleanerProfile>('CleanerProfile', CleanerProfileSchema);

// ---------------------------------------------------------------------------
// 3. PROPERTY SCHEMA & MODEL
// ---------------------------------------------------------------------------
export interface IProperty extends Document {
  id: string;
  user_id: string;
  property_type: 'house' | 'flat' | 'office' | 'other';
  name: string;
  other_description?: string;
  address_id: string;
  bedrooms_count?: number;
  bathrooms_count?: number;
  sqft_area?: number;
  created_at: string;
}

const PropertySchema: Schema = new Schema<IProperty>(
  {
    id: { type: String, required: true, unique: true },
    user_id: { type: String, required: true, ref: 'User' },
    property_type: { type: String, required: true, enum: ['house', 'flat', 'office', 'other'] },
    name: { type: String, required: true },
    other_description: { type: String },
    address_id: { type: String, required: true },
    bedrooms_count: { type: Number },
    bathrooms_count: { type: Number },
    sqft_area: { type: Number },
    created_at: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

export const PropertyModel: Model<IProperty> =
  mongoose.models.Property || mongoose.model<IProperty>('Property', PropertySchema);

// ---------------------------------------------------------------------------
// 4. BOOKING SCHEMA & MODEL
// ---------------------------------------------------------------------------
export interface IBooking extends Document {
  id: string;
  customer_id: string;
  cleaner_id?: string;
  property_id: string;
  booking_type: string;
  cleaning_category: string;
  cleaning_type: string;
  pricing_model: string;
  units_count: number;
  scheduled_date: string;
  scheduled_start_time: string;
  is_emergency: boolean;
  is_afterhours: boolean;
  total_amount: number;
  deposit_amount: number;
  cleaner_payout_amount: number;
  platform_commission: number;
  surge_bonus_amount: number;
  special_instructions?: string;
  status: string;
  before_photos: string[];
  after_photos: string[];
  chat_unlocked_at?: string;
  created_at: string;
}

const BookingSchema: Schema = new Schema<IBooking>(
  {
    id: { type: String, required: true, unique: true },
    customer_id: { type: String, required: true, ref: 'User' },
    cleaner_id: { type: String, ref: 'User' },
    property_id: { type: String, required: true },
    booking_type: { type: String, default: 'direct_cleaner' },
    cleaning_category: { type: String, default: 'residential' },
    cleaning_type: { type: String, required: true },
    pricing_model: { type: String, default: 'per_hour' },
    units_count: { type: Number, default: 2 },
    scheduled_date: { type: String, required: true },
    scheduled_start_time: { type: String, required: true },
    is_emergency: { type: Boolean, default: false },
    is_afterhours: { type: Boolean, default: false },
    total_amount: { type: Number, required: true },
    deposit_amount: { type: Number, required: true },
    cleaner_payout_amount: { type: Number, required: true },
    platform_commission: { type: Number, required: true },
    surge_bonus_amount: { type: Number, default: 0 },
    special_instructions: { type: String },
    status: { type: String, default: 'booked' },
    before_photos: { type: [String], default: [] },
    after_photos: { type: [String], default: [] },
    chat_unlocked_at: { type: String, default: () => new Date().toISOString() },
    created_at: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

export const BookingModel: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

// ---------------------------------------------------------------------------
// 5. CHAT MESSAGE SCHEMA & MODEL
// ---------------------------------------------------------------------------
export interface IChatMessage extends Document {
  id: string;
  booking_id: string;
  sender_id: string;
  sender_role: string;
  sender_name: string;
  message: string;
  created_at: string;
}

const ChatMessageSchema: Schema = new Schema<IChatMessage>(
  {
    id: { type: String, required: true, unique: true },
    booking_id: { type: String, required: true, ref: 'Booking' },
    sender_id: { type: String, required: true, ref: 'User' },
    sender_role: { type: String, required: true },
    sender_name: { type: String, required: true },
    message: { type: String, required: true },
    created_at: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

export const ChatMessageModel: Model<IChatMessage> =
  mongoose.models.ChatMessage || mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);

// ---------------------------------------------------------------------------
// 6. AUDIT LOG SCHEMA & MODEL (ADMIN ACTION TRAIL)
// ---------------------------------------------------------------------------
export interface IAuditLog extends Document {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  target_resource: string;
  details: string;
  status: 'success' | 'failed';
  created_at: string;
}

const AuditLogSchema: Schema = new Schema<IAuditLog>(
  {
    id: { type: String, required: true, unique: true },
    admin_id: { type: String, required: true },
    admin_name: { type: String, required: true },
    action: { type: String, required: true },
    target_resource: { type: String, required: true },
    details: { type: String, required: true },
    status: { type: String, default: 'success', enum: ['success', 'failed'] },
    created_at: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

export const AuditLogModel: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
