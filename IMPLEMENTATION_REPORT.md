# WhatsApp Business API & Vercel Cron Jobs - Implementation Report

## Overview
This report documents the complete implementation of WhatsApp Business API integration and Vercel Cron Jobs for automated post-operative follow-ups in the sistema-pos-operatorio project.

## Files Created

### 1. Core Library Files

#### `lib/whatsapp.ts`
**Purpose**: WhatsApp Business API client for sending messages and managing communication.

**Key Functions**:
- `sendMessage(to, message)` - Send text messages
- `sendTemplate(to, templateName, components)` - Send approved templates
- `sendInteractiveMessage(to, body, action, type)` - Send interactive messages (buttons/lists)
- `sendFollowUpQuestionnaire(followUp, patient, surgery)` - Send questionnaires
- `sendEmpatheticResponse(phone, message)` - Send AI-generated responses
- `sendDoctorAlert(patientName, dayNumber, riskLevel, redFlags)` - Alert doctor of high-risk cases
- `formatPhoneNumber(phone)` - Format phone numbers for WhatsApp
- `isValidWhatsAppNumber(phone)` - Validate phone numbers
- `testWhatsAppConnection()` - Test API connectivity

**Features**:
- Automatic phone number formatting (adds country code if missing)
- Greeting based on time of day (Bom dia/Boa tarde/Boa noite)
- Error handling and logging
- Rate limiting protection (500ms delay between messages)

---

#### `lib/questionnaires.ts`
**Purpose**: Follow-up questionnaires for each post-operative day.

**Questionnaires Defined**:
- **D+1**: Pain, urinary retention, bleeding, fever, nausea
- **D+2**: Pain evolution, first bowel movement, bleeding, discharge
- **D+3**: Pain, bowel movement, bleeding, swelling, redness
- **D+5**: Pain trend, regular bowel movements, discharge
- **D+7**: Pain, bowel pattern, wound healing, mobility (1 week milestone)
- **D+10**: Pain, bowel comfort, complications, return to work
- **D+14**: Final assessment, quality of life, surgery satisfaction (2 weeks)

**Key Functions**:
- `getQuestionnaireForDay(dayNumber, surgeryType)` - Get appropriate questionnaire
- `formatQuestionnaireForWhatsApp(questionnaire)` - Format for messaging
- `addSurgerySpecificQuestions(questionnaire, surgeryType, dayNumber)` - Add surgery-specific questions

**Surgery-Specific Adaptations**:
- **Hemorroidectomia**: Urinary retention questions (D+1 to D+3)
- **Fístula**: Discharge and secretion monitoring
- **Pilonidal**: Wound status and cellulitis signs

---

### 2. API Routes

#### `app/api/whatsapp/webhook/route.ts`
**Purpose**: Receive and process incoming WhatsApp messages.

**Endpoints**:
- **GET**: Webhook verification (required by Meta)
- **POST**: Receive incoming messages

**Processing Flow**:
1. Validate webhook signature
2. Parse incoming message
3. Find patient by phone number
4. Find pending follow-up for patient
5. Parse patient response (text parsing with NLP-like logic)
6. Detect red flags (deterministic rules)
7. Analyze with Claude AI
8. Save response to database
9. Send empathetic response to patient
10. Alert doctor if high/critical risk

**Features**:
- Support for text and interactive messages
- Automatic message read receipts
- Patient lookup by phone number
- Red flag detection (fever, bleeding, pain levels, etc.)
- AI-powered empathetic responses
- Automatic doctor alerts for critical cases

---

#### `app/api/cron/send-followups/route.ts`
**Purpose**: Daily cron job to send scheduled follow-ups.

**Schedule**: Runs daily at 10:00 AM (configurable in vercel.json)

**Process**:
1. Authenticate using CRON_SECRET
2. Find all pending follow-ups for today
3. For each follow-up:
   - Validate patient has phone number
   - Send questionnaire via WhatsApp
   - Update status to "sent"
   - Log results
4. Check and mark overdue follow-ups
5. Return summary report

