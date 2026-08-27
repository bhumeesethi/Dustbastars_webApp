import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IReviewDoc extends Document {
  id: string;
  booking_id: string;
  reviewer_id: string;
  reviewee_id: string;
  reviewer_role: 'customer' | 'cleaner';
  rating: number;
  comment: string;
  created_at: Date;
}

const ReviewSchema = new Schema<IReviewDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    booking_id: { type: String, required: true, index: true },
    reviewer_id: { type: String, required: true },
    reviewee_id: { type: String, required: true, index: true },
    reviewer_role: { type: String, enum: ['customer', 'cleaner'], required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
    created_at: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const ReviewModel = models.Review || model<IReviewDoc>('Review', ReviewSchema);
