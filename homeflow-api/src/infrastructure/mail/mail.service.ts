import { EnvVariable } from '@/config/env.validation';
import {
  Injectable,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter;
  private readonly mailFrom: string;

  constructor(
    private readonly configService: ConfigService<EnvVariable, true>
  ) {
    this.mailFrom = configService.get('MAIL_FROM', { infer: true });
    const port = configService.get('SMTP_PORT', { infer: true });

    this.transporter = nodemailer.createTransport({
      host: configService.get('SMTP_HOST', { infer: true }),
      port,
      secure: port === 465,
      auth: {
        user: configService.get('SMTP_USER', { infer: true }),
        pass: configService.get('SMTP_PASSWORD', { infer: true })
      }
    });
  }

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.mailFrom,
        to,
        subject: 'Reset your Homeflow password',
        html: `
          <p>We received a request to reset your Homeflow password.</p>
          <p><a href="${resetLink}">Click here to reset your password</a></p>
          <p>This link will expire in 15 minutes. If you did not request this, you can ignore this email.</p>
        `
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}
