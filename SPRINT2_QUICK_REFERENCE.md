# SPRINT 2: Quick Reference Guide

## 🎯 What Was Built

### 6 New Pages
1. **Homepage** (`/`) - Commercial landing with pricing
2. **Pricing** (`/pricing`) - Calculator + detailed comparison
3. **Registration** (`/cadastro-medico`) - Doctor signup form
4. **Login** (`/auth/login`) - Authentication page
5. **Onboarding** (`/onboarding`) - 4-step wizard
6. **Forgot Password** (`/auth/forgot-password`) - Reset placeholder

### 1 API Route
- `POST /api/auth/register` - Creates new doctor account

### Database Updates
- Updated User model in `schema.prisma`
- Added fields: `nomeCompleto`, `senha`, `estado`, `basePrice`, `isLifetimePrice`, `aceitoTermos`, `aceitoNovidades`, `firstLogin`

---

## 🎨 Visual Design

### Color Palette
- **Primary:** #0A2647 (Telos Blue)
- **Accent:** #D4AF37 (Gold - Excellence)
- **Light Blue:** #2C74B3
- **Light Gold:** #E8C547
- **Background:** #F5F7FA

### Typography
- **Brand "Telos":** Georgia, serif
- **".AI" Suffix:** System sans-serif
- **Body:** Geist Sans

---

## 💰 Pricing Structure

| Plan | Base Price | Patients Included | Additional Patient | Special Benefit |
|------|-----------|-------------------|-------------------|-----------------|
| **Founding** | R$ 400/mês | 3 | R$ 150 | Lifetime price guarantee |
| **Professional** | R$ 500/mês | 3 | R$ 180 | Standard pricing |

---

## 📝 Registration Form Fields

1. Nome Completo ✓
2. Email ✓
3. WhatsApp (auto-formatted) ✓
4. CRM ✓
5. Estado (dropdown) ✓
6. Senha (strength indicator) ✓
7. Confirmar Senha ✓
8. Aceito termos (required) ✓
9. Aceito novidades (optional)

---

## 🔄 User Flows

### New User (Founding)
Homepage → "Quero ser Founding Member" → Registration → Login → Onboarding → Dashboard

### New User (Professional)
Homepage → "Começar Agora" → Registration → Login → Onboarding → Dashboard

### Pricing Research
Homepage → "Ver preços" → Pricing Calculator → Detailed Comparison → Register

---

## 🎭 Onboarding Steps

1. **Welcome** - Greeting + platform intro
2. **WhatsApp** - Connect Twilio (placeholder)
3. **Tour** - Dashboard features overview
4. **Ready** - "Cadastrar primeiro paciente" CTA

---

## 🔐 Validations

### Email
- Valid format: `user@domain.com`

### WhatsApp
- Format: `+55 (11) 99999-9999`
- Auto-formatted as user types

### Password
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- Strength indicator: Fraca/Média/Forte

### CRM + Estado
- Unique combination (one doctor per CRM per state)

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Update database schema
npm run db:push

# Start dev server
npm run dev

