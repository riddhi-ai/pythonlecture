import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@innovia/shared';
import { CollaborationModel } from '../models/Collaboration.js';
import { TaskModel } from '../models/Task.js';

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access denied. Role '${req.user.role}' is not authorized for this action.`,
        requiredRoles: roles,
      });
      return;
    }

    next();
  };
}

/**
 * Ensures financial data (expenses, profit, margins, team payments)
 * is ONLY viewable by CREATOR role.
 */
export function requireFinancialAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'CREATOR') {
    res.status(403).json({
      error: 'Access denied. Only the workspace Creator can view financial analytics, expenses, and profit margins.',
    });
    return;
  }

  next();
}

/**
 * Checks if user is permitted to view or modify a specific collaboration.
 */
export async function authorizeCollaborationAccess(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const collabId = req.params.id || req.body.collaborationId;
    if (!collabId) {
      next();
      return;
    }

    const collab = await CollaborationModel.findOne({
      _id: collabId,
      workspaceId: req.user.workspaceId,
    });

    if (!collab) {
      res.status(404).json({ error: 'Collaboration not found' });
      return;
    }

    if (req.user.role === 'CREATOR') {
      next();
      return;
    }

    if (req.user.role === 'COLLABORATOR') {
      const isOwner = collab.collaboratorUserId?.toString() === req.user.id;
      const isLinked = req.user.linkedCollaborationIds?.includes(collabId);
      if (!isOwner && !isLinked) {
        res.status(403).json({ error: 'Access denied to this collaboration.' });
        return;
      }
      next();
      return;
    }

    if (req.user.role === 'TEAM_MEMBER') {
      const isAssigned = collab.assignedTeamUserIds?.some((uid) => uid.toString() === req.user!.id);
      if (!isAssigned) {
        res.status(403).json({ error: 'Access denied. You are not assigned to this collaboration.' });
        return;
      }
      next();
      return;
    }

    res.status(403).json({ error: 'Unauthorized role.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Checks if team member has access to the task
 */
export async function authorizeTaskAccess(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (req.user.role === 'CREATOR') {
      next();
      return;
    }

    if (req.user.role === 'COLLABORATOR') {
      res.status(403).json({ error: 'Collaborators cannot access internal team tasks.' });
      return;
    }

    // TEAM_MEMBER
    const taskId = req.params.id;
    if (!taskId) {
      next();
      return;
    }

    const task = await TaskModel.findOne({ _id: taskId, workspaceId: req.user.workspaceId });
    if (!task) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }

    if (task.assigneeId && task.assigneeId.toString() !== req.user.id) {
      res.status(403).json({ error: 'You can only access tasks assigned to you.' });
      return;
    }

    next();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
