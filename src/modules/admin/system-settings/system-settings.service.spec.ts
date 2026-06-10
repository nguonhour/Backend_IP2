import { Repository } from 'typeorm';
import { SystemSetting } from './system-setting.entity';
import { SystemSettingsService } from './system-settings.service';

describe('SystemSettingsService', () => {
  function createService(existingSettings: SystemSetting[] = []) {
    const repository = {
      find: jest.fn().mockResolvedValue(existingSettings),
      create: jest.fn((settings) => settings),
      save: jest.fn(async (settings) => settings),
    } as unknown as Repository<SystemSetting>;

    return {
      repository,
      service: new SystemSettingsService(repository),
    };
  }

  it('initializes default settings when the table is empty', async () => {
    const { repository, service } = createService();

    const result = await service.getAllSettings();

    expect(repository.save).not.toHaveBeenCalled();
    expect(result.general.platformName.value).toBe('');
    expect(result.general.supportEmail.value).toBe('support@example.com');
    expect(result.security.maintenanceMode.value).toBe(false);
    expect(result.security.registrationEnabled.value).toBe(true);
    expect(result.payments.abaPayWayEnabled.value).toBe(true);
  });

  it('preserves an existing setting value while adding missing defaults', async () => {
    const existingMaintenanceSetting = {
      key: 'maintenanceMode',
      value: true,
      group: 'security',
      description: 'Custom description',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as SystemSetting;
    const { repository, service } = createService([existingMaintenanceSetting]);

    const result = await service.getAllSettings();

    expect(result.security.maintenanceMode.value).toBe(true);
    expect(repository.save).not.toHaveBeenCalled();
    expect(result.payments.abaPayWayEnabled.value).toBe(true);
  });
});
