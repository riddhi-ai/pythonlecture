import { FinancialSummary, WorthItVerdict } from '@innovia/shared';
import { CollaborationModel } from '../models/Collaboration.js';
import { ExpenseModel } from '../models/Expense.js';
import { PaymentModel } from '../models/Payment.js';
import { TimeLogModel } from '../models/TimeLog.js';
import { PerformanceMetricModel } from '../models/PerformanceMetric.js';
import { ContentModel } from '../models/Content.js';
import mongoose from 'mongoose';

export class FinanceService {
  /**
   * Calculates overall financial summary for a workspace or filtered subset
   */
  static async calculateWorkspaceSummary(
    workspaceId: string,
    filters?: { startDate?: string; endDate?: string; collaborationId?: string; platform?: string }
  ): Promise<FinancialSummary> {
    const wsObjectId = new mongoose.Types.ObjectId(workspaceId);

    // 1. Calculate Revenue from Collaborations (Signed, In Production, Delivered, Paid)
    const collabQuery: any = {
      workspaceId: wsObjectId,
      status: { $in: ['Signed', 'In Production', 'Delivered', 'Paid'] },
    };
    if (filters?.collaborationId) {
      collabQuery._id = new mongoose.Types.ObjectId(filters.collaborationId);
    }
    const collabs = await CollaborationModel.find(collabQuery);
    let totalRevenue = collabs.reduce((acc, c) => acc + (c.dealValue || 0), 0);

    // Add standalone published content revenue if any
    const contentQuery: any = { workspaceId: wsObjectId };
    if (filters?.collaborationId) contentQuery.collaborationId = filters.collaborationId;
    if (filters?.platform) contentQuery.platform = filters.platform;
    const contents = await ContentModel.find(contentQuery);
    const standaloneContentRevenue = contents.reduce(
      (acc, c) => (!c.collaborationId ? acc + (c.estimatedRevenue || 0) : acc),
      0
    );
    totalRevenue += standaloneContentRevenue;

    // 2. Calculate Total Expenses (Approved production expenses + Approved/Paid team payments)
    const expenseQuery: any = {
      workspaceId: wsObjectId,
      approvalStatus: { $in: ['Approved'] },
    };
    if (filters?.collaborationId) {
      expenseQuery.linkedCollaborationId = new mongoose.Types.ObjectId(filters.collaborationId);
    }
    if (filters?.startDate || filters?.endDate) {
      expenseQuery.date = {};
      if (filters.startDate) expenseQuery.date.$gte = filters.startDate;
      if (filters.endDate) expenseQuery.date.$lte = filters.endDate;
    }
    const expenses = await ExpenseModel.find(expenseQuery);
    const productionExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

    const paymentQuery: any = {
      workspaceId: wsObjectId,
      type: 'TEAM_PAYOUT',
      status: { $in: ['Approved', 'Paid'] },
    };
    const payments = await PaymentModel.find(paymentQuery);
    const teamPayouts = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

    const totalExpenses = productionExpenses + teamPayouts;

    // 3. Net Profit
    const netProfit = totalRevenue - totalExpenses;

    // 4. Profit Margin %
    const profitMargin =
      totalRevenue > 0
        ? Number(((netProfit / totalRevenue) * 100).toFixed(1))
        : 0;

    // 5. Total Working Hours from Time Logs
    const timeQuery: any = { workspaceId: wsObjectId };
    const timeLogs = await TimeLogModel.find(timeQuery);
    const totalMinutes = timeLogs.reduce((acc, t) => acc + (t.durationMinutes || 0), 0);
    const totalHours = Number((totalMinutes / 60).toFixed(1));

    // 6. Profit Per Working Hour (in cents/hour)
    const profitPerHour =
      totalHours > 0
        ? Math.round(netProfit / totalHours)
        : netProfit > 0
        ? netProfit
        : 0;

    // 7. Average Engagement %
    const metrics = await PerformanceMetricModel.find({ workspaceId: wsObjectId });
    const avgEngagement =
      metrics.length > 0
        ? Number(
            (
              metrics.reduce((acc, m) => acc + (m.engagementRate || 0), 0) /
              metrics.length
            ).toFixed(2)
          )
        : 4.8; // default benchmark

    // 8. Worth It Score (0 to 100) & Verdict
    const { score, verdict, sticker } = this.calculateWorthItScore(
      profitMargin,
      profitPerHour,
      avgEngagement
    );

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      totalHours,
      profitPerHour,
      averageEngagement: avgEngagement,
      worthItScore: score,
      worthItVerdict: verdict,
      worthItSticker: sticker,
    };
  }

  /**
   * Calculates Worth It Score from 0 to 100 with sticker verdict
   */
  static calculateWorthItScore(
    marginPct: number,
    profitPerHourCents: number,
    engagementPct: number
  ): { score: number; verdict: WorthItVerdict; sticker: string } {
    // 1. Margin component (max 40 pts): 50% margin gives 40 pts
    let marginScore = 0;
    if (marginPct > 0) {
      marginScore = Math.min(40, (marginPct / 50) * 40);
    }

    // 2. Profit per hour component (max 35 pts): $50/hr ($5000 cents/hr) is baseline for full 35 pts
    let hourlyScore = 0;
    if (profitPerHourCents > 0) {
      hourlyScore = Math.min(35, (profitPerHourCents / 5000) * 35);
    }

    // 3. Engagement component (max 25 pts): 5% engagement gives full 25 pts
    let engagementScore = 0;
    if (engagementPct > 0) {
      engagementScore = Math.min(25, (engagementPct / 5) * 25);
    }

    const totalScore = Math.max(0, Math.min(100, Math.round(marginScore + hourlyScore + engagementScore)));

    let verdict: WorthItVerdict = 'Meh';
    let sticker = 'hourglass';

    if (totalScore >= 75) {
      verdict = 'Totally worth it!';
      sticker = 'trophy';
    } else if (totalScore < 45) {
      verdict = 'Not worth it';
      sticker = 'fire';
    }

    return { score: totalScore, verdict, sticker };
  }
}
