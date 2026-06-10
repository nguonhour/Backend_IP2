import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from './system-setting.entity';
import { UpdateSettingDto } from './dto/update-system-settings.dto';

@Injectable()
export class SystemSettingsService {
  constructor(
    @InjectRepository(SystemSetting)
    private readonly settingsRepository: Repository<SystemSetting>,
  ) {}

  // Resolves a single configuration key value instantly with a safe fallback value
  async get(key: string, defaultValue: any = null): Promise<any> {
    const setting = await this.settingsRepository.findOne({ where: { key } });
    return setting ? setting.value : defaultValue;
  }

  // Returns all application settings grouped neatly by category grouping tags
  async getAllSettings(): Promise<Record<string, any>> {
    const list = await this.settingsRepository.find();
    return list.reduce(
      (acc, item) => {
        if (!acc[item.group]) acc[item.group] = {};
        acc[item.group][item.key] = {
          value: item.value,
          description: item.description,
          updatedAt: item.updatedAt,
        };
        return acc;
      },
      {} as Record<string, any>,
    );
  }

  // Updates an existing configuration option or creates it securely on the fly (Upsert)
  async updateSetting(dto: UpdateSettingDto): Promise<SystemSetting> {
    let setting = await this.settingsRepository.findOne({
      where: { key: dto.key },
    });

    if (!setting) {
      setting = this.settingsRepository.create({
        key: dto.key,
        value: dto.value,
        group: dto.group || 'general',
        description: dto.description,
      });
    } else {
      setting.value = dto.value;
      if (dto.group) setting.group = dto.group;
      if (dto.description) setting.description = dto.description;
    }

    return this.settingsRepository.save(setting);
  }
}
