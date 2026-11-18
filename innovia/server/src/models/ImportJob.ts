import mongoose, { Schema } from 'mongoose';

export interface IImportJob {
  workspaceId: mongoose.Types.ObjectId;
  entityType: 'content' | 'expenses';
  totalRows: number;
  successRows: number;
  errorRows: number;
  errorDetails: string[];
  createdAt: Date;
}

const ImportJobSchema = new Schema<IImportJob>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    entityType: { type: String, enum: ['content', 'expenses'], required: true },
    totalRows: { type: Number, default: 0 },
    successRows: { type: Number, default: 0 },
    errorRows: { type: Number, default: 0 },
    errorDetails: [{ type: String }],
  },
  { timestamps: true }
);

export const ImportJobModel = mongoose.model<IImportJob>('ImportJob', ImportJobSchema);
