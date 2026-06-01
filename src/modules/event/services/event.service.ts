import eventRepository from '../repositories/event.repository';
import { CreateEventDto, UpdateEventDto, EventFilters } from '../types/event.types';
import { AppError } from '../../../middleware/error.middleware';
import redisClient from '../../../config/redis';
import logger from '../../../utils/logger';

class EventService {
  private readonly CACHE_PREFIX = 'event:';
  private readonly CACHE_TTL = 300; // 5 minutes

  async createEvent(creatorId: string, data: CreateEventDto) {
    if (data.startDate <= new Date()) {
      throw new AppError('Start date must be in the future', 400);
    }

    if (data.endDate <= data.startDate) {
      throw new AppError('End date must be after start date', 400);
    }

    if (data.price < 0) {
      throw new AppError('Price cannot be negative', 400);
    }

    if (data.quantity <= 0) {
      throw new AppError('Ticket quantity must be greater than 0', 400);
    }

    const event = await eventRepository.create(data, creatorId);
    
    // Invalidate cache
    await this.invalidateEventCache();
    
    return event;
  }

  async getEventById(id: string) {
    // Try cache first
    const cachedEvent = await redisClient.get(`${this.CACHE_PREFIX}${id}`);
    if (cachedEvent) {
      return JSON.parse(cachedEvent);
    }

    const event = await eventRepository.findById(id);
    if (!event) {
      throw new AppError('Event not found', 404);
    }

    // Cache the event
    await redisClient.setEx(`${this.CACHE_PREFIX}${id}`, this.CACHE_TTL, JSON.stringify(event));
    
    return event;
  }

  async getAllEvents(filters: EventFilters) {
    const cacheKey = `events:${JSON.stringify(filters)}`;
    const cachedEvents = await redisClient.get(cacheKey);
    
    if (cachedEvents) {
      return JSON.parse(cachedEvents);
    }

    const events = await eventRepository.findAll(filters);
    
    await redisClient.setEx(cacheKey, this.CACHE_TTL, JSON.stringify(events));
    
    return events;
  }

  async getCreatorEvents(creatorId: string, filters: EventFilters) {
    return await eventRepository.findByCreator(creatorId, filters);
  }

  async updateEvent(eventId: string, creatorId: string, data: UpdateEventDto) {
    const event = await eventRepository.findById(eventId);
    
    if (!event) {
      throw new AppError('Event not found', 404);
    }

    if (event.creatorId !== creatorId) {
      throw new AppError('You can only update your own events', 403);
    }

    if (event.status === 'COMPLETED') {
      throw new AppError('Cannot update completed events', 400);
    }

    if (data.startDate && data.startDate <= new Date()) {
      throw new AppError('Start date must be in the future', 400);
    }

    const updatedEvent = await eventRepository.update(eventId, data);
    
    // Invalidate cache
    await this.invalidateEventCache(eventId);
    
    return updatedEvent;
  }

  async deleteEvent(eventId: string, creatorId: string) {
    const event = await eventRepository.findById(eventId);
    
    if (!event) {
      throw new AppError('Event not found', 404);
    }

    if (event.creatorId !== creatorId) {
      throw new AppError('You can only delete your own events', 403);
    }

    if (event.tickets && event.tickets.length > 0) {
      throw new AppError('Cannot delete event with existing ticket sales', 400);
    }

    await eventRepository.delete(eventId);
    
    // Invalidate cache
    await this.invalidateEventCache(eventId);
    
    return true;
  }

  async publishEvent(eventId: string, creatorId: string) {
    const event = await eventRepository.findById(eventId);
    
    if (!event) {
      throw new AppError('Event not found', 404);
    }

    if (event.creatorId !== creatorId) {
      throw new AppError('You can only publish your own events', 403);
    }

    if (event.status !== 'DRAFT') {
      throw new AppError('Event can only be published from draft status', 400);
    }

    const publishedEvent = await eventRepository.updateStatus(eventId, 'PUBLISHED');
    
    await this.invalidateEventCache(eventId);
    
    return publishedEvent;
  }

  async cancelEvent(eventId: string, creatorId: string) {
    const event = await eventRepository.findById(eventId);
    
    if (!event) {
      throw new AppError('Event not found', 404);
    }

    if (event.creatorId !== creatorId) {
      throw new AppError('You can only cancel your own events', 403);
    }

    if (event.status === 'COMPLETED') {
      throw new AppError('Cannot cancel completed events', 400);
    }

    const cancelledEvent = await eventRepository.updateStatus(eventId, 'CANCELLED');
    
    await this.invalidateEventCache(eventId);
    
    // TODO: Send cancellation emails to all ticket holders
    
    return cancelledEvent;
  }

  async getAnalytics(creatorId: string) {
    return await eventRepository.getAnalytics(creatorId);
  }

  private async invalidateEventCache(eventId?: string) {
    if (eventId) {
      await redisClient.del(`${this.CACHE_PREFIX}${eventId}`);
    }
    // Pattern-based deletion would require SCAN, but for MVP, we'll clear events pattern
    const keys = await redisClient.keys('events:*');
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  }
}

export default new EventService();
