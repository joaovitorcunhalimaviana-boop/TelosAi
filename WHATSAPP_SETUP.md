# WhatsApp Business API Integration - Setup Guide

This guide will walk you through setting up WhatsApp Business API integration and Vercel Cron Jobs for automated post-operative follow-ups.

## Table of Contents
1. [WhatsApp Business API Setup](#1-whatsapp-business-api-setup)
2. [Webhook Configuration](#2-webhook-configuration)
3. [Message Templates](#3-message-templates)
4. [Vercel Deployment](#4-vercel-deployment)
5. [Testing](#5-testing)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. WhatsApp Business API Setup

### Prerequisites
- Meta Business Account
- WhatsApp Business Account
- Verified phone number for WhatsApp Business

### Steps

#### 1.1 Create Meta App
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click **My Apps** > **Create App**
3. Select **Business** as the app type
4. Fill in app details and create

#### 1.2 Add WhatsApp Product
1. In your app dashboard, click **Add Product**
2. Find **WhatsApp** and click **Set Up**
3. Select your Meta Business Account

#### 1.3 Get API Credentials
1. Go to **WhatsApp** > **Getting Started**
2. Note down:
   - **Phone Number ID**: Found under "Send and receive messages"
   - **Access Token**: Temporary token (will be replaced with permanent token)

#### 1.4 Create Permanent Access Token
1. Go to **Settings** > **Basic**
2. Note your **App ID** and **App Secret**
3. Go to **WhatsApp** > **Configuration**
4. Generate a **System User Access Token** with `whatsapp_business_messaging` permission
5. Save this token - you'll need it for the `.env` file

#### 1.5 Update Environment Variables
Add to your `.env` file:
```env
WHATSAPP_PHONE_NUMBER_ID="your_phone_number_id"
WHATSAPP_ACCESS_TOKEN="your_permanent_access_token"
WHATSAPP_WEBHOOK_VERIFY_TOKEN="your_custom_verify_token_here"
CRON_SECRET="your_random_secret_for_cron_auth"
```

**Note**: `WHATSAPP_WEBHOOK_VERIFY_TOKEN` can be any random string you create. You'll need it in the next step.

---

## 2. Webhook Configuration

### 2.1 Deploy to Vercel First
Before configuring the webhook, deploy your application to Vercel:

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy
vercel --prod
```

Note your production URL (e.g., `https://your-app.vercel.app`)

### 2.2 Configure Webhook in Meta Dashboard

1. Go to your app dashboard
2. Navigate to **WhatsApp** > **Configuration**
3. Click **Edit** next to "Webhook"
4. Enter the following:
   - **Callback URL**: `https://your-app.vercel.app/api/whatsapp/webhook`
   - **Verify Token**: The same value you set for `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
5. Click **Verify and Save**

### 2.3 Subscribe to Webhook Fields

After verification, subscribe to the following fields:
- ✅ **messages** (required)
- ✅ **message_status** (optional but recommended)

Click **Save**.

### 2.4 Test Webhook

You can test if the webhook is working:
```bash
curl -X GET "https://your-app.vercel.app/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=YOUR_VERIFY_TOKEN&hub.challenge=test"
```

Should return: `test`

---

## 3. Message Templates

WhatsApp Business API requires approved message templates for initial contact.

### 3.1 Understanding Templates

You can only send **template messages** as the first message to a patient. After they reply, you have a 24-hour window to send free-form messages.

### 3.2 Create Templates

1. Go to **WhatsApp** > **Message Templates**
2. Click **Create Template**

### Recommended Templates

#### Template 1: `followup_d1` (Day 1 Follow-up)
```
Category: UTILITY
Language: Portuguese (Brazil)

Header: None

Body:
Olá {{1}}!

Este é o questionário de acompanhamento do primeiro dia após sua cirurgia.

Como você está se sentindo? Por favor, responda as seguintes perguntas:

1. Em uma escala de 0 a 10, qual o nível da sua dor?
2. Conseguiu urinar normalmente?
3. Está tendo sangramento? Se sim, qual a intensidade?
4. Está com febre?

Responda cada pergunta separadamente. Estou aqui para ajudar!

Footer: Dr. João Vitor Viana - Cirurgia Colorretal

Buttons: None
```

#### Template 2: `followup_general` (General Follow-up)
```
Category: UTILITY
Language: Portuguese (Brazil)

Body:
Olá {{1}}!

Este é o questionário de acompanhamento do dia {{2}} após sua cirurgia.

Como você está se sentindo? Responda as perguntas que vou enviar em seguida.

Estou aqui para ajudar com qualquer dúvida ou preocupação!

Footer: Dr. João Vitor Viana

Buttons: None
```

### 3.3 Submit for Approval

1. Review your templates
2. Click **Submit**
3. Wait for Meta approval (usually 1-3 business days)

### 3.4 Update Code (if needed)

If you use templates, update `lib/whatsapp.ts` to use template messages instead of text messages for the initial contact.

---

## 4. Vercel Deployment

### 4.1 Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add all required variables:
   - `DATABASE_URL`
   - `ANTHROPIC_API_KEY`
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `WHATSAPP_ACCESS_TOKEN`
   - `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
   - `CRON_SECRET`
   - `DOCTOR_PHONE_NUMBER` (optional - for alerts)

### 4.2 Verify Cron Configuration

The `vercel.json` file is already configured:
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

This runs daily at 10:00 AM UTC.

**To change the time:**
- `0 10 * * *` = 10:00 AM UTC (7:00 AM BRT)
- `0 13 * * *` = 1:00 PM UTC (10:00 AM BRT)
- `0 14 * * *` = 2:00 PM UTC (11:00 AM BRT)

### 4.3 Verify Deployment

```bash
vercel --prod
```

Check deployment logs:
```bash
vercel logs
```

---

## 5. Testing

### 5.1 Test WhatsApp Connection

Create a test endpoint or use the existing setup:

```bash
curl https://your-app.vercel.app/api/whatsapp/test
```

### 5.2 Test Webhook Locally (Development)

Use ngrok for local testing:

```bash
# Install ngrok
npm i -g ngrok

# Run your dev server
npm run dev

# In another terminal, expose it
ngrok http 3000

# Use the ngrok URL in Meta webhook configuration
# Example: https://abc123.ngrok.io/api/whatsapp/webhook
```

### 5.3 Test Cron Job

Manual trigger (requires CRON_SECRET):

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-app.vercel.app/api/cron/send-followups
```

### 5.4 Test Complete Flow

1. **Create a test surgery** in your database with a follow-up scheduled for today
2. **Wait for cron to run** or manually trigger it
3. **Check WhatsApp** - you should receive the questionnaire
4. **Reply to the message**
5. **Check the database** - response should be saved with AI analysis

### 5.5 Test Manual Send

```bash
curl -X POST https://your-app.vercel.app/api/followup/FOLLOWUP_ID/send
```

---

## 6. Troubleshooting

### Issue: Webhook verification fails

**Solutions:**
- Ensure `WHATSAPP_WEBHOOK_VERIFY_TOKEN` in `.env` matches the verify token in Meta dashboard
- Check that the webhook URL is correct and accessible
- Review Vercel deployment logs

### Issue: Messages not sending

**Solutions:**
- Verify `WHATSAPP_PHONE_NUMBER_ID` and `WHATSAPP_ACCESS_TOKEN` are correct
- Check if the access token has expired (generate a new permanent token)
- Ensure the phone number is verified in Meta dashboard
- Check Vercel function logs for errors

### Issue: Not receiving incoming messages

**Solutions:**
- Verify webhook is subscribed to "messages" field
- Check webhook callback URL is correct
- Review Vercel function logs for errors
- Ensure the webhook endpoint returns 200 status

### Issue: Cron job not running

**Solutions:**
- Verify `vercel.json` is in the project root
- Check Vercel deployment includes the cron configuration
- Review Vercel Cron Logs in the dashboard
- Ensure CRON_SECRET is set in environment variables

### Issue: Message templates rejected

**Solutions:**
- Follow Meta's [template guidelines](https://developers.facebook.com/docs/whatsapp/message-templates/guidelines)
- Avoid promotional language
- Keep templates informational and transactional
- Resubmit with modifications based on rejection feedback

### Issue: Rate limiting errors

**Solutions:**
- Add delays between messages (already implemented: 500ms)
- Check your messaging tier limits in Meta dashboard
- Request tier upgrade if needed

---

## Message Template Approval Tips

1. **Category Selection**
   - Use `UTILITY` for follow-ups
   - Avoid `MARKETING` unless truly promotional

2. **Content Guidelines**
   - Be clear and concise
   - Medical/health templates are usually approved quickly
   - Avoid special characters or emojis
   - Include opt-out language if required

3. **Variables**
   - Use `{{1}}`, `{{2}}`, etc. for dynamic content
   - First variable is usually patient name
   - Keep variable count minimal

4. **Approval Timeline**
   - Usually 1-3 business days
   - Can be faster for medical/healthcare apps
   - If rejected, review feedback and resubmit

---

## Advanced Configuration

### Enable Signature Validation (Optional)

For additional security, validate webhook signatures:

1. Get your **App Secret** from Meta dashboard
2. Add to `.env`:
   ```env
   WHATSAPP_APP_SECRET="your_app_secret"
   ```
3. Uncomment signature validation in `app/api/whatsapp/webhook/route.ts`

### Doctor Alert Phone Number

To receive alerts for high-risk patients:

```env
DOCTOR_PHONE_NUMBER="5511999999999"
```

Format: Country code + area code + number (no spaces or special characters)

### Custom Cron Schedule

Edit `vercel.json` to change when follow-ups are sent:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-followups",
      "schedule": "0 13 * * *"  // 1 PM UTC = 10 AM BRT
    }
  ]
}
```

---

## Resources

- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Meta Business Help Center](https://www.facebook.com/business/help)

---

## Support

For issues specific to this implementation, please check:
1. Vercel deployment logs
2. Database entries for follow-ups
3. WhatsApp API error responses in logs

For Meta/WhatsApp API issues:
- [Meta Developer Community](https://developers.facebook.com/community/)
- [WhatsApp Business API Support](https://business.facebook.com/business/help/)
