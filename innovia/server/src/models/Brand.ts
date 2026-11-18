import mongoose, { Schema, Document } from 'mongoose';

export interface IBrandDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  name: string;
  logoUrl?: string;
  contactName?: string;
  contactEmail?: string;
  category?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = new Schema<IBrandDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    name: { type: String, required: true, trim: true },
    logoUrl: { type: String },
    contactName: { type: String },
    contactEmail: { type: String, lowercase: true, trim: true },
    category: { type: String, default: 'General' },
    notes: { type: String },
  },
  { timestamps: true }
);

BrandSchema.index({ workspaceId: 1, name: 1 });

export const BrandModel = mongoose.model<IBrandDocument>('Brand', BrandSchema);
