export interface PurchaseTicketDto {
  eventId: string;
  attendeeId: string;
  quantity?: number;
}

export interface TicketResponse {
  id: string;
  ticketNumber: string;
  qrCodeUrl: string;
  eventId: string;
  eventTitle: string;
  eventStartDate: Date;
  eventVenue: string;
  attendeeName: string;
}
