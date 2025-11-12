# WhatsApp Integration - Quick Reference Guide

## Environment Variables Required

```env
WHATSAPP_PHONE_NUMBER_ID="your_phone_number_id"
WHATSAPP_ACCESS_TOKEN="your_permanent_access_token"
WHATSAPP_WEBHOOK_VERIFY_TOKEN="your_custom_verify_token"
CRON_SECRET="your_random_secret_string"
DOCTOR_PHONE_NUMBER="5511999999999" # Optional
```

---

## API Endpoints

### Test WhatsApp Connection
```bash
GET https://your-app.vercel.app/api/whatsapp/test
```

### Send Test Message
```bash
POST https://your-app.vercel.app/api/whatsapp/test
Content-Type: application/json

{
  "phone": "5511999999999",
  "message": "Test message"
}
```

### Webhook (Meta calls this)
```bash
GET/POST https://your-app.vercel.app/api/whatsapp/webhook
```

### Trigger Cron Job Manually
```bash
GET https://your-app.vercel.app/api/cron/send-followups
Authorization: Bearer YOUR_CRON_SECRET
```

### Get Follow-up Details
```bash
GET https://your-app.vercel.app/api/followup/[id]/send
```

### Send Specific Follow-up
```bash
POST https://your-app.vercel.app/api/followup/[id]/send
```

### Skip Follow-up
```bash
DELETE https://your-app.vercel.app/api/followup/[id]/send
```

---

## Cron Schedule Reference

Edit `vercel.json` to change schedule:

```
0 10 * * *   # 10:00 AM UTC (7:00 AM BRT)
0 13 * * *   # 1:00 PM UTC (10:00 AM BRT)
0 14 * * *   # 2:00 PM UTC (11:00 AM BRT)
0 17 * * *   # 5:00 PM UTC (2:00 PM BRT)

# Format: minute hour day month day-of-week
# All times in UTC
```

---

## Follow-up Days

Auto-created for each surgery:
- D+1 (Day 1)
- D+2 (Day 2)
- D+3 (Day 3)
- D+5 (Day 5)
- D+7 (Day 7 - 1 week)
- D+10 (Day 10)
- D+14 (Day 14 - 2 weeks)

---

## Status Flow

```
pending → sent → responded
    ↓
overdue (if not responded after scheduled date)
    ↓
skipped (after 3 failed send attempts or manually)
```

---

## Risk Levels

- **low**: Normal recovery
- **medium**: Minor concerns
- **high**: Requires attention
- **critical**: Urgent medical attention needed

---

## Phone Number Format

**Correct formats**:
- `5511999999999` (with country code 55)
- `11999999999` (will add 55 automatically)

**Incorrect**:
- `(11) 99999-9999` (will be cleaned)
- `+55 11 99999-9999` (will be cleaned)

---

## Common Red Flags

### Universal
- Fever ≥38°C
- Severe bleeding
- Extreme pain (≥9/10)

### Hemorroidectomia
- Urinary retention >6h
- No bowel movement D+3+

### Fístula/Pilonidal
- Purulent discharge
- Cellulitis signs (redness, swelling, heat)

### Fissura
- Active bleeding
- No bowel movement D+4+

---

## Troubleshooting Commands

### Check Vercel Logs
```bash
vercel logs --follow
```

### Check Specific Function
```bash
vercel logs /api/cron/send-followups --follow
```

### Test Locally with ngrok
```bash
# Terminal 1
npm run dev

# Terminal 2
ngrok http 3000

# Use ngrok URL in Meta webhook config
# Example: https://abc123.ngrok.io/api/whatsapp/webhook
```

### Verify Environment Variables
```bash
vercel env ls
```

### Pull Remote Environment Variables
```bash
vercel env pull .env.local
```

---

## Message Template Status

Check template approval status:
1. Go to Meta Business Manager
2. WhatsApp Manager → Message Templates
3. Check status: Pending/Approved/Rejected

Re-submit if rejected with modifications.

---

## Database Queries (Useful for Debugging)

### Check pending follow-ups
```sql
SELECT * FROM "FollowUp"
WHERE status = 'pending'
  AND "scheduledDate" >= CURRENT_DATE
  AND "scheduledDate" < CURRENT_DATE + INTERVAL '1 day';
```

### Check overdue follow-ups
```sql
SELECT * FROM "FollowUp"
WHERE status IN ('pending', 'sent')
  AND "scheduledDate" < CURRENT_DATE - INTERVAL '1 day';
```

