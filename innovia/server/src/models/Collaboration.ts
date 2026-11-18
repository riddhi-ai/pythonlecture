import mongoose, { Schema, Document } from 'mongoose';
import { CollaborationStatus, PaymentStatus } from '@innovia/shared';

export interface IDeliverable {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export interface IAssetBrief {
  id: string;
  title: string;
  url: string;
  uploadedAt: string;
  uploaderRole: string;
}

export interface ICollabComment {
  id: string;
  authorName: string;
  role: string;
  comment: string;
  date: string;
}

export interface ICollaborationDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  brandId?: mongoose.Types.ObjectId;
  brandName: string;
  title: string;
  dealValue: number; // in cents
  currency: string;
  deliverables: IDeliverable[];
  startDate: string;
  deadlineDate: string;
  status: CollaborationStatus;
  paymentStatus: PaymentStatus;
  collaboratorUserId?: mongoose.Types.ObjectId;
  assignedTeamUserIds: mongoose.Types.ObjectId[];
  notes?: string;
  briefs: IAssetBrief[];
  feedbackComments: ICollabComment[];
  createdAt: Date;
  updatedAt: Date;
}

const DeliverableSchema = new Schema<IDeliverable>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    dueDate: { type: String },
  },
  { _id: false }
);

const AssetBriefSchema = new Schema<IAssetBrief>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
    uploadedAt: { type: String, required: true },
    uploaderRole: { type: String, default: 'CREATOR' },
  },
  { _id: false }
);

const CollabCommentSchema = new Schema<ICollabComment>(
  {
    id: { type: String, required: true },
    authorName: { type: String, required: true },
    role: { type: String, required: true },
    comment: { type: String, required: true },
    date: { type: String, required: true },
  },
  { _id: false }
);

const CollaborationSchema = new Schema<ICollaborationDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand' },
    brandName: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    dealValue: { type: Number, required: true, min: 0 }, // stored in minor units (cents)
    currency: { type: String, default: 'USD' },
    deliverables: [DeliverableSchema],
    startDate: { type: String, required: true },
    deadlineDate: { type: String, required: true },
    status: {
      type: String,
      enum: ['Pitched', 'Negotiating', 'Signed', 'In Production', 'Delivered', 'Paid', 'Cancelled'],
      default: 'Pitched',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Unpaid', 'Partial', 'Paid'],
      default: 'Unpaid',
    },
    collaboratorUserId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    assignedTeamUserIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    notes: { type: String },
    briefs: [AssetBriefSchema],
    feedbackComments: [CollabCommentSchema],
  },
  { timestamps: true }
);

CollaborationSchema.index({ workspaceId: 1, status: 1 });
CollaborationSchema.index({ workspaceId: 1, deadlineDate: 1 });

export const CollaborationModel = mongoose.model<ICollaborationDocument>(
  'Collaboration',
  CollaborationSchema
);
