import { Request, Response } from 'express';
import { AutomationScheduler } from '../jobs/cronJobs.js';
import { ImportService } from '../services/importService.js';
import { ExpenseModel } from '../models/Expense.js';
import { TaskModel } from '../models/Task.js';
import { CollaborationModel } from '../models/Collaboration.js';
import { ContentModel } from '../models/Content.js';
import { seedWorkspaceData } from '../seed/sampleData.js';
import { sseManager } from '../services/sseService.js';
import mongoose from 'mongoose';

export class AutomationController {
  // 1. One-click fill journal with rich sample data
  static async seedDemoData(req: Request, res: Response) {
    try {
      const workspaceId = req.user!.workspaceId;
      const result = await seedWorkspaceData(workspaceId, req.user!.id);
      sseManager.broadcastToWorkspace(workspaceId, 'WORKSPACE_SEEDED', { success: true });
      res.json({ message: 'Journal filled with sample creator data successfully!', ...result });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  // 2. Trigger scheduled background jobs on-demand
  static async runAutomations(req: Request, res: Response) {
    try {
      const workspaceId = req.user!.workspaceId;
      const reminders = await AutomationScheduler.runDeadlineReminders(workspaceId);
      const recurring = await AutomationScheduler.processRecurringExpenses(workspaceId);
      const teamPayouts = await AutomationScheduler.autoCalculateTeamPayments(workspaceId);
      await AutomationScheduler.generateWeeklyRecap(workspaceId);

      res.json({
        message: 'All background automations executed successfully!',
        reminders,
        recurring,
        teamPayouts,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  // 3. Quick-Add Command Bar Parser (/ or Ctrl+K)
  // Examples:
  // "expense 1200 props for reel 12"
  // "task review final cut due tomorrow"
  // "collab Nike Summer Campaign 4500"
  // "content Tech desk tour Reel"
  static async quickAdd(req: Request, res: Response) {
    try {
      const workspaceId = req.user!.workspaceId;
      const { text } = req.body;

      if (!text || typeof text !== 'string') {
        res.status(400).json({ error: 'Command text is required' });
        return;
      }

      const clean = text.trim();
      const parts = clean.split(' ');
      const command = parts[0].toLowerCase();
      const rest = parts.slice(1).join(' ');

      if (command === 'expense') {
        // e.g. "expense 450 props for shoot"
        const amountMatch = rest.match(/(\d+(\.\d{1,2})?)/);
        const amount = amountMatch ? Math.round(parseFloat(amountMatch[1]) * 100) : 2500;
        const description = rest.replace(amountMatch ? amountMatch[0] : '', '').trim() || 'Quick Expense';

        let category: any = 'other';
        if (description.toLowerCase().includes('prop')) category = 'props';
        else if (description.toLowerCase().includes('gear') || description.toLowerCase().includes('camera')) category = 'equipment';
        else if (description.toLowerCase().includes('travel') || description.toLowerCase().includes('flight')) category = 'travel';
        else if (description.toLowerCase().includes('edit')) category = 'editing';
        else if (description.toLowerCase().includes('software') || description.toLowerCase().includes('app')) category = 'software';

        const expense = await ExpenseModel.create({
          workspaceId,
          title: description,
          amount,
          category,
          date: new Date().toISOString().split('T')[0],
          approvalStatus: 'Approved',
        });

        sseManager.broadcastToWorkspace(workspaceId, 'EXPENSE_CREATED', expense);
        res.status(201).json({ type: 'EXPENSE', item: expense, feedback: `Added expense: $${(amount / 100).toFixed(2)} for "${description}"` });
        return;
      }

      if (command === 'task') {
        // e.g. "task edit intro reel due friday"
        const task = await TaskModel.create({
          workspaceId,
          title: rest || 'New Task',
          status: 'To Do',
          priority: rest.toLowerCase().includes('urgent') ? 'Urgent' : 'Medium',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          estimatedHours: 2,
        });

        sseManager.broadcastToWorkspace(workspaceId, 'TASK_CREATED', task);
        res.status(201).json({ type: 'TASK', item: task, feedback: `Created task: "${task.title}"` });
        return;
      }

      if (command === 'collab') {
        // e.g. "collab Spotify Podcast Sponsor 3500"
        const amountMatch = rest.match(/(\d+)/);
        const dealValue = amountMatch ? parseInt(amountMatch[1], 10) * 100 : 250000;
        const title = rest.replace(amountMatch ? amountMatch[0] : '', '').trim() || 'New Brand Deal';

        const collab = await CollaborationModel.create({
          workspaceId,
          title,
          brandName: title.split(' ')[0] || 'Brand Partner',
          dealValue,
          currency: 'USD',
          startDate: new Date().toISOString().split('T')[0],
          deadlineDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'Pitched',
          paymentStatus: 'Unpaid',
          deliverables: [{ id: 'd1', title: '1x Integrated Sponsor Reel', completed: false }],
        });

        sseManager.broadcastToWorkspace(workspaceId, 'COLLAB_CREATED', collab);
        res.status(201).json({ type: 'COLLABORATION', item: collab, feedback: `Created collaboration: "${title}" ($${(dealValue / 100).toFixed(2)})` });
        return;
      }

      if (command === 'content') {
        // e.g. "content Top 5 Desk Setup Items"
        const content = await ContentModel.create({
          workspaceId,
          title: rest || 'New Content Draft',
          platform: 'Instagram',
          type: 'Reel',
          publishDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'Planned',
        });

        sseManager.broadcastToWorkspace(workspaceId, 'CONTENT_CREATED', content);
        res.status(201).json({ type: 'CONTENT', item: content, feedback: `Planned new post: "${content.title}"` });
        return;
      }

      res.status(400).json({
        error: `Unrecognized command. Try: "expense 120 props", "task edit video", "collab Nike 3000", or "content Desk Tour Reel".`,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  // 4. CSV Import
  static async importCSV(req: Request, res: Response) {
    try {
      const workspaceId = req.user!.workspaceId;
      const { entityType, csvContent } = req.body;

      if (!csvContent) {
        res.status(400).json({ error: 'csvContent string is required' });
        return;
      }

      if (entityType === 'content') {
        const result = await ImportService.importContent(workspaceId, csvContent);
        res.json({ message: 'Content CSV processed', result });
      } else if (entityType === 'expenses') {
        const result = await ImportService.importExpenses(workspaceId, csvContent);
        res.json({ message: 'Expenses CSV processed', result });
      } else {
        res.status(400).json({ error: 'entityType must be either "content" or "expenses"' });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
