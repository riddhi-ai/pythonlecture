import mongoose, { Schema, Document } from 'mongoose';
import { TaskStatus, TaskPriority } from '@innovia/shared';

export interface ITaskDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  collaborationId?: mongoose.Types.ObjectId;
  contentId?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  assigneeId?: mongoose.Types.ObjectId;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITaskDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    collaborationId: { type: Schema.Types.ObjectId, ref: 'Collaboration', index: true },
    contentId: { type: Schema.Types.ObjectId, ref: 'Content', index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    assigneeId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    status: {
      type: String,
      enum: ['To Do', 'In Progress', 'Review', 'Done'],
      default: 'To Do',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    dueDate: { type: String, required: true, index: true },
    estimatedHours: { type: Number, default: 1, min: 0 },
    actualHours: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

TaskSchema.index({ workspaceId: 1, status: 1 });
TaskSchema.index({ workspaceId: 1, dueDate: 1 });

export const TaskModel = mongoose.model<ITaskDocument>('Task', TaskSchema);
