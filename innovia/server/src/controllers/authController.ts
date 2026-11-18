import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.js';
import { WorkspaceModel } from '../models/Workspace.js';
import { generateTokens } from '../middleware/auth.js';
import { ENV } from '../config/env.js';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const {
        name,
        email,
        password,
        role = 'CREATOR',
        workspaceName,
        currency = 'USD',
        niche = 'Tech & Lifestyle',
        avatarSticker = 'camera',
        hourlyRate = 3000, // 30.00/hr
        inviteCode,
      } = req.body;

      const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        res.status(400).json({ error: 'An account with this email already exists.' });
        return;
      }

      let workspace;

      if (inviteCode) {
        workspace = await WorkspaceModel.findOne({ inviteCode: inviteCode.trim().toUpperCase() });
        if (!workspace) {
          res.status(400).json({ error: 'Invalid invite code provided.' });
          return;
        }
      } else {
        // Create new workspace
        workspace = await WorkspaceModel.create({
          name: workspaceName || `${name}'s Studio`,
          currency,
          niche,
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await UserModel.create({
        name,
        email: email.toLowerCase(),
        passwordHash,
        role,
        avatarSticker,
        hourlyRate,
        workspaceId: workspace._id,
      });

      if (!workspace.ownerId && role === 'CREATOR') {
        workspace.ownerId = user._id;
        await workspace.save();
      }

      const tokens = generateTokens(user);

      res.status(201).json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarSticker: user.avatarSticker,
          hourlyRate: user.hourlyRate,
          workspaceId: user.workspaceId,
        },
        workspace: {
          id: workspace._id,
          name: workspace.name,
          currency: workspace.currency,
          niche: workspace.niche,
          inviteCode: workspace.inviteCode,
        },
        ...tokens,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await UserModel.findOne({ email: email.toLowerCase() });
      if (!user) {
        res.status(401).json({ error: 'Invalid email or password.' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ error: 'Invalid email or password.' });
        return;
      }

      const workspace = await WorkspaceModel.findById(user.workspaceId);
      const tokens = generateTokens(user);

      res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarSticker: user.avatarSticker,
          hourlyRate: user.hourlyRate,
          workspaceId: user.workspaceId,
          linkedCollaborationIds: user.linkedCollaborationIds,
        },
        workspace: workspace
          ? {
              id: workspace._id,
              name: workspace.name,
              currency: workspace.currency,
              niche: workspace.niche,
              inviteCode: workspace.inviteCode,
            }
          : null,
        ...tokens,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ error: 'Refresh token is required.' });
        return;
      }

      const decoded = jwt.verify(refreshToken, ENV.JWT_REFRESH_SECRET) as { id: string };
      const user = await UserModel.findById(decoded.id);
      if (!user) {
        res.status(401).json({ error: 'User not found.' });
        return;
      }

      const tokens = generateTokens(user);
      res.json(tokens);
    } catch (error) {
      res.status(401).json({ error: 'Invalid or expired refresh token.' });
    }
  }

  static async me(req: Request, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthenticated.' });
        return;
      }

      const user = await UserModel.findById(req.user.id).select('-passwordHash');
      const workspace = await WorkspaceModel.findById(req.user.workspaceId);

      res.json({ user, workspace });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async invite(req: Request, res: Response) {
    try {
      const { email, role, hourlyRate = 3500 } = req.body;
      const workspace = await WorkspaceModel.findById(req.user!.workspaceId);

      const inviteLink = `${ENV.CLIENT_URL}/register?inviteCode=${workspace?.inviteCode}&role=${role}&email=${encodeURIComponent(
        email
      )}`;

      res.json({
        message: 'Invite link generated successfully',
        inviteLink,
        inviteCode: workspace?.inviteCode,
        email,
        role,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
