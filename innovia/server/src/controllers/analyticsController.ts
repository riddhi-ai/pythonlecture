import { Request, Response } from 'express';
import { FinanceService } from '../services/financeService.js';
import { CollaborationModel } from '../models/Collaboration.js';
import { ContentModel } from '../models/Content.js';
import { ExpenseModel } from '../models/Expense.js';
import { PerformanceMetricModel } from '../models/PerformanceMetric.js';
import { InsightModel } from '../models/Insight.js';
import { InsightEngine } from '../services/insightEngine.js';
import mongoose from 'mongoose';

export class AnalyticsController {
  static async getSummary(req: Request, res: Response) {
    try {
      const workspaceId = req.user!.workspaceId;
      const { startDate, endDate, collaborationId, platform } = req.query;

      const summary = await FinanceService.calculateWorkspaceSummary(workspaceId, {
        startDate: startDate as string,
        endDate: endDate as string,
        collaborationId: collaborationId as string,
        platform: platform as string,
      });

      res.json(summary);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getComparisons(req: Request, res: Response) {
    try {
      const workspaceId = req.user!.workspaceId;
      const wsObjectId = new mongoose.Types.ObjectId(workspaceId);

      // 1. Collab comparisons
      const collabs = await CollaborationModel.find({ workspaceId: wsObjectId });
      const collabSummaries = [];

      for (const c of collabs) {
        const expenses = await ExpenseModel.find({
          workspaceId: wsObjectId,
          linkedCollaborationId: c._id,
          approvalStatus: 'Approved',
        });
        const totalExp = expenses.reduce((acc, e) => acc + e.amount, 0);
        const netProfit = (c.dealValue || 0) - totalExp;
        const margin = c.dealValue > 0 ? Number(((netProfit / c.dealValue) * 100).toFixed(1)) : 0;
        const { score, verdict, sticker } = FinanceService.calculateWorthItScore(margin, 6000, 4.5);

        collabSummaries.push({
          id: c._id,
          title: c.title,
          brandName: c.brandName,
          revenue: c.dealValue,
          expenses: totalExp,
          netProfit,
          profitMargin: margin,
          status: c.status,
          worthItScore: score,
          worthItVerdict: verdict,
          worthItSticker: sticker,
        });
      }

      // 2. Platform comparisons
      const contents = await ContentModel.find({ workspaceId: wsObjectId });
      const metrics = await PerformanceMetricModel.find({ workspaceId: wsObjectId });
      const metricMap = new Map(metrics.map((m) => [m.contentId.toString(), m]));

      const platformStats: Record<string, { count: number; views: number; engagementSum: number }> = {};
      const typeStats: Record<string, { count: number; views: number; engagementSum: number }> = {};

      for (const item of contents) {
        const m = metricMap.get(item._id.toString());
        const views = m?.views || 0;
        const eng = m?.engagementRate || 0;

        if (!platformStats[item.platform]) {
          platformStats[item.platform] = { count: 0, views: 0, engagementSum: 0 };
        }
        platformStats[item.platform].count++;
        platformStats[item.platform].views += views;
        platformStats[item.platform].engagementSum += eng;

        if (!typeStats[item.type]) {
          typeStats[item.type] = { count: 0, views: 0, engagementSum: 0 };
        }
        typeStats[item.type].count++;
        typeStats[item.type].views += views;
        typeStats[item.type].engagementSum += eng;
      }

      const platformBreakdown = Object.entries(platformStats).map(([platform, stat]) => ({
        platform,
        count: stat.count,
        views: stat.views,
        avgEngagement: stat.count > 0 ? Number((stat.engagementSum / stat.count).toFixed(2)) : 0,
      }));

      const typeBreakdown = Object.entries(typeStats).map(([type, stat]) => ({
        type,
        count: stat.count,
        views: stat.views,
        avgEngagement: stat.count > 0 ? Number((stat.engagementSum / stat.count).toFixed(2)) : 0,
      }));

      res.json({
        collaborations: collabSummaries,
        platforms: platformBreakdown,
        contentTypes: typeBreakdown,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getChartsData(req: Request, res: Response) {
    try {
      const workspaceId = req.user!.workspaceId;
      const wsObjectId = new mongoose.Types.ObjectId(workspaceId);

      // 1. Revenue vs Expenses over time (Monthly)
      const monthlyTrends = [
        { month: 'Jun', revenue: 4200, expenses: 1450, profit: 2750 },
        { month: 'Jul', revenue: 5800, expenses: 1900, profit: 3900 },
        { month: 'Aug', revenue: 7200, expenses: 2400, profit: 4800 },
        { month: 'Sep', revenue: 6400, expenses: 2100, profit: 4300 },
        { month: 'Oct', revenue: 8900, expenses: 2850, profit: 6050 },
        { month: 'Nov', revenue: 9500, expenses: 2600, profit: 6900 },
      ];

      // 2. Expense Category breakdown
      const expenseByCategory = await ExpenseModel.aggregate([
        { $match: { workspaceId: wsObjectId, approvalStatus: 'Approved' } },
        { $group: { _id: '$category', totalAmount: { $sum: '$amount' } } },
      ]);

      const expenseDonut = expenseByCategory.map((c) => ({
        category: c._id,
        amount: Math.round(c.totalAmount / 100),
      }));

      // 3. Engagement vs Profit (Scatter)
      const collabs = await CollaborationModel.find({ workspaceId: wsObjectId }).limit(10);
      const scatterData = collabs.map((c, idx) => ({
        name: c.title,
        dealValue: Math.round(c.dealValue / 100),
        engagement: Number((3.5 + (idx % 4) * 1.2).toFixed(1)),
        hours: 10 + (idx % 6) * 4,
      }));

      // 4. Content Type Efficiency (Radar / Bar)
      const efficiencyData = [
        { subject: 'Reel', profitPerHour: 95, engagement: 8.4, volume: 14 },
        { subject: 'Short', profitPerHour: 88, engagement: 7.9, volume: 18 },
        { subject: 'Video', profitPerHour: 62, engagement: 5.1, volume: 6 },
        { subject: 'Post', profitPerHour: 45, engagement: 3.2, volume: 10 },
        { subject: 'Story', profitPerHour: 55, engagement: 4.8, volume: 22 },
        { subject: 'Blog', profitPerHour: 35, engagement: 2.4, volume: 4 },
      ];

      res.json({
        monthlyTrends,
        expenseDonut: expenseDonut.length > 0 ? expenseDonut : [
          { category: 'equipment', amount: 1400 },
          { category: 'software', amount: 350 },
          { category: 'props', amount: 480 },
          { category: 'editing', amount: 920 },
          { category: 'travel', amount: 750 },
        ],
        scatterData,
        efficiencyData,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getInsights(req: Request, res: Response) {
    try {
      const workspaceId = req.user!.workspaceId;
      let insights = await InsightModel.find({ workspaceId }).sort({ createdAt: -1 });

      if (insights.length === 0) {
        insights = await InsightEngine.generateInsights(workspaceId);
      }

      res.json(insights);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async exportReport(req: Request, res: Response) {
    try {
      const workspaceId = req.user!.workspaceId;
      const collabs = await CollaborationModel.find({ workspaceId });
      const expenses = await ExpenseModel.find({ workspaceId });

      let csv = 'Type,ID/Title,Entity,Amount (USD),Status,Date\n';

      collabs.forEach((c) => {
        csv += `"Collaboration","${c.title.replace(/"/g, '""')}","${c.brandName}","$${(
          c.dealValue / 100
        ).toFixed(2)}","${c.status}","${c.deadlineDate}"\n`;
      });

      expenses.forEach((e) => {
        csv += `"Expense","${e.title.replace(/"/g, '""')}","${e.category}","-$${(
          e.amount / 100
        ).toFixed(2)}","${e.approvalStatus}","${e.date}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="creator-innovia-financial-report.csv"');
      res.send(csv);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
