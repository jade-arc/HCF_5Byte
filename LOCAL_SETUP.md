# Running the Wealth Platform Locally in VS Code

This guide will help you set up and run the Wealth Platform on your local machine using VS Code.

## Prerequisites

Before starting, ensure you have:
- **Node.js 18.x or higher** - Download from [nodejs.org](https://nodejs.org)
- **Git** - Download from [git-scm.com](https://git-scm.com)
- **VS Code** - Download from [code.visualstudio.com](https://code.visualstudio.com)
- **pnpm** (recommended) or npm

## Step 1: Clone the Repository

Open Terminal/PowerShell and run:

```bash
# Using HTTPS
git clone https://github.com/jade-arc/HCF_5Byte.git

# Or using SSH (if configured)
git clone git@github.com:jade-arc/HCF_5Byte.git

# Navigate to project
cd HCF_5Byte

# Checkout the v0 branch
git checkout v0/dsj221020-3736-877f1bd0
```

## Step 2: Install Dependencies

Choose one of the following:

### Option A: Using pnpm (Recommended)
```bash
# Install pnpm globally (if not already installed)
npm install -g pnpm

# Install project dependencies
pnpm install
```

### Option B: Using npm
```bash
npm install
```

### Option C: Using yarn
```bash
yarn install
```

## Step 3: Set Up Environment Variables

Create a `.env.local` file in the project root:

```bash
# Create the file
touch .env.local
```

Add the following to `.env.local`:

```env
# Supabase Configuration (Optional - for database features)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Google Gemini API (Optional - will be set via app UI)
# GOOGLE_GENERATIVE_AI_API_KEY=your_key_here

# Local Development
NODE_ENV=development
```

### Note on API Keys
- API keys are managed through the app UI at `/api-keys`
- They are stored locally in your browser's localStorage
- No API keys are required to get started - the app works with demo data

## Step 4: Run the Development Server

```bash
# Using pnpm
pnpm dev

# Or using npm
npm run dev

# Or using yarn
yarn dev
```

The server will start at `http://localhost:3000`

## Step 5: Open in Browser

1. Open VS Code Terminal (Ctrl+`)
2. The output will show: `▲ Next.js 16.0.0`
3. Press `Ctrl+Click` on `http://localhost:3000` or open manually
4. The app will open in your default browser

## Features to Try

Once running, you can:

### 1. Add Transaction Data
- Navigate to `/data`
- Manually add transactions or import CSV
- Data is stored in browser localStorage

### 2. Configure API Keys
- Navigate to `/api-keys`
- Add your AI provider API key (Gemini, Groq, OpenAI, Claude)
- Keys are used for portfolio analysis

### 3. View Dashboard
- Dashboard (`/`) reads from your transaction data
- See real-time portfolio allocation
- Check AI-powered risk scores
- Analyze income vs spending trends

### 4. Toggle Dark Mode
- Click the Sun/Moon icon in the header
- Theme persists across sessions

## File Structure

```
HCF_5Byte/
├── app/
│   ├── layout.tsx              # Main layout with theme provider
│   ├── page.tsx                # Dashboard homepage
│   ├── globals.css             # Global styles & design tokens
│   ├── api/                    # API routes
│   │   ├── transactions/       # Transaction endpoints
│   │   ├── risk/               # Risk scoring endpoints
│   │   ├── portfolio/          # Portfolio analysis endpoints
│   │   └── analysis/           # Analysis endpoints
│   ├── api-keys/               # API key management page
│   ├── data/                   # Transaction input page
│   ├── analysis/               # Analytics page
│   ├── compliance/             # Compliance page
│   └── settings/               # Settings page
├── components/
│   ├── dashboard/              # Dashboard components
│   │   ├── header.tsx
│   │   ├── risk-score-card.tsx
│   │   ├── portfolio-overview.tsx
│   │   ├── allocation-chart.tsx
│   │   └── ... (other dashboard components)
│   ├── ui/                     # Shadcn UI components
│   ├── theme-toggle.tsx        # Dark/Light mode toggle
│   └── ... (other components)
├── lib/
│   ├── services/               # Business logic
│   │   ├── risk-scorer.ts
│   │   ├── portfolio-manager.ts
│   │   ├── transaction-analyzer.ts
│   │   └── ... (other services)
│   ├── contexts/               # React contexts
│   │   ├── theme-context.tsx
│   │   └── api-key-context.tsx
│   ├── supabase.ts             # Supabase client
│   └── utils/
├── hooks/
│   ├── use-user-transactions.ts # Transaction management hook
│   ├── use-pwa.ts              # PWA utilities
│   └── ... (other hooks)
├── public/                      # Static assets
├── scripts/                     # Database migration scripts
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── next.config.mjs             # Next.js config
├── tailwind.config.ts          # Tailwind CSS config
└── README.md                   # Project documentation
```

## Common Commands

```bash
# Development server with hot reload
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Format code (if configured)
pnpm format
```

## Troubleshooting

### Port 3000 Already in Use
```bash
# Kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :3000
kill -9 <PID>
```

### Dependencies Not Installing
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Next.js Cache Issues
```bash
# Remove Next.js cache
rm -rf .next
pnpm dev
```

### Theme Not Applying
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+Shift+R)
- Check localStorage in DevTools Console

## Development Tips

### 1. Use VS Code Extensions
Install these extensions for better development:
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- Thunder Client (for API testing)

### 2. Hot Module Replacement (HMR)
Changes to files automatically refresh in the browser during development.

### 3. Browser DevTools
- Press F12 to open DevTools
- Check Console for [v0] debug logs
- Use Application > Storage to view localStorage

### 4. Add Console Logs for Debugging
```typescript
console.log("[v0] Debug message:", variable);
```

## Performance Optimization

### Lighthouse Audit
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Click "Generate report"
4. Review performance metrics

### Common Optimizations
- Use `next/Image` for images
- Implement code splitting with dynamic imports
- Use React.memo for expensive components
- Monitor bundle size with `next-bundle-analyzer`

## Deployment to Vercel

When ready to deploy:

```bash
# Push to GitHub
git add .
git commit -m "Update: local setup complete"
git push

# Go to vercel.com
# Connect repository
# Vercel will auto-deploy on push
```

## Support & Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com
- **Shadcn/ui**: https://ui.shadcn.com
- **React**: https://react.dev

## FAQ

**Q: Do I need a Supabase account?**
A: No, the app works with localStorage by default. Database features require Supabase setup.

**Q: Can I use different API keys?**
A: Yes, through `/api-keys` page. Supports Gemini, Groq, OpenAI, and Anthropic.

**Q: How do I update to latest changes from GitHub?**
A: Run `git pull origin v0/dsj221020-3736-877f1bd0`

**Q: Where is my data stored?**
A: In browser localStorage (private). Export as CSV anytime from `/data` page.

## Next Steps

1. Explore the dashboard at `http://localhost:3000`
2. Add sample transactions at `/data`
3. Configure an API key at `/api-keys`
4. Try different timeframes and filters
5. Toggle dark mode and check responsiveness

Happy developing!
