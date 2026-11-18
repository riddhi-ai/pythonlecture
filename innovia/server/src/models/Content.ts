import mongoose, { Schema, Document } from 'mongoose';
import { PlatformType, ContentFormat, ContentStatus } from '@innovia/shared';

export interface IContentDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  collaborationId?: mongoose.Types.ObjectId;
  title: string;
  platform: PlatformType;
  type: ContentFormat;
  publishDate: string;
  status: ContentStatus;
  link?: string;
  estimatedRevenue: number; // in cents
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContentSchema = new Schema<IContentDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    collaborationId: { type: Schema.Types.ObjectId, ref: 'Collaboration', index: true },
    title: { type: String, required: true, trim: true },
    platform: {
      type: String,
      enum: ['YouTube', 'Instagram', 'TikTok', 'Twitter/X', 'LinkedIn', 'Blog', 'Podcast'],
      default: 'Instagram',
      required: true,
    },
    type: {
      type: String,
      enum: ['Reel', 'Short', 'Video', 'Post', 'Story', 'Blog'],
      default: 'Reel',
      required: true,
    },
    publishDate: { type: String, required: true },
    status: {
      type: String,
      enum: ['Planned', 'Filming', 'Editing', 'Published'],
      default: 'Planned',
    },
    link: { type: String },
    estimatedRevenue: { type: Number, default: 0 },
    notes: { type: String },
  },
  { timestamps: true }
);

ContentSchema.index({ workspaceId: 1, publishDate: 1 });
ContentSchema.index({ workspaceId: 1, platform: 1 });

export const ContentModel = mongoose.model<IContentDocument>('Content', ContentSchema);
