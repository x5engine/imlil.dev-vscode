# 💳 Billing & Payment Implementation

## Overview

Complete billing infrastructure for Imlil.dev EmbedAPI Pro plan, supporting Solo (BYOK) and Pro (SaaS) plans with multi-currency payment processing.

---

## 📁 Files Created

### Core Billing Infrastructure
- ✅ `src/core/billing/usage-tracker.ts` - Usage tracking and statistics
- ✅ `src/core/billing/stripe.ts` - Stripe payment integration
- ✅ `src/core/billing/bank-wire.ts` - Bank wire transfer support

### UI Components
- ✅ `webview-ui/src/components/billing/UsageDashboard.tsx` - Usage statistics dashboard
- ✅ `webview-ui/src/components/billing/PricingPlans.tsx` - Plan selection UI
- ✅ `webview-ui/src/components/billing/PaymentMethod.tsx` - Payment method selection
- ✅ `webview-ui/src/components/billing/index.ts` - Component exports

### UI Foundation
- ✅ `webview-ui/src/components/ui/card.tsx` - Card component for billing UI
- ✅ `webview-ui/src/components/ui/tabs.tsx` - Tabs component for payment methods

---

## 🔧 Integration Points

### Usage Tracking
- **Location**: `src/api/providers/embedapi/embedapi-handler.ts`
- **Method**: `getTotalCost()` automatically records usage for Pro plan users
- **Storage**: VS Code global state (persistent across sessions)

### Pricing Calculation
- **Location**: `src/api/providers/embedapi/pricing.ts`
- **Features**:
  - Solo vs Pro plan detection
  - Multi-currency support (USD, EUR, MAD)
  - Token-based cost calculation
  - Cache read/write pricing

---

## 💰 Pricing Plans

### Solo Plan (BYOK - Bring Your Own Key)
- **Cost**: Free (extension is free)
- **Payment**: User pays AI providers directly
- **Features**:
  - Use your own API keys
  - No platform fees
  - Full control over costs
  - No usage tracking through Imlil.dev

### Pro Plan (SaaS)
- **Cost**: Pay-per-use (token-based billing)
- **Payment**: Stripe (credit card) or Bank Wire
- **Features**:
  - No API key management
  - Usage dashboard and analytics
  - Multi-currency support
  - Automatic billing

---

## 📊 Usage Tracking

### What's Tracked
- Input tokens
- Output tokens
- Cache read tokens (if available)
- Cache write tokens (if available)
- Cost per request
- Model used
- Timestamp
- Plan type (Solo/Pro)

### Statistics Available
- Total cost (by period: day/week/month/all)
- Total tokens (input + output)
- Total requests
- Average cost per request
- Usage by time period

### Storage
- **Location**: VS Code global state
- **Key**: `imlildev.embedapi.usage.v1`
- **Retention**: 90 days of history
- **Auto-pruning**: Old events automatically removed

---

## 💳 Payment Methods

### Stripe (Credit Card)
- **Integration**: `StripeBilling` class
- **Features**:
  - Payment intent creation
  - Secure card processing
  - Payment history
  - Multi-currency support

**API Endpoints** (expected from EmbedAPI backend):
- `POST /v1/billing/stripe/payment-intent` - Create payment
- `POST /v1/billing/stripe/confirm-payment` - Confirm payment
- `GET /v1/billing/stripe/payments` - Get payment history

### Bank Wire Transfer
- **Integration**: `BankWireBilling` class
- **Features**:
  - Bank account details retrieval
  - Payment request creation
  - Payment status tracking
  - Multi-currency support (USD, EUR, MAD)

**API Endpoints** (expected from EmbedAPI backend):
- `POST /v1/billing/bank-wire/request` - Request payment
- `GET /v1/billing/bank-wire/{id}` - Get payment status
- `GET /v1/billing/bank-wire/payments` - Get payment history
- `GET /v1/billing/bank-wire/details/{currency}` - Get bank details

---

## 🎨 UI Components

### UsageDashboard
**Props**:
- `planType: "solo" | "pro"` - Current plan type

