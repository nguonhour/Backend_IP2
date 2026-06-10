import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from '../../admin/system-settings/system-setting.entity';

@Injectable()
export class PaymentPolicyService {
  constructor(
    @InjectRepository(SystemSetting)
    private readonly settingsRepository: Repository<SystemSetting>,
  ) {}

  async isAbaPayWayEnabled(): Promise<boolean> {
    const setting = await this.settingsRepository.findOne({
      where: { key: 'abaPayWayEnabled' },
    });

    return !this.isDisabled(setting?.value);
  }

  async assertAbaPayWayEnabled(): Promise<void> {
    if (!(await this.isAbaPayWayEnabled())) {
      throw new ForbiddenException(
        'ABA PayWay payments are currently disabled.',
      );
    }
  }

  private isDisabled(value: unknown): boolean {
    return value === false || value === 0 || value === 'false' || value === '0';
  }
}
