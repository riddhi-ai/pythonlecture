import { ContentModel } from '../models/Content.js';
import { ExpenseModel } from '../models/Expense.js';
import { PerformanceMetricModel } from '../models/PerformanceMetric.js';
import { ImportJobModel } from '../models/ImportJob.js';
import mongoose from 'mongoose';

export class ImportService {
  /**
   * Simple, resilient CSV row parser (handles quoted values, commas, and newlines)
   */
  static parseCSV(csvString: string): string[][] {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = '';
    let insideQuotes = false;

    for (let i = 0; i < csvString.length; i++) {
      const char = csvString[i];
      const nextChar = csvString[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentCell += '"';
          i++; // skip escaped quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if ((char === '\r' || char === '\n') && !insideQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        currentRow.push(currentCell.trim());
        if (currentRow.some((c) => c.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }

    if (currentCell.length > 0 || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      if (currentRow.some((c) => c.length > 0)) {
        rows.push(currentRow);
      }
    }

    return rows;
  }

  static async importContent(workspaceId: string, csvContent: string) {
    const rows = this.parseCSV(csvContent);
    if (rows.length < 2) {
      throw new Error('CSV must contain a header row and at least one data row.');
    }

    const headers = rows[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const titleIdx = headers.findIndex((h) => h.includes('title'));
    const platformIdx = headers.findIndex((h) => h.includes('platform'));
    const typeIdx = headers.findIndex((h) => h.includes('type') || h.includes('format'));
    const dateIdx = headers.findIndex((h) => h.includes('date'));
    const viewsIdx = headers.findIndex((h) => h.includes('view'));
    const likesIdx = headers.findIndex((h) => h.includes('like'));
    const commentsIdx = headers.findIndex((h) => h.includes('comment'));
    const sharesIdx = headers.findIndex((h) => h.includes('share'));
    const savesIdx = headers.findIndex((h) => h.includes('save'));

    let successRows = 0;
    let errorRows = 0;
    const errors: string[] = [];

    const wsObjectId = new mongoose.Types.ObjectId(workspaceId);

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      try {
        const title = titleIdx !== -1 && row[titleIdx] ? row[titleIdx] : `Imported Post ${i}`;
        const platform = platformIdx !== -1 && row[platformIdx] ? row[platformIdx] : 'Instagram';
        const type = typeIdx !== -1 && row[typeIdx] ? row[typeIdx] : 'Reel';
        const publishDate = dateIdx !== -1 && row[dateIdx] ? row[dateIdx] : new Date().toISOString().split('T')[0];

        const content = await ContentModel.create({
          workspaceId: wsObjectId,
          title,
          platform: ['YouTube', 'Instagram', 'TikTok', 'Twitter/X', 'LinkedIn', 'Blog', 'Podcast'].includes(platform)
            ? platform
            : 'Instagram',
          type: ['Reel', 'Short', 'Video', 'Post', 'Story', 'Blog'].includes(type) ? type : 'Reel',
          publishDate,
          status: 'Published',
        });

        const views = viewsIdx !== -1 ? parseInt(row[viewsIdx], 10) || 0 : 1000;
        const likes = likesIdx !== -1 ? parseInt(row[likesIdx], 10) || 0 : 50;
        const comments = commentsIdx !== -1 ? parseInt(row[commentsIdx], 10) || 0 : 10;
        const shares = sharesIdx !== -1 ? parseInt(row[sharesIdx], 10) || 0 : 5;
        const saves = savesIdx !== -1 ? parseInt(row[savesIdx], 10) || 0 : 12;

        await PerformanceMetricModel.create({
          workspaceId: wsObjectId,
          contentId: content._id,
          views,
          likes,
          comments,
          shares,
          saves,
          followersGained: Math.floor(views * 0.005),
        });

        successRows++;
      } catch (err: any) {
        errorRows++;
        errors.push(`Row ${i + 1}: ${err.message}`);
      }
    }

    const job = await ImportJobModel.create({
      workspaceId: wsObjectId,
      entityType: 'content',
      totalRows: rows.length - 1,
      successRows,
      errorRows,
      errorDetails: errors,
    });

    return job;
  }

  static async importExpenses(workspaceId: string, csvContent: string) {
    const rows = this.parseCSV(csvContent);
    if (rows.length < 2) {
      throw new Error('CSV must contain a header row and at least one data row.');
    }

    const headers = rows[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const titleIdx = headers.findIndex((h) => h.includes('title') || h.includes('description') || h.includes('item'));
    const catIdx = headers.findIndex((h) => h.includes('cat'));
    const amountIdx = headers.findIndex((h) => h.includes('amount') || h.includes('cost') || h.includes('price'));
    const dateIdx = headers.findIndex((h) => h.includes('date'));

    let successRows = 0;
    let errorRows = 0;
    const errors: string[] = [];

    const wsObjectId = new mongoose.Types.ObjectId(workspaceId);

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      try {
        const title = titleIdx !== -1 && row[titleIdx] ? row[titleIdx] : `Expense #${i}`;
        const category = catIdx !== -1 && row[catIdx] ? row[catIdx].toLowerCase() : 'other';
        const rawAmount = amountIdx !== -1 ? parseFloat(row[amountIdx].replace(/[^0-9.]/g, '')) : 0;
        const amountCents = Math.round((rawAmount || 0) * 100);
        const date = dateIdx !== -1 && row[dateIdx] ? row[dateIdx] : new Date().toISOString().split('T')[0];

        await ExpenseModel.create({
          workspaceId: wsObjectId,
          title,
          category: ['equipment', 'props', 'travel', 'editing', 'ads', 'software', 'team_payment', 'other'].includes(
            category
          )
            ? category
            : 'other',
          amount: amountCents > 0 ? amountCents : 2500,
          date,
          approvalStatus: 'Approved',
        });

        successRows++;
      } catch (err: any) {
        errorRows++;
        errors.push(`Row ${i + 1}: ${err.message}`);
      }
    }

    const job = await ImportJobModel.create({
      workspaceId: wsObjectId,
      entityType: 'expenses',
      totalRows: rows.length - 1,
      successRows,
      errorRows,
      errorDetails: errors,
    });

    return job;
  }
}
