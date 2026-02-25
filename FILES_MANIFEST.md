# Complete Files Manifest

## Project Overview
- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: Shadcn/ui
- **State Management**: React Hooks + Context
- **Storage**: Browser localStorage + optional Supabase
- **AI**: Integration-ready for Gemini, Groq, OpenAI, Anthropic

## Directory Structure & File Listing

### Root Configuration Files
```
.env.example                    # Environment variables template
.gitignore                      # Git ignore rules
next.config.mjs                # Next.js configuration
package.json                   # Dependencies & scripts
tsconfig.json                  # TypeScript configuration
tailwind.config.ts             # Tailwind configuration
```

### Documentation Files
```
README.md                       # Main project documentation
QUICKSTART.md                  # 5-minute quick start guide
LOCAL_SETUP.md                 # Detailed local development setup
PROJECT_SUMMARY.md             # Full project overview
DEPLOYMENT.md                  # Production deployment guide
DYNAMIC_PWA_GUIDE.md           # API key & data integration guide
API_KEY_SYSTEM.md              # API key management system
PWA_SETUP.md                   # Progressive Web App setup
PWA_IMPLEMENTATION.md          # PWA technical details
PWA_FEATURES.md                # PWA features list
PWA_CHECKLIST.md               # PWA implementation checklist
PWA_QUICK_REFERENCE.md         # PWA quick reference
DARK_MODE_FIXES.md             # Dark mode implementation
FILES_MANIFEST.md              # This file
```

### App Directory - Pages & Routes
```
app/
├── layout.tsx                 # Root layout with theme provider (114 lines)
├── page.tsx                   # Dashboard homepage (178 lines)
├── globals.css                # Global styles & CSS variables
├── api-keys/
│   └── page.tsx              # API key management UI (407 lines)
├── data/
│   └── page.tsx              # Transaction input form (335 lines)
├── analysis/
│   └── page.tsx              # Analytics & insights (179 lines)
├── compliance/
│   └── page.tsx              # Compliance & governance (274 lines)
├── settings/
│   └── page.tsx              # Settings page (264 lines)
└── api/
    ├── transactions/
    │   ├── ingest/
    │   │   └── route.ts      # SMS transaction parsing API
    │   ├── manage/
    │   │   └── route.ts      # Transaction CRUD operations (204 lines)
    │   ├── summary/
    │   │   └── route.ts      # Spending summary endpoint (39 lines)
    ├── risk/
    │   └── calculate/
    │       └── route.ts      # Risk score calculation API
    ├── portfolio/
    │   └── analyze/
    │       └── route.ts      # Portfolio analysis API
    ├── analysis/
    │   ├── transactions/
    │   │   └── route.ts      # Transaction analysis API (93 lines)
    │   └── idle-capital/
    │       └── route.ts      # Idle capital detection API (79 lines)
    └── keys/
        └── manage/
            └── route.ts      # API key management endpoint (191 lines)
```

### Components Directory - React Components
```
components/
├── ui/                        # Shadcn UI components (auto-generated)
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── textarea.tsx
│   ├── label.tsx
│   ├── dialog.tsx
│   └── ... (other UI components)
├── dashboard/                 # Dashboard-specific components
│   ├── header.tsx            # Header with theme toggle (25 lines)
│   ├── risk-score-card.tsx   # Risk score visualization (59 lines)
│   ├── portfolio-overview.tsx # Portfolio value display (41 lines)
│   ├── allocation-chart.tsx  # 70/30 allocation pie chart (65 lines)
│   ├── longevity-assets-breakdown.tsx # Longevity assets detail (141 lines)
│   ├── rebalance-recommendations.tsx   # Rebalance action card (45 lines)
│   ├── idle-capital-alert.tsx # Idle capital detection alert (46 lines)
│   ├── transaction-summary.tsx # Income vs spending chart (61 lines)
│   ├── risk-details.tsx      # Risk breakdown visualization (158 lines)
│   └── (other dashboard components)
├── theme-toggle.tsx          # Dark/Light mode toggle button (31 lines)
├── pwa-prompt.tsx            # PWA installation prompt (64 lines)
└── offline-indicator.tsx     # Offline status indicator (40 lines)
```

### Lib Directory - Business Logic & Utilities
```
lib/
├── supabase.ts               # Supabase client initialization (32 lines)
├── utils.ts                  # Utility functions (auto-generated)
├── services/                 # Core business logic services
│   ├── sms-parser.ts         # SMS message parsing (125 lines)
│   ├── risk-scorer.ts        # Risk scoring engine (253 lines)
│   ├── portfolio-manager.ts  # Portfolio allocation logic (346 lines)
│   ├── transaction-analyzer.ts # Transaction pattern analysis (343 lines)
│   ├── idle-capital-detector.ts # Idle capital detection (385 lines)
│   ├── rebalancer.ts         # Portfolio rebalancing (337 lines)
│   ├── compliance.ts         # Risk compliance checks (360 lines)
│   ├── api-key-manager.ts    # API key management (206 lines)
│   └── user-transaction-manager.ts # User transaction handling (257 lines)
├── contexts/                 # React Context Providers
│   ├── theme-context.tsx     # Dark/Light mode context (63 lines)
│   └── api-key-context.tsx   # API key context (73 lines)
└── (utility files)
```

