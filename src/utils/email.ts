import nodemailer from 'nodemailer';
import logger from './logger';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const sendEmailOtp = async (email: string, otp: string): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"AgriOwn" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Your AgriOwn OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
          <div style="background: #15803d; padding: 20px; border-radius: 12px; text-align: center;">
            <h1 style="color: white; margin: 0;">🌾 AgriOwn</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb; border-radius: 12px; margin-top: 16px; text-align: center;">
            <h2 style="color: #1f2937;">Your OTP Code</h2>
            <div style="font-size: 36px; font-weight: bold; color: #15803d; letter-spacing: 8px; padding: 16px;">
              ${otp}
            </div>
            <p style="color: #6b7280; font-size: 14px;">Valid for 10 minutes. Do not share with anyone.</p>
          </div>
        </div>
      `,
    });
    logger.info(`OTP email sent to ${email}`);
  } catch (err: any) {
    logger.error(`Email send error: ${err.message}`);
    throw err;
  }
};