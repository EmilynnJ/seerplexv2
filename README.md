# SoulSeer - Psychic Reading Platform

SoulSeer is a full-stack psychic reading platform that connects spiritual readers with clients seeking guidance. The platform features real-time video/audio/chat sessions, pay-per-minute billing, and a comprehensive admin dashboard.

## Features

### Core Functionality
- **Real-time Sessions**: Custom WebRTC implementation for video, audio, and chat sessions
- **Pay-per-minute Billing**: Automated billing system with Stripe integration
- **Role-based Access**: Client, Reader, and Admin roles with specific permissions
- **Live Streaming**: Readers can host live streams with virtual gifting
- **Marketplace**: Shop for spiritual products and services
- **Community Features**: Forums and messaging system

### Technical Features
- **Custom WebRTC**: Built from scratch without third-party SDKs
- **Real-time Communication**: Socket.io for signaling and notifications
- **Secure Payments**: Stripe Connect for reader payouts
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based auth system
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Socket.io Client** for real-time features
- **Axios** for API calls
- **Stripe.js** for payment processing

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **Socket.io** for WebRTC signaling
- **Stripe** for payment processing
- **JWT** for authentication
- **bcryptjs** for password hashing

## Project Structure

```
soulseer/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   └── utils/          # Utility functions
│   ├── public/
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   ├── config/             # Configuration files
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js 16+ 
- MongoDB database (or MongoDB Atlas)
- Stripe account for payments

### Environment Variables

Create `.env` files in both client and server directories:

**Server (.env)**
```env
NODE_ENV=development
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
CLIENT_URL=http://localhost:3000
```

**Client (.env)**
```env
VITE_API_BASE_URL=http://localhost:4000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here
```

### Installation Steps

1. **Install dependencies**
   ```bash
   npm run install-deps
   ```

2. **Start development servers**
   ```bash
   npm run dev
   ```

   This will start both the client (port 3000) and server (port 4000) concurrently.

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000

## Key Features Implementation

### WebRTC System
- Custom signaling server using Socket.io
- Peer-to-peer video/audio communication
- Real-time chat during sessions
- Connection quality monitoring
- Automatic reconnection handling

### Billing System
- Real-time per-minute charging
- Automatic session termination on insufficient funds
- 70/30 revenue split (70% to readers)
- Daily automatic payouts for readers
- Comprehensive transaction tracking

### User Roles

#### Clients
- Browse and connect with readers
- Participate in video/audio/chat sessions
- Add funds to account balance
- Rate and review sessions
- Access session history

#### Readers
- Set availability and rates
- Accept/decline session requests
- Manage earnings and payouts
- Host live streams
- Respond to client reviews

#### Admins
- Create and manage reader accounts
- Monitor platform statistics
- Process manual payouts
- Manage user accounts
- Access comprehensive analytics

### Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting on sensitive endpoints
- Secure payment processing with Stripe

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/readers` - Get all readers
- `PATCH /api/users/profile` - Update profile
- `PATCH /api/users/status` - Toggle online status (readers)
- `GET /api/users/earnings` - Get earnings (readers)

### Sessions
- `POST /api/sessions/request` - Request new session
- `POST /api/sessions/:id/accept` - Accept session (readers)
- `POST /api/sessions/charge` - Process billing
- `POST /api/sessions/:id/end` - End session
- `GET /api/sessions/history` - Get session history

### Payments
- `POST /api/stripe/create-payment-intent` - Create payment
- `POST /api/stripe/payment-success` - Confirm payment
- `POST /api/stripe/payout` - Process reader payout

### Admin
- `GET /api/admin/readers` - Get all readers
- `POST /api/admin/readers` - Create reader account
- `GET /api/admin/sessions` - Get all sessions
- `GET /api/admin/stats` - Get platform statistics

## Database Schema

### User Model
- Authentication and profile information
- Role-based permissions (client/reader/admin)
- Reader-specific settings (rates, availability)
- Earnings and balance tracking
- Stripe integration fields

### Session Model
- Session metadata and participants
- Billing and duration tracking
- Rating and review system
- Connection quality metrics

### Transaction Model
- Payment and payout records
- Stripe integration tracking
- Fee calculations
- Balance history

### Message Model
- Real-time messaging system
- Conversation management
- Message reactions and editing
- Read status tracking

## Deployment

### Netlify Deployment

1. **Create a Netlify site**
   ```bash
   # Install Netlify CLI if needed
   npm install -g netlify-cli
   
   # Login to Netlify
   netlify login
   
   # Initialize a new Netlify site
   netlify init
   ```

2. **Set environment variables**
   ```bash
   # Via Netlify CLI
   netlify env:set NODE_ENV production
   netlify env:set MONGODB_URI your_mongodb_connection_string
   netlify env:set JWT_SECRET your_jwt_secret_key
   netlify env:set STRIPE_SECRET_KEY sk_live_your_stripe_secret_key
   netlify env:set STRIPE_WEBHOOK_SECRET whsec_your_webhook_secret
   netlify env:set CLIENT_URL https://your-app-name.netlify.app
   
   # Or set these in the Netlify dashboard under Site settings > Environment variables
   ```

3. **Deploy to Netlify**
   ```bash
   # Manual deployment
   netlify deploy --prod
   
   # Or connect to Git repository for automatic deployments
   # Configure in Netlify dashboard: Site settings > Build & deploy > Continuous Deployment
   ```

4. **Set up MongoDB**
   - Use MongoDB Atlas for production database
   - Update MONGODB_URI with your Atlas connection string
   - No IP whitelist needed as Netlify Functions use dynamic IPs

5. **Configure Stripe**
   - Set up Stripe webhooks pointing to: `https://your-app-name.netlify.app/.netlify/functions/api/stripe/webhook`
   - Use production Stripe keys
   - Configure Stripe Connect for reader payouts

### Local Development
```bash
# Install dependencies
npm run install-all

# Start development servers
npm run dev
```

### Production Build
```bash
# Build for production
npm run build

# Start production server
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.

## Support

For technical support or questions, contact the development team.

---

**Note**: This is a complete, production-ready implementation of the SoulSeer platform as specified in the build guide. All major features including WebRTC, billing, and admin functionality are fully implemented.