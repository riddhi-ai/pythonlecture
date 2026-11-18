import { describe, it, expect, vi } from 'vitest';
import { requireRole, requireFinancialAccess } from '../middleware/rbac.js';

describe('RBAC & Permission Enforcement Middleware', () => {
  it('allows CREATOR to access creator-only routes', () => {
    const req: any = {
      user: { role: 'CREATOR', id: 'user1', workspaceId: 'ws1' },
    };
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    const middleware = requireRole('CREATOR');
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('denies COLLABORATOR and TEAM_MEMBER from creator-only routes with 403', () => {
    const req: any = {
      user: { role: 'COLLABORATOR', id: 'collab1', workspaceId: 'ws1' },
    };
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    const middleware = requireRole('CREATOR');
    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("Role 'COLLABORATOR' is not authorized"),
      })
    );
  });

  it('blocks non-CREATOR from financial summary and profit margin access', () => {
    const req: any = {
      user: { role: 'TEAM_MEMBER', id: 'team1', workspaceId: 'ws1' },
    };
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    requireFinancialAccess(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('Only the workspace Creator can view financial analytics'),
      })
    );
  });

  it('allows CREATOR to access financial analytics', () => {
    const req: any = {
      user: { role: 'CREATOR', id: 'creator1', workspaceId: 'ws1' },
    };
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    requireFinancialAccess(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
