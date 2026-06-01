import Queue from 'bull';
import prisma from '../config/database';
import notificationService from '../services/notification.service';
import logger from '../utils/logger';

const reminderQueue = new Queue('event-reminders', {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

reminderQueue.process(async (job) => {
  const { eventId, reminderType, userId } = job.data;
  
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });
    
    if (!event || event.status !== 'PUBLISHED') {
      logger.info(`Event ${eventId} not found or not published, skipping reminder`);
      return;
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      logger.info(`User ${userId} not found, skipping reminder`);
      return;
    }
    
    await notificationService.sendEventReminder(userId, event, reminderType);
    
    // Mark reminder as sent
    await prisma.reminder.updateMany({
      where: {
        userId,
        eventId,
        reminderDate: {
          lte: new Date(),
        },
      },
      data: {
        isSent: true,
        sentAt: new Date(),
      },
    });
    
    logger.info(`Reminder sent for event ${eventId} to user ${userId}`);
  } catch (error) {
    logger.error(`Failed to send reminder for event ${eventId}:`, error);
    throw error;
  }
});

export async function scheduleEventReminders(eventId: string, userId: string, reminderSettings: any) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });
  
  if (!event) return;
  
  const reminders = [];
  const eventDate = new Date(event.startDate);
  
  if (reminderSettings.oneHour) {
    const reminderDate = new Date(eventDate.getTime() - 60 * 60 * 1000);
    if (reminderDate > new Date()) {
      reminders.push({
        userId,
        eventId,
        reminderDate,
        message: `Event "${event.title}" starts in 1 hour`,
      });
      await reminderQueue.add({ eventId, reminderType: '1 hour', userId }, { delay: reminderDate.getTime() - Date.now() });
    }
  }
  
  if (reminderSettings.oneDay) {
    const reminderDate = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000);
    if (reminderDate > new Date()) {
      reminders.push({
        userId,
        eventId,
        reminderDate,
        message: `Event "${event.title}" starts in 24 hours`,
      });
      await reminderQueue.add({ eventId, reminderType: '24 hours', userId }, { delay: reminderDate.getTime() - Date.now() });
    }
  }
  
  if (reminderSettings.threeDays) {
    const reminderDate = new Date(eventDate.getTime() - 3 * 24 * 60 * 60 * 1000);
    if (reminderDate > new Date()) {
      reminders.push({
        userId,
        eventId,
        reminderDate,
        message: `Event "${event.title}" starts in 3 days`,
      });
      await reminderQueue.add({ eventId, reminderType: '3 days', userId }, { delay: reminderDate.getTime() - Date.now() });
    }
  }
  
  if (reminderSettings.oneWeek) {
    const reminderDate = new Date(eventDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (reminderDate > new Date()) {
      reminders.push({
        userId,
        eventId,
        reminderDate,
        message: `Event "${event.title}" starts in 1 week`,
      });
      await reminderQueue.add({ eventId, reminderType: '1 week', userId }, { delay: reminderDate.getTime() - Date.now() });
    }
  }
  
  if (reminders.length > 0) {
    await prisma.reminder.createMany({
      data: reminders,
    });
  }
}

export { reminderQueue };
