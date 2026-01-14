import { AppDataSource } from '../config/database';
import { MessageReport, ReportReason, ReportStatus } from '../entities/MessageReport';
import { User } from '../entities/User';

export class ReportService {
  private reportRepository = AppDataSource.getRepository(MessageReport);
  private userRepository = AppDataSource.getRepository(User);

  async createReport(data: {
    messageId: string;
    reporterId: string;
    reason: ReportReason;
    comment?: string;
  }): Promise<MessageReport> {
    const report = this.reportRepository.create({
      messageId: data.messageId,
      reporterId: data.reporterId,
      reason: data.reason,
      comment: data.comment,
      status: ReportStatus.PENDING,
    });

    return await this.reportRepository.save(report);
  }

  async getAllReports(): Promise<MessageReport[]> {
    return await this.reportRepository.find({
      relations: ['message', 'message.sender', 'reporter', 'reviewer'],
      order: { createdAt: 'DESC' },
    });
  }

  async getReportById(reportId: string): Promise<MessageReport> {
    const report = await this.reportRepository.findOne({
      where: { id: reportId },
      relations: ['message', 'message.sender', 'reporter', 'reviewer'],
    });

    if (!report) {
      throw new Error('Report not found');
    }

    return report;
  }

  async reviewReport(
    reportId: string,
    reviewerId: string,
    data: {
      status: ReportStatus;
      reviewComment?: string;
    }
  ): Promise<MessageReport> {
    const report = await this.getReportById(reportId);

    report.status = data.status;
    report.reviewerId = reviewerId;
    report.reviewComment = data.reviewComment ?? null;
    report.reviewedAt = new Date();

    return await this.reportRepository.save(report);
  }

  async suspendUser(
    userId: string,
    data: {
      endDate?: Date;
      reason: string;
    }
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    user.isSuspended = true;
    user.suspensionEndDate = data.endDate || null;
    user.suspensionReason = data.reason;

    return await this.userRepository.save(user);
  }

  async unsuspendUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    user.isSuspended = false;
    user.suspensionEndDate = null;
    user.suspensionReason = null;

    return await this.userRepository.save(user);
  }
}