import mongoose, { Schema, Document } from 'mongoose';
import { PaymentType } from '@innovia/shared';

export interface IPaymentDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  recipientName: string;
  amount: number; // in cents
  status: 'Pending' | 'Approved' | 'Paid';
  dueDate?: string;
  paidDate?: string;
  type: PaymentType;
  referenceNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPaymentDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    recipientName: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 }, // in cents
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Paid'],
      default: 'Pending',
      index: true,
    },
    dueDate: { type: String },
    paidDate: { type: String },
    type: {
      type: String,
      enum: ['TEAM_PAYOUT', 'BRAND_INFLOW'],
      default: 'TEAM_PAYOUT',
    },
    referenceNote: { type: String },
  },
  { timestamps: true }
);

PaymentSchema.index({ workspaceId: 1, status: 1 });

export const PaymentModel = mongoose.model<IPaymentDocument>('Payment', PaymentSchema);
