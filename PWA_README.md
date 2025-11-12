# PWA Implementation - Sistema Pós-Operatório

## Overview

This document describes the Progressive Web App (PWA) implementation for the Sistema Pós-Operatório, designed to enable Dr. João Vitor Viana to use the system on mobile devices during busy surgical days with full offline support.

## Key Features

### 🚀 Core PWA Features
- **Installable**: Add to home screen on iOS and Android
- **Offline First**: Full functionality without internet connection
- **Background Sync**: Automatic data synchronization when online
- **Mobile Optimized**: Touch-friendly UI with bottom navigation
- **Fast**: Optimized for mobile networks and devices

### 📱 Mobile Optimizations
- **Bottom Navigation**: Easy one-handed operation
- **Touch Targets**: Minimum 44x44px for all interactive elements
- **Smart Keyboards**: Context-appropriate input types (tel, date, number)
- **Safe Area Support**: Works perfectly on notched devices
- **Responsive**: Optimized layouts for all screen sizes

### 🔄 Offline Capabilities
- **Patient Registration**: Save patients locally when offline
- **Auto-Sync**: Automatically syncs when connection restored
- **Queue Management**: Visual indicator for pending data
- **Cache Strategy**: Intelligent caching of pages and resources

## Architecture

### Service Worker (`public/sw.js`)

**Caching Strategy:**
- **Network First** for API calls (with cache fallback)
- **Cache First** for pages (with network update in background)
- **Cache Only** for static assets

**Key Features:**
- Version-based cache management
- Offline request queuing
- Background sync support
- Automatic cache cleanup

### IndexedDB Storage (`lib/offline-storage.ts`)

**Database Structure:**
```
pos-op-db
├── pending-patients (patient registrations)
│   ├── id (auto-increment)
│   ├── nome
│   ├── telefone
│   ├── cirurgia
│   ├── dataCirurgia
│   ├── observacoes
│   ├── timestamp
│   └── synced (boolean)
└── offline-queue (failed requests)
    ├── url
    ├── method
    ├── headers
    ├── body
    └── timestamp
```

**API Methods:**
- `savePendingPatient()` - Save patient locally
- `getPendingPatients()` - Get unsynced patients
- `syncPendingPatients()` - Sync all pending data
- `markPatientAsSynced()` - Mark patient as synced
- `deletePendingPatient()` - Remove patient from queue

### Components

#### PWARegistration
- Registers service worker on app load
- Handles service worker updates
- Shows update prompts to users

#### OfflineIndicator
- Shows online/offline status
- Displays pending sync count
- Provides manual sync button
- Auto-syncs when connection restored

#### InstallPrompt
- Detects install capability
- Shows install prompt (Android/Desktop)
- Shows iOS-specific instructions
- Respects user dismissal (7-day cooldown)

#### BottomNav
- Mobile-first navigation
- 4 main sections: Dashboard, Cadastro, Termos, Mais
- Safe area support for notched devices
- Only visible on mobile (<768px)

## File Structure

```
sistema-pos-operatorio/
├── public/
│   ├── manifest.json              # PWA manifest
│   ├── sw.js                      # Service worker
│   ├── offline-test.html          # Testing tool
│   └── icons/
│       ├── icon-192.png           # App icon 192x192
│       ├── icon-512.png           # App icon 512x512
│       ├── icon.svg               # Source icon
│       └── generate-icons.html    # Icon generator
│
├── app/
│   ├── layout.tsx                 # PWA meta tags + components
│   ├── mobile.css                 # Mobile-specific styles
│   └── offline/
│       └── page.tsx               # Offline fallback page
│
├── components/
│   ├── PWARegistration.tsx        # SW registration
│   ├── OfflineIndicator.tsx       # Offline status UI
│   ├── InstallPrompt.tsx          # Install prompt UI
│   └── BottomNav.tsx              # Mobile navigation
│
├── lib/
│   ├── offline-storage.ts         # IndexedDB wrapper
│   └── performance.ts             # Performance monitoring
│
├── MOBILE_GUIDE.md                # User documentation
├── PWA_IMPLEMENTATION_CHECKLIST.md # Implementation guide
└── PWA_README.md                  # This file
```

