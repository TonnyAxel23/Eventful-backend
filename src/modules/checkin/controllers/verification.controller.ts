import { Request, Response, NextFunction } from 'express';
import verificationService from '../services/verification.service';
import { AuthRequest } from '../../../middleware/auth.middleware';

class VerificationController {
  async verifyTicket(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { ticketNumber } = req.body;
      const scannerId = req.user!.userId;
      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');
      
      const result = await verificationService.verifyTicket(
        ticketNumber,
        scannerId,
        ipAddress,
        userAgent
      );
      
      res.status(200).json({
        success: result.valid,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getTicketInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const { ticketNumber } = req.params;
      
      const ticketInfo = await verificationService.getTicketInfo(ticketNumber);
      
      res.status(200).json({
        success: true,
        data: ticketInfo,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getEventCheckins(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params;
      const creatorId = req.user!.userId;
      
      const checkins = await verificationService.getEventCheckins(eventId, creatorId);
      
      res.status(200).json({
        success: true,
        data: checkins,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new VerificationController();
