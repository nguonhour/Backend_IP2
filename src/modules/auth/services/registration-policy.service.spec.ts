import { ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SystemSetting } from '../../admin/system-settings/system-setting.entity';
import { RegistrationPolicyService } from './registration-policy.service';

describe('RegistrationPolicyService', () => {
  function createService(value?: unknown) {
    const repository = {
      findOne: jest.fn().mockResolvedValue(
        value === undefined
          ? null
          : {
              key: 'registrationEnabled',
              value,
            },
      ),
    } as unknown as Repository<SystemSetting>;

    return new RegistrationPolicyService(repository);
  }

  it('allows registration when the setting is missing or enabled', async () => {
    await expect(
      createService().assertRegistrationEnabled(),
    ).resolves.toBeUndefined();
    await expect(
      createService(true).assertRegistrationEnabled(),
    ).resolves.toBeUndefined();
  });

  it('rejects registration when the setting is disabled', async () => {
    await expect(
      createService(false).assertRegistrationEnabled(),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
