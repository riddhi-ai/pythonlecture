import mongoose, { Schema, Document } from 'mongoose';
import { NotificationType } from '@innovia/shared';

export interface INotificationDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['DEADLINE', 'PAYMENT', 'DELIVERABLE', 'SYSTEM', 'INSIGHT'],
      default: 'SYSTEM',
    },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
  },
  { timestamps: true }
);

NotificationSchema.index({ workspaceId: 1, userId: 1, isRead: 1 });

export const NotificationModel = mongoose.model<INotificationDocument>(
  'Notification',
  NotificationSchema
);
