# Production Deployment Configuration

## 📋 Pre-Deployment Checklist

### Environment Setup
- [ ] Production database configured (Neon, AWS RDS, etc.)
- [ ] OpenAI API key added to production environment
- [ ] Stripe production keys configured
- [ ] JWT secret set to cryptographically secure value
- [ ] SSL/TLS certificates configured
- [ ] Domain name configured and DNS pointing to server

### Security Configuration
- [ ] Rate limiting configured appropriately for production load
- [ ] CORS origins restricted to production domains
- [ ] Error logging configured (Sentry, LogRocket, etc.)
- [ ] Database connection pooling configured
- [ ] Environment variables secured (no .env files in production)

### Performance Optimization
- [ ] Static asset CDN configured
- [ ] Database query optimization reviewed
- [ ] Caching strategy implemented (Redis recommended)
- [ ] Load balancing configured for multiple instances
- [ ] Health check endpoints implemented

## 🚀 Deployment Methods

### Option 1: Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

# Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=awesomesauce
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Option 2: Vercel + Railway

1. **Frontend on Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
vercel --prod
```

2. **Backend on Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Option 3: AWS ECS/Fargate

```yaml
# aws-task-definition.json
{
  "family": "awesomesauce-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "awesomesauce-container",
      "image": "YOUR_ECR_REPO/awesomesauce:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT:secret:awesomesauce/database-url"
        },
        {
          "name": "OPENAI_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT:secret:awesomesauce/openai-key"
        }
      ]
    }
  ]
}
```

## 🔧 Production Environment Variables

Create these in your production environment (never commit to git):

```env
# Production Environment Variables

# Database
DATABASE_URL="postgresql://user:password@prod-db-host:5432/awesomesauce"

# AI Services
OPENAI_API_KEY="sk-proj-production-key-here"

# Payments
STRIPE_SECRET_KEY="sk_live_your_production_stripe_key"
STRIPE_PUBLISHABLE_KEY="pk_live_your_production_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Application
NODE_ENV="production"
PORT=3000
JWT_SECRET="your-256-bit-cryptographically-secure-secret"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
SENTRY_DSN="https://your-sentry-dsn@sentry.io/project-id"
LOG_LEVEL="info"

# Caching (if using Redis)
REDIS_URL="redis://your-redis-instance:6379"
```

## 📊 Monitoring & Logging

### Application Performance Monitoring

1. **Sentry Integration:**
```bash
npm install @sentry/node @sentry/tracing
```

2. **Server Monitoring:**
```javascript
// Add to server/index.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### Health Check Endpoint

```javascript
// Add to server/routes.ts
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV
  });
});
```

## 🔐 Security Hardening

### 1. Environment Security
```javascript
// server/middleware/security.ts
import helmet from 'helmet';
import cors from 'cors';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true,
}));
```

### 2. Database Security
- Use connection pooling
- Enable SSL for database connections
- Regular security updates
- Backup strategy implemented

### 3. API Security
- Rate limiting per IP and user
- Input validation and sanitization
- JWT token expiration and refresh
- API versioning for backward compatibility

## 📈 Performance Optimization

### 1. Caching Strategy
```javascript
// Redis caching for agent responses
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache agent configurations
const cacheAgent = async (agentId, config) => {
  await redis.setex(`agent:${agentId}`, 3600, JSON.stringify(config));
};
```

### 2. Database Optimization
- Connection pooling
- Query optimization
- Database indexing
- Read replicas for scaling

### 3. CDN Configuration
- Static asset optimization
- Image compression and optimization
- Gzip/Brotli compression
- Browser caching headers

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run check

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          # Your deployment script here
          echo "Deploying to production..."
```

## 📧 Post-Deployment

### 1. Smoke Tests
- [ ] Health check endpoint responding
- [ ] User registration/login working
- [ ] Agent creation and chat functionality
- [ ] Payment processing working
- [ ] Database connectivity confirmed

### 2. Monitoring Setup
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Log aggregation working
- [ ] Alerting rules configured

### 3. Backup Verification
- [ ] Database backups automated
- [ ] Backup restoration tested
- [ ] Disaster recovery plan documented

## 🆘 Troubleshooting

### Common Production Issues

1. **Database Connection Issues**
   - Check connection string format
   - Verify SSL requirements
   - Confirm database server accessibility

2. **OpenAI API Rate Limits**
   - Implement request queuing
   - Add retry logic with exponential backoff
   - Monitor usage quotas

3. **Memory Leaks**
   - Monitor heap usage
   - Implement proper connection cleanup
   - Use memory profiling tools

4. **High CPU Usage**
   - Profile application performance
   - Optimize database queries
   - Implement caching

### Emergency Contacts
- Database Admin: db-admin@yourcompany.com
- DevOps Team: devops@yourcompany.com
- Security Team: security@yourcompany.com

## 📚 Additional Resources

- [Deployment Best Practices](https://docs.example.com/deployment)
- [Security Guidelines](https://docs.example.com/security)
- [Performance Monitoring](https://docs.example.com/monitoring)
- [Incident Response Plan](https://docs.example.com/incidents)