## Getting Started

### 1. Generate Icons

**Option A: Use HTML Generator**
```bash
# Open in browser
http://localhost:3000/icons/generate-icons.html

# Click "Download All Icons"
# Save files to public/icons/
```

**Option B: Manual Creation**
Create two PNG files with medical-themed design:
- 192x192px → `public/icons/icon-192.png`
- 512x512px → `public/icons/icon-512.png`

### 2. Build and Test

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start

# Open in browser
http://localhost:3000
```

### 3. Test PWA Features

#### Desktop (Chrome/Edge)
1. Open DevTools (F12)
2. Application tab → Service Workers
3. Verify registration
4. Test offline (Network tab → Offline)

#### Mobile (Chrome Android)
1. Deploy to production (HTTPS required)
2. Open in Chrome
3. Install via prompt or menu
4. Test offline functionality

#### iOS (Safari)
1. Deploy to production (HTTPS required)
2. Open in Safari
3. Share → Add to Home Screen
4. Open installed app
5. Test offline functionality

### 4. Use Testing Page

Navigate to `/offline-test.html` for comprehensive testing:
- Service Worker status
- IndexedDB functionality
- Offline patient registration
- Cache management
- Sync testing

## Usage Flow

### Normal Usage (Online)

```
1. User opens app (installed or browser)
2. Service Worker loads
3. PWA components initialize
4. User navigates and uses features
5. All data syncs immediately to server
```

### Offline Usage

```
1. User loses connection
2. OfflineIndicator appears: "Você está offline"
3. User registers patient
4. Data saved to IndexedDB
5. OfflineIndicator shows: "1 paciente pendente"
6. User continues working offline
```

### Coming Back Online

```
1. Connection restored
2. OfflineIndicator detects: "Online"
3. Auto-sync starts after 2 seconds
4. OfflineIndicator shows: "Sincronizando..."
5. Data sent to server
6. OfflineIndicator shows: "Sincronização concluída!"
7. Indicator disappears after 3 seconds
```

## Performance

### Target Metrics

- **Lighthouse PWA Score**: 100
- **Performance Score**: >90
- **First Contentful Paint**: <1.8s
- **Time to Interactive**: <3.8s
- **Largest Contentful Paint**: <2.5s

### Optimizations Implemented

1. **Code Splitting**: Dynamic imports for heavy components
2. **Image Optimization**: WebP with fallbacks
3. **Compression**: Brotli/Gzip enabled
4. **Minification**: JS/CSS minified in production
5. **Caching**: Aggressive caching strategy
6. **Lazy Loading**: Images and components

### Monitoring

Use `lib/performance.ts` to track:
- Page load times
- User interactions
- Web Vitals (LCP, FID, CLS)
- Connection quality

```typescript
import { reportWebVitals, trackInteraction } from '@/lib/performance';

// Track web vitals
reportWebVitals(metric => {
  console.log(metric);
});

// Track user actions
trackInteraction('patient-registered');
```

## Security

### Data Storage
- IndexedDB encrypted by OS
- Not accessible by other apps
- Cleared on app uninstall

### Network
- HTTPS required for PWA
- All API calls over HTTPS
- No sensitive data in service worker cache

### Best Practices
- Use device lock (PIN/biometrics)
- Clear cache regularly
- Sync on trusted networks
- Log out when sharing device

## Troubleshooting

### Service Worker Won't Register

**Check:**
1. HTTPS (required except localhost)
2. Browser console for errors
3. Service worker scope is correct
4. File path is `/sw.js`

**Fix:**
```javascript
// Check registration
navigator.serviceWorker.getRegistration().then(reg => {
  console.log(reg);
});
```

### Offline Mode Not Working

**Check:**
1. Service worker is active
2. IndexedDB supported
3. Correct cache version
4. Network actually offline

**Fix:**
- Clear cache and re-register SW
- Check `/offline-test.html` diagnostics
- Verify in DevTools → Application

### Sync Failing

**Check:**
1. Network connection active
2. API endpoint accessible
3. Authentication valid
4. Request format correct

**Fix:**
```javascript
// Manual sync trigger
import { syncPendingPatients } from '@/lib/offline-storage';

