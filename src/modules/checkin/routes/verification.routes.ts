import { Router } from 'express';
import verificationController from '../controllers/verification.controller';
import { authenticate } from '../../../middleware/auth.middleware';
import { requireRole } from '../../../middleware/rbac.middleware';

const router = Router();

router.post('/verify', authenticate, requireRole('CREATOR', 'ADMIN'), verificationController.verifyTicket);
router.get('/ticket/:ticketNumber', verificationController.getTicketInfo);
router.get('/event/:eventId/checkins', authenticate, requireRole('CREATOR', 'ADMIN'), verificationController.getEventCheckins);

export default router;
