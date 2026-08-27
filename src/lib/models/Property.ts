import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IPropertyDoc extends Document {
  id: string;
  user_id: string;
  property_type: 'house' | 'flat' | 'office' | 'other';
  name: string;
  other_description?: string;
  address_id: string;
  bedrooms_count?: number;
  bathrooms_count?: number;
  sqft_area?: number;
  created_at: Date;
}

const PropertySchema = new Schema<IPropertyDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    user_id: { type: String, required: true, index: true },
    property_type: { type: String, enum: ['house', 'flat', 'office', 'other'], required: true },
    name: { type: String, required: true },
    other_description: { type: String },
    address_id: { type: String, default: 'addr_default' },
    bedrooms_count: { type: Number },
    bathrooms_count: { type: Number },
    sqft_area: { type: Number },
    created_at: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const PropertyModel = models.Property || model<IPropertyDoc>('Property', PropertySchema);
