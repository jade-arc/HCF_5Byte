# Running in VS Code - Complete Guide

## Step 1: Download & Open Project

### Option A: Using Git Clone (Recommended)
```bash
# Open Terminal/PowerShell and run:
git clone https://github.com/jade-arc/HCF_5Byte.git
cd HCF_5Byte
git checkout v0/dsj221020-3736-877f1bd0

# Open in VS Code
code .
```

### Option B: Open Folder
1. Download ZIP from GitHub
2. Extract to a folder
3. Open VS Code
4. File → Open Folder
5. Select the extracted folder

## Step 2: Set Up VS Code

### Install Recommended Extensions
1. Open Extensions (Ctrl+Shift+X)
2. Search and install:
   - **TypeScript Vue Plugin** (by Vue)
   - **ES7+ React/Redux/React-Native snippets** (by dsznajder)
   - **Tailwind CSS IntelliSense** (by Tailwind Labs)
   - **Prettier - Code formatter** (by Prettier)
   - **Thunder Client** (by Rangav) - for API testing
   - **REST Client** (by Huachao Mao)

### Configure VS Code Settings
1. File → Preferences → Settings (Ctrl+,)
2. Search "format on save"
3. Enable "Editor: Format On Save"
4. Search "default formatter"
5. Select "Prettier" as default

## Step 3: Install Dependencies

1. Open Terminal in VS Code (Ctrl+`)
2. Run one of these commands:

```bash
# Using pnpm (Recommended - faster)
npm install -g pnpm
pnpm install

# Or using npm
npm install

# Or using yarn
yarn install
```

**Wait for installation to complete** - This may take 2-5 minutes.

## Step 4: Create Environment File

1. In VS Code, right-click root folder
2. Create file → `.env.local`
3. Paste:

```env
# Optional - Leave empty for demo mode
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

NODE_ENV=development
```

4. Save (Ctrl+S)

## Step 5: Start Development Server

In Terminal (Ctrl+`), run:

```bash
pnpm dev
```

You should see:
```
  ▲ Next.js 16.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local
```

## Step 6: Open App in Browser

1. Ctrl+Click on `http://localhost:3000` in Terminal
2. Or manually type in browser: `http://localhost:3000`
3. App opens and hot-reloads on file changes

## VS Code Workflow

### File Navigation
- **Ctrl+P**: Quick file search
- **Ctrl+Shift+F**: Search entire project
- **Ctrl+`**: Toggle terminal
- **Ctrl+J**: Toggle panel

### Debugging
1. Press F5 to open Debug menu
2. Select "Next.js (node)"
3. Or use Chrome DevTools (F12 in browser)

### Useful Shortcuts
| Shortcut | Action |
|----------|--------|
| Ctrl+S | Save file |
| Ctrl+Z | Undo |
| Ctrl+Shift+Z | Redo |
| Alt+Up/Down | Move line |
| Ctrl+/ | Toggle comment |
| Ctrl+D | Select next match |
| F2 | Rename variable |
| Ctrl+Shift+O | Go to symbol |

### Git in VS Code
1. Click Source Control (Ctrl+Shift+G)
2. Make changes
3. Stage changes (+ button)
4. Enter commit message
5. Click checkmark to commit
6. Push changes (↑ button)

## Running Different Tasks

### Build for Production
```bash
pnpm build
```

### Run Production Build Locally
```bash
pnpm build
pnpm start
```

### Lint Code
```bash
pnpm lint
```

### Run Type Check
```bash
pnpm typecheck  # If configured
```

## Hot Module Replacement (HMR)

The app automatically reloads when you:
- Edit component files (`.tsx`)
- Update CSS in `globals.css`
- Modify API routes

**Just save (Ctrl+S) and the browser refreshes automatically!**

## Common Issues & Solutions

### "pnpm: command not found"
```bash
npm install -g pnpm
```

### Port 3000 Already in Use
```bash
# Find process on port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use different port
pnpm dev -p 3001
```

### Dependencies Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Next.js Cache Issues
```bash
# Remove .next folder
rm -rf .next
pnpm dev
```

### Git Errors
```bash
# Ensure you're on correct branch
git checkout v0/dsj221020-3736-877f1bd0

