# Wealth Platform - AI-Powered Retirement Portfolio Optimizer

A production-ready platform that converts bank and card transactions into continuously adaptive retirement portfolios optimized for longevity.

## Overview

The Wealth Platform automatically:
- **Ingests financial data** from SMS banking alerts
- **Detects idle capital** that isn't being invested
- **Computes dynamic risk scores** based on spending patterns and income stability
- **Allocates portfolios** with a 70/30 strategy (70% traditional assets, 30% longevity assets)
- **Rebalances automatically** when drift exceeds thresholds or volatility triggers risk governance
- **Enforces risk governance** with volatility thresholds and compliance auditing

## Architecture

### Database (Supabase PostgreSQL)

The platform uses a comprehensive schema with Row-Level Security:

- **users**: User profiles with risk preferences
- **accounts**: Linked financial accounts (checking, savings, investment, credit)
- **transactions**: Parsed SMS transaction records with ML confidence scores
- **risk_scores**: Dynamic risk assessments with spending volatility and income stability metrics
- **portfolio_allocations**: Active 70/30 portfolio allocations
- **traditional_assets**: Stocks, bonds, ETFs holdings
- **longevity_assets**: Staking yields, yield farming, longevity insurance
- **rebalance_history**: Complete audit trail of rebalancing actions
- **idle_capital_logs**: Idle capital detection and allocation recommendations
- **audit_logs**: Compliance and governance tracking

### Services

#### SMS Parser (`lib/services/sms-parser.ts`)
- Uses Google Gemini AI to intelligently parse banking SMS messages
- Extracts: amount, date, merchant, category, transaction type
- Provides confidence scores for parsing accuracy
- Fallback regex-based parsing for AI failures

#### Risk Scorer (`lib/services/risk-scorer.ts`)
- Calculates **spending volatility** from transaction history
- Measures **income stability** from credit transactions
- Quantifies **idle capital ratio** from account inactivity
- Generates dynamic **risk profile** (conservative/moderate/aggressive)
- Determines **rebalance recommendations** based on drift and volatility

#### Portfolio Manager (`lib/services/portfolio-manager.ts`)
- Enforces **70/30 allocation** (traditional/longevity assets)
- Calculates **allocation drift** from target
- Computes **portfolio volatility** with weighted asset contributions
- Recommends rebalancing when:
  - Allocation drift > 5% (configurable)
  - Portfolio volatility > 25% (configurable)
  - 6+ months since last rebalance
- Simulates portfolio growth with longevity APY rates

### API Routes

#### `/api/transactions/ingest` (POST)
Ingests SMS messages and parses transactions:
```json
{
  "userId": "user-id",
  "smsMessages": [
    "Chase: Your purchase of $45.99 at Coffee Shop",
    "Wells Fargo: Payment received $500"
  ]
}
```

#### `/api/risk/calculate` (POST)
Calculates user's dynamic risk score:
```json
{
  "userId": "user-id",
  "totalCapital": 125000,
  "riskPreference": "moderate"
}
```

#### `/api/portfolio/analyze` (POST)
Analyzes portfolio and recommends rebalancing:
```json
{
  "userId": "user-id",
  "availableCapital": 125000,
  "riskProfile": "moderate",
  "volatilityThreshold": 25,
  "rebalanceThreshold": 5
}
```

## Setup

### 1. Environment Variables

Add to `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google Gemini
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
```

### 2. Database Initialization