### Hooks Directory - React Hooks
```
hooks/
├── use-user-transactions.ts  # Transaction data management hook (155 lines)
├── use-pwa.ts               # PWA utilities & detection (119 lines)
└── use-mobile.ts            # Mobile responsiveness detection (auto-generated)
```

### Public Directory - Static Assets
```
public/
├── icon.svg                 # App icon (SVG)
├── icon-512x512.png         # App icon 512px (generated)
├── apple-icon.png           # iOS app icon (generated)
├── apple-icon-152x152.png   # iOS app icon 152px (generated)
├── icon-light-32x32.png     # Light theme icon
├── icon-dark-32x32.png      # Dark theme icon
├── manifest.json            # PWA manifest (112 lines)
├── screenshot-wide.png      # PWA screenshot desktop (generated)
└── screenshot-narrow.png    # PWA screenshot mobile (generated)
└── sw.js                    # Service worker (266 lines)
```

### Scripts Directory - Database & Setup Scripts
```
scripts/
├── 01-create-schema.sql     # Initial database schema creation
└── 02-create-api-keys.sql   # API key management tables (104 lines)
```

## File Statistics

### Code Files (excluding node_modules)
- **TypeScript/TSX**: ~50+ files
- **CSS**: 1 main file (globals.css)
- **SQL**: 2 migration scripts
- **Config**: 5 configuration files

### Total Lines of Code (LOC)
- **Backend Services**: ~2,600 LOC
- **React Components**: ~1,500 LOC
- **API Routes**: ~600 LOC
- **Hooks & Contexts**: ~240 LOC
- **Configuration**: ~400 LOC
- **Documentation**: ~2,000 LOC
- **Total**: ~7,340 LOC

## Dependencies

### Core Framework
- next@16.x
- react@19.x
- react-dom@19.x
- typescript@5.x

### UI & Styling
- tailwindcss@4.x
- tailwindcss-animate
- class-variance-authority
- clsx

### Components & Icons
- lucide-react (icons)
- recharts (charts)
- @radix-ui/* (UI primitives)

### API & Database
- @google/generative-ai@0.20.0 (Gemini AI)
- @supabase/supabase-js@2.45.0 (Database client)

### Forms & Validation
- react-hook-form
- @hookform/resolvers
- zod

### Analytics
- @vercel/analytics

See `package.json` for complete dependency list.

## Key Features by File

### User Data Management
- `hooks/use-user-transactions.ts` - Transaction CRUD
- `app/data/page.tsx` - Data input UI
- `lib/services/user-transaction-manager.ts` - Transaction processing

### Portfolio Analysis
- `lib/services/portfolio-manager.ts` - Asset allocation
- `lib/services/rebalancer.ts` - Rebalancing logic
- `components/dashboard/allocation-chart.tsx` - Visualization
- `components/dashboard/longevity-assets-breakdown.tsx` - Details

### Risk Management
- `lib/services/risk-scorer.ts` - Risk scoring
- `lib/services/compliance.ts` - Governance checks
- `components/dashboard/risk-score-card.tsx` - Display
- `components/dashboard/risk-details.tsx` - Breakdown

### Transactions
- `lib/services/sms-parser.ts` - SMS parsing
- `lib/services/transaction-analyzer.ts` - Pattern analysis
- `components/dashboard/transaction-summary.tsx` - Visualization
- `app/data/page.tsx` - Input interface

### Idle Capital
- `lib/services/idle-capital-detector.ts` - Detection engine
- `components/dashboard/idle-capital-alert.tsx` - Alert UI

### API Integration
- `lib/contexts/api-key-context.tsx` - Key management
- `app/api-keys/page.tsx` - Configuration UI
- `lib/services/api-key-manager.ts` - Key operations

### Theme & UI
- `lib/contexts/theme-context.tsx` - Dark mode
- `components/theme-toggle.tsx` - Toggle button
- `app/globals.css` - Design tokens

## Getting Started with Files

1. **Read First**: `QUICK_START.md` → `LOCAL_SETUP.md`
2. **Explore**: `app/page.tsx` (main dashboard)
3. **Understand Logic**: `lib/services/` (core algorithms)
4. **Add Features**: `components/dashboard/` (UI components)
5. **Test**: Run `pnpm dev` and test in browser

## File Modification Guide

### To Add a New Dashboard Card
1. Create component in `components/dashboard/new-card.tsx`
2. Add to `app/page.tsx` in grid
3. Style using Tailwind + design tokens

### To Add a New API Endpoint
1. Create route in `app/api/feature/endpoint/route.ts`
2. Add `export const dynamic = 'force-dynamic'`
3. Implement GET/POST/PUT/DELETE handlers
4. Call from components using `fetch('/api/...')`

### To Add a New Service
1. Create file in `lib/services/feature-name.ts`
2. Export typed functions
3. Use in components via hooks or API routes
4. Add tests (recommended)

### To Update Styles
1. Edit `app/globals.css` for global changes
2. Use Tailwind classes in components
3. Update design tokens for theme consistency

## Database Optional

- **Without Supabase**: App works with browser localStorage
- **With Supabase**: Uncomment `.env.local` variables and run migrations
- **Migrations**: In `scripts/` folder, run manually in Supabase SQL editor

## Deployment Ready

All files are production-ready:
- TypeScript for type safety
- Optimized images and code splitting
- Progressive Web App support
- Dark mode support
- Responsive design
- Accessibility compliance
- Security best practices

Deploy with: `git push` → Vercel auto-deploys
