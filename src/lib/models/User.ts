import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IUserDoc extends Document {
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
  created_at: Date;
}

const UserSchema = new Schema<IUserDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    role: { type: String, enum: ['customer', 'cleaner', 'admin'], required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    full_name: { type: String, required: true },
    avatar_url: { type: String },
    id_document_url: { type: String },
    selfie_url: { type: String },
    id_verified: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'pending_approval', 'suspended'], default: 'active' },
    created_at: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const UserModel = models.User || model<IUserDoc>('User', UserSchema);
