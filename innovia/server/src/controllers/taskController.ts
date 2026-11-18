import { Request, Response } from 'express';
import { TaskModel } from '../models/Task.js';
import { TimeLogModel } from '../models/TimeLog.js';
import { AutomationScheduler } from '../jobs/cronJobs.js';
import { sseManager } from '../services/sseService.js';
import mongoose from 'mongoose';

export class TaskController {
  static async getAll(req: Request, res: Response) {
    try {
      const workspaceId = req.user!.workspaceId;
      const query: any = { workspaceId: new mongoose.Types.ObjectId(workspaceId) };

      if (req.user!.role === 'TEAM_MEMBER') {
        query.assigneeId = new mongoose.Types.ObjectId(req.user!.id);
      }

      const tasks = await TaskModel.find(query).sort({ dueDate: 1 });
      res.json(tasks);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const workspaceId = req.user!.workspaceId;
      const task = await TaskModel.create({
        ...req.body,
        workspaceId,
      });

      sseManager.broadcastToWorkspace(workspaceId, 'TASK_CREATED', task);
      res.status(201).json(task);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const workspaceId = req.user!.workspaceId;
      const oldTask = await TaskModel.findOne({ _id: id, workspaceId });

      if (!oldTask) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      const task = await TaskModel.findOneAndUpdate(
        { _id: id, workspaceId },
        req.body,
        { new: true }
      );

      // Auto time tracking logic:
      // If task moved to 'In Progress', start timer if none running
      if (oldTask.status !== 'In Progress' && req.body.status === 'In Progress') {
        const running = await TimeLogModel.findOne({
          taskId: id,
          userId: req.user!.id,
          isRunning: true,
        });
        if (!running) {
          await TimeLogModel.create({
            workspaceId,
            taskId: id,
            userId: req.user!.id,
            startTime: new Date().toISOString(),
            isRunning: true,
            notes: 'Auto-started when task moved to In Progress',
          });
        }
      }

      // If task moved to 'Review' or 'Done', stop running timer
      if (
        (req.body.status === 'Review' || req.body.status === 'Done') &&
        oldTask.status === 'In Progress'
      ) {
        const running = await TimeLogModel.findOne({
          taskId: id,
          userId: req.user!.id,
          isRunning: true,
        });
        if (running) {
          const now = new Date();
          const start = new Date(running.startTime);
          const diffMinutes = Math.max(1, Math.round((now.getTime() - start.getTime()) / 60000));
          running.endTime = now.toISOString();
          running.durationMinutes = diffMinutes;
          running.isRunning = false;
          await running.save();

          // Add to task actualHours
          if (task) {
            task.actualHours = Number(((task.actualHours || 0) + diffMinutes / 60).toFixed(1));
            await task.save();
          }
        }
      }

      // Check auto status for parent collaboration if done
      if (task?.collaborationId) {
        await AutomationScheduler.autoUpdateCollaborationStatus(task.collaborationId.toString());
      }

      sseManager.broadcastToWorkspace(workspaceId, 'TASK_UPDATED', task);
      res.json(task);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const workspaceId = req.user!.workspaceId;

      await TaskModel.findOneAndDelete({ _id: id, workspaceId });
      sseManager.broadcastToWorkspace(workspaceId, 'TASK_DELETED', { id });
      res.json({ message: 'Task deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  // Timer start
  static async startTimer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const workspaceId = req.user!.workspaceId;

      // Stop any other active timer for this user
      const existing = await TimeLogModel.findOne({
        workspaceId,
        userId: req.user!.id,
        isRunning: true,
      });

      if (existing) {
        const now = new Date();
        const start = new Date(existing.startTime);
        const mins = Math.max(1, Math.round((now.getTime() - start.getTime()) / 60000));
        existing.endTime = now.toISOString();
        existing.durationMinutes = mins;
        existing.isRunning = false;
        await existing.save();
      }

      const newLog = await TimeLogModel.create({
        workspaceId,
        taskId: id,
        userId: req.user!.id,
        startTime: new Date().toISOString(),
        isRunning: true,
      });

      // Update task status to 'In Progress'
      await TaskModel.findByIdAndUpdate(id, { status: 'In Progress' });

      sseManager.broadcastToWorkspace(workspaceId, 'TIMER_STARTED', newLog);
      res.status(201).json(newLog);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  // Timer stop
  static async stopTimer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const workspaceId = req.user!.workspaceId;

      const log = await TimeLogModel.findOne({
        taskId: id,
        userId: req.user!.id,
        isRunning: true,
      });

      if (!log) {
        res.status(404).json({ error: 'No active timer found for this task.' });
        return;
      }

      const now = new Date();
      const start = new Date(log.startTime);
      const diffMinutes = Math.max(1, Math.round((now.getTime() - start.getTime()) / 60000));
      log.endTime = now.toISOString();
      log.durationMinutes = diffMinutes;
      log.isRunning = false;
      await log.save();

      // Update task actualHours
      const task = await TaskModel.findById(id);
      if (task) {
        task.actualHours = Number(((task.actualHours || 0) + diffMinutes / 60).toFixed(1));
        await task.save();
      }

      sseManager.broadcastToWorkspace(workspaceId, 'TIMER_STOPPED', log);
      res.json(log);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  // Log manual time
  static async logManualTime(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { durationMinutes, notes, date } = req.body;
      const workspaceId = req.user!.workspaceId;

      const log = await TimeLogModel.create({
        workspaceId,
        taskId: id,
        userId: req.user!.id,
        startTime: date || new Date().toISOString(),
        endTime: date || new Date().toISOString(),
        durationMinutes,
        isRunning: false,
        notes,
      });

      const task = await TaskModel.findById(id);
      if (task) {
        task.actualHours = Number(((task.actualHours || 0) + durationMinutes / 60).toFixed(1));
        await task.save();
      }

      res.status(201).json(log);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  // Get time logs
  static async getTimeLogs(req: Request, res: Response) {
    try {
      const workspaceId = req.user!.workspaceId;
      const query: any = { workspaceId: new mongoose.Types.ObjectId(workspaceId) };

      if (req.user!.role === 'TEAM_MEMBER') {
        query.userId = new mongoose.Types.ObjectId(req.user!.id);
      }

      const logs = await TimeLogModel.find(query).sort({ createdAt: -1 });
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