**Features**:
- Period selector (day/week/month/all)
- Cost display with currency formatting
- Token usage statistics
- Request count
- Average cost per request

**Usage**:
```tsx
<UsageDashboard planType="pro" />
```

### PricingPlans
**Props**:
- `currentPlan?: "solo" | "pro"` - Current plan
- `onSelectPlan: (plan: "solo" | "pro") => void` - Plan selection handler

**Features**:
- Side-by-side plan comparison
- Feature lists
- Popular badge
- Current plan indicator

**Usage**:
```tsx
<PricingPlans 
  currentPlan="solo" 
  onSelectPlan={(plan) => handlePlanChange(plan)} 
/>
```

### PaymentMethod
**Props**:
- `onPaymentSuccess?: () => void` - Success callback

**Features**:
- Currency selector (USD, EUR, MAD)
- Stripe tab (credit card)
- Bank wire tab
- Preset amount buttons
- Custom amount input

**Usage**:
```tsx
<PaymentMethod onPaymentSuccess={() => refreshBalance()} />
```

---

## 🔌 Backend Integration

### Required EmbedAPI Endpoints

#### Stripe
1. `POST /v1/billing/stripe/payment-intent`
   - Request: `{ amount, currency, description?, metadata? }`
   - Response: `{ id, clientSecret, amount, currency, status }`

2. `POST /v1/billing/stripe/confirm-payment`
   - Request: `{ paymentIntentId }`
   - Response: `{ id, status, ... }`

3. `GET /v1/billing/stripe/payments`
   - Query: `?limit=10`
   - Response: `{ payments: [...] }`

#### Bank Wire
1. `POST /v1/billing/bank-wire/request`
   - Request: `{ amount, currency, description? }`
   - Response: `{ payment: { id, amount, currency, status, reference, bankDetails, ... } }`

2. `GET /v1/billing/bank-wire/{id}`
   - Response: `{ payment: {...} }`

3. `GET /v1/billing/bank-wire/payments`
   - Query: `?limit=10`
   - Response: `{ payments: [...] }`

4. `GET /v1/billing/bank-wire/details/{currency}`
   - Response: `{ bankDetails: { accountName, accountNumber, bankName, swiftCode?, iban?, routingNumber? } }`

---

## 📝 Message Types (Webview ↔ Extension)

### From Webview to Extension
```typescript
// Fetch usage statistics
{
  type: "fetchEmbedAPIUsageStats",
  payload: { period: "day" | "week" | "month" | "all" }
}

// Create Stripe payment intent
{
  type: "createStripePaymentIntent",
  payload: { amount: number, currency: "usd" | "eur" | "mad" }
}

// Request bank wire payment
{
  type: "requestBankWirePayment",
  payload: { amount: number, currency: "USD" | "EUR" | "MAD" }
}
```

### From Extension to Webview
```typescript
// Usage statistics response
{
  type: "embedAPIUsageStatsResponse",
  payload: { stats: UsageStats }
}

// Payment intent created
{
  type: "stripePaymentIntentCreated",
  payload: { paymentIntent: StripePaymentIntent }
}

// Bank wire details
{
  type: "bankWireDetailsResponse",
  payload: { payment: BankWirePayment }
}
```

---

## 🚀 Next Steps

1. **Backend Integration**: Connect to actual EmbedAPI billing endpoints
2. **Stripe.js Integration**: Add Stripe.js for client-side payment confirmation
3. **Webview Message Handlers**: Implement message handlers in extension
4. **Profile View Integration**: Add billing section to ProfileView
5. **Settings Integration**: Add billing settings to SettingsView
6. **Testing**: Unit and integration tests for billing flows

---

## 📚 Related Files

- `src/api/providers/embedapi/pricing.ts` - Pricing calculation
- `src/api/providers/embedapi/embedapi-handler.ts` - Usage recording
- `webview-ui/src/components/kilocode/profile/ProfileView.tsx` - Profile view (integration point)

---

**Status**: Core infrastructure complete, backend integration pending
**Last Updated**: 2025-01-XX

