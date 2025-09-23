# AwesomeSauce - AI Agent Marketplace 🤖

A comprehensive AI agent marketplace platform with training capabilities, payment integration, and production-ready infrastructure.

## 🌟 Features

### AI Agent Marketplace
- **Create Custom AI Agents**: Build AI agents with custom system prompts and configurations
- **Agent Presets**: Quick start with pre-configured agent templates (Customer Service, Content Writer, Code Assistant, Educational Tutor)
- **Real-time Chat**: Interactive chat interface with AI agents using OpenAI API
- **Agent Evaluation**: Comprehensive performance testing and metrics
- **Rating & Feedback**: Community-driven agent ratings and reviews

### Training & Development
- **Custom Training Data**: Add and manage training datasets for agents
- **Fine-tuning Support**: OpenAI fine-tuning integration for improved performance
- **Performance Analytics**: Detailed evaluation metrics and improvement suggestions
- **Version Control**: Training data versioning and management

### Payment & Monetization
- **Stripe Integration**: Secure payment processing for premium agents
- **Subscription Management**: Recurring billing and subscription plans
- **Marketplace Economy**: Buy and sell AI agents with pricing flexibility
- **Revenue Tracking**: Comprehensive sales and earnings analytics

### Production Features
- **Error Handling**: Global error middleware with rate limiting and request logging
- **Authentication**: JWT-based user authentication and authorization
- **Database**: PostgreSQL with Drizzle ORM for robust data management
- **PWA Support**: Progressive Web App capabilities for mobile experience
- **TypeScript**: Full type safety across frontend and backend

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (we recommend [Neon](https://neon.tech/))
- OpenAI API key
- Stripe account (for payments)

### Installation

1. **Clone and install dependencies:**
```bash
git clone <your-repo>
cd AwesomeSauce
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/awesomesauce"

# OpenAI API
OPENAI_API_KEY="sk-proj-your-openai-key-here"

# Stripe
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"

# Application
NODE_ENV="development"
PORT=3000
JWT_SECRET="your-super-secret-jwt-key"
```

3. **Set up the database:**
```bash
./setup-db.sh
# or manually: npm run db:push
```

4. **Start development server:**
```bash
npm run dev
```

Visit `http://localhost:3000` to see your AI marketplace!

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: Vite + React 18 with TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for lightweight routing
- **Payments**: Stripe React components

### Backend (Node.js + Express)
- **Runtime**: Node.js with Express and TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with bcrypt password hashing
- **AI Integration**: OpenAI SDK for GPT models
- **Payments**: Stripe server-side integration

### Key Components

#### AI Agent Service (`server/ai-service.ts`)
- OpenAI integration with conversation management
- Fine-tuning and training data management
- Performance evaluation and metrics
- Agent configuration and presets

#### Error Handling (`server/middleware/errorHandler.ts`)
- Global error catching and logging
- Rate limiting and request throttling
- Comprehensive error responses
- Production-ready monitoring

#### Payment System (`server/payments.ts`)
- Stripe payment intents and confirmations
- Subscription management
- Webhook handling for payment events
- Revenue tracking and analytics

## 📱 Pages & Features

### Public Pages
- **Landing Page** (`/`) - Marketing and feature showcase
- **Marketplace** (`/marketplace`) - Browse and discover AI agents
- **Pricing** (`/pricing`) - Subscription plans and pricing
- **Documentation** (`/docs`) - API and usage guides

### User Dashboard
- **Dashboard** (`/dashboard`) - User overview and statistics
- **Agents** (`/agents`) - Manage your AI agents
- **Training** (`/training`) - Training data and fine-tuning
- **Analytics** (`/analytics`) - Performance metrics and insights

### Agent Development
- **Create Agent** (`/create-agent`) - Build new AI agents
- **Train Agent** (`/train-agent`) - Add training data and fine-tune
- **Agent Evaluation** (`/agent-evaluation`) - Test and improve performance
- **Playground** (`/playground`) - Interactive testing environment

### Admin Features
- **Admin Panel** (`/admin`) - Platform administration
- **Support** (`/support`) - Customer support tools
- **Treasury** (`/treasury`) - Financial overview and reporting

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run check        # TypeScript type checking

# Database
npm run db:push      # Push schema changes to database

# Setup
./setup-db.sh        # Initialize database and verify setup
```

### Project Structure

```
AwesomeSauce/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components and routes
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and configurations
├── server/                 # Backend Express server
│   ├── middleware/         # Express middleware
│   ├── ai-service.ts       # OpenAI integration
│   ├── payments.ts         # Stripe payment handling
│   ├── routes.ts           # API route definitions
│   └── index.ts            # Server entry point
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema definitions
├── .env.example            # Environment variable template
└── setup-db.sh            # Database setup script
```

## 🔌 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### AI Agents
- `GET /api/agents` - List all agents
- `POST /api/agents` - Create new agent
- `GET /api/agents/:id` - Get agent details
- `POST /api/agents/:id/chat` - Chat with agent
- `POST /api/agents/:id/evaluate` - Evaluate agent performance

### Training
- `GET /api/agents/:id/training` - Get training data
- `POST /api/agents/:id/training` - Add training data

### Marketplace
- `GET /api/search/agents` - Search agents
- `POST /api/agents/:id/feedback` - Submit feedback
- `GET /api/agent-presets` - Get agent presets

### Payments
- `POST /api/create-payment-intent` - Create payment
- `POST /api/confirm-payment` - Confirm payment

## 🛡️ Security Features

- **Authentication**: JWT-based auth with secure password hashing
- **Rate Limiting**: Configurable request rate limits
- **Input Validation**: Comprehensive input sanitization
- **Error Handling**: Secure error messages without data leakage
- **CORS**: Properly configured cross-origin resource sharing

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production database URL
3. Set secure JWT secret
4. Configure Stripe production keys
5. Set up proper SSL/TLS certificates

### Recommended Hosting
- **Frontend**: Vercel, Netlify, or AWS S3 + CloudFront
- **Backend**: Railway, Heroku, or AWS ECS
- **Database**: Neon, AWS RDS, or PlanetScale

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for AI capabilities
- [Stripe](https://stripe.com/) for payment processing
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Drizzle ORM](https://orm.drizzle.team/) for database management

## 📞 Support

For support and questions:
- 📧 Email: support@awesomesauce.ai
- 💬 Discord: [Join our community](https://discord.gg/awesomesauce)
- 📖 Documentation: [docs.awesomesauce.ai](https://docs.awesomesauce.ai)

---

Built with ❤️ by the AwesomeSauce team