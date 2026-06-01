import { Router } from 'express';
import eventController from '../controllers/event.controller';
import validate from '../../../middleware/validation.middleware';
import {
  createEventSchema,
  updateEventSchema,
  eventIdSchema,
  eventFiltersSchema,
} from '../validators/event.validator';
import { authenticate } from '../../../middleware/auth.middleware';
import { requireRole } from '../../../middleware/rbac.middleware';

const router = Router();

// Public routes
router.get('/', validate(eventFiltersSchema), eventController.getAllEvents);
router.get('/:id', validate(eventIdSchema), eventController.getEvent);

// Protected routes (Creator only)
router.use(authenticate);
router.post('/', requireRole('CREATOR', 'ADMIN'), validate(createEventSchema), eventController.createEvent);
router.get('/my/events', eventController.getMyEvents);
router.put('/:id', requireRole('CREATOR', 'ADMIN'), validate(updateEventSchema), eventController.updateEvent);
router.delete('/:id', requireRole('CREATOR', 'ADMIN'), validate(eventIdSchema), eventController.deleteEvent);
router.post('/:id/publish', requireRole('CREATOR', 'ADMIN'), validate(eventIdSchema), eventController.publishEvent);
router.post('/:id/cancel', requireRole('CREATOR', 'ADMIN'), validate(eventIdSchema), eventController.cancelEvent);
router.get('/analytics/overview', requireRole('CREATOR', 'ADMIN'), eventController.getAnalytics);

export default router;
