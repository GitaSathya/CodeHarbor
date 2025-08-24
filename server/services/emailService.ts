
import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

interface MatchNotificationData {
  jobTitle: string;
  matchCount: number;
  highSimilarityMatches: Array<{
    name: string;
    score: number;
  }>;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null;

  constructor() {
    // Only create transporter if credentials are available
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      this.transporter = null;
      console.log('Email service disabled: SMTP credentials not configured');
    }
  }

  async sendProcessingCompleteEmail(userEmail: string, jobTitle: string, matchCount: number): Promise<void> {
    const subject = `Analysis Complete: ${jobTitle}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Analysis Complete</h2>
        <p>Your job analysis for <strong>${jobTitle}</strong> has been completed successfully.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Results Summary</h3>
          <p><strong>Total matches found:</strong> ${matchCount}</p>
        </div>
        
        <p>You can view detailed results in your dashboard.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated message from your recruitment analysis system.
          </p>
        </div>
      </div>
    `;

    await this.sendEmail({ to: userEmail, subject, html });
  }

  async sendHighSimilarityMatchEmail(
    userEmail: string, 
    jobTitle: string, 
    matchData: MatchNotificationData
  ): Promise<void> {
    const subject = `High Similarity Matches Found: ${jobTitle}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">High Similarity Matches Found!</h2>
        <p>We've found ${matchData.highSimilarityMatches.length} candidate(s) with 80%+ similarity for <strong>${jobTitle}</strong>.</p>
        
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #166534;">Top Matches</h3>
          ${matchData.highSimilarityMatches.map(match => `
            <div style="margin-bottom: 15px; padding: 15px; background: white; border-radius: 6px;">
              <strong>${match.name}</strong>
              <div style="color: #10b981; font-weight: bold; margin-top: 5px;">${Math.round(match.score)}% similarity</div>
            </div>
          `).join('')}
        </div>
        
        <p>Review these matches in your dashboard to proceed with the recruitment process.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated message from your recruitment analysis system.
          </p>
        </div>
      </div>
    `;

    await this.sendEmail({ to: userEmail, subject, html });
  }

  async sendReverseMatchCompleteEmail(
    userEmail: string, 
    matchData: {
      candidateSummary: string;
      matchCount: number;
      topMatch: string;
    }
  ): Promise<void> {
    const subject = `Reverse Match Complete - Job Recommendations Found`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8b5cf6;">Reverse Match Complete</h2>
        <p>We've analyzed your resume and found <strong>${matchData.matchCount}</strong> suitable job opportunities.</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #475569;">Top Recommendation</h3>
          <p><strong>${matchData.topMatch}</strong></p>
        </div>
        
        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #475569;">Candidate Summary</h3>
          <p>${matchData.candidateSummary}</p>
        </div>
        
        <p>View detailed results in your dashboard to explore all job opportunities.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated message from your recruitment analysis system.
          </p>
        </div>
      </div>
    `;

    await this.sendEmail({ to: userEmail, subject, html });
  }

  private async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.transporter) {
      console.log('Email service disabled: SMTP credentials not configured');
      return;
    }
    
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        ...options,
      });
      console.log(`Email sent successfully to ${options.to}`);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService();