# Pull latest changes
git pull origin v0/dsj221020-3736-877f1bd0
```

## Editing Code

### Add a New Component

1. Create file: `components/dashboard/new-feature.tsx`
2. Write component:
```tsx
'use client';

import { Card } from '@/components/ui/card';

export function NewFeature() {
  return (
    <Card className="bg-card border-border p-6">
      <h2 className="text-foreground font-semibold">New Feature</h2>
    </Card>
  );
}
```
3. Import in `app/page.tsx`:
```tsx
import { NewFeature } from '@/components/dashboard/new-feature';
```
4. Use in JSX
5. Save - automatically reloads!

### Add API Endpoint

1. Create: `app/api/feature/route.ts`
2. Write handler:
```typescript
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return Response.json({ message: 'Hello' });
}
```
3. Call from component:
```typescript
const res = await fetch('/api/feature');
const data = await res.json();
```

### Update Styles

1. Edit `app/globals.css`
2. Modify Tailwind classes in components
3. Changes apply instantly

## Testing Components

### Manual Testing
1. Edit a component
2. Check browser (it auto-reloads)
3. Test interactions
4. Open DevTools (F12) for console

### API Testing
Use Thunder Client extension:
1. Click Thunder Client icon
2. Create new request
3. Set method (GET/POST/PUT/DELETE)
4. Enter URL: `http://localhost:3000/api/...`
5. Add body (JSON) if needed
6. Send request

### DevTools Console
Press F12 in browser to see:
- [v0] debug logs
- Console errors
- Network requests
- Storage data

## Browser Storage

All data is in localStorage. To view:
1. Open DevTools (F12)
2. Go to Application tab
3. Click Storage → Local Storage
4. Select http://localhost:3000
5. View stored data

## Database (Optional)

If using Supabase:
1. Create account at https://supabase.com
2. Create new project
3. Copy credentials to `.env.local`
4. Run migration scripts in Supabase SQL editor

## Performance Testing

### Lighthouse
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Click Generate report
4. Review metrics

### React DevTools
Install React DevTools extension:
1. Click Extensions
2. Search "React Developer Tools"
3. Install from Chrome Web Store
4. DevTools shows React component tree

## Deploying

### Push to GitHub
```bash
git add .
git commit -m "Feature: add new component"
git push origin v0/dsj221020-3736-877f1bd0
```

### Deploy to Vercel
1. Go to https://vercel.com
2. Import GitHub repo
3. Select branch
4. Add environment variables
5. Click Deploy

Auto-deploys on every push!

## Keyboard Shortcuts Reference

### Editor
- Ctrl+A: Select all
- Ctrl+X: Cut
- Ctrl+C: Copy
- Ctrl+V: Paste
- Ctrl+Z: Undo
- Ctrl+Shift+Z: Redo

### Navigation
- Ctrl+P: Open file
- Ctrl+G: Go to line
- Ctrl+F: Find
- Ctrl+H: Find & replace
- Ctrl+Shift+F: Find in folder

### Editor Actions
- F12: Open DevTools
- Ctrl+Shift+D: Debug
- Ctrl+Shift+B: Build

## Recommended Workflow

1. **Morning**: `git pull` to get latest
2. **Edit**: Make changes, save files
3. **Test**: Alt+Tab to browser, test
4. **Debug**: F12 to check console
5. **Commit**: Ctrl+Shift+G, commit changes
6. **Push**: Push to GitHub
7. **Deploy**: Auto-deploys to Vercel

## Getting Unstuck

If something breaks:
1. Check Console (F12)
2. Check Terminal (Ctrl+`)
3. Read error message carefully
4. Search for solution
5. Restart dev server (Ctrl+C, then `pnpm dev`)

## Next Steps

1. Make a small change to test hot reload
2. Add a transaction at `/data`
3. View it in the dashboard
4. Try dark mode toggle
5. Open DevTools and explore

## Resources

- VS Code Docs: https://code.visualstudio.com/docs
- Next.js Docs: https://nextjs.org/docs
- React Docs: https://react.dev
- Tailwind Docs: https://tailwindcss.com/docs
- TypeScript Docs: https://www.typescriptlang.org/docs

You're now ready to develop in VS Code! Happy coding!
