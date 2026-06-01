import QRCode from 'qrcode';
import crypto from 'crypto';

export function generateTicketNumber(): string {
  const prefix = 'EVT';
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex');
  return `${prefix}-${timestamp}-${random}`.toUpperCase();
}

export async function generateQRCode(data: string): Promise<string> {
  try {
    const qrCode = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
    });
    return qrCode;
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
}

export function validateTicketNumber(ticketNumber: string): boolean {
  const regex = /^EVT-[a-zA-Z0-9]+-[a-fA-F0-9]+$/;
  return regex.test(ticketNumber);
}
