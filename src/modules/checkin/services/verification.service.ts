import ticketRepository from '../../ticket/repositories/ticket.repository';
import checkinRepository from '../repositories/checkin.repository';
import { AppError } from '../../../middleware/error.middleware';
import logger from '../../../utils/logger';

class VerificationService {
  async verifyTicket(ticketNumber: string, scannerId: string, ipAddress?: string, userAgent?: string) {
    const ticket = await ticketRepository.findByTicketNumber(ticketNumber);
    
    if (!ticket) {
      return {
        valid: false,
        message: 'Invalid ticket',
        status: 'INVALID',
      };
    }
    
    if (ticket.status === 'USED') {
      return {
        valid: false,
        message: 'Ticket has already been used',
        status: 'ALREADY_USED',
        usedAt: ticket.checkIns?.[0]?.scannedAt,
      };
    }
    
    if (ticket.status === 'EXPIRED') {
      return {
        valid: false,
        message: 'Ticket has expired',
        status: 'EXPIRED',
      };
    }
    
    // Check if event has started
    const eventStartDate = new Date(ticket.event.startDate);
    if (eventStartDate > new Date()) {
      return {
        valid: false,
        message: 'Event has not started yet',
        status: 'NOT_STARTED',
        eventStartDate,
      };
    }
    
    // Create check-in record
    const checkin = await checkinRepository.create({
      ticketId: ticket.id,
      scannedBy: scannerId,
      ipAddress,
      userAgent,
    });
    
    // Mark ticket as used
    await ticketRepository.markAsUsed(ticket.id);
    
    logger.info(`Ticket ${ticketNumber} verified by user ${scannerId}`);
    
    return {
      valid: true,
      message: 'Ticket verified successfully',
      status: 'VALID',
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        event: {
          id: ticket.event.id,
          title: ticket.event.title,
          venue: ticket.event.venue,
          startDate: ticket.event.startDate,
        },
        attendee: {
          name: `${ticket.attendee.firstName} ${ticket.attendee.lastName}`,
          email: ticket.attendee.email,
        },
      },
      checkin: {
        scannedAt: checkin.scannedAt,
      },
    };
  }
  
  async getTicketInfo(ticketNumber: string) {
    const ticket = await ticketRepository.findByTicketNumber(ticketNumber);
    
    if (!ticket) {
      throw new AppError('Ticket not found', 404);
    }
    
    return {
      ticketNumber: ticket.ticketNumber,
      status: ticket.status,
      event: {
        id: ticket.event.id,
        title: ticket.event.title,
        venue: ticket.event.venue,
        startDate: ticket.event.startDate,
        endDate: ticket.event.endDate,
      },
      attendee: {
        name: `${ticket.attendee.firstName} ${ticket.attendee.lastName}`,
        email: ticket.attendee.email,
      },
      checkedIn: ticket.status === 'USED',
      checkedInAt: ticket.checkIns?.[0]?.scannedAt,
    };
  }
  
  async getEventCheckins(eventId: string, creatorId: string) {
    // Verify creator owns the event
    const tickets = await ticketRepository.findByEventId(eventId);
    
    if (!tickets.length) {
      return {
        totalTickets: 0,
        checkedIn: 0,
        checkins: [],
      };
    }
    
    const checkins = await checkinRepository.findByEvent(eventId);
    
    return {
      totalTickets: tickets.length,
      checkedIn: checkins.length,
      attendanceRate: (checkins.length / tickets.length) * 100,
      checkins: checkins.map(c => ({
        ticketNumber: c.ticket.ticketNumber,
        attendeeName: `${c.ticket.attendee.firstName} ${c.ticket.attendee.lastName}`,
        scannedAt: c.scannedAt,
        scannedBy: c.scannedBy,
      })),
    };
  }
}

export default new VerificationService();
