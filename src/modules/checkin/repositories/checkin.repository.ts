import prisma from '../../../config/database';

class CheckinRepository {
  async create(data: {
    ticketId: string;
    scannedBy: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return await prisma.checkIn.create({
      data,
    });
  }
  
  async findByTicket(ticketId: string) {
    return await prisma.checkIn.findUnique({
      where: { ticketId },
      include: {
        ticket: {
          include: {
            event: true,
            attendee: true,
          },
        },
      },
    });
  }
  
  async findByEvent(eventId: string) {
    return await prisma.checkIn.findMany({
      where: {
        ticket: {
          eventId,
        },
      },
      include: {
        ticket: {
          include: {
            attendee: true,
            event: true,
          },
        },
      },
      orderBy: {
        scannedAt: 'desc',
      },
    });
  }
  
  async getEventStats(eventId: string) {
    const stats = await prisma.checkIn.aggregate({
      where: {
        ticket: {
          eventId,
        },
      },
      _count: true,
    });
    
    return stats._count;
  }
}

export default new CheckinRepository();
