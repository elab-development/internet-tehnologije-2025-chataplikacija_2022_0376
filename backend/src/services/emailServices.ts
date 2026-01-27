// services/emailService.ts
import { transporter, emailTemplates } from '../config/emailConfig';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Osnovna funkcija za slanje email-a
 */
export const sendEmail = async (options: SendEmailOptions): Promise<boolean> => {
  try {
    console.log('📧 [EMAIL] Sending email to:', options.to);

    const info = await transporter.sendMail({
      from: `"Chat App" <${process.env.SMTP_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    console.log('✅ [EMAIL] Email sent successfully:', info.messageId);
    return true;
  } catch (error: any) {
    console.error('❌ [EMAIL] Error sending email:', error.message);
    return false;
  }
};

/**
 * Pošalji email za resetovanje lozinke
 */
export const sendPasswordResetEmail = async (
  email: string,
  userName: string,
  resetToken: string
): Promise<boolean> => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const template = emailTemplates.resetPassword(resetUrl, userName);

    return await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  } catch (error: any) {
    console.error('❌ [EMAIL] Error sending password reset email:', error.message);
    return false;
  }
};

/**
 * Pošalji welcome email (opciono)
 */
export const sendWelcomeEmail = async (
  email: string,
  userName: string
): Promise<boolean> => {
  try {
    const template = emailTemplates.welcome(userName);

    return await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  } catch (error: any) {
    console.error('❌ [EMAIL] Error sending welcome email:', error.message);
    return false;
  }
};