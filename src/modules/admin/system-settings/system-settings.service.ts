import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from './system-setting.entity';
import { UpdateSettingDto } from './dto/update-system-settings.dto';
import { DEFAULT_SYSTEM_SETTINGS } from './system-settings.defaults';

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
    const list = await this.getSettingsWithDefaults();
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

  private async getSettingsWithDefaults(): Promise<SystemSetting[]> {
    const existingSettings = await this.settingsRepository.find();
    const existingKeys = new Set(
      existingSettings.map((setting) => setting.key),
    );
    const missingDefaults = DEFAULT_SYSTEM_SETTINGS.filter(
      (setting) => !existingKeys.has(setting.key),
    );

    if (!missingDefaults.length) {
      return existingSettings;
    }

    const defaultSettings = this.settingsRepository.create(missingDefaults);

    return [...existingSettings, ...defaultSettings];
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