**Features**:
- Authentication via CRON_SECRET
- Batch processing with delays to avoid rate limiting
- Failure tracking (max 3 attempts before marking as skipped)
- Overdue detection and marking
- Comprehensive logging

---

#### `app/api/followup/[id]/send/route.ts`
**Purpose**: Manually send or resend specific follow-ups.

**Endpoints**:
- **GET**: Get follow-up details and status
- **POST**: Manually send follow-up
- **DELETE**: Cancel/skip follow-up

**Use Cases**:
- Testing
- Resending failed messages
- Sending outside scheduled time
- Viewing follow-up details

---

#### `app/api/whatsapp/test/route.ts`
**Purpose**: Test WhatsApp API connectivity and send test messages.

**Endpoints**:
- **GET**: Test API connection and configuration
- **POST**: Send test message to a phone number

**Testing Features**:
- Configuration validation
- Connection testing
- Phone number validation
- Test message sending

---

### 3. Components

#### `components/FollowUpStatus.tsx`
**Purpose**: React component to display follow-up timeline and status.

**Features**:
- Timeline view of all follow-ups
- Status badges (pending, sent, responded, overdue, skipped)
- Risk level indicators (low, medium, high, critical)
- Red flag alerts display
- Resend buttons for failed sends
- View responses button
- Date formatting in Portuguese (pt-BR)

**Status Icons**:
- ✓ Responded (green checkmark)
- → Sent (blue send icon)
- ⚠ Overdue (orange X)
- ⊘ Skipped (gray X)
- ○ Pending (gray clock)

**Risk Badges**:
- 🟢 Low risk (green)
- 🟡 Medium risk (yellow)
- 🟠 High risk (orange)
- 🔴 Critical risk (red)

---

### 4. Configuration Files

#### `vercel.json`
**Purpose**: Vercel deployment and cron configuration.

```json
{
  "crons": [
    {
      "path": "/api/cron/send-followups",
      "schedule": "0 10 * * *"
    }
  ]
}
```

**Schedule**: `0 10 * * *` = Daily at 10:00 AM UTC (7:00 AM BRT)

To change time, modify the cron expression:
- `0 13 * * *` = 1:00 PM UTC (10:00 AM BRT)
- `0 14 * * *` = 2:00 PM UTC (11:00 AM BRT)

---

#### `.env.example` (Updated)
Added new environment variables:
```env
WHATSAPP_PHONE_NUMBER_ID="123456789"
WHATSAPP_ACCESS_TOKEN="EAAxxxxx"
WHATSAPP_WEBHOOK_VERIFY_TOKEN="my-verify-token"
WHATSAPP_APP_SECRET="your-app-secret-optional"
DOCTOR_PHONE_NUMBER="5511999999999"
CRON_SECRET="random-secret-string"
```

---

### 5. Documentation

#### `WHATSAPP_SETUP.md`
Comprehensive setup guide covering:
1. WhatsApp Business API setup (Meta account, app creation, credentials)
2. Webhook configuration (URL, verification, subscription)
3. Message templates (creation, approval, examples)
4. Vercel deployment (environment variables, cron setup)
5. Testing procedures (connection tests, webhook tests, end-to-end flow)
6. Troubleshooting (common issues and solutions)
7. Advanced configuration (signature validation, custom schedules)

---

## Integration Points

### Database Schema
Uses existing Prisma models:
- **FollowUp**: Stores follow-up schedule and status
- **FollowUpResponse**: Stores patient responses and AI analysis
- **Patient**: Patient data with phone number
- **Surgery**: Surgery details for questionnaire context

### Existing Libraries
- `lib/anthropic.ts`: AI analysis (already implemented)
- `lib/red-flags.ts`: Deterministic red flag detection (already implemented)
- `lib/prisma.ts`: Database client

---

## Security Features

### 1. Authentication
- **Webhook Verification**: Meta-required verify token
- **Cron Authorization**: CRON_SECRET header validation
- **Optional Signature Validation**: HMAC verification for webhooks

