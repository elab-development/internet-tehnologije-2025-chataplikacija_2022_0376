import { Response } from 'express';

import { AuthRequest } from '../middleware/auth';

import { AppDataSource } from '../config/database';

import { MessageReport, ReportStatus } from '../entities/MessageReport';

import { User, UserStatus } from '../entities/User';

 

export const reportMessage = async (req: AuthRequest, res: Response) => {

  try {

    const { messageId, reason, additionalComment } = req.body;

    const reporterId = req.user!.id;

 

    const reportRepository = AppDataSource.getRepository(MessageReport);

 

    const report = reportRepository.create({

      messageId,

      reporterId,

      reason,

      additionalComment,

    });

 

    await reportRepository.save(report);

 

    res.status(201).json({

      message: 'Message reported successfully',

      report,

    });

  } catch (error) {

    console.error('Report message error:', error);

    res.status(500).json({ message: 'Server error' });

  }

};

 

export const getAllReports = async (req: AuthRequest, res: Response) => {

  try {

    const reportRepository = AppDataSource.getRepository(MessageReport);

 

    const reports = await reportRepository.find({

      relations: ['message', 'message.sender', 'reporter', 'reviewedBy'],

      order: { createdAt: 'DESC' },

    });

 

    res.json(reports);

  } catch (error) {

    console.error('Get reports error:', error);

    res.status(500).json({ message: 'Server error' });

  }

};

 

export const reviewReport = async (req: AuthRequest, res: Response) => {

  try {

   const { reportId } = req.params;

    const { status, reviewNotes, suspendUser, suspensionDays, suspensionReason } = req.body;

    const reviewerId = req.user!.id;

 

    const reportRepository = AppDataSource.getRepository(MessageReport);

    const userRepository = AppDataSource.getRepository(User);

 

    const report = await reportRepository.findOne({

      where: { id: reportId },

      relations: ['message', 'message.sender'],

    });

 

    if (!report) {

      return res.status(404).json({ message: 'Report not found' });

    }

 

    report.status = status;

    report.reviewNotes = reviewNotes;

    report.reviewedById = reviewerId;

    await reportRepository.save(report);

 

    // Suspend user if requested

    if (suspendUser && report.message?.sender) {

      const user = await userRepository.findOne({

        where: { id: report.message.sender.id },

      });

 

      if (user) {

        user.status = UserStatus.SUSPENDED;

        user.suspendedUntil = new Date(Date.now() + suspensionDays * 24 * 60 * 60 * 1000);

        user.suspensionReason = suspensionReason;

        await userRepository.save(user);

      }

    }

 

    res.json({

      message: 'Report reviewed successfully',

      report,

    });

  } catch (error) {

    console.error('Review report error:', error);

    res.status(500).json({ message: 'Server error' });

  }

};