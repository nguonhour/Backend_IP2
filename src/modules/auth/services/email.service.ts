import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly isEnabled: boolean;

  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    const from = process.env.SENDGRID_FROM;

    this.isEnabled = Boolean(apiKey && from);

    if (!apiKey || !from) {
      this.logger.warn(
        'SendGrid is not configured. Email verification will be skipped in this environment.',
      );
      return;
    }

    sgMail.setApiKey(apiKey);
  }

  async sendVerificationEmail(email: string, token: string) {
    const appBaseUrl =
      process.env.APP_BASE_URL ??
      process.env.FRONTEND_URL ??
      'http://localhost:5174';
    if (!this.isEnabled) {
      return;
    }

//     const appBaseUrl = process.env.APP_BASE_URL ?? 'http://localhost:5174';
    const from = process.env.SENDGRID_FROM;
    if (!from) {
      throw new InternalServerErrorException('SENDGRID_FROM is not set');
    }

    if (this.disabled) {
      this.logger.log(
        `Email sending is disabled. Would have sent verification email to ${email} with token ${token}`,
      );
      return;
    }

    const verifyUrl = `${appBaseUrl}/verify-email?token=${encodeURIComponent(token)}`;

    try {
      await sgMail.send({
        to: email,
        from,
        subject: 'Verify your email',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <h2>Verify your email</h2>
            <p>Click the button below to verify your email address.</p>
            <p>
              <a href="${verifyUrl}" style="background:#1E51BE;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;display:inline-block;">
                Verify Email
              </a>
            </p>
            <p>If the button doesn't work, copy and paste this link:</p>
            <p>${verifyUrl}</p>
          </div>
        `,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      this.logger.error(`Failed to send verification email: ${errorMessage}`);
      throw new InternalServerErrorException(
        'Failed to send verification email',
      );
    }
  }

  async sendResetPasswordEmail(email: string, token: string) {
    if (!this.isEnabled) {
      return;
    }

    const appBaseUrl = process.env.APP_BASE_URL ?? 'http://localhost:5174';
    const from = process.env.SENDGRID_FROM;
    if (!from) {
      throw new InternalServerErrorException('SENDGRID_FROM is not set');
    }

    const resetUrl = `${appBaseUrl}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(
      email,
    )}`;

    try {
      await sgMail.send({
        to: email,
        from,
        subject: 'Reset your password',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <h2>Reset your password</h2>
            <p>Click the button below to set a new password. This link will expire in 1 hour.</p>
            <p>
              <a href="${resetUrl}" style="background:#1E51BE;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;display:inline-block;">
                Reset Password
              </a>
            </p>
            <p>If the button doesn't work, copy and paste this link:</p>
            <p>${resetUrl}</p>
          </div>
        `,
      });
    } catch {
      throw new InternalServerErrorException(
        'Failed to send reset password email',
      );
    }
  }
}
