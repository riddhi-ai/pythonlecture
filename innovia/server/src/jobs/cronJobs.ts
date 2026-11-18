import cron from 'node-cron';
import { TaskModel } from '../models/Task.js';
import { CollaborationModel } from '../models/Collaboration.js';
import { PaymentModel } from '../models/Payment.js';
import { RecurringExpenseModel } from '../models/RecurringExpense.js';
import { ExpenseModel } from '../models/Expense.js';
import { NotificationService } from '../services/notificationService.js';
import { InsightEngine } from '../services/insightEngine.js';
import { UserModel } from '../models/User.js';
import { TimeLogModel } from '../models/TimeLog.js';
import { sseManager } from '../services/sseService.js';

export class AutomationScheduler {
  static init() {
    console.log('[Automation] Initializing node-cron background automations...');

    // 1. Run daily at 08:00 AM (or every hour in dev) - Check 48h deadlines, overdue items
    cron.schedule('0 8 * * *', async () => {
      console.log('[Cron] Executing daily deadline and overdue reminder job...');
      await this.runDeadlineReminders();
    });

    // 2. Run daily at midnight - Process recurring expenses
    cron.schedule('0 0 * * *', async () => {
      console.log('[Cron] Executing recurring expenses processing job...');
      await this.processRecurringExpenses();
    });

    // 3. Run weekly on Sunday night at 23:00 - Generate weekly journal recap & insights
    cron.schedule('0 23 * * 0', async () => {
      console.log('[Cron] Executing weekly recap generation...');
      await this.generateWeeklyRecap();
    });
  }

  /**
   * Checks tasks, deliverables, and payments due within 48h or overdue
   */
  static async runDeadlineReminders(workspaceId?: string) {
    const now = new Date();
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const todayStr = now.toISOString().split('T')[0];
    const in48Str = in48Hours.toISOString().split('T')[0];

    const taskQuery: any = {
      status: { $in: ['To Do', 'In Progress'] },
      dueDate: { $lte: in48Str },
    };
    if (workspaceId) taskQuery.workspaceId = workspaceId;

    const upcomingTasks = await TaskModel.find(taskQuery);
    for (const task of upcomingTasks) {
      if (task.assigneeId) {
        const isOverdue = task.dueDate < todayStr;
        await NotificationService.notify({
          workspaceId: task.workspaceId.toString(),
          userId: task.assigneeId.toString(),
          title: isOverdue ? `⚠️ Overdue Task: ${task.title}` : `⏰ Task Due in 48h: ${task.title}`,
          message: `Task is due on ${task.dueDate}. Priority: ${task.priority}.`,
          type: 'DEADLINE',
        });
      }
    }

    // Overdue payments check
    const paymentQuery: any = {
      status: 'Pending',
      dueDate: { $lte: todayStr },
    };
    if (workspaceId) paymentQuery.workspaceId = workspaceId;
    const overduePayments = await PaymentModel.find(paymentQuery);
    for (const payment of overduePayments) {
      if (payment.userId) {
        await NotificationService.notify({
          workspaceId: payment.workspaceId.toString(),
          userId: payment.userId.toString(),
          title: `💰 Payment Due: ${payment.recipientName}`,
          message: `Payment of $${(payment.amount / 100).toFixed(2)} is pending since ${payment.dueDate || 'today'}.`,
          type: 'PAYMENT',
        });
      }
    }

    return { processedTasks: upcomingTasks.length, processedPayments: overduePayments.length };
  }

  /**
   * Auto-creates monthly recurring expenses
   */
  static async processRecurringExpenses(workspaceId?: string) {
    const todayStr = new Date().toISOString().split('T')[0];
    const query: any = { active: true, nextRunDate: { $lte: todayStr } };
    if (workspaceId) query.workspaceId = workspaceId;

    const recurrings = await RecurringExpenseModel.find(query);
    let createdCount = 0;

    for (const rec of recurrings) {
      await ExpenseModel.create({
        workspaceId: rec.workspaceId,
        title: `${rec.title} (Monthly Subscription)`,
        category: rec.category,
        amount: rec.amount,
        date: todayStr,
        approvalStatus: 'Approved',
        isRecurring: true,
      });

      // Advance nextRunDate by 1 month
      const nextDate = new Date();
      nextDate.setMonth(nextDate.getMonth() + 1);
      rec.nextRunDate = nextDate.toISOString().split('T')[0];
      await rec.save();

      createdCount++;
    }

    return { processedRecurring: createdCount };
  }