### 2. Data Protection
- Phone numbers normalized and validated
- Environment variables for all sensitive data
- No credentials in code

### 3. Rate Limiting
- 500ms delay between bulk message sends
- Failure tracking (max 3 attempts)
- Automatic skipping of repeatedly failed sends

---

## Workflow

### Automatic Follow-up Flow
1. **Surgery Creation**: Follow-ups automatically created for D+1, D+2, D+3, D+5, D+7, D+10, D+14
2. **Daily Cron (10 AM)**: Checks for follow-ups scheduled for today
3. **Send Questionnaire**: WhatsApp message sent to patient
4. **Patient Responds**: Message received via webhook
5. **Process Response**:
   - Parse text response
   - Detect red flags (deterministic)
   - Analyze with Claude AI
   - Combine risk assessments
   - Save to database
6. **Send Response**: Empathetic AI-generated message sent back
7. **Alert Doctor**: If high/critical risk, alert sent to doctor
8. **Status Update**: Follow-up marked as "responded"

### Manual Send Flow
1. **Navigate to Patient/Surgery**: View follow-up timeline
2. **Click Resend**: Button in FollowUpStatus component
3. **API Call**: POST to `/api/followup/[id]/send`
4. **Send Message**: WhatsApp questionnaire sent immediately
5. **Status Update**: Follow-up marked as "sent"

---

## Message Templates

### Required Templates (Need Meta Approval)

#### 1. `followup_d1` (Day 1)
Category: UTILITY
- Header: None
- Body: Greeting + D+1 questions
- Footer: Doctor name
- Variables: `{{1}}` = Patient first name

#### 2. `followup_general` (General)
Category: UTILITY
- Body: Greeting + day number
- Variables: `{{1}}` = Patient name, `{{2}}` = Day number

**Note**: After patient replies, 24-hour free-form messaging window opens (no template required).

---

## Testing Guide

### 1. Test WhatsApp Connection
```bash
curl https://your-app.vercel.app/api/whatsapp/test
```

### 2. Send Test Message
```bash
curl -X POST https://your-app.vercel.app/api/whatsapp/test \
  -H "Content-Type: application/json" \
  -d '{"phone": "5511999999999", "message": "Test message"}'
```

### 3. Manually Trigger Cron
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-app.vercel.app/api/cron/send-followups
```

### 4. Test Webhook Locally
```bash
# Terminal 1: Run dev server
npm run dev

# Terminal 2: Expose with ngrok
ngrok http 3000

