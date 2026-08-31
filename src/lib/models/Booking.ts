import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IBookingDoc extends Document {
  id: string;
  customer_id: string;
  cleaner_id?: string;
  property_id: string;
  booking_type: 'calendar_post' | 'direct_cleaner';
  cleaning_category: 'residential' | 'commercial' | 'other';
  cleaning_type: string;
  pricing_model: 'per_hour' | 'per_room' | 'quote';
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
  emergency_surcharge_amount?: number;
  cleaner_count?: number;
  cleaners_assigned?: string[];
  special_instructions?: string;
  quote_details?: string;
  quote_status?: 'pending' | 'submitted' | 'accepted' | 'declined';
  status: 'pending_match' | 'booked' | 'in_progress' | 'completed' | 'cancelled_by_customer' | 'cancelled_by_cleaner' | 'disputed';
  customer_started_at?: Date;
  customer_finished_at?: Date;
  cleaner_started_at?: Date;
  cleaner_finished_at?: Date;
  before_photos: string[];
  after_photos: string[];
  chat_unlocked_at?: Date;
  cancellation_reason?: string;
  cancellation_penalty_fee?: number;
  refunded_amount?: number;
  created_at: Date;
}

const BookingSchema = new Schema<IBookingDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    customer_id: { type: String, required: true, index: true },
    cleaner_id: { type: String, index: true },
    property_id: { type: String, required: true },
    booking_type: { type: String, enum: ['calendar_post', 'direct_cleaner'], required: true },
    cleaning_category: { type: String, enum: ['residential', 'commercial', 'other'], required: true },
    cleaning_type: { type: String, required: true },
    pricing_model: { type: String, enum: ['per_hour', 'per_room', 'quote'], required: true },
    units_count: { type: Number, default: 1 },
    scheduled_date: { type: String, required: true },
    scheduled_start_time: { type: String, required: true },
    is_emergency: { type: Boolean, default: false },
    is_afterhours: { type: Boolean, default: false },
    total_amount: { type: Number, required: true },
    deposit_amount: { type: Number, required: true },
    cleaner_payout_amount: { type: Number, required: true },
    platform_commission: { type: Number, required: true },
    surge_bonus_amount: { type: Number, default: 0 },
    emergency_surcharge_amount: { type: Number, default: 0 },
    cleaner_count: { type: Number, default: 1 },
    cleaners_assigned: [{ type: String }],
    special_instructions: { type: String },
    quote_details: { type: String },
    quote_status: { type: String, enum: ['pending', 'submitted', 'accepted', 'declined'] },
    status: { 
      type: String, 
      enum: ['pending_match', 'booked', 'in_progress', 'completed', 'cancelled_by_customer', 'cancelled_by_cleaner', 'disputed'],
      default: 'booked'
    },
    customer_started_at: { type: Date },
    customer_finished_at: { type: Date },
    cleaner_started_at: { type: Date },
    cleaner_finished_at: { type: Date },
    before_photos: [{ type: String }],
    after_photos: [{ type: String }],
    chat_unlocked_at: { type: Date },
    cancellation_reason: { type: String },
    cancellation_penalty_fee: { type: Number },
    refunded_amount: { type: Number },
    created_at: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const BookingModel = models.Booking || model<IBookingDoc>('Booking', BookingSchema);
