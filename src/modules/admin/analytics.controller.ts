import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Get job creation trend
   */
  @Get('jobs/trend')
  async getJobTrend(@Query('days') days?: string) {
    return this.analyticsService.getJobTrendData(parseInt(days || '30', 10));
  }

  /**
   * Get application trend
   */
  @Get('applications/trend')
  async getApplicationTrend(@Query('days') days?: string) {
    return this.analyticsService.getApplicationTrendData(
      parseInt(days || '30', 10),
    );
  }

  /**
   * Get revenue trend
   */
  @Get('revenue/trend')
  async getRevenueTrend(@Query('days') days?: string) {
    return this.analyticsService.getRevenueTrendData(
      parseInt(days || '30', 10),
    );
  }

  /**
   * Get user registration trend
   */
  @Get('users/trend')
  async getUserTrend(@Query('days') days?: string) {
    return this.analyticsService.getUserTrendData(parseInt(days || '30', 10));
  }

  /**
   * Get comparison metrics between two periods
   */
  @Get('comparison')
  async getComparison(
    @Query('period1Days') period1Days?: string,
    @Query('period2Days') period2Days?: string,
  ) {
    return this.analyticsService.getComparisonMetrics(
      parseInt(period1Days || '30', 10),
      parseInt(period2Days || '30', 10),
    );
  }

  /**
   * Get conversion funnel
   */
  @Get('conversion-funnel')
  async getConversionFunnel() {
    return this.analyticsService.getConversionFunnel();
  }
}