const result = await syncPendingPatients();
console.log(result); // { success: N, failed: N, errors: [...] }
```

### Install Prompt Not Showing

**Check:**
1. PWA criteria met (Lighthouse)
2. User hasn't dismissed recently
3. Not already installed
4. On supported browser

**Fix:**
- Clear site data
- Re-visit after 7 days
- Check manifest.json valid
- Verify icons present

## Browser Support

### Fully Supported
- ✅ Chrome 67+ (Android/Desktop)
- ✅ Edge 79+ (Desktop)
- ✅ Safari 11.1+ (iOS/macOS)
- ✅ Firefox 44+ (Android/Desktop)
- ✅ Samsung Internet 8.2+

### Partial Support
- ⚠️ Safari < 11.1 (no service worker)
- ⚠️ Firefox iOS (uses Safari engine)
- ⚠️ Chrome iOS (uses Safari engine)

### Not Supported
- ❌ IE 11
- ❌ Old Android browsers (<5.0)

## Limitations

### iOS Specific
- Must use Safari for installation
- No background sync when app closed
- Service worker may be purged after 2 weeks
- No push notifications in standalone mode
- Limited storage quota

### Android Specific
- Battery optimization may limit background sync
- Different install UI per browser
- Storage quota varies by device

### General
- HTTPS required (except localhost)
- Storage limits: 50MB-2GB (device dependent)
- Service worker requires modern browser
- Some features need user permission

## Future Enhancements

### Planned Features
- [ ] Push notifications for reminders
- [ ] Periodic background sync
- [ ] App shortcuts (Android)
- [ ] Share target API
- [ ] Badge API for unread counts
- [ ] File handling
- [ ] Contact picker integration

### Performance Improvements
- [ ] Further code splitting
- [ ] Critical CSS inlining
- [ ] Resource hints (preload/prefetch)
- [ ] Image lazy loading improvements
- [ ] Bundle size reduction

## Testing Checklist

### Pre-Deployment
- [ ] Icons generated and correct
- [ ] Service Worker registers
- [ ] Offline mode works
- [ ] Sync functionality tested
- [ ] Install prompt appears
- [ ] Bottom nav functional
- [ ] All pages cached

### Post-Deployment
- [ ] HTTPS working
- [ ] Manifest loads
- [ ] Icons display
- [ ] Install on iOS
- [ ] Install on Android
- [ ] Lighthouse score >90
- [ ] Web Vitals pass

## Resources

### Documentation
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PWA Builder](https://www.pwabuilder.com/)
- [Workbox](https://developers.google.com/web/tools/workbox)

### Testing
- `/offline-test.html` - Built-in test page
- [WebPageTest](https://www.webpagetest.org/)
- Chrome DevTools → Application

## Support

For issues or questions:
1. Check troubleshooting section
2. Use `/offline-test.html` for diagnostics
3. Review browser console errors
4. Check implementation checklist
5. Consult mobile guide

## Version History

### v1.0.0 (2025-01-09)
- Initial PWA implementation
- Service Worker with offline support
- IndexedDB for data storage
- Mobile-optimized UI
- Install prompts
- Offline indicator
- Bottom navigation
- Performance monitoring

---

**Last Updated:** 2025-01-09
**Author:** Sistema Pós-Operatório Team
**Next.js Version:** 16.0.1
