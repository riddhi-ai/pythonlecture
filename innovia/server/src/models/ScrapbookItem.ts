import mongoose, { Schema, Document } from 'mongoose';

export interface IScrapbookItemDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  stickerId: string;
  stickerType: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  noteText?: string;
  color?: string;
  zIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

const ScrapbookItemSchema = new Schema<IScrapbookItemDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    stickerId: { type: String, required: true },
    stickerType: { type: String, required: true },
    x: { type: Number, default: 100 },
    y: { type: Number, default: 100 },
    width: { type: Number, default: 90 },
    height: { type: Number, default: 90 },
    rotation: { type: Number, default: 0 },
    noteText: { type: String },
    color: { type: String },
    zIndex: { type: Number, default: 1 },
  },
  { timestamps: true }
);

ScrapbookItemSchema.index({ workspaceId: 1, userId: 1 });

export const ScrapbookItemModel = mongoose.model<IScrapbookItemDocument>(
  'ScrapbookItem',
  ScrapbookItemSchema
);
