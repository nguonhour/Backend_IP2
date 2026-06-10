export interface DefaultSystemSetting {
  key: string;
  value: string | number | boolean;
  group: string;
  description: string;
}

export const DEFAULT_SYSTEM_SETTINGS: DefaultSystemSetting[] = [
  {
    key: 'platformName',
    value: '',
    group: 'general',
    description: 'The public name displayed for the platform.',
  },
  {
    key: 'supportEmail',
    value: 'support@example.com',
    group: 'general',
    description: 'Primary email address used for platform support.',
  },
  {
    key: 'maintenanceMode',
    value: false,
    group: 'security',
    description: 'Temporarily disables public platform access.',
  },
  {
    key: 'registrationEnabled',
    value: true,
    group: 'security',
    description: 'Allows new users to create accounts.',
  },
  {
    key: 'abaPayWayEnabled',
    value: true,
    group: 'payments',
    description: 'Enables ABA PayWay as a payment method.',
  },
];
