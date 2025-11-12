# PWA Quick Start Guide - Sistema Pós-Operatório

## 🚀 5-Minute Setup

### Step 1: Generate Icons (2 minutes)

**Open the icon generator:**
```bash
npm run dev
# Navigate to: http://localhost:3000/icons/generate-icons.html
```

**Download and save:**
1. Click "Download Todos os Ícones"
2. Two files will download: `icon-192.png` and `icon-512.png`
3. Save both files to `public/icons/` directory

**Verify:**
```bash
ls public/icons/
# Should show: icon-192.png, icon-512.png
```

### Step 2: Test Locally (1 minute)

**Build and start:**
```bash
npm run build
npm start
```

**Open browser:**
```
http://localhost:3000
```

**Check service worker:**
1. Press F12 (DevTools)
2. Go to "Application" tab
3. Click "Service Workers"
4. Should see: `/sw.js` - Status: activated

### Step 3: Test Offline (1 minute)

**Enable offline mode:**
1. In DevTools, go to "Network" tab
2. Select "Offline" from throttling dropdown
3. Refresh page - should still work!
4. Try registering a patient - should save locally

**Check saved data:**
1. Go to "Application" tab
2. Expand "IndexedDB" → "pos-op-db" → "pending-patients"
3. Should see your saved patient

### Step 4: Test Sync (1 minute)

**Go back online:**
1. In Network tab, select "Online"
2. Watch for sync notification in app
3. Check DevTools console for sync logs

**Verify sync:**
- OfflineIndicator should show "Sincronizando..."
- Then "Sincronização concluída!"
- Counter should go to 0

## 🧪 Testing Checklist

Quick tests before deployment:

### Desktop
- [ ] Service Worker registers
- [ ] Offline mode works
- [ ] Can save patient offline
- [ ] Sync works when back online
- [ ] Install prompt appears

### Mobile (After Deploy)
- [ ] Install on Android via Chrome
- [ ] Install on iOS via Safari
- [ ] App opens standalone
- [ ] Bottom nav works
- [ ] All offline features work

## 📱 Install Testing

### Android (Chrome)
```
1. Deploy to production (HTTPS required)
2. Open in Chrome mobile
3. Wait for "Install app" banner OR
4. Menu (⋮) → "Install app"
5. Confirm installation
6. Find app in app drawer
```

### iOS (Safari)
```
1. Deploy to production (HTTPS required)
2. Open in Safari mobile
3. Tap Share button (square with arrow)
4. Scroll down → "Add to Home Screen"
5. Tap "Add"
6. Find icon on home screen
```

## 🔧 Common Issues & Quick Fixes

### Issue: Service Worker Won't Register

**Quick Fix:**
```bash
# Clear browser cache
# Chrome: DevTools → Application → Clear storage → Clear site data

# Check service worker status
http://localhost:3000/offline-test.html
```

### Issue: Icons Not Showing

**Quick Fix:**
```bash
# Verify files exist
ls public/icons/icon-*.png

# If missing, regenerate:
http://localhost:3000/icons/generate-icons.html
```

### Issue: Offline Mode Not Working

**Quick Fix:**
1. Check DevTools console for errors
2. Verify service worker is active
3. Try hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)
4. Use test page: `/offline-test.html`

### Issue: Install Prompt Not Appearing

**Quick Fix:**
```bash
# Check PWA criteria with Lighthouse:
# DevTools → Lighthouse → Run PWA audit

# Common fixes:
- Ensure HTTPS (production)
- Check manifest.json loads
- Verify icons exist
- Clear browser data
```

## 🎯 Production Deployment

### Pre-Deploy Checklist
- [ ] Icons generated and in place
- [ ] Service Worker tested
- [ ] Offline mode verified
- [ ] Build completes: `npm run build`
- [ ] No TypeScript errors

### Deploy Commands

**Vercel:**
```bash
vercel --prod
```

**Netlify:**
```bash
netlify deploy --prod
```

**Custom Server:**
```bash
npm run build
npm start
# Ensure HTTPS is configured
```

### Post-Deploy Verification
1. Visit your site
2. Check service worker registers
3. Test offline mode
4. Install on mobile device
5. Test all functionality

## 📊 Performance Check

### Quick Lighthouse Audit
```
1. Open site in Chrome
2. DevTools (F12) → Lighthouse
3. Select "Progressive Web App"
4. Click "Generate report"
5. Target: Score 100
```

### Key Metrics to Check
- **PWA**: 100 (perfect)
- **Performance**: >90 (excellent)
- **Accessibility**: >90 (excellent)
- **Best Practices**: >90 (excellent)

## 🛠️ Debug Tools

### Built-in Test Page
```
http://your-site.com/offline-test.html
```

**Features:**
- Service Worker status
- IndexedDB testing
- Cache inspection
- Offline patient registration
- Manual sync testing
- Detailed logs

### Browser DevTools

**Service Worker:**
```
DevTools → Application → Service Workers
- See registration status
- Force update
- Unregister (for testing)
```

**Cache:**
```
DevTools → Application → Cache Storage
- View cached files
- Delete caches
- Inspect cache contents
```

**IndexedDB:**
```
DevTools → Application → IndexedDB
- Browse pending patients
- View stored data
- Clear storage
```

## 📚 Documentation

Full documentation available:

- **PWA_README.md** - Complete technical documentation
- **MOBILE_GUIDE.md** - User guide for mobile usage
- **PWA_IMPLEMENTATION_CHECKLIST.md** - Detailed checklist

## 🆘 Need Help?

### Quick Diagnostics

**Run this in browser console:**
```javascript
// Check service worker
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW:', reg ? 'Registered' : 'Not registered');
});

// Check IndexedDB
indexedDB.databases().then(dbs => {
  console.log('Databases:', dbs);
});

// Check online status
console.log('Online:', navigator.onLine);
```

### Test Page
Visit `/offline-test.html` for comprehensive diagnostics

### Common Solutions
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Check browser console
4. Verify HTTPS (production)
5. Test in incognito mode

## ✅ Success Criteria

Your PWA is ready when:

- [x] Service Worker registered
- [x] Works offline
- [x] Can save data offline
- [x] Syncs when online
- [x] Installable on mobile
- [x] Lighthouse PWA score: 100
- [x] Bottom nav appears on mobile
- [x] Icons display correctly

## 🎉 You're Done!

If all checks pass:
1. ✅ PWA is fully functional
2. ✅ Ready for production
3. ✅ Mobile optimized
4. ✅ Offline capable

Share the MOBILE_GUIDE.md with Dr. João for usage instructions!

---

**Setup Time:** ~5 minutes
**Next Steps:** Deploy to production and test on real devices
**Support:** Check PWA_README.md for detailed troubleshooting
