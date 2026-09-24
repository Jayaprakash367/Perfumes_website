import nodemailer from 'nodemailer';
import { env } from './env';
import { logger } from '@utils/logger';

export const emailTransporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  secure: env.EMAIL_PORT === 465,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASSWORD,
  },
});

// Verify connection in non-test environments
if (env.NODE_ENV !== 'test') {
  emailTransporter.verify((error) => {
    if (error) {
      logger.warn({ error: error.message }, 'Email transporter not available — emails will be logged only');
    } else {
      logger.info('✅ Email transporter ready');
    }
  });
}
