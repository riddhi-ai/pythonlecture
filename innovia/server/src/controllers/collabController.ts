import { Request, Response } from 'express';
import { CollaborationModel } from '../models/Collaboration.js';
import { BrandModel } from '../models/Brand.js';
import { AutomationScheduler } from '../jobs/cronJobs.js';
import { sseManager } from '../services/sseService.js';
import mongoose from 'mongoose';

export class CollabController {
  static async getAll(req: Request, res: Response) {
    try {
      const workspaceId = req.user!.workspaceId;
      const query: any = { workspaceId: new mongoose.Types.ObjectId(workspaceId) };

      if (req.user!.role === 'COLLABORATOR') {
        query.$or = [
          { collaboratorUserId: req.user!.id },
          { _id: { $in: req.user!.linkedCollaborationIds || [] } },
        ];
      } else if (req.user!.role === 'TEAM_MEMBER') {
        query.assignedTeamUserIds = req.user!.id;
      }

      const collabs = await CollaborationModel.find(query).sort({ deadlineDate: 1 });
      res.json(collabs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const collab = await CollaborationModel.findOne({
        _id: id,
        workspaceId: req.user!.workspaceId,
      });

      if (!collab) {
        res.status(404).json({ error: 'Collaboration not found' });
        return;
      }

      res.json(collab);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const workspaceId = req.user!.workspaceId;
      const data = req.body;

      // Find or create Brand record
      if (data.brandName) {
        const brand = await BrandModel.findOneAndUpdate(
          { workspaceId, name: data.brandName },
          { workspaceId, name: data.brandName },
          { upsert: true, new: true }
        );
        data.brandId = brand._id;
      }

      const collab = await CollaborationModel.create({
        ...data,
        workspaceId,
      });

      sseManager.broadcastToWorkspace(workspaceId, 'COLLAB_CREATED', collab);
      res.status(201).json(collab);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const workspaceId = req.user!.workspaceId;

      const collab = await CollaborationModel.findOneAndUpdate(
        { _id: id, workspaceId },
        { ...req.body },
        { new: true }
      );

      if (!collab) {
        res.status(404).json({ error: 'Collaboration not found' });
        return;
      }

      // Check auto status progression
      await AutomationScheduler.autoUpdateCollaborationStatus(id);

      sseManager.broadcastToWorkspace(workspaceId, 'COLLAB_UPDATED', collab);
      res.json(collab);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const workspaceId = req.user!.workspaceId;

      await CollaborationModel.findOneAndDelete({ _id: id, workspaceId });
      sseManager.broadcastToWorkspace(workspaceId, 'COLLAB_DELETED', { id });
      res.json({ message: 'Collaboration deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async toggleDeliverable(req: Request, res: Response) {
    try {
      const { id, deliverableId } = req.params;
      const workspaceId = req.user!.workspaceId;

      const collab = await CollaborationModel.findOne({ _id: id, workspaceId });
      if (!collab) {
        res.status(404).json({ error: 'Collaboration not found' });
        return;
      }

      const item = collab.deliverables.find((d) => d.id === deliverableId);
      if (!item) {
        res.status(404).json({ error: 'Deliverable item not found' });
        return;
      }

      item.completed = !item.completed;
      await collab.save();

      await AutomationScheduler.autoUpdateCollaborationStatus(id);
      sseManager.broadcastToWorkspace(workspaceId, 'COLLAB_UPDATED', collab);

      res.json(collab);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async addBrief(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, url } = req.body;
      const workspaceId = req.user!.workspaceId;

      const collab = await CollaborationModel.findOne({ _id: id, workspaceId });
      if (!collab) {
        res.status(404).json({ error: 'Collaboration not found' });
        return;
      }

      collab.briefs.push({
        id: Math.random().toString(36).substring(2, 9),
        title,
        url: url || 'https://innovia.local/assets/brief-spec.pdf',
        uploadedAt: new Date().toISOString(),
        uploaderRole: req.user!.role,
      });

      await collab.save();
      sseManager.broadcastToWorkspace(workspaceId, 'COLLAB_UPDATED', collab);
      res.json(collab);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async addComment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { comment } = req.body;
      const workspaceId = req.user!.workspaceId;

      const collab = await CollaborationModel.findOne({ _id: id, workspaceId });
      if (!collab) {
        res.status(404).json({ error: 'Collaboration not found' });
        return;
      }

      collab.feedbackComments.push({
        id: Math.random().toString(36).substring(2, 9),
        authorName: req.user!.name,
        role: req.user!.role,
        comment,
        date: new Date().toISOString(),
      });

      await collab.save();
      sseManager.broadcastToWorkspace(workspaceId, 'COLLAB_UPDATED', collab);
      res.json(collab);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