  /**
   * Auto-status updates for collaborations:
   * - If all deliverables & tasks are done => status 'Delivered'
   * - If paymentStatus is 'Paid' and deliverables done => status 'Paid'
   */
  static async autoUpdateCollaborationStatus(collabId: string) {
    const collab = await CollaborationModel.findById(collabId);
    if (!collab) return;

    const allDeliverablesDone =
      collab.deliverables.length > 0 && collab.deliverables.every((d) => d.completed);

    const relatedTasks = await TaskModel.find({ collaborationId: collab._id });
    const allTasksDone =
      relatedTasks.length === 0 || relatedTasks.every((t) => t.status === 'Done');

    if (allDeliverablesDone && allTasksDone) {
      if (collab.paymentStatus === 'Paid') {
        collab.status = 'Paid';
      } else if (collab.status !== 'Delivered' && collab.status !== 'Paid') {
        collab.status = 'Delivered';
      }
      await collab.save();
      sseManager.broadcastToWorkspace(collab.workspaceId.toString(), 'COLLAB_STATUS_AUTO_UPDATED', collab);
    }
  }

  /**
   * Auto-generates weekly recap and plain-English journal insights
   */
  static async generateWeeklyRecap(workspaceId?: string) {
    let wsIds: string[] = [];
    if (workspaceId) {
      wsIds = [workspaceId];
    } else {
      const creators = await UserModel.find({ role: 'CREATOR' });
      wsIds = creators.map((c) => c.workspaceId.toString());
    }

    for (const wsId of wsIds) {
      await InsightEngine.generateInsights(wsId);
      // Notify creator
      const creator = await UserModel.findOne({ workspaceId: wsId, role: 'CREATOR' });
      if (creator) {
        await NotificationService.notify({
          workspaceId: wsId,
          userId: creator._id.toString(),
          title: `📖 New Weekly Journal Digest Ready!`,
          message: `Your business intelligence insights and profit analysis have been refreshed. Click to view your scrapbook recap.`,
          type: 'INSIGHT',
        });
      }
    }
  }

  /**
   * Auto team payout calculation based on hourlyRate * logged time
   */
  static async autoCalculateTeamPayments(workspaceId: string) {
    const teamMembers = await UserModel.find({ workspaceId, role: 'TEAM_MEMBER' });
    let createdPayments = 0;

    for (const member of teamMembers) {
      const rate = member.hourlyRate || 3000; // in cents
      const timeLogs = await TimeLogModel.find({ workspaceId, userId: member._id });
      const totalMinutes = timeLogs.reduce((acc, t) => acc + (t.durationMinutes || 0), 0);
      const hours = totalMinutes / 60;
      const amountCents = Math.round(hours * rate);

      if (amountCents > 0) {
        const existing = await PaymentModel.findOne({
          workspaceId,
          userId: member._id,
          status: 'Pending',
        });

        if (existing) {
          existing.amount = amountCents;
          existing.referenceNote = `Calculated: ${hours.toFixed(1)} hrs @ $${(rate / 100).toFixed(2)}/hr`;
          await existing.save();
        } else {
          await PaymentModel.create({
            workspaceId,
            userId: member._id,
            recipientName: member.name,
            amount: amountCents,
            status: 'Pending',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            type: 'TEAM_PAYOUT',
            referenceNote: `Calculated: ${hours.toFixed(1)} hrs @ $${(rate / 100).toFixed(2)}/hr`,
          });
          createdPayments++;
        }
      }
    }

    return { createdPayments };
  }
}
