# Deployment Guide

## Production Checklist

Before deploying to production, ensure:

- [ ] All environment variables are configured
- [ ] Database schema is initialized
- [ ] SMS parsing tested with real bank messages
- [ ] Risk scoring validated against manual calculations
- [ ] Portfolio rebalancing logic tested
- [ ] Compliance checks passing
- [ ] Authentication properly configured
- [ ] Error handling and logging in place
- [ ] Security headers configured
- [ ] Rate limiting enabled for APIs

## Environment Variables (Production)

Add these to your production environment:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Gemini
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key

# Security
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

## Vercel Deployment

### 1. Push Code to GitHub

```bash
git add .
git commit -m "Initial commit: Wealth Platform"
git push origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the project

### 3. Configure Environment Variables

In Vercel project settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
GOOGLE_GENERATIVE_AI_API_KEY=...
```

### 4. Deploy

Click "Deploy" - Vercel will automatically build and deploy your app.

Production URL: `https://yourdomain.vercel.app`

## Database Setup (Supabase Production)

### 1. Create Production Database

```bash
# Using Supabase CLI
supabase projects create --name "Wealth Platform Prod"
```

### 2. Initialize Schema

```bash
# Upload migration script
psql -h db.yourdomain.supabase.co -U postgres -d postgres < scripts/01-create-schema.sql
```

### 3. Configure RLS Policies

Verify all Row-Level Security policies are enabled:

```sql
-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### 4. Create Backup

```bash
# Automatic daily backups in Supabase
# Configure in Project Settings → Backups
```

## Security Configuration

### 1. Authentication

- Enable Supabase Auth in project settings
- Configure OAuth providers (Google, GitHub, etc.)
- Set up email templates for verification

### 2. API Security

Rate limiting (add to `middleware.ts`):

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(100, "1 h"),
});

export async function middleware(request: NextRequest) {
  const ip = request.ip || "anonymous";
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return new NextResponse("Rate limit exceeded", { status: 429 });
  }
}
```

### 3. CORS Headers

In `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Credentials', value: 'true' },
        { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_APP_URL },
        { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
        { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Forwarded-Host, Content-Type' },
      ],
    },
  ],
};

module.exports = nextConfig;
```

### 4. CSP Headers

```javascript
headers: async () => [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  },
]
```

## Monitoring & Logging

### Sentry Integration (Error Tracking)

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### Database Monitoring

Enable in Supabase:
- Query performance analysis
- Connection pooling
- Slow query logs

### Application Metrics

Track:
- API response times
- Error rates
- SMS parsing success rate
- Portfolio rebalancing frequency

## Database Backups

### Automatic Backups

Supabase provides:
- Daily backups (7-day retention)
- Point-in-time recovery
- Full backup restoration

### Manual Backups

```bash
# Using pg_dump
pg_dump -h db.yourdomain.supabase.co \
  -U postgres \
  -d postgres \
  > backup_$(date +%Y%m%d).sql
```

## Performance Optimization

### 1. Database Indexing

Key indexes to add:

```sql
CREATE INDEX idx_user_transactions ON transactions(user_id, parsed_date DESC);
CREATE INDEX idx_risk_scores_latest ON risk_scores(user_id, calculation_date DESC);
CREATE INDEX idx_portfolio_allocations ON portfolio_allocations(user_id, is_active);
```

### 2. Caching Strategy

Implement Redis caching for:
- Risk scores (24-hour TTL)
- Portfolio allocations (1-hour TTL)
- Transaction summaries (6-hour TTL)

### 3. Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/chart-preview.png"
  alt="Portfolio"
  width={800}
  height={600}
  priority
/>
```

### 4. Code Splitting

Next.js automatically splits code, but optimize with:

```typescript
import dynamic from 'next/dynamic';

const PortfolioChart = dynamic(() => import('@/components/charts/portfolio'), {
  loading: () => <div>Loading...</div>,
  ssr: false,
});
```

## Scaling for Production

### 1. Database Scaling

- Upgrade to larger compute instance
- Enable connection pooling
- Implement read replicas for analytics

### 2. API Scaling

- Deploy on Vercel's Pro plan for more resources
- Use serverless edge functions for low-latency
- Implement API caching

### 3. Storage Scaling

- Archive old transaction data to cold storage
- Implement data pagination
- Use database partitioning by date

## Monitoring Checklist

Daily:
- [ ] Check error logs in Sentry
- [ ] Review API performance metrics
- [ ] Verify SMS parsing accuracy

Weekly:
- [ ] Analyze user engagement
- [ ] Review portfolio rebalancing triggers
- [ ] Check database performance

Monthly:
- [ ] Full compliance audit
- [ ] Database optimization review
- [ ] Security update check

## Disaster Recovery

### Recovery Time Objective (RTO): 4 hours
### Recovery Point Objective (RPO): 1 hour

### Recovery Procedure

1. **Database Recovery**
   ```bash
   # Restore from Supabase backup
   psql -h backup.supabase.co < backup_latest.sql
   ```

2. **Application Recovery**
   - Redeploy from GitHub (automatic with Vercel)
   - Verify API endpoints functional
   - Test user authentication

3. **Verification**
   - Run test suite
   - Verify data integrity
   - Check all critical paths

## Post-Deployment

### 1. Smoke Testing

```bash
curl -I https://yourdomain.com
curl -I https://yourdomain.com/api/health
```

### 2. User Acceptance Testing

- [ ] SMS ingestion works
- [ ] Risk scores calculate correctly
- [ ] Portfolio allocation correct
- [ ] Rebalancing recommendations accurate
- [ ] Compliance checks functioning

### 3. Documentation

- [ ] Update runbook for ops team
- [ ] Document all environment variables
- [ ] Create incident response procedures
- [ ] Document backup procedures

## Support Contacts

- **Supabase Support**: support@supabase.com
- **Vercel Support**: support@vercel.com
- **Gemini API Support**: [Google AI Support](https://support.google.com)

## Additional Resources

- [Vercel Deployment Best Practices](https://vercel.com/docs/concepts/deployments/managed-deployments)
- [Supabase Production Setup](https://supabase.com/docs/guides/hosting/platform/concepts#production)
- [Next.js Production Guide](https://nextjs.org/docs/going-to-production)
