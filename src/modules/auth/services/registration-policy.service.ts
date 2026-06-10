import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from '../../admin/system-settings/system-setting.entity';

@Injectable()
export class RegistrationPolicyService {
  constructor(
    @InjectRepository(SystemSetting)
    private readonly settingsRepository: Repository<SystemSetting>,
  ) {}

  async assertRegistrationEnabled(): Promise<void> {
    const setting = await this.settingsRepository.findOne({
      where: { key: 'registrationEnabled' },
    });

    if (this.isDisabled(setting?.value)) {
      throw new ForbiddenException(
        'New user registration is currently disabled.',
      );
    }
  }

  private isDisabled(value: unknown): boolean {
    return value === false || value === 0 || value === 'false' || value === '0';
  }
}
