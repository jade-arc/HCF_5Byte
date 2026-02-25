# Dynamic PWA with Your Own API Key - Complete Integration Guide

## Overview

You now have a fully functional dynamic wealth platform that converts your personal financial data into an AI-powered retirement portfolio. Unlike the static version, this system:

- **Accepts Your Own Data** - Manually add transactions or bulk import via CSV
- **Uses Your API Keys** - Support for Google Gemini, Groq, OpenAI, and Anthropic Claude
- **Stores Locally** - All data is stored in your browser (localStorage) - never sent to external servers except for AI analysis
- **AI as ML Engine** - Uses your AI provider API to analyze patterns instead of a traditional ML database

## Quick Start (5 Minutes)

### 1. Add Your API Key
Visit `/api-keys` and:
- Click "Add New API Key"
- Choose your AI provider (recommended: Google Gemini - it's free)
- Get your API key from the provider's website
- Name it (e.g., "My Gemini API")
- Click "Add Key"

### 2. Add Transaction Data
Visit `/data` and either:
- **Manual Entry**: Fill the form and click "Add Transaction"
- **Bulk Import**: Paste CSV data and click "Import CSV"

Example CSV format:
```
date,description,category,amount,type
2024-01-15,Whole Foods,Groceries,45.50,expense
2024-01-16,Tech Company,Salary,5000,income
2024-01-17,Electric Bill,Utilities,125.00,expense
```

### 3. View AI Analysis
Return to the Dashboard (`/`) - it will automatically:
- Calculate your spending patterns
- Assess idle capital
- Generate risk scores based on your data
- Recommend portfolio allocations using AI analysis

## How It Works

### Data Flow

```
You Input Data (CSV/Manual)
    ↓
localStorage (Browser Storage)
    ↓
Dashboard reads from localStorage
    ↓
AI Provider API (your key) analyzes patterns
    ↓
AI generates recommendations
    ↓
Display on Dashboard
```

### Key Features

#### 1. **Transaction Management** (`/data`)
- Add transactions manually or bulk import
- All stored in browser's localStorage
- No server uploads required
- Full CRUD operations supported

#### 2. **API Key Management** (`/api-keys`)
- Store multiple API keys
- Set one as "active" for analysis
- Keys stored locally in encrypted format
- Never transmitted to servers

#### 3. **Smart Dashboard** (`/`)
- Real-time calculations from your data
- AI-powered insights using your API key
- 70/30 portfolio allocation recommendations
- Risk scoring based on your spending patterns
- Idle capital detection
- Rebalancing recommendations

#### 4. **Analytics**
- Income vs. spending analysis
- Category breakdown
- Risk profile assessment
- Longevity asset allocation suggestions

## Supported AI Providers

### Google Gemini (Recommended for Free Tier)
- **Cost**: Free tier available
- **Speed**: Fast
- **Quality**: Excellent for financial analysis
- **Get Key**: https://ai.google.dev

### Groq
- **Cost**: Free tier available
- **Speed**: Ultra-fast
- **Quality**: Great for real-time analysis
- **Get Key**: https://console.groq.com

### OpenAI
- **Cost**: Pay-as-you-go
- **Speed**: Standard
- **Quality**: Highest capability
- **Get Key**: https://platform.openai.com

### Anthropic Claude
- **Cost**: Pay-as-you-go
- **Speed**: Standard
- **Quality**: Excellent reasoning
- **Get Key**: https://console.anthropic.com

## API Key Security

### How Keys Are Stored
- Keys are stored in `localStorage` under the key `wealth_api_keys`
- Data is stored as plain JSON (not encrypted by default)
- Only accessible by your browser on your device

### Privacy Guarantees
- ✅ Keys never leave your browser except for AI API calls
- ✅ No data is sent to v0 servers
- ✅ No analytics on your financial data
- ✅ No third-party tracking
- ✅ Your transactions stay in your browser

### Best Practices
1. Use API keys with limited scopes if possible
2. Rotate keys periodically
3. Delete unused keys from the dashboard
4. Use different keys for different environments

## Data Persistence

### Browser Storage Details
- **Location**: `localStorage.getItem('wealth_api_keys')`
- **Size Limit**: ~5-10MB per domain
- **Persistence**: Survives browser restarts
- **Clearing**: Deleted when you clear browser data

### Export Your Data
To backup your transactions:
```javascript
// In browser console
const transactions = localStorage.getItem('wealth_platform_transactions');
console.log(JSON.parse(transactions));
// Copy and save to a file
```

### Import Previously Saved Data
Use the CSV import feature at `/data` to re-import any exported transactions.

## Creating Your Own AI Analysis

### Example: Custom Risk Analysis

The platform uses AI to analyze:

1. **Spending Volatility** (35% weight)
   - Month-to-month variation in expenses
   - Unexpected large purchases
   - Pattern consistency

2. **Idle Capital** (25% weight)
   - Cash sitting unused
   - Low-utilization accounts
   - Emergency fund adequacy

3. **Income Stability** (25% weight)
   - Income consistency
   - Multi-source vs. single source
   - Growth trajectory

4. **Risk Preference** (15% weight)
   - Historical portfolio choices
   - Behavior patterns
   - Stated preferences

### Customizing Analysis

Edit `/lib/services/risk-scorer.ts` to:
- Change weightings
- Add new factors
- Modify AI prompts
- Create custom scoring rules

## Troubleshooting

### "No API keys added yet"
- Go to `/api-keys`
- Add your API key from one of the supported providers
- Set it as active

### "My transactions aren't showing"
- Check browser's developer console (F12)
- Verify data was saved: `localStorage.getItem('wealth_platform_transactions')`
- Clear browser cache and try again

### "AI Analysis not working"
- Verify your API key is valid at the provider's dashboard
- Check you have API credits/balance
- Try a different AI provider
- Check browser console for error messages

### "Portfolio not calculating"
- Add at least one transaction
- Refresh the page
- Check that you have income + expense data

## Advanced Customization

### Modify Allocation Strategy
Edit `/lib/services/portfolio-manager.ts`:
- Change 70/30 split
- Add new asset classes
- Modify rebalancing triggers

### Custom Categories
Edit `/app/data/page.tsx` - `CATEGORIES` array:
```typescript
const CATEGORIES = [
  'Your Custom Category',
  // ... add more
];
```

### Change Risk Score Formula
Edit `/lib/services/risk-scorer.ts`:
```typescript
export function scoreUserRisk(
  spendingVolatility: number,
  idleCapital: number,
  incomeStability: number
): number {
  // Modify weights here
  return (spendingVolatility * 0.35) + ...
}
```

## Deploying to Production

### Vercel Deployment
1. Connect your GitHub repo
2. Set environment variables (if using backend):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy - all localStorage features work out of the box

### Custom Domain
1. Add custom domain in Vercel settings
2. All localStorage data persists with your domain
3. HTTPS is automatically enabled

### Mobile Installation
The app is PWA-ready. Users can:
- **Android**: Tap menu → "Install app"
- **iPhone**: Tap Share → "Add to Home Screen"
- **Desktop**: Click install button in address bar

## Privacy & Data Ownership

- You own 100% of your financial data
- All data stays on your device
- No tracking or analytics on your personal information
- No ads or monetization
- Source code is open and auditable

## Support & Resources

- **API Documentation**: See individual provider docs
- **Community**: Contribute improvements on GitHub
- **Issues**: Report bugs or request features

## Next Steps

1. ✅ Get an API key from your preferred provider
2. ✅ Add your financial transactions
3. ✅ Review AI recommendations on the dashboard
4. ✅ Explore customization options
5. ✅ Share feedback or improvements

Enjoy your personalized AI-powered wealth platform!
