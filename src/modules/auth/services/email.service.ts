import { Injectable, InternalServerErrorException } from '@nestjs/common';
import sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException('SENDGRID_API_KEY is not set');
    }
    sgMail.setApiKey(apiKey);
  }

  async sendVerificationEmail(email: string, token: string) {
    const appBaseUrl = process.env.APP_BASE_URL ?? 'http://localhost:5174';
    const from = process.env.SENDGRID_FROM;
    if (!from) {
      throw new InternalServerErrorException('SENDGRID_FROM is not set');
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
    } catch (err) {
      throw new InternalServerErrorException('Failed to send verification email');
    }
  }
}
