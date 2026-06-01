import prisma from '../../../config/database';
import { PurchaseTicketDto } from '../types/ticket.types';

class TicketRepository {
  async create(data: PurchaseTicketDto, ticketNumber: string, qrCodeUrl: string) {
    return await prisma.ticket.create({
      data: {
        eventId: data.eventId,
        attendeeId: data.attendeeId,
        ticketNumber,
        qrCode: `data:image/png;base64,${qrCodeUrl}`,
        qrCodeUrl,
        status: 'ACTIVE',
      },
      include: {
        event: {
          select: {
            title: true,
            startDate: true,
            venue: true,
            price: true,
          },
        },
        attendee: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return await prisma.ticket.findUnique({
      where: { id },
      include: {
        event: true,
        attendee: true,
        checkIns: true,
      },
    });
  }

  async findByTicketNumber(ticketNumber: string) {
    return await prisma.ticket.findUnique({
      where: { ticketNumber },
      include: {
        event: true,
        attendee: true,
        checkIns: true,
      },
    });
  }

  async findByAttendee(attendeeId: string) {
    return await prisma.ticket.findMany({
      where: { attendeeId, status: 'ACTIVE' },
      include: {
        event: {
          select: {
            title: true,
            startDate: true,
            endDate: true,
            venue: true,
            location: true,
            bannerImage: true,
          },
        },
      },
      orderBy: {
        purchaseDate: 'desc',
      },
    });
  }

  async updateStatus(id: string, status: string) {
    return await prisma.ticket.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async markAsUsed(id: string) {
    return await prisma.ticket.update({
      where: { id },
      data: { status: 'USED' },
    });
  }

  async getTicketCount(eventId: string) {
    return await prisma.ticket.count({
      where: { eventId, status: 'ACTIVE' },
    });
  }

  async checkDuplicatePurchase(eventId: string, attendeeId: string) {
    const ticket = await prisma.ticket.findFirst({
      where: {
        eventId,
        attendeeId,
        status: 'ACTIVE',
      },
    });
    return !!ticket;
  }
}

export default new TicketRepository();
