import { ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SystemSetting } from '../../admin/system-settings/system-setting.entity';
import { PaymentPolicyService } from './payment-policy.service';

describe('PaymentPolicyService', () => {
  function createService(value?: unknown) {
    const repository = {
      findOne: jest.fn().mockResolvedValue(
        value === undefined
          ? null
          : {
              key: 'abaPayWayEnabled',
              value,
            },
      ),
    } as unknown as Repository<SystemSetting>;

    return new PaymentPolicyService(repository);
  }

  it('allows PayWay when the setting is missing or enabled', async () => {
    await expect(
      createService().assertAbaPayWayEnabled(),
    ).resolves.toBeUndefined();
    await expect(
      createService(true).assertAbaPayWayEnabled(),
    ).resolves.toBeUndefined();
  });

  it.each([false, 0, 'false', '0'])(
    'rejects PayWay when the setting is %p',
    async (value) => {
      await expect(
        createService(value).assertAbaPayWayEnabled(),
      ).rejects.toBeInstanceOf(ForbiddenException);
    },
  );
});
