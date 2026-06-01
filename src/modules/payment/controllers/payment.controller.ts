import { Request, Response, NextFunction } from 'express';
import paymentService from '../services/payment.service';
import { AuthRequest } from '../../../middleware/auth.middleware';

class PaymentController {
  async initializePayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params;
      const attendeeId = req.user!.userId;
      const { email, quantity } = req.body;
      
      const result = await paymentService.initializePayment(
        eventId,
        attendeeId,
        email,
        quantity || 1
      );
      
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { reference } = req.query;
      
      const result = await paymentService.verifyPayment(reference as string);
      
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async webhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['x-paystack-signature'] as string;
      
      await paymentService.webhookHandler(req.body, signature);
      
      res.status(200).json({ received: true });
    } catch (error) {
      next(error);
    }
  }
  
  async getPaymentStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { reference } = req.params;
      
      const payment = await paymentService.getPaymentStatus(reference);
      
      res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PaymentController();
