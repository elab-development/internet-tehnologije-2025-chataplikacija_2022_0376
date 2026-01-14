import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { UserRole } from '../entities/User';

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.userRole) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.userRole as UserRole)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.userRole,
      });
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole(UserRole.ADMIN);
export const requireModerator = requireRole(UserRole.MODERATOR, UserRole.ADMIN);
export const requireUser = requireRole(UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN);

export default {
  requireRole,
  requireAdmin,
  requireModerator,
  requireUser,
};