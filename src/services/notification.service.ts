import prisma from '../config/database';
import { sendEmail } from '../utils/email';
import logger from '../utils/logger';

class NotificationService {
  async sendTicketPurchaseNotification(userId: string, ticketData: any) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;
    
    await sendEmail({
      to: user.email,
      subject: 'Ticket Purchase Confirmation',
      template: 'ticketPurchase',
      data: {
        name: user.firstName,
        eventName: ticketData.eventTitle,
        ticketNumber: ticketData.ticketNumber,
        eventDate: ticketData.eventDate,
        venue: ticketData.venue,
        qrCodeUrl: ticketData.qrCodeUrl,
      },
    });
    
    await this.createNotification(userId, 'EMAIL', 'Ticket Purchase Confirmation', 
      `Your ticket for ${ticketData.eventTitle} has been confirmed.`);
  }
  
  async sendEventReminder(userId: string, eventData: any, reminderTime: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;
    
    await sendEmail({
      to: user.email,
      subject: `Reminder: ${eventData.title} starts in ${reminderTime}`,
      template: 'eventReminder',
      data: {
        name: user.firstName,
        eventName: eventData.title,
        eventDate: eventData.startDate,
        venue: eventData.venue,
        location: eventData.location,
        reminderTime,
      },
    });
    
    await this.createNotification(userId, 'EMAIL', 'Event Reminder', 
      `${eventData.title} starts in ${reminderTime}`);
  }
  
  async sendEventCancellationNotification(eventId: string) {
    const tickets = await prisma.ticket.findMany({
      where: { eventId, status: 'ACTIVE' },
      include: {
        attendee: true,
        event: true,
      },
    });
    
    for (const ticket of tickets) {
      await sendEmail({
        to: ticket.attendee.email,
        subject: `Event Cancelled: ${ticket.event.title}`,
        template: 'eventCancelled',
        data: {
          name: ticket.attendee.firstName,
          eventName: ticket.event.title,
          eventDate: ticket.event.startDate,
        },
      });
      
      await this.createNotification(ticket.attendeeId, 'EMAIL', 'Event Cancelled', 
        `${ticket.event.title} has been cancelled.`);
    }
  }
  
  async createNotification(userId: string, type: string, title: string, message: string) {
    return await prisma.notification.create({
      data: {
        userId,
        type: type as any,
        title,
        message,
        status: 'SENT',
        sentAt: new Date(),
      },
    });
  }
  
  async getUserNotifications(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);
    
    return {
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
  
  async markAsRead(notificationId: string, userId: string) {
    return await prisma.notification.update({
      where: { id: notificationId },
      data: { status: 'SENT' as any },
    });
  }
}

export default new NotificationService();
