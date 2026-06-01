import { Router } from 'express';
import paymentController from '../controllers/payment.controller';
import { authenticate } from '../../../middleware/auth.middleware';

const router = Router();

router.post('/initialize/:eventId', authenticate, paymentController.initializePayment);
router.get('/verify', paymentController.verifyPayment);
router.post('/webhook/paystack', paymentController.webhook);
router.get('/status/:reference', paymentController.getPaymentStatus);

export default router;
