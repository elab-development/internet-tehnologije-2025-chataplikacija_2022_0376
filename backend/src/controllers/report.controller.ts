import { Response } from 'express';
import { ReportService } from '../services/report.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { ReportReason, ReportStatus } from '../entities/MessageReport';

export class ReportController {
  private reportService = new ReportService();

  createReport = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { messageId, reason, comment } = req.body;

      if (!messageId || !reason) {
        res.status(400).json({
          error: 'messageId and reason are required',
        });
        return;
      }

      if (!Object.values(ReportReason).includes(reason)) {
        res.status(400).json({ error: 'Invalid reason' });
        return;
      }

      const report = await this.reportService.createReport({
        messageId,
        reporterId: req.userId,
        reason,
        comment,
      });

      res.status(201).json({
        message: 'Report submitted successfully',
        report,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to create report' });
      }
    }
  };

  getAllReports = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const reports = await this.reportService.getAllReports();
      res.status(200).json({ reports });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch reports' });
    }
  };

  getReport = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const report = await this.reportService.getReportById(id);
      res.status(200).json({ report });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch report' });
      }
    }
  };

  reviewReport = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const { status, reviewComment } = req.body;

      if (!status) {
        res.status(400).json({ error: 'Status is required' });
        return;
      }

      if (!Object.values(ReportStatus).includes(status)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
      }

      const report = await this.reportService.reviewReport(id, req.userId, {
        status,
        reviewComment,
      });

      res.status(200).json({
        message: 'Report reviewed successfully',
        report,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to review report' });
      }
    }
  };

  suspendUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { endDate, reason } = req.body;

      if (!reason) {
        res.status(400).json({ error: 'Reason is required' });
        return;
      }

      const user = await this.reportService.suspendUser(userId, {
        endDate: endDate ? new Date(endDate) : undefined,
        reason,
      });

      res.status(200).json({
        message: 'User suspended successfully',
        user,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to suspend user' });
      }
    }
  };

  unsuspendUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      const user = await this.reportService.unsuspendUser(userId);

      res.status(200).json({
        message: 'User unsuspended successfully',
        user,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to unsuspend user' });
      }
    }
  };
}