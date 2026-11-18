import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkspaceDocument extends Document {
  name: string;
  ownerId: mongoose.Types.ObjectId;
  currency: string;
  niche?: string;
  bio?: string;
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceSchema = new Schema<IWorkspaceDocument>(
  {
    name: { type: String, required: true, trim: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
    currency: { type: String, default: 'USD', uppercase: true },
    niche: { type: String, default: 'Tech & Lifestyle' },
    bio: { type: String, default: 'Building and creating every day.' },
    inviteCode: {
      type: String,
      unique: true,
      default: () => Math.random().toString(36).substring(2, 8).toUpperCase(),
    },
  },
  { timestamps: true }
);

WorkspaceSchema.index({ ownerId: 1 });

export const WorkspaceModel = mongoose.model<IWorkspaceDocument>('Workspace', WorkspaceSchema);
