# Wealth Platform - Quick Start Guide

## Getting Started in 5 Minutes

### 1. Configure Environment Variables

Create a `.env.local` file in the project root with your API keys:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google Gemini API
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
```

**Where to get these:**
- **Supabase**: Go to [supabase.com](https://supabase.com), create a project, and find the keys in Project Settings
- **Gemini API**: Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Test SMS Ingestion

Visit [http://localhost:3000/settings](http://localhost:3000/settings) and try the SMS ingestion test:

```
Chase: Your purchase of $45.99 at WHOLE FOODS was approved
Wells Fargo: Payment received $500 on 01/20
Bank of America: Transfer of $1000 sent to savings
AMEX: Your purchase of $199.99 was approved
```

### 5. View Dashboard

The main dashboard at [http://localhost:3000](http://localhost:3000) displays:
- Risk score with trend indicators
- Portfolio value and projections
- 70/30 allocation visualization
- Rebalancing recommendations
- Idle capital alerts
- Transaction summary

## Key Pages

| Path | Purpose |
|------|---------|
| `/` | Main dashboard with portfolio overview |
| `/settings` | SMS configuration and integration testing |
| `/analysis` | Detailed financial analysis and insights |
| `/compliance` | Risk governance and compliance reporting |

## Core API Endpoints

### Ingest Transactions
```bash
curl -X POST http://localhost:3000/api/transactions/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id",
    "smsMessages": [
      "Chase: Your purchase of $45.99..."
    ]
  }'
```

### Calculate Risk Score
```bash
curl -X POST http://localhost:3000/api/risk/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id",
    "totalCapital": 125000,
    "riskPreference": "moderate"
  }'
```

### Analyze Portfolio
```bash
curl -X POST http://localhost:3000/api/portfolio/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id",
    "availableCapital": 125000,
    "riskProfile": "moderate"
  }'
```

## Demo Data

The platform includes demo data for testing:
- Sample user profile with moderate risk preference
- 6 months of transaction history
- Multiple account types (checking, savings, credit)
- Idle capital detection
- Risk score calculations

## Features Walkthrough

### 1. Risk Scoring
Your risk score is calculated based on:
- Spending volatility (35%)
- Idle capital ratio (25%)
- Income stability (25%)
- Risk preference (15%)

Visit `/analysis` to see detailed risk breakdown.

### 2. Portfolio Allocation
The platform maintains a 70/30 strategy:
- **70% Traditional Assets**: Stocks, bonds, ETFs
- **30% Longevity Assets**: Staking, yield farming, insurance

Automatic rebalancing triggers when:
- Allocation drifts > 5%
- Portfolio volatility > 25%
- 6+ months since last rebalance

### 3. Idle Capital Detection
The system identifies dormant funds and recommends allocation based on your risk profile.

Conservative Profile:
- High-yield savings (4.5% APY)
- Treasury bonds (4.8% APY)

Aggressive Profile:
- Yield farming (12% APY)
- Growth ETFs (8.5% APY)

### 4. Compliance Reporting
Visit `/compliance` to see:
- Overall compliance status
- Policy adherence checks
- Risk governance violations
- Action items and recommendations

## Building for Production

### Deploy to Vercel

1. Connect GitHub repository
2. Set environment variables in Vercel project settings
3. Deploy:

```bash
git push origin main
```

### Build Locally

```bash
pnpm build
pnpm start
```

### Run Linter

```bash
pnpm lint
```

## Troubleshooting

### "Missing GOOGLE_GENERATIVE_AI_API_KEY"
- Add the key to `.env.local`
- Restart development server

### SMS Parsing Not Working
- Verify Gemini API key is valid
- Check API quota hasn't been exceeded
- Use fallback regex parser (automatic if AI fails)

### Portfolio Data Not Appearing
- Verify Supabase credentials in `.env.local`
- Check database schema is initialized
- Confirm Row-Level Security policies are correct

### Transaction Ingestion Failing
- Ensure SMS format matches expected patterns
- Check API response in browser DevTools
- Verify userId matches authenticated user

## Next Steps

1. **Customize Risk Profile**: Update preferences in `/settings`
2. **Test Rebalancing**: View recommendations and simulate execution
3. **Monitor Compliance**: Track governance status in `/compliance`
4. **Analyze Patterns**: Explore spending insights in `/analysis`

## Support

For issues:
1. Check the main [README.md](README.md) for detailed documentation
2. Review error messages in browser console and server logs
3. Verify all environment variables are set correctly
4. Test API endpoints directly with curl

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Google Gemini API](https://ai.google.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Recharts Documentation](https://recharts.org/)
