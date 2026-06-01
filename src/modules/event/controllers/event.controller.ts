import { Request, Response, NextFunction } from 'express';
import eventService from '../services/event.service';
import { AuthRequest } from '../../../middleware/auth.middleware';
import { CreateEventDto, EventFilters } from '../types/event.types';

class EventController {
  async createEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const creatorId = req.user!.userId;
      const eventData: CreateEventDto = req.body;
      
      const event = await eventService.createEvent(creatorId, eventData);
      
      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: event,
      });
    } catch (error) {
      next(error);
    }
  }

  async getEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const event = await eventService.getEventById(id);
      
      res.status(200).json({
        success: true,
        data: event,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: EventFilters = req.query;
      const events = await eventService.getAllEvents(filters);
      
      res.status(200).json({
        success: true,
        data: events,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyEvents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const creatorId = req.user!.userId;
      const filters: EventFilters = req.query;
      const events = await eventService.getCreatorEvents(creatorId, filters);
      
      res.status(200).json({
        success: true,
        data: events,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const creatorId = req.user!.userId;
      const updateData = req.body;
      
      const event = await eventService.updateEvent(id, creatorId, updateData);
      
      res.status(200).json({
        success: true,
        message: 'Event updated successfully',
        data: event,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const creatorId = req.user!.userId;
      
      await eventService.deleteEvent(id, creatorId);
      
      res.status(200).json({
        success: true,
        message: 'Event deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async publishEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const creatorId = req.user!.userId;
      
      const event = await eventService.publishEvent(id, creatorId);
      
      res.status(200).json({
        success: true,
        message: 'Event published successfully',
        data: event,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const creatorId = req.user!.userId;
      
      const event = await eventService.cancelEvent(id, creatorId);
      
      res.status(200).json({
        success: true,
        message: 'Event cancelled successfully',
        data: event,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const creatorId = req.user!.userId;
      const analytics = await eventService.getAnalytics(creatorId);
      
      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new EventController();
