# 💰 Pricing Guide

## Overview

Imlil.dev offers flexible pricing through EmbedAPI with two plans: **Solo** (BYOK) and **Pro** (SaaS).

---

## 📋 Pricing Plans

### Solo Plan (BYOK - Bring Your Own Key)

**Cost**: **Free** (extension is free)

**Features**:
- ✅ Use your own API keys
- ✅ No platform fees
- ✅ Full control over costs
- ✅ Pay providers directly
- ✅ No usage tracking through Imlil.dev

**Best For**:
- Users who already have API keys from providers
- Users who want full cost control
- Users who prefer direct payment to providers

**How It Works**:
1. Get API keys from your preferred AI providers (OpenAI, Anthropic, etc.)
2. Configure them in the extension
3. Pay providers directly at their rates
4. No additional fees from Imlil.dev

---

### Pro Plan (SaaS)

**Cost**: **Pay-per-use** (token-based billing)

**Features**:
- ✅ No API key management
- ✅ Pay-as-you-go pricing
- ✅ Multi-currency support (USD, EUR, MAD)
- ✅ Usage dashboard and analytics
- ✅ Automatic billing
- ✅ Credits managed on website

**Best For**:
- Users who want simplicity
- Users who prefer consolidated billing
- Teams and organizations
- Users who want usage analytics

**How It Works**:
1. Sign up for EmbedAPI Pro plan
2. Add credits on the website (https://app.embedapi.com/billing)
3. Use the service - credits are consumed automatically
4. Add more credits when needed

**Payment Methods**:
- Stripe (Credit Card) - Instant
- Bank Wire Transfer - Manual confirmation

---

## 💵 Cost Calculation

### Token-Based Pricing

Costs are calculated based on:
- **Input Tokens**: Tokens in your prompts
- **Output Tokens**: Tokens in AI responses
- **Cache Read Tokens**: Tokens read from cache (if available)
- **Cache Write Tokens**: Tokens written to cache (if available)

### Formula

```
Total Cost = (Input Tokens / 1M) × Input Price
          + (Output Tokens / 1M) × Output Price
          + (Cache Read Tokens / 1M) × Cache Read Price
          + (Cache Write Tokens / 1M) × Cache Write Price
```

### Example

**Model**: Claude 3.5 Sonnet
- Input Price: $3.00 per million tokens
- Output Price: $15.00 per million tokens

**Usage**:
- Input Tokens: 1,000,000
- Output Tokens: 500,000

**Calculation**:
```
Input Cost = (1,000,000 / 1,000,000) × $3.00 = $3.00
Output Cost = (500,000 / 1,000,000) × $15.00 = $7.50
Total Cost = $3.00 + $7.50 = $10.50
```

---

## 🌍 Multi-Currency Support

### Supported Currencies

- **USD** ($): US Dollar
- **EUR** (€): Euro
- **MAD** (د.م.): Moroccan Dirham

### Currency Selection

Currency is determined by:
1. Your EmbedAPI account settings
2. Model pricing (some models may have different currencies)
3. Payment method selected

### Currency Conversion

Basic conversion rates are available in the pricing module. For production, use real-time exchange rates from an API.

---

## 📊 Usage Tracking

### Solo Plan
- **No tracking** through Imlil.dev
- Track usage directly with your provider
- Full control over cost monitoring

### Pro Plan
- **Automatic tracking** of all API calls
- Statistics available in usage dashboard
- 90-day history retention
- Period-based filtering (day/week/month/all)

### What's Tracked

- Total cost
- Total tokens (input + output)
- Total requests
- Average cost per request
- Usage by time period
- Model usage breakdown

---

## 💳 Adding Credits (Pro Plan)

### Step 1: Open Billing Page

1. Click "Open Billing Page" in ProfileView or Settings
2. Or visit: https://app.embedapi.com/billing

### Step 2: Add Credits

1. Select payment method (Stripe or Bank Wire)
2. Enter amount
3. Complete payment

### Step 3: Credits Applied

- Credits are added immediately (Stripe)
- Or after confirmation (Bank Wire)
- API calls resume automatically

---

## ⚠️ Credit Exhaustion

### What Happens

When credits run out:
1. API returns error: `insufficient_credits`
2. Extension displays error message
3. Link to billing page provided
4. User adds credits on website
5. Service resumes

### Error Message

```
Error: Insufficient credits. 
Please add credits at https://app.embedapi.com/billing
```

---

## 🔄 Plan Switching

### From Solo to Pro

1. Open Settings → Providers
2. Select your EmbedAPI configuration
3. Change `embedApiPlan` to `"pro"`
4. Save configuration
5. Usage tracking begins automatically

### From Pro to Solo

1. Open Settings → Providers
2. Select your EmbedAPI configuration
3. Change `embedApiPlan` to `"solo"`
4. Save configuration
5. Usage tracking stops (data retained)

---

## 📈 Cost Optimization Tips

### 1. Use Cache When Available
- Cache reads are cheaper than regular input tokens
- Enable prompt caching for repeated prompts

### 2. Choose Appropriate Models
- Use smaller models for simple tasks
- Use larger models only when needed

### 3. Optimize Prompts
- Shorter prompts = fewer input tokens
- Clear instructions = fewer output tokens

### 4. Monitor Usage
- Check usage dashboard regularly
- Set up alerts (if available)
- Review usage patterns

---

## ❓ FAQ

### Q: How do I know how much I'm spending?

**A**: Check the usage dashboard in ProfileView or Settings → Billing & Usage. It shows:
- Total cost for selected period
- Total tokens used
- Number of requests
- Average cost per request

### Q: Can I set spending limits?

**A**: Currently, spending limits are managed on the EmbedAPI website. Set up alerts or limits there.

### Q: What happens if I exceed my budget?

**A**: The API will return an error when credits are exhausted. Add more credits on the website to continue.

### Q: Are there any hidden fees?

**A**: No. You only pay for what you use. No monthly fees, no setup fees, no hidden charges.

### Q: Can I get a refund?

**A**: Refunds are handled by EmbedAPI. Contact their support at https://app.embedapi.com/support

### Q: How accurate is cost calculation?

**A**: Cost calculation is accurate to the token level. Prices are based on model pricing from EmbedAPI.

### Q: Can I use multiple currencies?

**A**: Your account currency is set on the EmbedAPI website. All billing is in that currency.

---

## 🔗 Related Documentation

- [Billing Guide](./BILLING.md)
- [EmbedAPI Integration](./EMBEDAPI_INTEGRATION.md)
- [Usage Dashboard Guide](./BILLING.md#usage-dashboard)

---

**Last Updated**: 2025-01-XX
**Version**: 1.0.0

