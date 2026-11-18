import mongoose, { Schema, Document } from 'mongoose';
import { ExpenseCategory } from '@innovia/shared';

export interface IRecurringExpenseDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  title: string;
  category: ExpenseCategory;
  amount: number; // in cents
  frequency: 'monthly';
  nextRunDate: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RecurringExpenseSchema = new Schema<IRecurringExpenseDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['equipment', 'props', 'travel', 'editing', 'ads', 'software', 'team_payment', 'other'],
      default: 'software',
    },
    amount: { type: Number, required: true, min: 0 },
    frequency: { type: String, default: 'monthly' },
    nextRunDate: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

RecurringExpenseSchema.index({ workspaceId: 1, active: 1, nextRunDate: 1 });

export const RecurringExpenseModel = mongoose.model<IRecurringExpenseDocument>(
  'RecurringExpense',
  RecurringExpenseSchema
);
