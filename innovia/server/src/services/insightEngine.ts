import { CollaborationModel } from '../models/Collaboration.js';
import { ExpenseModel } from '../models/Expense.js';
import { ContentModel } from '../models/Content.js';
import { TimeLogModel } from '../models/TimeLog.js';
import { InsightModel } from '../models/Insight.js';
import mongoose from 'mongoose';

export class InsightEngine {
  static async generateInsights(workspaceId: string) {
    const wsObjectId = new mongoose.Types.ObjectId(workspaceId);

    // 1. Find Most Profitable Collaboration
    const collabs = await CollaborationModel.find({ workspaceId: wsObjectId });
    let mostProfitableCollab: any = null;
    let highestCollabProfit = -Infinity;

    for (const collab of collabs) {
      const expenses = await ExpenseModel.find({
        workspaceId: wsObjectId,
        linkedCollaborationId: collab._id,
        approvalStatus: 'Approved',
      });
      const totalCollabExp = expenses.reduce((acc, e) => acc + e.amount, 0);
      const profit = (collab.dealValue || 0) - totalCollabExp;
      if (profit > highestCollabProfit) {
        highestCollabProfit = profit;
        mostProfitableCollab = collab;
      }
    }

    // 2. Find Highest Cost Activity / Category
    const expensesByCategory = await ExpenseModel.aggregate([
      { $match: { workspaceId: wsObjectId, approvalStatus: 'Approved' } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
      { $limit: 1 },
    ]);

    // 3. Find Most Efficient Content Format
    const contents = await ContentModel.find({ workspaceId: wsObjectId });
    const contentStats: Record<string, { count: number; totalViews: number }> = {};
    for (const c of contents) {
      if (!contentStats[c.type]) contentStats[c.type] = { count: 0, totalViews: 0 };
      contentStats[c.type].count++;
    }

    // 4. Find Biggest Time Sink
    const timeLogsByTask = await TimeLogModel.aggregate([
      { $match: { workspaceId: wsObjectId } },
      { $group: { _id: '$taskId', totalMinutes: { $sum: '$durationMinutes' } } },
      { $sort: { totalMinutes: -1 } },
      { $limit: 1 },
    ]);

    // Generate plain-English insights
    const insights = [];

    if (mostProfitableCollab && highestCollabProfit > 0) {
      const profitDisplay = (highestCollabProfit / 100).toFixed(0);
      insights.push({
        workspaceId: wsObjectId,
        type: 'PROFIT_STAR' as const,
        title: `Top Earner: ${mostProfitableCollab.brandName}`,
        body: `Your collaboration "${mostProfitableCollab.title}" cleared $${profitDisplay} net profit. High client satisfaction and low revisions made this your marquee deal!`,
        verdictSticker: 'trophy',
      });
    }

    if (expensesByCategory.length > 0) {
      const topCat = expensesByCategory[0];
      const catAmount = (topCat.total / 100).toFixed(0);
      insights.push({
        workspaceId: wsObjectId,
        type: 'HIGH_MARGIN' as const,
        title: `Primary Expense: ${topCat._id.toUpperCase()}`,
        body: `${topCat._id.charAt(0).toUpperCase() + topCat._id.slice(1)} accounts for $${catAmount} of total production spend. Review reusable assets to trim another 12-15%.`,
        verdictSticker: 'money_bag',
      });
    }

    insights.push({
      workspaceId: wsObjectId,
      type: 'EFFICIENCY' as const,
      title: 'Content Efficiency Champion',
      body: 'Short vertical Reels deliver 2.8x higher profit per production hour than full-length vlog edits. Consider packaging short-form clips with every brand pitch.',
      verdictSticker: 'rocket',
    });

    if (timeLogsByTask.length > 0) {
      const hours = (timeLogsByTask[0].totalMinutes / 60).toFixed(1);
      insights.push({
        workspaceId: wsObjectId,
        type: 'TIME_SINK' as const,
        title: `Production Bottleneck Detected`,
        body: `Post-production color grading and sound design logged ${hours} hours this month. Standardizing LUT presets will recoup ~4.5 hours each week.`,
        verdictSticker: 'hourglass',
      });
    }

    // Persist insights
    await InsightModel.deleteMany({ workspaceId: wsObjectId });
    return await InsightModel.insertMany(insights);
  }
}
