import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IChatMessageDoc extends Document {
  id: string;
  booking_id: string;
  sender_id: string;
  sender_role: 'customer' | 'cleaner' | 'admin';
  sender_name: string;
  message: string;
  created_at: Date;
}

const ChatMessageSchema = new Schema<IChatMessageDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    booking_id: { type: String, required: true, index: true },
    sender_id: { type: String, required: true },
    sender_role: { type: String, enum: ['customer', 'cleaner', 'admin'], required: true },
    sender_name: { type: String, required: true },
    message: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const ChatMessageModel = models.ChatMessage || model<IChatMessageDoc>('ChatMessage', ChatMessageSchema);
