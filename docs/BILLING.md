# 💳 Billing & Usage Guide

## Overview

Imlil.dev supports two billing plans for EmbedAPI: **Solo** (BYOK) and **Pro** (SaaS). This guide explains how billing works, how to manage your plan, and how to add credits.

---

## 📋 Table of Contents

1. [Pricing Plans](#pricing-plans)
2. [Usage Tracking](#usage-tracking)
3. [Adding Credits](#adding-credits)
4. [Usage Dashboard](#usage-dashboard)
5. [Error Handling](#error-handling)
6. [FAQ](#faq)

---

## 💰 Pricing Plans

### Solo Plan (BYOK - Bring Your Own Key)

**Cost**: Free (extension is free)

**How it works**:
- You provide your own API keys from AI providers (OpenAI, Anthropic, etc.)
- You pay providers directly
- No platform fees
- No usage tracking through Imlil.dev

**Best for**:
- Users who already have API keys
- Users who want full control over costs
- Users who prefer direct payment to providers

**Configuration**:
```json
{
  "embedApiToken": "your-key",
  "embedApiPlan": "solo"
}
```

### Pro Plan (SaaS)

**Cost**: Pay-per-use (token-based billing)

**How it works**:
- No API key management needed
- Pay for what you use
- Usage tracked automatically
- Credits managed on EmbedAPI website

**Best for**:
- Users who want simplicity
- Users who prefer consolidated billing
- Teams and organizations

**Configuration**:
```json
{
  "embedApiToken": "your-key",
  "embedApiPlan": "pro"
}
```

---

## 📊 Usage Tracking

### What's Tracked (Pro Plan Only)

- **Input Tokens**: Tokens in your prompts
- **Output Tokens**: Tokens in AI responses
- **Cache Read Tokens**: Tokens read from cache (if available)
- **Cache Write Tokens**: Tokens written to cache (if available)
- **Cost**: Calculated cost per request
- **Model**: Which model was used
- **Timestamp**: When the request was made

### Statistics Available

- **Total Cost**: Sum of all costs for the period
- **Total Tokens**: Sum of input + output tokens
- **Total Requests**: Number of API calls
- **Average Cost per Request**: Total cost / Total requests

### Time Periods

- **Past Day**: Last 24 hours
- **Past Week**: Last 7 days
- **Past Month**: Last 30 days
- **All Time**: Complete history (90 days max)

### Storage

- **Location**: VS Code global state
- **Key**: `imlildev.embedapi.usage.v1`
- **Retention**: 90 days
- **Auto-pruning**: Old events automatically removed

---

## 💳 Adding Credits

### For Pro Plan Users

1. **Open Billing Page**:
   - Click "Open Billing Page" button in ProfileView or Settings
   - Or visit: https://app.embedapi.com/billing

2. **Add Credits**:
   - Select payment method (Stripe or Bank Wire)
   - Enter amount
   - Complete payment on website

3. **Credits Applied**:
   - Credits are added to your account immediately
   - API calls will work once credits are available

### Payment Methods

- **Stripe (Credit Card)**: Instant payment processing
- **Bank Wire**: Manual transfer (credits added after confirmation)

### Multi-Currency Support

- **USD** ($): US Dollar
- **EUR** (€): Euro
- **MAD** (د.م.): Moroccan Dirham

---

## 📈 Usage Dashboard

### Accessing the Dashboard

1. **ProfileView**:
   - Open Profile tab
   - Usage dashboard appears automatically for Pro plan users

2. **Settings**:
   - Open Settings
   - Navigate to **Billing & Usage** section
   - View full usage statistics

### Dashboard Features

- **Period Selector**: Choose day/week/month/all
- **Cost Display**: Total cost with currency formatting
- **Token Statistics**: Input, output, and total tokens
- **Request Count**: Number of API calls
- **Average Cost**: Cost per request

### Example Dashboard

```
Usage Dashboard
─────────────────────────────────────
Period: [Past Month ▼]

Total Cost:        $12.50
Total Tokens:      125,000
Total Requests:    45
Avg Cost/Request:  $0.28
```

---

## ⚠️ Error Handling

### Credit Exhaustion

When you run out of credits:

1. **API Returns Error**:
   ```
   {
     "error": {
       "type": "insufficient_credits",
       "message": "Insufficient credits"
     }
   }
   ```

2. **Extension Shows Error**:
   - Error message displayed in chat
   - Link to billing page provided

3. **Add Credits**:
   - Click "Open Billing Page"
   - Add credits on website
   - Resume using the service

### Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| `insufficient_credits` | No credits remaining | Add credits on website |
| `authentication_error` | Invalid API key | Check API key in settings |
| `rate_limit_error` | Too many requests | Wait and retry |
| `model_not_found` | Model unavailable | Check model availability |

---

## ❓ FAQ

### Q: How do I switch between Solo and Pro plans?

**A**: Update your API configuration:
1. Open Settings → Providers
2. Select your EmbedAPI configuration
3. Change `embedApiPlan` to `"solo"` or `"pro"`
4. Save configuration

### Q: Can I use both plans simultaneously?

**A**: No, you can only use one plan at a time per API configuration. You can create multiple configurations with different plans.

### Q: How accurate is usage tracking?

**A**: Usage tracking is accurate to the token level. Costs are calculated based on model pricing from EmbedAPI.

### Q: What happens to my usage data?

**A**: Usage data is stored locally in VS Code global state. It's never sent to external servers except for the actual API calls. Data is retained for 90 days.

### Q: Can I export my usage data?

**A**: Currently, usage data is only accessible through the usage dashboard. Export functionality may be added in the future.

### Q: How do I clear usage data?

**A**: Use the usage tracker API:
```typescript
import { EmbedAPIUsageTracker } from "./core/billing/usage-tracker"

const tracker = EmbedAPIUsageTracker.getInstance()
await tracker.clearAllUsage()
```

### Q: What currency is used for billing?

**A**: The currency depends on your EmbedAPI account settings. The extension supports USD, EUR, and MAD.

### Q: Can I get a refund?

**A**: Refunds are handled by EmbedAPI. Contact their support at https://app.embedapi.com/support

---

## 🔗 Related Documentation

- [EmbedAPI Integration Guide](./EMBEDAPI_INTEGRATION.md)
- [Pricing Details](./PRICING.md)
- [Migration Guide](./MIGRATION.md)

---

## 📞 Support

- **Billing Issues**: https://app.embedapi.com/support
- **Extension Issues**: GitHub Issues
- **Documentation**: See [docs/](./) directory

---

**Last Updated**: 2025-01-XX
**Version**: 1.0.0

