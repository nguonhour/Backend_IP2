import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { DashboardController } from './dashboard.controller';
import { AnalyticsController } from './analytics.controller';
import { AdminService } from './admin.service';
import { DashboardService } from './dashboard.service';
import { AnalyticsService } from './analytics.service';
import { UserManagementService } from './user-management.service';
import { JobModerationService } from './job-moderation.service';
import { User } from '../users/user.entity';
import { Job } from '../jobs/job.entity';
import { JobSkill } from '../jobs/job-skill.entity';
import { Application } from '../applications/application.entity';
import { ApplicationStatusHistory } from '../applications/application-status-history.entity';
import { Payment } from '../payments/payment.entity';
import { Report } from '../reports/report.entity';
import { AuditLog } from '../audit-logs/audit-log.entity';
import { Notification } from '../notifications/notification.entity';
import { Skill } from '../../entities/master/skill.entity';
import { Industry } from '../../entities/master/industry.entity';
import { Language } from '../../entities/master/language.entity';
import { University } from '../../entities/master/university.entity';
import { Major } from '../../entities/master/major.entity';
import { StudentSkill } from '../student-profiles/student-skill.entity';
import { SearchHistory } from '../student-profiles/search-history.entity';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { NotificationModule } from '../notifications/notification.module';
import { MasterDataController } from './master-data.controller';
import { MasterDataService } from './master-data.service';
import { SystemSetting } from './system-settings/system-setting.entity';
import { SystemSettingsController } from './system-settings/system-settings.controller';
import { SystemSettingsService } from './system-settings/system-settings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Job,
      JobSkill,
      Application,
      ApplicationStatusHistory,
      Payment,
      Report,
      AuditLog,
      Notification,
      Skill,
      Industry,
      Language,
      University,
      Major,
      StudentSkill,
      SearchHistory,
      SystemSetting,
    ]),
    AuditLogsModule,
    NotificationModule,
  ],
  controllers: [
    AdminController,
    DashboardController,
    AnalyticsController,
    MasterDataController,
    SystemSettingsController,
  ],
  providers: [
    AdminService,
    DashboardService,
    AnalyticsService,
    UserManagementService,
    JobModerationService,
    MasterDataService,
    SystemSettingsService,
  ],
})
export class AdminModule {}
