# Eventful - Event Management & Ticketing Platform

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)
![Prisma](https://img.shields.io/badge/Prisma-5.7.0-2D3748.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg)
![Redis](https://img.shields.io/badge/Redis-7-FF4438.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📋 Overview

Eventful is a comprehensive event management and ticketing platform that enables creators to organize events and attendees to discover, purchase tickets, and attend events seamlessly. The platform features QR code-based ticketing, real-time verification, and analytics dashboards.

### 🎯 Key Features

#### For Creators
- ✅ Create and manage events
- ✅ Set ticket prices and quantities
- ✅ Track ticket sales and revenue
- ✅ QR code verification system
- ✅ Real-time analytics dashboard
- ✅ Event publishing and cancellation
- ✅ View attendee lists and check-ins

#### For Attendees (Eventees)
- ✅ Discover events with advanced filtering
- ✅ Purchase tickets via Paystack
- ✅ Receive QR code tickets via email
- ✅ View purchased tickets
- ✅ Set event reminders
- ✅ Share events on social media

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Application                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express.js API Gateway                    │
│  • Authentication • Rate Limiting • CORS • Helmet Security  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                           │
│  Auth • Event • Payment • Ticket • Notification • Analytics │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Repository Layer                          │
│              Data Access & Business Logic                    │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │PostgreSQL│   │  Redis   │   │ Paystack │
        │ Database │   │  Cache   │   │ Payment  │
        └──────────┘   └──────────┘   └──────────┘
```

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Cache**: Redis
- **Queue**: Bull (Redis-based)

### Authentication & Security
- JWT with refresh tokens
- Bcrypt for password hashing
- Helmet for security headers
- Rate limiting
- CORS configuration
- Input validation with Zod

### Payments
- **Payment Gateway**: Paystack
- Webhook integration
- Payment verification

### Notifications
- Email notifications (Nodemailer)
- Event reminders
- Ticket confirmations

### Testing & Documentation
- Jest & Supertest
- Swagger/OpenAPI

## 📦 Installation

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v15 or higher)
- Redis (v7 or higher)
- npm or yarn
- Docker (optional)

### Quick Start with Docker

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/eventful-backend.git
cd eventful-backend
```

2. **Copy environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start services with Docker**
```bash
npm run docker:up
```

4. **Run database migrations**
```bash
npx prisma migrate dev --name init
npx prisma generate
```

5. **Seed the database**
```bash
npm run prisma:seed
```

6. **Start the application**
```bash
npm run dev
```

### Manual Setup

1. **Install dependencies**
```bash
npm install
```

2. **Set up PostgreSQL**
```sql
CREATE DATABASE eventful;
CREATE USER eventful_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE eventful TO eventful_user;
```

3. **Start Redis**
```bash
redis-server
```

4. **Configure environment**
```bash
# Update .env with your database credentials
DATABASE_URL="postgresql://eventful_user:your_password@localhost:5432/eventful"
REDIS_HOST=localhost
REDIS_PORT=6379
```

5. **Run migrations**
```bash
npx prisma migrate dev --name init
```

6. **Start the server**
```bash
npm run dev
```

## 🔧 Environment Variables

```env
# Application
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/eventful"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_ACCESS_SECRET=your-super-secret-access-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Paystack (Get from https://dashboard.paystack.co/#/settings/developers)
PAYSTACK_SECRET_KEY=sk_test_xxx
PAYSTACK_PUBLIC_KEY=pk_test_xxx

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@eventful.com

# App URLs
CLIENT_URL=http://localhost:3000
API_URL=http://localhost:5000

# Security
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/v1/auth/register` | User registration | Public |
| POST | `/api/v1/auth/login` | User login | Public |
| POST | `/api/v1/auth/refresh-token` | Refresh JWT token | Public |
| POST | `/api/v1/auth/logout` | User logout | Private |
| POST | `/api/v1/auth/forgot-password` | Request password reset | Public |
| POST | `/api/v1/auth/reset-password` | Reset password | Public |

### Event Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/events` | Get all events | Public |
| GET | `/api/v1/events/:id` | Get event details | Public |
| POST | `/api/v1/events` | Create event | Creator/Admin |
| PUT | `/api/v1/events/:id` | Update event | Creator/Admin |
| DELETE | `/api/v1/events/:id` | Delete event | Creator/Admin |
| POST | `/api/v1/events/:id/publish` | Publish event | Creator/Admin |
| POST | `/api/v1/events/:id/cancel` | Cancel event | Creator/Admin |
| GET | `/api/v1/events/my/events` | Get creator's events | Creator/Admin |
| GET | `/api/v1/events/analytics/overview` | Get analytics | Creator/Admin |

### Payment Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/v1/payments/initialize/:eventId` | Initialize payment | Private |
| GET | `/api/v1/payments/verify` | Verify payment | Public |
| POST | `/api/v1/payments/webhook/paystack` | Paystack webhook | Public |
| GET | `/api/v1/payments/status/:reference` | Check payment status | Private |

### Verification Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/v1/verify/verify` | Verify ticket QR code | Creator/Admin |
| GET | `/api/v1/verify/ticket/:ticketNumber` | Get ticket info | Public |
| GET | `/api/v1/verify/event/:eventId/checkins` | Get event check-ins | Creator/Admin |

## 💳 Payment Integration

Eventful uses Paystack for payment processing. The flow is:

1. **Initialize Payment**: User selects event and clicks "Buy Ticket"
2. **Redirect to Paystack**: User completes payment on Paystack's secure page
3. **Payment Verification**: Webhook or redirect verification
4. **Ticket Generation**: QR code ticket generated and emailed
5. **Confirmation**: User receives ticket with QR code

### Testing Payments

Use Paystack test card details:
- **Card Number**: `4111111111111111`
- **Expiry**: Any future date
- **CVV**: Any 3 digits
- **OTP**: `123456` (if prompted)

## 🎫 QR Code System

Each ticket contains a unique QR code with:
- Ticket ID
- Event ID
- Attendee ID
- Ticket Number

### Verification Process
1. Creator scans QR code using the mobile app or webcam
2. System validates ticket authenticity
3. Marks ticket as used
4. Prevents duplicate entries

## 📊 Analytics Dashboard

Creators get access to:
- **Global Metrics**: Total events, tickets sold, revenue, attendees
- **Per-Event Analytics**: 
  - Tickets sold vs available
  - Revenue generated
  - Check-in rates
  - Attendance percentage

## 🔄 Background Jobs

Eventful uses Bull (Redis-based queue) for:
- **Event Reminders**: 1 hour, 1 day, 3 days, 1 week before events
- **Email Notifications**: Ticket confirmations, payment receipts
- **Analytics Processing**: Periodic metric calculations

## 🧪 Testing

```bash
# Run all tests
npm test

# Run unit tests
npm test -- --testMatch="**/*.test.ts"

# Run integration tests
npm run test:integration

# Run with coverage
npm test -- --coverage
```

## 📁 Project Structure

```
eventful-backend/
├── src/
│   ├── config/           # Configuration files
│   ├── modules/          # Feature modules
│   │   ├── auth/        # Authentication module
│   │   ├── event/       # Event management
│   │   ├── payment/     # Payment processing
│   │   ├── ticket/      # Ticket management
│   │   ├── checkin/     # QR verification
│   │   └── notification/# Notifications
│   ├── middleware/       # Custom middleware
│   ├── utils/           # Utility functions
│   ├── jobs/            # Background jobs
│   ├── types/           # TypeScript types
│   ├── app.ts           # Express app
│   └── server.ts        # Server entry
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed data
├── tests/               # Test files
├── logs/                # Application logs
└── package.json
```

## 🔒 Security Features

- **JWT Authentication** with short-lived access tokens
- **Refresh Token Rotation** for enhanced security
- **Password Hashing** with bcrypt (10 rounds)
- **Rate Limiting** to prevent abuse
- **Helmet.js** for security headers
- **CORS** properly configured
- **Input Validation** with Zod
- **SQL Injection Prevention** via Prisma ORM
- **XSS Protection** through sanitization
- **Secure Session Management**

## 🚢 Deployment

### Deploy to Production

1. **Build the application**
```bash
npm run build
```

2. **Set production environment variables**
```bash
NODE_ENV=production
DATABASE_URL=your_production_db_url
# Configure other environment variables
```

3. **Run migrations**
```bash
npx prisma migrate deploy
```

4. **Start the server**
```bash
npm start
```

### Deployment Options

- **VPS**: DigitalOcean, Linode, Vultr
- **Cloud**: AWS (EC2, RDS, ElastiCache), GCP, Azure
- **PaaS**: Heroku, Railway, Render
- **Container**: Docker + Kubernetes

## 📈 Performance Optimization

- **Redis Caching** for frequently accessed data
- **Database Indexing** on frequently queried fields
- **Pagination** for list endpoints
- **Connection Pooling** for database
- **Rate Limiting** to prevent abuse
- **Compression** for response payloads

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGithub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Paystack for payment processing
- Prisma for amazing ORM
- Bull for queue management
- All open-source contributors

## 📞 Support

For support, email support@eventful.com or open an issue in the GitHub repository.

## 🗺️ Roadmap

### Phase 1 (MVP) - ✅ Complete
- User authentication
- Event management
- Ticket purchase
- QR code generation
- Payment integration

### Phase 2 - 🚧 In Progress
- Mobile app (React Native)
- Push notifications
- Social login (Google, Facebook)

### Phase 3 - 📅 Planned
- Multiple ticket tiers
- Discount codes
- Waitlist feature
- Event chat
- Live streaming integration
- Advanced analytics with charts

## 🐛 Known Issues

See [Issues](https://github.com/yourusername/eventful-backend/issues) page for current bugs and feature requests.

## 📊 API Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

## 💡 Tips & Tricks

1. **For Testing**: Use the test environment with `.env.test`
2. **For Debugging**: Use `npm run dev` for detailed logs
3. **For Performance**: Enable Redis caching in production
4. **For Security**: Always use HTTPS in production
5. **For Monitoring**: Integrate with logging services like Sentry

---

**Built with ❤️ using Node.js, TypeScript, and Prisma**
