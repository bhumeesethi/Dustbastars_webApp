import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface ICommercialContractDoc extends Document {
  id: string;
  user_id: string;
  company_name: string;
  frequency: string;
  notes: string;
  status: 'pending' | 'approved' | 'active';
  created_at: Date;
}

const CommercialContractSchema = new Schema<ICommercialContractDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    user_id: { type: String, required: true, index: true },
    company_name: { type: String, required: true },
    frequency: { type: String, default: 'weekly' },
    notes: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'active'], default: 'pending' },
    created_at: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const CommercialContractModel = models.CommercialContract || model<ICommercialContractDoc>('CommercialContract', CommercialContractSchema);
