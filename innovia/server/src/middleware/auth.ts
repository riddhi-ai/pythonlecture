import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { UserModel, IUserDocument } from '../models/User.js';
import { UserRole } from '@innovia/shared';
import mongoose from 'mongoose';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  workspaceId: string;
  name: string;
  linkedCollaborationIds?: string[];
  hourlyRate?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function generateTokens(user: IUserDocument) {
  const payload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    workspaceId: user.workspaceId.toString(),
    name: user.name,
  };

  const accessToken = jwt.sign(payload, ENV.JWT_ACCESS_SECRET, {
    expiresIn: ENV.JWT_ACCESS_EXPIRY as any,
  });

  const refreshToken = jwt.sign(
    { id: user._id.toString() },
    ENV.JWT_REFRESH_SECRET,
    { expiresIn: ENV.JWT_REFRESH_EXPIRY as any }
  );

  return { accessToken, refreshToken };
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, ENV.JWT_ACCESS_SECRET) as {
      id: string;
      email: string;
      role: UserRole;
      workspaceId: string;
      name: string;
    };

    const user = await UserModel.findById(decoded.id);
    if (!user) {
      res.status(401).json({ error: 'User not found or session revoked.' });
      return;
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      workspaceId: user.workspaceId.toString(),
      name: user.name,
      linkedCollaborationIds: user.linkedCollaborationIds?.map((id) => id.toString()),
      hourlyRate: user.hourlyRate,
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
      return;
    }
    res.status(401).json({ error: 'Invalid authentication token.' });
  }
}
