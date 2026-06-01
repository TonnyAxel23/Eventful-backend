import prisma from '../../../config/database';

class PaymentRepository {
  async create(data: any) {
    return await prisma.payment.create({
      data: {
        ...data,
        paidAt: new Date(),
      },
    });
  }
  
  async findByReference(reference: string) {
    return await prisma.payment.findUnique({
      where: { reference },
      include: {
        ticket: {
          include: {
            event: true,
            attendee: true,
          },
        },
      },
    });
  }
  
  async findByEvent(eventId: string) {
    return await prisma.payment.findMany({
      where: { eventId, status: 'SUCCESSFUL' },
    });
  }
  
  async updateStatus(reference: string, status: string) {
    return await prisma.payment.update({
      where: { reference },
      data: { status: status as any },
    });
  }
}

export default new PaymentRepository();
