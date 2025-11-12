# PWA Quick Reference Card

## 🚀 Quick Setup (5 Minutes)

### 1. Generate Icons
```bash
npm run dev
# Open: http://localhost:3000/icons/generate-icons.html
# Download both icons → save to public/icons/
```

### 2. Build & Test
```bash
npm run build && npm start
# Open: http://localhost:3000
```

### 3. Verify
- F12 → Application → Service Workers ✓
- Network → Offline → Reload (should work) ✓

---

## 📱 Install App

### iOS
Safari → Share → Add to Home Screen

### Android
Chrome → Install App (or Menu → Install)

---

## 🧪 Testing

### Quick Test
```
http://localhost:3000/offline-test.html
```

### DevTools Checks
- Application → Service Workers (registered?)
- Application → IndexedDB → pos-op-db
- Network → Offline mode → Test

---

## 📁 Key Files

```
public/
├── manifest.json          # PWA config
├── sw.js                  # Service worker
├── offline-test.html      # Test page
└── icons/
    ├── icon-192.png       # Generate this
    └── icon-512.png       # Generate this

components/
├── PWARegistration.tsx    # Registers SW
├── OfflineIndicator.tsx   # Status UI
├── InstallPrompt.tsx      # Install UI
└── BottomNav.tsx          # Mobile nav

lib/
├── offline-storage.ts     # IndexedDB
└── performance.ts         # Metrics

app/
├── layout.tsx             # PWA setup
├── mobile.css             # Mobile styles
└── offline/page.tsx       # Offline page
```

---

## 🔧 Common Commands

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Deploy (Vercel)
vercel --prod

# Deploy (Netlify)
netlify deploy --prod
```

---

## 🐛 Debug Quick Fixes

### SW Not Working
```javascript
// Console:
navigator.serviceWorker.getRegistration()
// Clear and retry:
// DevTools → Application → Clear site data
```

### Offline Not Saving
```javascript
// Console:
indexedDB.databases()
// Check browser console for errors
```

### Sync Failing
- Check network is actually online
- Try manual sync (click banner)
- Check `/offline-test.html` logs

---

## 📊 Performance Checks

```bash
# Lighthouse in Chrome DevTools:
# F12 → Lighthouse → PWA (should be 100)
```

**Target Scores:**
- PWA: 100
- Performance: >90
- Accessibility: >90

---

## 🗂️ Database Structure

```javascript
// IndexedDB: pos-op-db
pending-patients: {
  id: number,
  nome: string,
  telefone: string,
  cirurgia: string,
  dataCirurgia: string,
  timestamp: number,
  synced: boolean
}
```

---

## 🔄 Update SW

1. Edit `public/sw.js`
2. Change: `const CACHE_NAME = 'pos-op-v2'`
3. Deploy
4. Users get update prompt

---

## 📚 Documentation

- **PWA_README.md** - Full technical docs
- **MOBILE_GUIDE.md** - User guide
- **PWA_IMPLEMENTATION_CHECKLIST.md** - Detailed checklist
- **PWA_QUICK_START.md** - 5-minute setup
- **PWA_IMPLEMENTATION_REPORT.md** - Complete report

---

## ✅ Pre-Deploy Checklist

- [ ] Icons generated
- [ ] `npm run build` succeeds
- [ ] SW registers in DevTools
- [ ] Offline mode works
- [ ] HTTPS configured
- [ ] Manifest.json loads

---

## 📞 Support

### Test Tools
- `/offline-test.html` - Diagnostics
- DevTools → Application tab
- Browser console logs

### Common Issues
1. **No install prompt** → Wait 7 days or clear site data
2. **Offline broken** → Check SW registered + IndexedDB
3. **Sync failing** → Check network + API endpoint

---

## 🎯 Success Criteria

When ready:
- ✅ Service Worker active
- ✅ Works offline
- ✅ Saves data offline
- ✅ Syncs when online
- ✅ Installs on mobile
- ✅ Lighthouse PWA = 100

---

## 🔐 Security Notes

- ✅ HTTPS required (production)
- ✅ Data encrypted by OS
- ✅ No PHI in cache
- ⚠️ Use device lock
- ⚠️ Sync on trusted WiFi

---

**Quick Links:**
- Test Page: `/offline-test.html`
- Icon Generator: `/icons/generate-icons.html`
- Manifest: `/manifest.json`
- Service Worker: `/sw.js`

---

**Version:** 1.0.0
**Last Updated:** 2025-01-09
**Status:** Production Ready ✅
