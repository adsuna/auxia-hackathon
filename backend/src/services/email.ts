import nodemailer from 'nodemailer';

interface EmailConfig {
  service: string;
  user: string;
  pass: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailConfig;

  constructor() {
    this.config = {
      service: process.env.EMAIL_SERVICE || 'gmail',
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || ''
    };

    this.initializeTransporter();
  }

  private initializeTransporter() {
    if (!this.config.user || !this.config.pass) {
      console.warn('Email service not configured. OTP emails will be logged to console.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        service: this.config.service,
        auth: {
          user: this.config.user,
          pass: this.config.pass
        }
      });
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
    }
  }

  async sendOTP(email: string, code: string): Promise<boolean> {
    const subject = 'SwipeHire Campus - Your Login Code';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">SwipeHire Campus</h2>
        <p>Your login code is:</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 4px;">${code}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">SwipeHire Campus - Mutual Match Micro Interview Scheduler</p>
      </div>
    `;

    if (!this.transporter) {
      // Development mode - log to console
      console.log(`\n📧 OTP Email for ${email}:`);
      console.log(`Subject: ${subject}`);
      console.log(`Code: ${code}`);
      console.log(`Expires: 10 minutes\n`);
      return true;
    }

    try {
      await this.transporter.sendMail({
        from: `"SwipeHire Campus" <${this.config.user}>`,
        to: email,
        subject,
        html
      });
      return true;
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();