The SQL migration script (`scripts/01-create-schema.sql`) is already executed and creates:
- All required tables
- Row-Level Security policies
- Indexes for performance optimization

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Run Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000` to access the dashboard.

## Features

### Dashboard (`/`)
- **Risk Score Card**: Dynamic risk assessment with trend indicators
- **Portfolio Overview**: Total assets and projected returns
- **Allocation Chart**: 70/30 portfolio visualization
- **Rebalance Alerts**: Actionable recommendations when drift detected
- **Idle Capital Detection**: Suggests capital allocation opportunities
- **Transaction Summary**: Income vs. spending trends with 6-month history

### Settings (`/settings`)
- **SMS Integration**: Add and verify phone numbers for transaction ingestion
- **Test SMS Ingestion**: Parse sample SMS messages and preview transactions
- **Risk Profile Configuration**: Set conservative/moderate/aggressive preference
- **Rebalancing Thresholds**: Customize drift (%) and volatility (%) triggers
- **Notification Preferences**: Control email/SMS/weekly report alerts

## Risk Scoring Algorithm

The risk score (0-100) is calculated with weighted components:

```
Volatility Component (35%): Coefficient of variation in monthly spending
Idle Capital Component (25%): Penalty for capital unused >30 days
Income Stability Component (25%): Inverse of income CV
Risk Preference Component (15%): User's baseline risk tolerance
```

Risk profiles:
- **Conservative**: Score < 40 → Low volatility, income-focused
- **Moderate**: Score 40-65 → Balanced growth and stability
- **Aggressive**: Score > 65 → High growth, volatility tolerance

## Portfolio Allocation Strategy

### Traditional Assets (70%)
- Stocks (30% of allocation)
- Bonds (25% of allocation)
- ETFs (15% of allocation)

### Longevity Assets (30%)
- Staking (15% of allocation) - Simulated 6% APY
- Yield Farming (10% of allocation) - Simulated 15% APY
- Longevity Insurance (5% of allocation) - Simulated 4% APY

## Rebalancing Logic

Triggers rebalancing when ANY of these conditions are met:

1. **Drift Trigger**: Allocation deviation > 5%
2. **Volatility Trigger**: Portfolio volatility > 25%
3. **Time Trigger**: 6+ months since last rebalance

Rebalancing shifts assets between traditional and longevity pools to restore the 70/30 target while respecting volatility constraints.

## Idle Capital Detection

The platform identifies idle capital by:
1. Analyzing transaction dates for each account
2. Calculating days since last activity
3. Estimating idle percentage (2% per day of inactivity, capped at 60%)
4. Recommending allocation based on risk profile

Benefits of addressing idle capital:
- **Conservative Profile**: Direct to bonds (4% APY)
- **Moderate Profile**: Mix of staking (6% APY) + bonds
- **Aggressive Profile**: Heavy allocation to yield farming (15% APY)

## Compliance & Governance

### Row-Level Security
All tables enforce RLS policies ensuring users can only access their own data:
```sql
CREATE POLICY "Users access only their own data"
  ON transactions FOR ALL
  USING (user_id = auth.uid())
```

### Audit Logging
Every significant action is logged:
- Portfolio allocations
- Rebalancing actions
- Risk threshold breaches
- Idle capital detections
- User configuration changes

### Risk Governance Checks
- Volatility thresholds prevent excessive risk
- Rebalancing respects user risk preference
- Drift thresholds prevent portfolio decay
- Allocation constraints maintain 70/30 target

## SMS Message Examples

The platform recognizes these SMS formats:

```
"Chase: You spent $45.99 at WHOLE FOODS"
"Wells Fargo: Payment received $500"
"Bank of America: Transfer of $1,000 sent to savings"
"AMEX: Your purchase of $199.99 was approved"
"Capital One: Account fee of $25 applied"
"Payroll: Deposit of $3,500 received"
```

## Performance Optimizations

- **Indexed queries** on user_id, dates, and categories
- **Lazy loading** of historical data
- **Caching** of recent risk scores
- **Batch SMS parsing** with parallel processing
- **Pagination** for large transaction lists

## Future Enhancements

- [ ] Real blockchain staking integration (Lido, Aave)
- [ ] Real-time market data feeds for volatility calculation
- [ ] Machine learning model for spending pattern forecasting
- [ ] Mobile app with push notifications
- [ ] Advanced tax optimization (tax-loss harvesting)
- [ ] Social features (compare with peers)
- [ ] AI advisor chat interface for portfolio questions
- [ ] Integration with third-party APIs (Plaid, etc.)

## Support

For issues or questions, please contact support or open an issue in the repository.

## License

Proprietary - All rights reserved
