import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '@innovia/shared';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  avatarSticker?: string;
  hourlyRate?: number; // stored in cents
  workspaceId: mongoose.Types.ObjectId;
  linkedCollaborationIds?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['CREATOR', 'COLLABORATOR', 'TEAM_MEMBER'],
      default: 'CREATOR',
      required: true,
    },
    avatarSticker: { type: String, default: 'camera' },
    hourlyRate: { type: Number, default: 0 },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    linkedCollaborationIds: [{ type: Schema.Types.ObjectId, ref: 'Collaboration' }],
  },
  { timestamps: true }
);

UserSchema.index({ workspaceId: 1, role: 1 });

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
