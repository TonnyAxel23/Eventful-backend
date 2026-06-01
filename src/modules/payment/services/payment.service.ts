import Paystack from 'paystack-api';
import crypto from 'crypto';
import ticketRepository from '../../ticket/repositories/ticket.repository';
import paymentRepository from '../repositories/payment.repository';
import eventRepository from '../../event/repositories/event.repository';
import { AppError } from '../../../middleware/error.middleware';
import { generateTicketNumber, generateQRCode } from '../../../utils/ticket';
import { sendEmail } from '../../../utils/email';
import logger from '../../../utils/logger';

const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY!);

class PaymentService {
  async initializePayment(eventId: string, attendeeId: string, email: string, quantity: number = 1) {
    const event = await eventRepository.findById(eventId);
    
    if (!event) {
      throw new AppError('Event not found', 404);
    }
    
    if (event.status !== 'PUBLISHED') {
      throw new AppError('Event is not available for purchase', 400);
    }
    
    if (new Date(event.startDate) <= new Date()) {
      throw new AppError('Event has already started or ended', 400);
    }
    
    const ticketsSold = await ticketRepository.getTicketCount(eventId);
    const availableTickets = event.quantity - ticketsSold;
    
    if (availableTickets < quantity) {
      throw new AppError('Not enough tickets available', 400);
    }
    
    const duplicatePurchase = await ticketRepository.checkDuplicatePurchase(eventId, attendeeId);
    if (duplicatePurchase) {
      throw new AppError('You have already purchased a ticket for this event', 400);
    }
    
    const amount = event.price * quantity * 100; // Paystack uses kobo/cents
    const reference = `EVT-${eventId.substring(0, 8)}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    
    try {
      const response = await paystack.transaction.initialize({
        email,
        amount,
        reference,
        metadata: {
          eventId,
          attendeeId,
          quantity,
          eventTitle: event.title,
        },
        callback_url: `${process.env.CLIENT_URL}/payment/verify`,
      });
      
      if (!response.status) {
        throw new AppError('Payment initialization failed', 400);
      }
      
      return {
        authorizationUrl: response.data.authorization_url,
        reference,
      };
    } catch (error) {
      logger.error('Payment initialization error:', error);
      throw new AppError('Payment initialization failed', 500);
    }
  }
  
  async verifyPayment(reference: string) {
    try {
      const response = await paystack.transaction.verify({ reference });
      
      if (!response.status || response.data.status !== 'success') {
        throw new AppError('Payment verification failed', 400);
      }
      
      const { eventId, attendeeId, quantity } = response.data.metadata;
      
      // Check if payment already processed
      const existingPayment = await paymentRepository.findByReference(reference);
      if (existingPayment) {
        return existingPayment;
      }
      
      const event = await eventRepository.findById(eventId);
      if (!event) {
        throw new AppError('Event not found', 404);
      }
      
      // Create tickets
      const tickets = [];
      for (let i = 0; i < parseInt(quantity); i++) {
        const ticketNumber = generateTicketNumber();
        const qrData = {
          ticketNumber,
          eventId,
          attendeeId,
        };
        const qrCodeUrl = await generateQRCode(JSON.stringify(qrData));
        
        const ticket = await ticketRepository.create(
          { eventId, attendeeId, quantity: 1 },
          ticketNumber,
          qrCodeUrl
        );
        
        tickets.push(ticket);
        
        // Create payment record
        await paymentRepository.create({
          ticketId: ticket.id,
          eventId,
          reference,
          amount: response.data.amount / 100,
          status: 'SUCCESSFUL',
          paystackResponse: response.data,
        });
        
        // Send ticket email
        await sendEmail({
          to: response.data.customer.email,
          subject: `Your Ticket for ${event.title}`,
          template: 'ticket',
          data: {
            eventName: event.title,
            attendeeName: ticket.attendee.firstName,
            ticketNumber: ticket.ticketNumber,
            qrCodeUrl: ticket.qrCodeUrl,
            eventDate: event.startDate,
            venue: event.venue,
          },
        });
      }
      
      // Update available tickets
      const ticketsSold = await ticketRepository.getTicketCount(eventId);
      const availableTickets = event.quantity - ticketsSold;
      await eventRepository.update(eventId, { availableTickets });
      
      return {
        success: true,
        tickets,
        reference,
      };
    } catch (error) {
      logger.error('Payment verification error:', error);
      throw error;
    }
  }
  
  async webhookHandler(payload: any, signature: string) {
    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    if (hash !== signature) {
      throw new AppError('Invalid webhook signature', 401);
    }
    
    if (payload.event === 'charge.success') {
      await this.verifyPayment(payload.data.reference);
    }
    
    return { received: true };
  }
  
  async getPaymentStatus(reference: string) {
    return await paymentRepository.findByReference(reference);
  }
}

export default new PaymentService();