# Access pages
http://localhost:3000/              # Homepage
http://localhost:3000/pricing       # Pricing
http://localhost:3000/cadastro-medico  # Registration
http://localhost:3000/auth/login    # Login
http://localhost:3000/onboarding    # Onboarding wizard
```

---

## ⚠️ CRITICAL TODOs

### Before Production
1. ❗ **Implement bcrypt** for password hashing
2. ❗ **Add NextAuth** for session management
3. ❗ **Create login API** (`POST /api/auth/signin`)
4. ❗ **Email verification** flow
5. ❗ **Twilio integration** for WhatsApp

### Nice to Have
6. Mobile hamburger menu functionality
7. Forgot password reset flow
8. Terms & privacy policy pages
9. Payment gateway integration
10. Email marketing setup

---

## 📊 Success Metrics

Track these in analytics:
- Homepage views
- CTA click rate (Founding vs Professional)
- Pricing calculator usage
- Registration completion rate
- Onboarding completion rate
- Time to first patient

---

## 🎉 Key Features

### Homepage
- ✅ Dual CTAs (Founding + Professional)
- ✅ Side-by-side pricing cards
- ✅ "Apenas 3 vagas!" badge for Founding
- ✅ Lifetime price guarantee highlight
- ✅ "Como Funciona" 4-step process
- ✅ Benefits section
- ✅ Link to pricing page

### Pricing Page
- ✅ Interactive slider (1-30 patients)
- ✅ Real-time price calculation
- ✅ Savings comparison
- ✅ 14-row detailed feature table
- ✅ 6-item FAQ section
- ✅ Direct registration CTAs

### Registration
- ✅ Plan badge (gold/blue)
- ✅ WhatsApp auto-formatting
- ✅ Password strength meter
- ✅ Terms acceptance required
- ✅ Marketing opt-in optional
- ✅ Full validation with Zod
- ✅ Error messages per field

### Login
- ✅ Success message display
- ✅ Pre-filled email from registration
- ✅ Forgot password link
- ✅ Registration CTAs at bottom
- ✅ Loading state
- ✅ Error handling

### Onboarding
- ✅ Progress bar
- ✅ 4 steps with illustrations
- ✅ Skip tour option
- ✅ WhatsApp setup placeholder
- ✅ Dashboard tour
- ✅ Next steps checklist
- ✅ Direct CTA to patient registration

---

## 🔗 URLs Map

| Page | URL | Query Params |
|------|-----|--------------|
| Homepage | `/` | - |
| Pricing | `/pricing` | - |
| Registration | `/cadastro-medico` | `?plan=founding` or `?plan=professional` |
| Login | `/auth/login` | `?message=...&email=...` |
| Onboarding | `/onboarding` | - |
| Forgot Password | `/auth/forgot-password` | - |

---

## 🎨 Component Updates

### TelosHeader
- Added "Preços" to navigation
- Added "Login" text link
- Changed CTA to "Começar Agora"
- Links to registration with plan param

---

## 📦 Files Modified/Created

```
✅ UPDATED: app/page.tsx
✅ UPDATED: components/TelosHeader.tsx
✅ UPDATED: prisma/schema.prisma

✅ NEW: app/pricing/page.tsx
✅ NEW: app/cadastro-medico/page.tsx
✅ NEW: app/auth/login/page.tsx
✅ NEW: app/auth/forgot-password/page.tsx
✅ NEW: app/onboarding/page.tsx
✅ NEW: app/api/auth/register/route.ts
```

---

## 🧪 Testing Checklist

### Functionality
- [ ] Homepage CTAs work
- [ ] Pricing calculator calculates correctly
- [ ] Registration form validates
- [ ] WhatsApp formats automatically
- [ ] Password strength shows correctly
- [ ] Can submit valid form
- [ ] API creates user in database
- [ ] Login shows success message
- [ ] Onboarding progresses through steps
- [ ] All links work

### Responsiveness
- [ ] Mobile (< 768px)
- [ ] Tablet (768-1024px)
- [ ] Desktop (> 1024px)

### Database
- [ ] User created with correct plan
- [ ] Pricing set correctly (Founding vs Professional)
- [ ] Email uniqueness enforced
- [ ] CRM+Estado uniqueness enforced

---

## 💡 Pro Tips

1. **Test with real data:** Use your actual CRM/email to test
2. **Check mobile:** 60% of traffic will be mobile
3. **Monitor performance:** Pricing calculator should be instant
4. **A/B test:** Try different hero copy variations
5. **Track conversions:** Which CTA performs better?

---

## 🎯 Sprint Goals - All Achieved ✅

- ✅ Commercial landing page
- ✅ Pricing section with 2 plans
- ✅ Founding Members special offer
- ✅ Interactive pricing calculator
- ✅ Complete registration flow
- ✅ Professional login page
- ✅ 4-step onboarding wizard
- ✅ API for user creation
- ✅ Database schema updates
- ✅ Responsive design

---

**Telos.AI - O Propósito da Recuperação, a Inteligência do Cuidado**

Last Updated: 2025-11-10
