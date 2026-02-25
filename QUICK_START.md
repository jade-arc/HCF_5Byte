# Quick Start - 5 Minutes

## Installation (2 minutes)

```bash
git clone https://github.com/jade-arc/HCF_5Byte.git
cd HCF_5Byte
git checkout v0/dsj221020-3736-877f1bd0
pnpm install
```

## Run (1 minute)

```bash
pnpm dev
```

Open http://localhost:3000 in your browser.

## First Steps (2 minutes)

1. **Add Transactions** → Click "Add Transaction" button
   - Enter transaction details (date, amount, category)
   - Or import CSV from `/data` page

2. **Configure API** (Optional) → Click "Configure API" button
   - Go to `/api-keys`
   - Add your free Gemini API key from https://ai.google.dev
   - API is optional - app works with demo data

3. **View Dashboard** → Back to `/`
   - See your portfolio allocation
   - View risk scores
   - Check income vs spending trends

4. **Toggle Dark Mode** → Sun/Moon icon in header

## Key Pages

| Page | URL | Purpose |
|------|-----|---------|
| Dashboard | `/` | Main portfolio view |
| Add Data | `/data` | Input transactions |
| API Keys | `/api-keys` | Manage AI providers |
| Analysis | `/analysis` | Detailed insights |
| Compliance | `/compliance` | Risk governance |
| Settings | `/settings` | App configuration |

## Useful Commands

```bash
pnpm dev       # Development server
pnpm build     # Production build
pnpm start     # Run production server
pnpm lint      # Check code quality
```

## Key Files to Know

```
app/page.tsx                           # Main dashboard
components/dashboard/                 # Dashboard components
lib/services/                          # Business logic
lib/contexts/theme-context.tsx        # Dark mode
hooks/use-user-transactions.ts        # Data management
```

## Browser Storage

All data is stored in browser localStorage:
- Transactions
- API keys (encrypted)
- Theme preference
- User settings

Export anytime from `/data` page as CSV.

## Getting Help

- Check `LOCAL_SETUP.md` for detailed setup
- Check `README.md` for full documentation
- Check `DYNAMIC_PWA_GUIDE.md` for API integration
- Open DevTools (F12) to see console logs

## Deployed Yet?

To deploy to Vercel:

```bash
git push origin v0/dsj221020-3736-877f1bd0
```

Then connect repo at https://vercel.com/new

That's it! You're ready to develop.
