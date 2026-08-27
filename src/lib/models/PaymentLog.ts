import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IPaymentLogDoc extends Document {
  id: string;
  booking_id: string;
  customer_id: string;
  cleaner_id?: string;
  stripe_session_id?: string;
  stripe_transfer_id?: string;
  amount: number;
  deposit_amount: number;
  cleaner_payout_amount: number;
  platform_commission: number;
  status: 'pending' | 'completed' | 'refunded' | 'failed';
  created_at: Date;
}

const PaymentLogSchema = new Schema<IPaymentLogDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    booking_id: { type: String, required: true, index: true },
    customer_id: { type: String, required: true },
    cleaner_id: { type: String },
    stripe_session_id: { type: String },
    stripe_transfer_id: { type: String },
    amount: { type: Number, required: true },
    deposit_amount: { type: Number, required: true },
    cleaner_payout_amount: { type: Number, required: true },
    platform_commission: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'completed', 'refunded', 'failed'], default: 'completed' },
    created_at: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const PaymentLogModel = models.PaymentLog || model<IPaymentLogDoc>('PaymentLog', PaymentLogSchema);