### Check high-risk responses
```sql
SELECT * FROM "FollowUpResponse"
WHERE "riskLevel" IN ('high', 'critical')
ORDER BY "createdAt" DESC;
```

### Check unanswered follow-ups by patient
```sql
SELECT f.* FROM "FollowUp" f
JOIN "Patient" p ON f."patientId" = p.id
WHERE p.phone = '5511999999999'
  AND f.status IN ('pending', 'sent')
ORDER BY f."scheduledDate";
```

---

## React Component Usage

```tsx
import { FollowUpStatus } from '@/components/FollowUpStatus';

// In your page/component
<FollowUpStatus
  followUps={followUps}
  onResend={async (id) => {
    await fetch(`/api/followup/${id}/send`, { method: 'POST' });
  }}
  onViewResponses={(id) => {
    router.push(`/followup/${id}/responses`);
  }}
  isLoading={isLoading}
/>
```

---

## Common Issues & Quick Fixes

### Issue: "WhatsApp not configured"
**Fix**: Check environment variables are set in Vercel

### Issue: "Webhook verification failed"
**Fix**: Ensure WHATSAPP_WEBHOOK_VERIFY_TOKEN matches in Meta dashboard and .env

### Issue: "Phone number not found"
**Fix**: Ensure patient phone number is saved in database with correct format

### Issue: "Messages not sending"
**Fix**:
1. Check WHATSAPP_ACCESS_TOKEN is valid
2. Verify WHATSAPP_PHONE_NUMBER_ID is correct
3. Check Vercel logs for errors

### Issue: "Cron not running"
**Fix**:
1. Verify vercel.json is in project root
2. Check CRON_SECRET is set
3. View Vercel Cron Logs in dashboard

### Issue: "Template not found"
**Fix**: Templates need to be approved by Meta before use

---

## Meta Dashboard Quick Links

- **App Dashboard**: https://developers.facebook.com/apps/
- **WhatsApp Manager**: https://business.facebook.com/wa/manage/
- **Message Templates**: WhatsApp Manager → Message Templates
- **Phone Numbers**: WhatsApp Manager → Phone Numbers
- **Webhooks**: App Dashboard → WhatsApp → Configuration

---

## Testing Checklist

- [ ] WhatsApp API connection test passes
- [ ] Test message sends successfully
- [ ] Webhook verification succeeds
- [ ] Can receive incoming messages
- [ ] Cron job runs on schedule
- [ ] Manual send works
- [ ] Patient response triggers AI analysis
- [ ] Doctor alert sends for high-risk
- [ ] FollowUpStatus component displays correctly

---

## Production Launch Checklist

- [ ] All environment variables set in Vercel
- [ ] Webhook configured and verified in Meta
- [ ] Message templates approved
- [ ] Test message sent and received
- [ ] End-to-end test completed successfully
- [ ] Cron job tested (manual trigger)
- [ ] Doctor alert phone number verified
- [ ] Monitoring/logging in place
- [ ] Error alerting configured
- [ ] Team trained on system

---

## Support Contacts

**Meta/WhatsApp Issues**:
- Developer Support: https://developers.facebook.com/support/
- Community: https://developers.facebook.com/community/

**Vercel Issues**:
- Support: https://vercel.com/support
- Discord: https://vercel.com/discord

**Claude AI Issues**:
- Anthropic Support: https://support.anthropic.com/

---

## Cost Monitoring

**WhatsApp Business API**:
- Dashboard: WhatsApp Manager → Insights
- Billing: Meta Business Manager → Billing

**Vercel**:
- Dashboard: Vercel Dashboard → Usage
- Billing: Vercel Dashboard → Billing

**Claude AI**:
- Dashboard: Anthropic Console → Usage
- Billing: Anthropic Console → Billing

---

## Performance Metrics

Monitor these KPIs:
- Follow-up send rate: >95%
- Patient response rate: Target 60-80%
- Red flag detection rate: Track false positives/negatives
- Doctor alert frequency: Should correlate with actual complications
- Message delivery time: <2 seconds
- Webhook processing time: <1 second
- AI analysis accuracy: Validate against doctor review

---

## Version History

- **v1.0**: Initial implementation (current)
  - Automated follow-ups D+1 to D+14
  - AI-powered response analysis
  - Red flag detection
  - Doctor alerts
  - Manual send/resend capability

**Future versions**: See IMPLEMENTATION_REPORT.md for planned features
