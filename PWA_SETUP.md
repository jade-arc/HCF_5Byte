# Progressive Web App (PWA) Setup Guide

## Overview

The Wealth Platform is now a fully functional Progressive Web App with:

- **Installability**: Install on mobile devices and desktop
- **Offline Support**: Works offline with cached data and background sync
- **App Shell**: Fast loading with service worker caching
- **Push Notifications**: Receive portfolio alerts
- **Share Target**: Share SMS messages directly to the app
- **Responsive Design**: Works on all device sizes

## Features

### 1. Installation
Users can install the app on:
- **Mobile (Android & iOS)**: Home screen installation
- **Desktop (Chrome, Edge)**: App drawer and task bar
- **PWA Stores**: Microsoft Store, Google Play (via Bubblewrap)

### 2. Offline Functionality
- View cached dashboard and portfolio data
- Read offline transaction history
- Queue transactions for sync when online
- Automatic background sync

### 3. Service Worker Caching
The app uses intelligent caching strategies:
- **Cache First**: Static assets (CSS, JS, fonts)
- **Network First**: API calls and dynamic pages
- **Stale While Revalidate**: Portfolio data

### 4. Push Notifications
Receive alerts for:
- Rebalancing recommendations
- Risk score changes
- Idle capital detection
- Compliance warnings

## Installation Guide

### Desktop (Chrome, Edge, Safari)
1. Visit the app URL
2. Click the **Install** button in the address bar
3. Follow the prompt to add to home screen

### Mobile (Android)
1. Visit the app URL in Chrome
2. Tap the menu (⋮) → "Install app"
3. Or use "Add to Home Screen"

### Mobile (iOS)
1. Visit the app URL in Safari
2. Tap **Share** → "Add to Home Screen"
3. Name the app and tap **Add**

## File Structure

```
public/
├── manifest.json              # PWA manifest
├── sw.js                     # Service worker
├── icon-512x512.png          # App icon (512x512)
├── icon-192x192.png          # App icon (192x192)
├── icon-192x192-maskable.png # Adaptive icon (Android)
├── icon-512x512-maskable.png # Adaptive icon (Android)
├── apple-icon.png            # iOS home screen
├── apple-icon-152x152.png    # iPad icon
├── screenshot-wide.png       # Desktop screenshot
└── screenshot-narrow.png     # Mobile screenshot

components/
├── pwa-prompt.tsx            # Install prompt UI
└── offline-indicator.tsx     # Offline status indicator

hooks/
└── use-pwa.ts               # PWA detection & control

app/
└── layout.tsx               # PWA metadata & components
```

## Icon Generation

The app includes icons in multiple sizes:

| Size | Purpose | Format |
|------|---------|--------|
| 192x192 | Mobile home screen | PNG |
| 192x192-maskable | Android adaptive icon | PNG |
| 512x512 | App stores, splash screen | PNG |
| 512x512-maskable | Android adaptive icon | PNG |
| Icon.svg | Vector icon | SVG |

To customize icons:
1. Replace images in `public/` with your own
2. Ensure 192x192 and 512x512 PNG formats
3. Maskable icons should have 40px safe zone
4. Update manifest.json with new icon paths

## Configuration

### Manifest (public/manifest.json)
Customize app metadata:
```json
{
  "name": "Wealth Platform",
  "short_name": "Wealth",
  "description": "Your app description",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#10b981",
  "background_color": "#0f1419"
}
```

### Next.js Config (next.config.mjs)
PWA settings:
```javascript
const withPWAConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: false,
  disable: process.env.NODE_ENV === 'development',
  // ... cache strategies
});
```

## Service Worker Behavior

### Caching Strategies

**Cache First** (Fastest, may serve stale):
- CSS, JavaScript, fonts
- Images and static assets
- Expires after 30 days

**Network First** (Fresh, needs internet):
- API calls
- Dashboard and pages
- Falls back to cache after 5-10 minutes

**Stale While Revalidate**:
- Portfolio data
- Compliance reports
- Returns cache immediately, updates in background

### Background Sync

When online, automatically syncs:
- Pending transactions
- Risk score updates
- Portfolio rebalancing
- Compliance logs

### Push Notifications

Enable browser notifications for:
```javascript
// Request permission
Notification.requestPermission().then(permission => {
  if (permission === 'granted') {
    // Subscribe to push notifications
  }
});
```

## Testing

### Local Testing
```bash
# Production build
pnpm build
pnpm start

# Test in Chrome DevTools
# Open DevTools → Application → Service Workers
# Check:
# - Service worker registration
# - Cache storage
# - Manifest
```

### Testing Offline
1. Open DevTools → Application
2. Check "Offline" checkbox
3. Reload page
4. Verify app still works
5. Make changes to test queue functionality

### Testing Installation
1. Run production build: `pnpm build && pnpm start`
2. Open in Chrome/Edge
3. Wait 5 seconds (needs to be available offline first)
4. Click install prompt or use menu

## Deployment Checklist

- [ ] Icons created and placed in `public/`
- [ ] `manifest.json` updated with correct app name/description
- [ ] `next.config.mjs` PWA config enabled
- [ ] HTTPS enabled (required for PWA)
- [ ] Service worker registered correctly
- [ ] Test offline mode works
- [ ] Test installation on mobile
- [ ] Configure push notifications (optional)
- [ ] Add app to PWA stores (optional)

## Troubleshooting

### Installation button not showing
- App must be on HTTPS
- Service worker must be registered
- Manifest must be valid
- Wait 5+ seconds for service worker to activate

### Service worker not updating
- Use DevTools → Application → Service Workers
- Click "Update on reload" during development
- In production, use `skipWaiting: true` for instant updates

### Offline mode not working
- Check DevTools → Application → Cache Storage
- Verify service worker is activated
- Ensure routes are cached appropriately

### Icons not showing
- Verify file paths in manifest.json
- Icons must be in `public/` folder
- Clear browser cache and service worker
- Check file formats (PNG, SVG supported)

## Best Practices

1. **Keep service worker lightweight** - Use async/await for long operations
2. **Version your caches** - Increment cache names when updating assets
3. **Handle sync errors gracefully** - Queue requests and retry on next sync
4. **Test offline scenarios** - Use DevTools offline mode
5. **Monitor performance** - Check cache hit rates and sync status
6. **Update regularly** - Keep dependencies and assets current
7. **Security first** - Only cache safe content, use HTTPS
8. **User control** - Let users disable background sync if needed

## Resources

- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [MDN Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Manifest Spec](https://w3c.github.io/manifest/)
- [Chrome DevTools - PWA](https://developer.chrome.com/docs/devtools/progressive-web-apps/)

## Support

For issues or questions:
1. Check DevTools → Application for service worker status
2. Clear cache and reinstall if problems persist
3. Review browser console for error messages
4. Test on latest Chrome/Edge/Safari versions
