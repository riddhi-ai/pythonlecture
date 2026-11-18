import mongoose, { Schema, Document } from 'mongoose';

export interface ITimeLogDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  startTime: string;
  endTime?: string;
  durationMinutes: number;
  isRunning: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TimeLogSchema = new Schema<ITimeLogDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String },
    durationMinutes: { type: Number, default: 0, min: 0 },
    isRunning: { type: Boolean, default: false },
    notes: { type: String },
  },
  { timestamps: true }
);

TimeLogSchema.index({ workspaceId: 1, userId: 1 });

export const TimeLogModel = mongoose.model<ITimeLogDocument>('TimeLog', TimeLogSchema);
