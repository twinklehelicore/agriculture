import { Request, Response } from "express";
import prisma from '../lib/prisma';
import logger from "../utils/logger";

// Get my notifications
const getMyNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return res.status(200).json(notifications);
  } catch (err: any) {
    logger.error('Get notifications error:', err);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Get unread count
const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });
    return res.status(200).json({ count });
  } catch (err: any) {
    logger.error('Get unread count error:', err);
    return res.status(500).json({ error: 'Failed to fetch count' });
  }
};

// Mark all as read
const markAllRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return res.status(200).json({ message: 'All marked as read' });
  } catch (err: any) {
    logger.error('Mark read error:', err);
    return res.status(500).json({ error: 'Failed to mark as read' });
  }
};

// Mark single as read
const markOneRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    await prisma.notification.updateMany({
      where: { id: Number(id), userId },
      data: { isRead: true },
    });
    return res.status(200).json({ message: 'Marked as read' });
  } catch (err: any) {
    logger.error('Mark one read error:', err);
    return res.status(500).json({ error: 'Failed to mark as read' });
  }
};

export default { getMyNotifications, getUnreadCount, markAllRead, markOneRead };