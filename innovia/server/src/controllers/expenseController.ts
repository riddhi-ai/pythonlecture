import { Request, Response } from 'express';
import { ExpenseModel } from '../models/Expense.js';
import { RecurringExpenseModel } from '../models/RecurringExpense.js';
import { PaymentModel } from '../models/Payment.js';
import { sseManager } from '../services/sseService.js';
import mongoose from 'mongoose';

export class ExpenseController {
  static async getAll(req: Request, res: Response) {
    try {
      const workspaceId = req.user!.workspaceId;
      const { category, approvalStatus, collaborationId } = req.query;

      const query: any = { workspaceId: new mongoose.Types.ObjectId(workspaceId) };
      if (category) query.category = category;
      if (approvalStatus) query.approvalStatus = approvalStatus;
      if (collaborationId) query.linkedCollaborationId = new mongoose.Types.ObjectId(collaborationId as string);

      // Role check: TEAM_MEMBER only sees their submitted expenses
      if (req.user!.role === 'TEAM_MEMBER') {
        query.submittedByUserId = new mongoose.Types.ObjectId(req.user!.id);
      }

      const expenses = await ExpenseModel.find(query).sort({ date: -1 });
      res.json(expenses);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const workspaceId = req.user!.workspaceId;
      const isTeamMember = req.user!.role === 'TEAM_MEMBER';

      const expense = await ExpenseModel.create({
        ...req.body,
        workspaceId,
        submittedByUserId: req.user!.id,
        approvalStatus: isTeamMember ? 'Pending' : req.body.approvalStatus || 'Approved',
      });

      sseManager.broadcastToWorkspace(workspaceId, 'EXPENSE_CREATED', expense);
      res.status(201).json(expense);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const workspaceId = req.user!.workspaceId;

      const expense = await ExpenseModel.findOneAndUpdate(
        { _id: id, workspaceId },
        req.body,
        { new: true }
      );

      if (!expense) {
        res.status(404).json({ error: 'Expense not found' });
        return;
      }

      sseManager.broadcastToWorkspace(workspaceId, 'EXPENSE_UPDATED', expense);
      res.json(expense);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const workspaceId = req.user!.workspaceId;

      await ExpenseModel.findOneAndDelete({ _id: id, workspaceId });
      sseManager.broadcastToWorkspace(workspaceId, 'EXPENSE_DELETED', { id });
      res.json({ message: 'Expense deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async setApproval(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { approvalStatus } = req.body;
      const workspaceId = req.user!.workspaceId;

      const expense = await ExpenseModel.findOneAndUpdate(
        { _id: id, workspaceId },
        { approvalStatus },
        { new: true }
      );

      if (!expense) {
        res.status(404).json({ error: 'Expense not found' });
        return;
      }

      sseManager.broadcastToWorkspace(workspaceId, 'EXPENSE_UPDATED', expense);
      res.json(expense);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  // Recurring subscriptions
  static async getRecurring(req: Request, res: Response) {
    try {
      const workspaceId = req.user!.workspaceId;
      const recurring = await RecurringExpenseModel.find({ workspaceId }).sort({ nextRunDate: 1 });
      res.json(recurring);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async createRecurring(req: Request, res: Response) {
    try {
      const workspaceId = req.user!.workspaceId;
      const recurring = await RecurringExpenseModel.create({
        ...req.body,
        workspaceId,
      });
      res.status(201).json(recurring);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  // Payments
  static async getPayments(req: Request, res: Response) {
    try {
      const workspaceId = req.user!.workspaceId;
      const query: any = { workspaceId: new mongoose.Types.ObjectId(workspaceId) };

      if (req.user!.role === 'TEAM_MEMBER') {
        query.userId = new mongoose.Types.ObjectId(req.user!.id);
      }

      const payments = await PaymentModel.find(query).sort({ createdAt: -1 });
      res.json(payments);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updatePaymentStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const workspaceId = req.user!.workspaceId;

      const updateData: any = { status };
      if (status === 'Paid') {
        updateData.paidDate = new Date().toISOString().split('T')[0];
      }

      const payment = await PaymentModel.findOneAndUpdate(
        { _id: id, workspaceId },
        updateData,
        { new: true }
      );

      if (!payment) {
        res.status(404).json({ error: 'Payment not found' });
        return;
      }

      sseManager.broadcastToWorkspace(workspaceId, 'PAYMENT_UPDATED', payment);
      res.json(payment);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
