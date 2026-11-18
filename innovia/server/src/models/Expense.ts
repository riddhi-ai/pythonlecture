import mongoose, { Schema, Document } from 'mongoose';
import { ExpenseCategory, ApprovalStatus } from '@innovia/shared';

export interface IExpenseDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  title: string;
  category: ExpenseCategory;
  amount: number; // in cents
  date: string;
  linkedContentId?: mongoose.Types.ObjectId;
  linkedCollaborationId?: mongoose.Types.ObjectId;
  receiptUrl?: string;
  approvalStatus: ApprovalStatus;
  isRecurring: boolean;
  submittedByUserId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpenseDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['equipment', 'props', 'travel', 'editing', 'ads', 'software', 'team_payment', 'other'],
      default: 'other',
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 }, // in cents
    date: { type: String, required: true, index: true },
    linkedContentId: { type: Schema.Types.ObjectId, ref: 'Content', index: true },
    linkedCollaborationId: { type: Schema.Types.ObjectId, ref: 'Collaboration', index: true },
    receiptUrl: { type: String },
    approvalStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Approved',
      index: true,
    },
    isRecurring: { type: Boolean, default: false },
    submittedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

ExpenseSchema.index({ workspaceId: 1, date: -1 });

export const ExpenseModel = mongoose.model<IExpenseDocument>('Expense', ExpenseSchema);
