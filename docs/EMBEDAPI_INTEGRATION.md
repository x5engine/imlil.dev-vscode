# 🔌 EmbedAPI Integration Guide

## Overview

This guide explains how EmbedAPI is integrated into the Imlil.dev VS Code extension, including setup, configuration, and usage.

---

## 📋 Table of Contents

1. [Architecture](#architecture)
2. [Setup & Configuration](#setup--configuration)
3. [API Integration](#api-integration)
4. [Usage Tracking](#usage-tracking)
5. [Error Handling](#error-handling)
6. [Testing](#testing)

---

## 🏗️ Architecture

### Core Components

1. **EmbedAPIClient** (`src/api/providers/embedapi/embedapi-client.ts`)
   - Wrapper around `@embedapi/core` npm package
   - Handles all communication with EmbedAPI backend
   - Supports generation, streaming, and embeddings

2. **EmbedAPIHandler** (`src/api/providers/embedapi/embedapi-handler.ts`)
   - Main handler that routes AI requests through EmbedAPI
   - Extends `OpenRouterHandler` for compatibility
   - Handles pricing calculation and usage tracking

3. **Pricing Module** (`src/api/providers/embedapi/pricing.ts`)
   - Solo vs Pro plan detection
   - Cost calculation
   - Multi-currency support (USD, EUR, MAD)

4. **Usage Tracker** (`src/core/billing/usage-tracker.ts`)
   - Tracks token usage and costs for Pro plan users
   - Statistics by period (day/week/month/all)
   - 90-day history retention

---

## ⚙️ Setup & Configuration

### 1. Install Dependencies

```bash
pnpm install
```

This will install `@embedapi/core` which is already added to `package.json`.

### 2. Configure EmbedAPI

#### Option A: Via Settings UI
1. Open VS Code Settings
2. Navigate to **Providers** section
3. Select or create an API configuration
4. Choose **EmbedAPI** as the provider
5. Enter your EmbedAPI token
6. (Optional) Set plan type: **Solo** (BYOK) or **Pro** (SaaS)

#### Option B: Via Configuration File
```json
{
  "apiProvider": "embedapi",
  "embedApiToken": "your-api-key-here",
  "embedApiPlan": "pro",
  "embedApiModel": "claude-3-5-sonnet",
  "embedApiBaseUrl": "https://api.embedapi.com/v1"
}
```

### 3. Plan Types

#### Solo Plan (BYOK - Bring Your Own Key)
- **Cost**: Free (extension is free)
- **Payment**: User pays AI providers directly
- **Usage Tracking**: No tracking through Imlil.dev
- **Configuration**: Set `embedApiPlan: "solo"` or leave unset (defaults to solo if token exists)

#### Pro Plan (SaaS)
- **Cost**: Pay-per-use (token-based billing)
- **Payment**: Handled on EmbedAPI website (https://app.embedapi.com/billing)
- **Usage Tracking**: Automatic tracking and statistics
- **Configuration**: Set `embedApiPlan: "pro"`

---

## 🔌 API Integration

### Request Flow

```
User Request
    ↓
EmbedAPIHandler.createMessage()
    ↓
EmbedAPIClient.generate() or streamGenerate()
    ↓
@embedapi/core → EmbedAPI Backend
    ↓
Response → Usage Tracking (Pro plan only)
    ↓
User receives response
```

### Code Example

```typescript
import { EmbedAPIHandler } from "./api/providers/embedapi/embedapi-handler"

const handler = new EmbedAPIHandler({
  embedApiToken: "your-api-key",
  embedApiPlan: "pro",
  embedApiModel: "claude-3-5-sonnet",
})

// Create a message
const stream = handler.createMessage(
  "You are a helpful assistant.",
  [
    { role: "user", content: "Hello!" }
  ]
)

// Process stream
for await (const chunk of stream) {
  if (chunk.type === "text") {
    console.log(chunk.text)
  } else if (chunk.type === "usage") {
    console.log("Tokens used:", chunk.inputTokens, chunk.outputTokens)
  }
}
```

### Model Fetching

Models are automatically fetched from EmbedAPI when the handler is initialized:

```typescript
// Models are cached and available via:
const model = handler.getModel()
console.log(model.id) // e.g., "claude-3-5-sonnet"
console.log(model.info.inputPrice) // Price per million input tokens
```

---

## 📊 Usage Tracking

### Automatic Tracking (Pro Plan)

Usage is automatically tracked for Pro plan users:

1. **When**: Every API call via `EmbedAPIHandler.getTotalCost()`
2. **What's Tracked**:
   - Input tokens
   - Output tokens
   - Cache read tokens (if available)
   - Cache write tokens (if available)
   - Cost per request
   - Model used
   - Timestamp
   - Plan type

3. **Storage**: VS Code global state (`imlildev.embedapi.usage.v1`)
4. **Retention**: 90 days of history

### Accessing Usage Statistics

```typescript
import { EmbedAPIUsageTracker } from "./core/billing/usage-tracker"

const tracker = EmbedAPIUsageTracker.getInstance()

// Get stats for a period
const stats = tracker.getUsageStats("month")
console.log(stats.totalCost) // Total cost in USD
console.log(stats.totalTokens) // Total tokens used
console.log(stats.totalRequests) // Number of requests

// Get usage events
const events = tracker.getUsageEvents("week")
events.forEach(event => {
  console.log(event.model, event.cost)
})
```

### Usage Dashboard

The usage dashboard is available in:
- **ProfileView**: Shows usage for current plan
- **Settings → Billing & Usage**: Full billing management

---

## ⚠️ Error Handling

### Credit Exhaustion

When credits are exhausted, the EmbedAPI backend will return an error. The extension will:

1. Display the error to the user
2. Show a link to the billing page (https://app.embedapi.com/billing)
3. Allow user to add credits on the website

### Error Types

```typescript
// Insufficient credits
{
  error: {
    type: "insufficient_credits",
    message: "Insufficient credits. Please add credits at https://app.embedapi.com/billing"
  }
}

// Invalid API key
{
  error: {
    type: "authentication_error",
    message: "Invalid API key"
  }
}

// Rate limit exceeded
{
  error: {
    type: "rate_limit_error",
    message: "Rate limit exceeded"
  }
}
```

### Handling Errors

```typescript
try {
  const stream = handler.createMessage(systemPrompt, messages)
  for await (const chunk of stream) {
    // Process chunks
  }
} catch (error: any) {
  if (error.message?.includes("insufficient_credits")) {
    // Show billing link
    vscode.window.showErrorMessage(
      "Insufficient credits. Please add credits at https://app.embedapi.com/billing"
    )
  } else {
    // Handle other errors
    console.error("API error:", error)
  }
}
```

---

## 🧪 Testing

### Unit Tests

Run unit tests for EmbedAPI components:

```bash
# Test EmbedAPI handler
pnpm test src/api/providers/embedapi/__tests__/embedapi-handler.spec.ts

# Test EmbedAPI client
pnpm test src/api/providers/embedapi/__tests__/embedapi-client.spec.ts

# Test pricing module
pnpm test src/api/providers/embedapi/__tests__/pricing.spec.ts

# Test usage tracker
pnpm test src/core/billing/__tests__/usage-tracker.spec.ts
```

### Integration Tests

```bash
# Test EmbedAPI integration
pnpm test src/api/providers/embedapi/__tests__/embedapi-integration.spec.ts
```

### Manual Testing

1. **Configure EmbedAPI**:
   - Add EmbedAPI token in settings
   - Set plan type (Solo or Pro)

2. **Test Chat Completion**:
   - Open chat
   - Send a message
   - Verify response

3. **Test Usage Tracking** (Pro plan):
   - Make several API calls
   - Check usage dashboard
   - Verify statistics

4. **Test Error Handling**:
   - Use invalid API key
   - Verify error message
   - Test credit exhaustion scenario

---

## 📝 Configuration Options

### EmbedAPI Settings

| Setting | Type | Description | Default |
|---------|------|-------------|---------|
| `embedApiToken` | `string` | EmbedAPI API key (required) | - |
| `embedApiPlan` | `"solo" \| "pro"` | Plan type | `"solo"` if token exists |
| `embedApiModel` | `string` | Model ID to use | `"claude-3-5-sonnet"` |
| `embedApiBaseUrl` | `string` | EmbedAPI base URL | `"https://api.embedapi.com/v1"` |
| `embedApiOrganizationId` | `string?` | Organization ID (optional) | - |

### Environment Variables

```bash
# EmbedAPI API key (for development)
EMBEDAPI_API_KEY=your-key-here

# EmbedAPI base URL (for custom deployments)
EMBEDAPI_BASE_URL=https://api.embedapi.com/v1
```

---

## 🔗 Related Documentation

- [Billing Documentation](./BILLING.md)
- [Pricing Guide](./PRICING.md)
- [Migration Guide](./MIGRATION.md)
- [API Reference](../src/api/providers/embedapi/README.md)

---

## 🐛 Troubleshooting

### Issue: "EmbedAPI API key is required"

**Solution**: Add your EmbedAPI token in Settings → Providers → EmbedAPI

### Issue: "Failed to fetch models from EmbedAPI"

**Solution**: 
1. Check your API key is valid
2. Verify network connectivity
3. Check EmbedAPI service status

### Issue: Usage not being tracked

**Solution**:
1. Ensure you're on Pro plan (`embedApiPlan: "pro"`)
2. Check VS Code global state is accessible
3. Verify usage tracker is initialized

### Issue: Cost calculation incorrect

**Solution**:
1. Verify model pricing is fetched correctly
2. Check cache token handling
3. Review pricing module logs

---

## 📚 API Reference

### EmbedAPIClient

```typescript
class EmbedAPIClient {
  constructor(options: {
    apiKey: string
    baseUrl?: string
    organizationId?: string
  })

  generate(options: {
    model: string
    messages: Array<{ role: string; content: string }>
    temperature?: number
    maxTokens?: number
    stream?: boolean
  }): Promise<any>

  streamGenerate(options: {
    model: string
    messages: Array<{ role: string; content: string }>
    temperature?: number
    maxTokens?: number
  }): AsyncGenerator<string>

  createEmbeddings(options: {
    model: string
    input: string | string[]
  }): Promise<any>
}
```

### EmbedAPIHandler

```typescript
class EmbedAPIHandler extends OpenRouterHandler {
  constructor(options: ApiHandlerOptions)

  getTotalCost(lastUsage: CompletionUsage): number
  getModel(): { id: string; info: ModelInfo }
  fetchModel(): Promise<ModelRecord>
  createMessage(...): ApiStream
  streamFim(...): ApiStream
}
```

---

**Last Updated**: 2025-01-XX
**Version**: 1.0.0

