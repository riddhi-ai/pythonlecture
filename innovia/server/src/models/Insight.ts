import mongoose, { Schema, Document } from 'mongoose';
import { InsightType } from '@innovia/shared';

export interface IInsightDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  type: InsightType;
  title: string;
  body: string;
  verdictSticker: string;
  createdAt: Date;
}

const InsightSchema = new Schema<IInsightDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    type: {
      type: String,
      enum: ['HIGH_MARGIN', 'TIME_SINK', 'PROFIT_STAR', 'EFFICIENCY'],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    verdictSticker: { type: String, default: 'star' },
  },
  { timestamps: true }
);

InsightSchema.index({ workspaceId: 1, createdAt: -1 });

export const InsightModel = mongoose.model<IInsightDocument>('Insight', InsightSchema);
