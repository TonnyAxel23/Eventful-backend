import nodemailer from 'nodemailer';
import logger from './logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(options: {
  to: string;
  subject: string;
  template: string;
  data: any;
}) {
  try {
    // For MVP, we'll use simple HTML templates
    const html = generateEmailTemplate(options.template, options.data);
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html,
    });
    
    logger.info(`Email sent to ${options.to}: ${options.subject}`);
  } catch (error) {
    logger.error('Failed to send email:', error);
    throw error;
  }
}

function generateEmailTemplate(template: string, data: any): string {
  switch (template) {
    case 'welcome':
      return `
        <h1>Welcome to Eventful, ${data.name}!</h1>
        <p>We're excited to have you on board. Start discovering amazing events today!</p>
        <a href="${process.env.CLIENT_URL}/events">Browse Events</a>
      `;
    
    case 'ticket':
      return `
        <h1>Your Ticket for ${data.eventName}</h1>
        <p>Dear ${data.attendeeName},</p>
        <p>Here's your ticket for ${data.eventName}.</p>
        <p><strong>Ticket Number:</strong> ${data.ticketNumber}</p>
        <p><strong>Event Date:</strong> ${new Date(data.eventDate).toLocaleString()}</p>
        <p><strong>Venue:</strong> ${data.venue}</p>
        <img src="${data.qrCodeUrl}" alt="QR Code" />
        <p>Please present this QR code at the venue for entry.</p>
      `;
    
    default:
      return `<p>${JSON.stringify(data)}</p>`;
  }
}
