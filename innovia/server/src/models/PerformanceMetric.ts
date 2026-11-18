import mongoose, { Schema, Document } from 'mongoose';

export interface IPerformanceMetricDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  contentId: mongoose.Types.ObjectId;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  followersGained: number;
  engagementRate: number;
  recordedAt: Date;
}

const PerformanceMetricSchema = new Schema<IPerformanceMetricDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    contentId: { type: Schema.Types.ObjectId, ref: 'Content', required: true, index: true, unique: true },
    views: { type: Number, default: 0, min: 0 },
    likes: { type: Number, default: 0, min: 0 },
    comments: { type: Number, default: 0, min: 0 },
    shares: { type: Number, default: 0, min: 0 },
    saves: { type: Number, default: 0, min: 0 },
    followersGained: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 },
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

PerformanceMetricSchema.pre('save', function (next) {
  if (this.views > 0) {
    const totalInteractions = (this.likes || 0) + (this.comments || 0) + (this.shares || 0) + (this.saves || 0);
    this.engagementRate = Number(((totalInteractions / this.views) * 100).toFixed(2));
  } else {
    this.engagementRate = 0;
  }
  next();
});

export const PerformanceMetricModel = mongoose.model<IPerformanceMetricDocument>(
  'PerformanceMetric',
  PerformanceMetricSchema
);