# Use ngrok URL in Meta webhook config
```

### 5. End-to-End Test
1. Create test surgery with today's follow-up
2. Trigger cron or manual send
3. Check WhatsApp for questionnaire
4. Reply with symptoms
5. Verify response saved in database
6. Check AI-generated response received

---

## Red Flags Detection

### Universal Red Flags
- **Fever ≥38°C**: High severity (≥39°C = critical)
- **Severe bleeding**: Critical
- **Extreme pain (≥9/10)**: Critical
- **Very intense pain (≥8/10)**: High severity

### Surgery-Specific

**Hemorroidectomia**:
- Urinary retention >12h: Critical
- Urinary retention 6-12h: High
- No bowel movement D+3: Medium

**Fístula**:
- Purulent discharge: High
- Cellulitis signs: High

**Fissura**:
- Active bleeding: High
- No bowel movement D+4: Medium

**Pilonidal**:
- Purulent discharge: High
- Cellulitis signs: High

---

## AI Analysis

Uses Claude Sonnet 4.5 to:
1. Assess overall risk level
2. Identify non-obvious red flags
3. Generate empathetic response
4. Provide care-seeking advice when needed

**Input**:
- Surgery type and day
- Patient demographics
- Comorbidities
- Questionnaire responses
- Detected red flags

**Output**:
- Risk level (low/medium/high/critical)
- Additional red flags
- Empathetic response message
- Care-seeking advice
- Reasoning (optional)

---

## Deployment Checklist

### Pre-Deployment
- [ ] Create Meta Business Account
- [ ] Set up WhatsApp Business API
- [ ] Get Phone Number ID and Access Token
- [ ] Create webhook verify token
- [ ] Generate CRON_SECRET

### Deployment
- [ ] Add all environment variables to Vercel
- [ ] Deploy to Vercel
- [ ] Configure webhook URL in Meta dashboard
- [ ] Verify webhook
- [ ] Subscribe to webhook fields

### Post-Deployment
- [ ] Create message templates
- [ ] Submit templates for approval
- [ ] Test WhatsApp connection
- [ ] Test webhook with ngrok or production
- [ ] Test cron job
- [ ] Perform end-to-end test

### Production
- [ ] Monitor Vercel logs
- [ ] Monitor WhatsApp API usage
- [ ] Track message delivery rates
- [ ] Review AI analysis accuracy
- [ ] Collect patient feedback

---

## Monitoring

### Logs to Check
- **Vercel Function Logs**: API errors, webhook processing
- **Vercel Cron Logs**: Scheduled job execution
- **Database**: Follow-up status, response data
- **WhatsApp API**: Message delivery status

### Metrics to Track
- Follow-up send success rate
- Response rate from patients
- Red flag detection rate
- Doctor alert frequency
- AI analysis quality

---

## Future Enhancements

### Potential Features
1. **Rich Media**: Support images, PDFs for educational content
2. **Interactive Buttons**: Quick reply buttons for common responses
3. **Appointment Scheduling**: Book follow-up appointments via WhatsApp
4. **Medication Reminders**: Automated reminders for medications
5. **Voice Messages**: Support voice note responses
6. **Multi-language**: Support for other languages
7. **Analytics Dashboard**: Visualize follow-up data
8. **NLP Improvements**: Better response parsing with advanced NLP
9. **Template Versioning**: A/B test different questionnaires
10. **Patient Satisfaction**: CSAT survey after recovery

### Technical Improvements
1. **Message Queue**: Redis/BullMQ for reliable message delivery
2. **Retry Logic**: Exponential backoff for failed sends
3. **Webhook Signature**: Enable HMAC validation
4. **Database Indexes**: Optimize queries for large datasets
5. **Caching**: Cache questionnaires and templates
6. **Error Alerting**: Sentry/LogRocket integration
7. **Testing**: Unit and integration tests
8. **Type Safety**: Stricter TypeScript types

---

## Cost Considerations

### WhatsApp Business API
- **Conversation-based pricing**: ~$0.005-0.05 per conversation (varies by country)
- **First 1,000 conversations/month**: Free
- **Template messages**: Counted as user-initiated conversations

### Vercel
- **Hobby Plan**: 100 GB-hrs/month free (sufficient for most use cases)
- **Pro Plan**: If scaling beyond hobby limits

### Claude AI API
- **Sonnet 4.5**: ~$3 per million input tokens, ~$15 per million output tokens
- Estimated cost: ~$0.01-0.03 per analysis

**Estimated monthly cost** (100 patients, 7 follow-ups each):
- WhatsApp: ~$20-35 (700 conversations)
- Vercel: $0 (within free tier)
- Claude AI: ~$7-21
- **Total**: ~$27-56/month

---

## Support and Resources

### Documentation
- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

### Community
- [Meta Developer Community](https://developers.facebook.com/community/)
- [Vercel Discord](https://vercel.com/discord)

---

## Conclusion

The WhatsApp Business API integration and Vercel Cron Jobs are now fully implemented and ready for deployment. The system provides:

✅ **Automated follow-ups** on D+1, D+2, D+3, D+5, D+7, D+10, D+14
✅ **Intelligent response processing** with AI analysis
✅ **Red flag detection** for patient safety
✅ **Doctor alerts** for high-risk cases
✅ **Empathetic communication** via Claude AI
✅ **Comprehensive logging** and error handling
✅ **Manual override** capabilities for testing and resending
✅ **React component** for status visualization

Follow the setup guide in `WHATSAPP_SETUP.md` to complete the deployment.
