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

  @Get('overview')
  async getAdvancedOverview(@Query('days') days?: string) {
    return this.analyticsService.getAdvancedOverview(
      parseInt(days || '30', 10),
    );
  }

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

  @Get('employers/engagement')
  async getEmployerEngagement(@Query('limit') limit?: string) {
    return this.analyticsService.getEmployerEngagement(
      parseInt(limit || '5', 10),
    );
  }

  @Get('skills/gaps')
  async getSkillGapAnalysis(@Query('limit') limit?: string) {
    return this.analyticsService.getSkillGapAnalysis(
      parseInt(limit || '5', 10),
    );
  }

  @Get('utilization/heatmap')
  async getUtilizationHeatmap(@Query('days') days?: string) {
    return this.analyticsService.getUtilizationHeatmap(
      parseInt(days || '7', 10),
    );
  }

  @Get('search-tokens')
  async getPopularSearchTokens(@Query('limit') limit?: string) {
    return this.analyticsService.getPopularSearchTokens(
      parseInt(limit || '10', 10),
    );
  }

  @Get('surge-forecast')
  async getSurgeForecast(
    @Query('days') days?: string,
    @Query('limit') limit?: string,
  ) {
    return this.analyticsService.getSurgeForecast(
      parseInt(days || '14', 10),
      parseInt(limit || '2', 10),
    );
  }
}
