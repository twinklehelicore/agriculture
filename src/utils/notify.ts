import prisma from '../lib/prisma';
import logger from './logger';

export const createNotification = async (
  userId: number,
  title: string,
  message: string
): Promise<void> => {
  try {
    await prisma.notification.create({
      data: { userId, title, message },
    });
  } catch (err: any) {
    logger.error('Create notification error:', err.message);
  }
};