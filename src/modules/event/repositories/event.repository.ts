import prisma from '../../../config/database';
import { CreateEventDto, UpdateEventDto, EventFilters } from '../types/event.types';
import { Prisma } from '@prisma/client';

class EventRepository {
  async create(data: CreateEventDto, creatorId: string) {
    const availableTickets = data.quantity;
    
    return await prisma.event.create({
      data: {
        ...data,
        creatorId,
        availableTickets,
        shareableLink: this.generateShareableLink(),
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return await prisma.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        tickets: {
          where: { status: 'ACTIVE' },
          select: { id: true },
        },
        payments: {
          where: { status: 'SUCCESSFUL' },
          select: { amount: true },
        },
      },
    });
  }

  async findAll(filters: EventFilters) {
    const { page = 1, limit = 10, search, category, location, minPrice, maxPrice, startDate, endDate } = filters;
    const skip = (page - 1) * limit;
    
    const where: Prisma.EventWhereInput = {
      status: 'PUBLISHED',
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { venue: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(category && { category: { equals: category, mode: 'insensitive' } }),
      ...(location && { location: { contains: location, mode: 'insensitive' } }),
      ...(minPrice !== undefined && { price: { gte: minPrice } }),
      ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
      ...(startDate && { startDate: { gte: startDate } }),
      ...(endDate && { endDate: { lte: endDate } }),
    };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: 'asc' },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              tickets: {
                where: { status: 'ACTIVE' },
              },
            },
          },
        },
      }),
      prisma.event.count({ where }),
    ]);

    return {
      events,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByCreator(creatorId: string, filters: EventFilters = {}) {
    const { page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.EventWhereInput = { creatorId };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              tickets: true,
              payments: {
                where: { status: 'SUCCESSFUL' },
              },
            },
          },
        },
      }),
      prisma.event.count({ where }),
    ]);

    return { events, total, page, totalPages: Math.ceil(total / limit) };
  }

  async update(id: string, data: UpdateEventDto) {
    return await prisma.event.update({
      where: { id },
      data,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return await prisma.event.delete({ where: { id } });
  }

  async updateStatus(id: string, status: string) {
    return await prisma.event.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async getAnalytics(creatorId: string) {
    const events = await prisma.event.findMany({
      where: { creatorId },
      include: {
        tickets: true,
        payments: {
          where: { status: 'SUCCESSFUL' },
        },
        checkIns: {
          include: {
            ticket: true,
          },
        },
      },
    });

    const totalEvents = events.length;
    const totalTicketsSold = events.reduce((sum, event) => sum + event.tickets.length, 0);
    const totalRevenue = events.reduce((sum, event) => 
      sum + event.payments.reduce((s, p) => s + p.amount, 0), 0);
    const totalAttendees = new Set(events.flatMap(e => e.tickets.map(t => t.attendeeId))).size;

    const perEventAnalytics = events.map(event => ({
      id: event.id,
      title: event.title,
      ticketsAvailable: event.quantity,
      ticketsSold: event.tickets.length,
      revenueGenerated: event.payments.reduce((sum, p) => sum + p.amount, 0),
      attendeesCheckedIn: event.checkIns.length,
      attendanceRate: event.tickets.length > 0 
        ? (event.checkIns.length / event.tickets.length) * 100 
        : 0,
    }));

    return {
      global: {
        totalEvents,
        totalTicketsSold,
        totalRevenue,
        totalAttendees,
      },
      perEvent: perEventAnalytics,
    };
  }

  private generateShareableLink(): string {
    return `${process.env.CLIENT_URL}/event/${Math.random().toString(36).substring(2, 15)}`;
  }
}

export default new EventRepository();
