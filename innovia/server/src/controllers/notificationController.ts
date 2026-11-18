import { Request, Response } from 'express';
import { NotificationModel } from '../models/Notification.js';
import { CollaborationModel } from '../models/Collaboration.js';
import { TaskModel } from '../models/Task.js';
import { FinanceService } from '../services/financeService.js';
import mongoose from 'mongoose';

export class NotificationController {
  static async getAll(req: Request, res: Response) {
    try {
      const workspaceId = req.user!.workspaceId;
      const userId = req.user!.id;

      const notifications = await NotificationModel.find({
        workspaceId: new mongoose.Types.ObjectId(workspaceId),
        userId: new mongoose.Types.ObjectId(userId),
      }).sort({ createdAt: -1 });

      res.json(notifications);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async markRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const notification = await NotificationModel.findByIdAndUpdate(
        id,
        { isRead: true, readAt: new Date() },
        { new: true }
      );
      res.json(notification);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async markAllRead(req: Request, res: Response) {
    try {
      const workspaceId = req.user!.workspaceId;
      const userId = req.user!.id;

      await NotificationModel.updateMany(
        { workspaceId, userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );

      res.json({ message: 'All notifications marked as read' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getWeeklyDigest(req: Request, res: Response) {
    try {
      const workspaceId = req.user!.workspaceId;
      const wsObjectId = new mongoose.Types.ObjectId(workspaceId);

      const summary = await FinanceService.calculateWorkspaceSummary(workspaceId);
      const completedCollabs = await CollaborationModel.find({
        workspaceId: wsObjectId,
        status: { $in: ['Delivered', 'Paid'] },
      }).limit(5);

      const completedTasks = await TaskModel.find({
        workspaceId: wsObjectId,
        status: 'Done',
      }).limit(10);

      const digest = {
        title: 'Weekly Creator Journal Digest',
        weekPeriod: 'Current Week',
        highlights: [
          `Cleared $${(summary.netProfit / 100).toFixed(0)} net profit with a ${summary.profitMargin}% margin!`,
          `Logged ${summary.totalHours} productive production hours across tasks.`,
          `Average social engagement rate holding strong at ${summary.averageEngagement}%.`,
          `Worth It Verdict: "${summary.worthItVerdict}" (${summary.worthItScore}/100)`,
        ],
        completedCollabsCount: completedCollabs.length,
        completedTasksCount: completedTasks.length,
        stickerVerdict: summary.worthItSticker,
        summary,
      };

      res.json(digest);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
