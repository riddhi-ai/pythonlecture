import { Request, Response } from 'express';
import { ScrapbookItemModel } from '../models/ScrapbookItem.js';
import mongoose from 'mongoose';

export class ScrapbookController {
  static async getItems(req: Request, res: Response) {
    try {
      const workspaceId = req.user!.workspaceId;
      const userId = req.user!.id;

      const items = await ScrapbookItemModel.find({
        workspaceId: new mongoose.Types.ObjectId(workspaceId),
        userId: new mongoose.Types.ObjectId(userId),
      });

      res.json(items);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async saveItems(req: Request, res: Response) {
    try {
      const workspaceId = req.user!.workspaceId;
      const userId = req.user!.id;
      const { items } = req.body;

      if (!Array.isArray(items)) {
        res.status(400).json({ error: 'Items must be an array' });
        return;
      }

      // Replace user's scrapbook layout with the latest batch
      await ScrapbookItemModel.deleteMany({
        workspaceId: new mongoose.Types.ObjectId(workspaceId),
        userId: new mongoose.Types.ObjectId(userId),
      });

      const docsToInsert = items.map((item: any) => ({
        ...item,
        workspaceId: new mongoose.Types.ObjectId(workspaceId),
        userId: new mongoose.Types.ObjectId(userId),
      }));

      const inserted = await ScrapbookItemModel.insertMany(docsToInsert);
      res.json({ message: 'Scrapbook layout saved successfully', items: inserted });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
