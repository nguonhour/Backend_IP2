import { Controller, Get, Body, Put, UseGuards } from '@nestjs/common';
import { SystemSettingsService } from './system-settings.service';
import { UpdateSettingDto } from './dto/update-system-settings.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('admin/system-settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class SystemSettingsController {
  constructor(private readonly settingsService: SystemSettingsService) {}

  @Get()
  async fetchAll() {
    return {
      success: true,
      data: await this.settingsService.getAllSettings(),
    };
  }

  @Put()
  async update(@Body() dto: UpdateSettingDto) {
    const updated = await this.settingsService.updateSetting(dto);
    return {
      success: true,
      message: `System configuration setting '${dto.key}' has been updated safely.`,
      data: updated,
    };
  }
}
