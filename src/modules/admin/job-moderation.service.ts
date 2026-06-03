import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '../jobs/job.entity';
import { JobApprovalStatus } from '../jobs/job-approval-status.enum';
import { AuditService } from '../audit-logs/audit.service';
import { AuditAction } from '../audit-logs/audit-log.entity';
import { NotificationService } from '../notifications/notification.service';
import { NotificationType } from '../notifications/notification-type.enum';
import { NotificationChannel } from '../notifications/notification-channel.enum';

@Injectable()
export class JobModerationService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    private auditService: AuditService,
    private notificationService: NotificationService,
  ) {}

  /**
   * Get pending jobs awaiting approval
   */
  async getPendingJobs(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.jobRepository.findAndCount({
      where: { approvalStatus: JobApprovalStatus.PENDING_APPROVAL },
      relations: ['employer', 'employer.user', 'category', 'jobType', 'status'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  /**
   * Get approved jobs
   */
  async getApprovedJobs(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.jobRepository.findAndCount({
      where: { approvalStatus: JobApprovalStatus.APPROVED },
      relations: ['employer', 'category', 'jobType', 'status'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  /**
   * Get rejected jobs
   */
  async getRejectedJobs(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.jobRepository.findAndCount({
      where: { approvalStatus: JobApprovalStatus.REJECTED },
      relations: ['employer', 'category', 'jobType', 'status'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  /**
   * Get job details for moderation
   */
  async getJobForModeration(jobId: string): Promise<Job> {
    const job = await this.jobRepository.findOne({
      where: { id: jobId },
      relations: ['employer', 'employer.user', 'category', 'jobType', 'status'],
    });

    if (!job) {
      throw new NotFoundException(`Job ${jobId} not found`);
    }

    return job;
  }

  /**
   * Approve job for publication
   */
  async approveJob(jobId: string, adminId: string): Promise<Job> {
    const job = await this.getJobForModeration(jobId);
    const oldData = {
      approvalStatus: job.approvalStatus,
      rejectionReason: job.rejectionReason,
      is_blocked: job.is_blocked,
    };

    job.approvalStatus = JobApprovalStatus.APPROVED;
    job.rejectionReason = null;
    job.is_blocked = false;
    const updated = await this.jobRepository.save(job);

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: AuditAction.APPROVE,
      module: 'jobs',
      entityId: jobId,
      entityType: 'Job',
      oldData,
      newData: {
        approvalStatus: job.approvalStatus,
        rejectionReason: null,
        is_blocked: job.is_blocked,
      },
      description: `Job "${job.title}" approved`,
    });

    // Send notification to employer
    await this.notificationService.createNotification(
      job.employer.user.id,
      NotificationType.JOB_APPROVED,
      'Job Approved',
      `Your job posting "${job.title}" has been approved and is now visible to students.`,
      NotificationChannel.BOTH,
      {
        referenceId: jobId,
        metadata: {
          jobId,
          jobTitle: job.title,
          employerId: job.employer.id,
        },
      },
    );

    return updated;
  }

  /**
   * Reject job
   */
  async rejectJob(
    jobId: string,
    reason: string,
    adminId: string,
  ): Promise<Job> {
    const job = await this.getJobForModeration(jobId);
    const oldData = {
      approvalStatus: job.approvalStatus,
      rejectionReason: job.rejectionReason,
    };

    job.approvalStatus = JobApprovalStatus.REJECTED;
    job.rejectionReason = reason;
    const updated = await this.jobRepository.save(job);

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: AuditAction.REJECT,
      module: 'jobs',
      entityId: jobId,
      entityType: 'Job',
      oldData,
      newData: {
        approvalStatus: job.approvalStatus,
        rejectionReason: reason,
      },
      description: `Job "${job.title}" rejected: ${reason}`,
    });

    // Send notification to employer
    await this.notificationService.createNotification(
      job.employer.user.id,
      NotificationType.JOB_REJECTED,
      'Job Rejected',
      `Your job posting "${job.title}" was not approved. Reason: ${reason}. You can make changes and resubmit.`,
      NotificationChannel.BOTH,
      {
        referenceId: jobId,
        metadata: {
          jobId,
          jobTitle: job.title,
          employerId: job.employer.id,
          rejectionReason: reason,
        },
      },
    );

    return updated;
  }

  /**
   * Resubmit rejected job for re-approval
   */
  async resubmitJob(jobId: string, employerId: string): Promise<Job> {
    const job = await this.getJobForModeration(jobId);

    if (job.approvalStatus !== JobApprovalStatus.REJECTED) {
      throw new Error('Only rejected jobs can be resubmitted');
    }

    if (job.employer.id !== employerId) {
      throw new Error('Job does not belong to this employer');
    }

    const oldData = {
      approvalStatus: job.approvalStatus,
      rejectionReason: job.rejectionReason,
    };

    job.approvalStatus = JobApprovalStatus.PENDING_APPROVAL;
    job.rejectionReason = null;
    const updated = await this.jobRepository.save(job);

    // Audit log
    await this.auditService.log({
      userId: employerId,
      action: AuditAction.UPDATE,
      module: 'jobs',
      entityId: jobId,
      entityType: 'Job',
      oldData,
      newData: {
        approvalStatus: job.approvalStatus,
        rejectionReason: null,
      },
      description: `Job "${job.title}" resubmitted for approval`,
    });

    return updated;
  }

  /**
   * Get moderation statistics
   */
  async getModerationStats() {
    const pending = await this.jobRepository.count({
      where: { approvalStatus: JobApprovalStatus.PENDING_APPROVAL },
    });
    const approved = await this.jobRepository.count({
      where: { approvalStatus: JobApprovalStatus.APPROVED },
    });
    const rejected = await this.jobRepository.count({
      where: { approvalStatus: JobApprovalStatus.REJECTED },
    });

    return {
      pending,
      approved,
      rejected,
      total: pending + approved + rejected,
    };
  }
}
