import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Get overview dashboard
   */
  @Get('overview')
  async getOverview() {
    return this.dashboardService.getOverview();
  }

  /**
   * Get user statistics
   */
  @Get('users')
  async getUserStats(@Query('days') days?: string) {
    return this.dashboardService.getUserStats(parseInt(days || '30', 10));
  }

  /**
   * Get job statistics
   */
  @Get('jobs')
  async getJobStats(@Query('days') days?: string) {
    return this.dashboardService.getJobStats(parseInt(days || '30', 10));
  }

  /**
   * Get application statistics
   */
  @Get('applications')
  async getApplicationStats(@Query('days') days?: string) {
    return this.dashboardService.getApplicationStats(
      parseInt(days || '30', 10),
    );
  }

  /**
   * Get payment and revenue statistics
   */
  @Get('payments')
  async getPaymentStats(@Query('days') days?: string) {
    return this.dashboardService.getPaymentStats(parseInt(days || '30', 10));
  }

  /**
   * Get report statistics
   */
  @Get('reports')
  async getReportStats() {
    return this.dashboardService.getReportStats();
  }

  /**
   * Get recent reports
   */
  @Get('recent-reports')
  async getRecentReports(@Query('limit') limit?: string) {
    return this.dashboardService.getRecentReports(
      parseInt(limit || '5', 10),
    );
  }

  /**
   * Get recent audit logs
   */
  @Get('audit-logs')
  async getAuditLogs(@Query('limit') limit?: string) {
    return this.dashboardService.getRecentAuditLogs(
      parseInt(limit || '20', 10),
    );
  }

  /**
   * Get activity trend
   */
  @Get('activity-trend')
  async getActivityTrend(@Query('days') days?: string) {
    return this.dashboardService.getActivityTrend(parseInt(days || '30', 10));
  }

  /**
   * Get top reported jobs
   */
  @Get('top-reported-jobs')
  async getTopReportedJobs(@Query('limit') limit?: string) {
    return this.dashboardService.getTopReportedJobs(
      parseInt(limit || '10', 10),
    );
  }

  /**
   * Get system health metrics
   */
  @Get('system-health')
  async getSystemHealth() {
    return this.dashboardService.getSystemHealth();
  }

  /**
   * Get comprehensive dashboard (all stats)
   */
  @Get('comprehensive')
  async getComprehensive() {
    const [
      overview,
      userStats,
      jobStats,
      appStats,
      paymentStats,
      reportStats,
      activityTrend,
      systemHealth,
      recentReports,
      auditLogs,
      topReportedJobs,
    ] = await Promise.all([
      this.dashboardService.getOverview(),
      this.dashboardService.getUserStats(30),
      this.dashboardService.getJobStats(30),
      this.dashboardService.getApplicationStats(30),
      this.dashboardService.getPaymentStats(30),
      this.dashboardService.getReportStats(),
      this.dashboardService.getActivityTrend(30),
      this.dashboardService.getSystemHealth(),
      this.dashboardService.getRecentReports(5),
      this.dashboardService.getRecentAuditLogs(5),
      this.dashboardService.getTopReportedJobs(5),
    ]);

    return {
      overview,
      userStats,
      jobStats,
      applicationStats: appStats,
      paymentStats,
      reportStats,
      activityTrend,
      systemHealth,
      recentReports,
      auditLogs,
      topReportedJobs,
    };
  }
}
