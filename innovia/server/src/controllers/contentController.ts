import { Request, Response } from 'express';
import { ContentModel } from '../models/Content.js';
import { PerformanceMetricModel } from '../models/PerformanceMetric.js';
import { sseManager } from '../services/sseService.js';
import mongoose from 'mongoose';

export class ContentController {
  static async getAll(req: Request, res: Response) {
    try {
      const workspaceId = req.user!.workspaceId;
      const { platform, type, status, collaborationId } = req.query;

      const query: any = { workspaceId: new mongoose.Types.ObjectId(workspaceId) };
      if (platform) query.platform = platform;
      if (type) query.type = type;
      if (status) query.status = status;
      if (collaborationId) query.collaborationId = new mongoose.Types.ObjectId(collaborationId as string);

      const contents = await ContentModel.find(query).sort({ publishDate: -1 });

      // Join metrics
      const contentIds = contents.map((c) => c._id);
      const metrics = await PerformanceMetricModel.find({ contentId: { $in: contentIds } });
      const metricMap = new Map(metrics.map((m) => [m.contentId.toString(), m]));

      const results = contents.map((c) => {
        const metric = metricMap.get(c._id.toString());
        return {
          ...c.toObject(),
          metrics: metric || {
            views: 0,
            likes: 0,
            comments: 0,
            shares: 0,
            saves: 0,
            followersGained: 0,
            engagementRate: 0,
          },
        };
      });

      res.json(results);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const workspaceId = req.user!.workspaceId;

      const content = await ContentModel.findOne({ _id: id, workspaceId });
      if (!content) {
        res.status(404).json({ error: 'Content item not found' });
        return;
      }

      const metric = await PerformanceMetricModel.findOne({ contentId: id });
      res.json({
        ...content.toObject(),
        metrics: metric,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const workspaceId = req.user!.workspaceId;
      const {
        title,
        platform,
        type,
        publishDate,
        status,
        collaborationId,
        link,
        estimatedRevenue,
        notes,
        metrics,
      } = req.body;

      const content = await ContentModel.create({
        workspaceId,
        title,
        platform,
        type,
        publishDate,
        status: status || 'Planned',
        collaborationId: collaborationId || undefined,
        link,
        estimatedRevenue: estimatedRevenue || 0,
        notes,
      });

      const initialMetrics = await PerformanceMetricModel.create({
        workspaceId,
        contentId: content._id,
        views: metrics?.views || 0,
        likes: metrics?.likes || 0,
        comments: metrics?.comments || 0,
        shares: metrics?.shares || 0,
        saves: metrics?.saves || 0,
        followersGained: metrics?.followersGained || 0,
      });

      sseManager.broadcastToWorkspace(workspaceId, 'CONTENT_CREATED', {
        ...content.toObject(),
        metrics: initialMetrics,
      });

      res.status(201).json({
        ...content.toObject(),
        metrics: initialMetrics,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const workspaceId = req.user!.workspaceId;
      const { metrics, ...contentData } = req.body;

      const content = await ContentModel.findOneAndUpdate(
        { _id: id, workspaceId },
        contentData,
        { new: true }
      );

      if (!content) {
        res.status(404).json({ error: 'Content not found' });
        return;
      }

      let updatedMetrics = null;
      if (metrics) {
        updatedMetrics = await PerformanceMetricModel.findOneAndUpdate(
          { contentId: id, workspaceId },
          metrics,
          { new: true, upsert: true }
        );
      } else {
        updatedMetrics = await PerformanceMetricModel.findOne({ contentId: id });
      }

      sseManager.broadcastToWorkspace(workspaceId, 'CONTENT_UPDATED', {
        ...content.toObject(),
        metrics: updatedMetrics,
      });

      res.json({
        ...content.toObject(),
        metrics: updatedMetrics,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const workspaceId = req.user!.workspaceId;

      await ContentModel.findOneAndDelete({ _id: id, workspaceId });
      await PerformanceMetricModel.deleteMany({ contentId: id });

      sseManager.broadcastToWorkspace(workspaceId, 'CONTENT_DELETED', { id });
      res.json({ message: 'Content deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
