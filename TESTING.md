# 🧪 Testing Guide

## Overview

This guide explains how to test the Imlil.dev extension, including unit tests, integration tests, and manual testing procedures.

---

## 📋 Table of Contents

1. [Running Tests](#running-tests)
2. [Unit Tests](#unit-tests)
3. [Integration Tests](#integration-tests)
4. [Manual Testing](#manual-testing)
5. [Test Coverage](#test-coverage)

---

## 🚀 Running Tests

### Install Dependencies

```bash
pnpm install
```

### Run All Tests

```bash
pnpm test
```

### Run Specific Test Suite

```bash
# EmbedAPI handler tests
pnpm test src/api/providers/embedapi/__tests__/embedapi-handler.spec.ts

# EmbedAPI client tests
pnpm test src/api/providers/embedapi/__tests__/embedapi-client.spec.ts

# Pricing tests
pnpm test src/api/providers/embedapi/__tests__/pricing.spec.ts

# Usage tracker tests
pnpm test src/core/billing/__tests__/usage-tracker.spec.ts

# Integration tests
pnpm test src/api/providers/embedapi/__tests__/embedapi-integration.spec.ts
```

### Run Tests in Watch Mode

```bash
pnpm test --watch
```

### Run Tests with Coverage

```bash
pnpm test --coverage
```

---

## 🔬 Unit Tests

### EmbedAPI Handler Tests

**File**: `src/api/providers/embedapi/__tests__/embedapi-handler.spec.ts`

**Tests**:
- ✅ Handler initialization
- ✅ Plan type detection (Solo/Pro)
- ✅ Cost calculation for Pro plan
- ✅ Upstream cost tracking for Solo plan
- ✅ Usage tracking integration

**Run**:
```bash
pnpm test embedapi-handler.spec.ts
```

### EmbedAPI Client Tests

**File**: `src/api/providers/embedapi/__tests__/embedapi-client.spec.ts`

**Tests**:
- ✅ Client initialization
- ✅ API key validation
- ✅ Base URL handling
- ✅ Organization ID support
- ✅ Method availability

**Run**:
```bash
pnpm test embedapi-client.spec.ts
```

### Pricing Module Tests

**File**: `src/api/providers/embedapi/__tests__/pricing.spec.ts`

**Tests**:
- ✅ Cost calculation
- ✅ Cache token pricing
- ✅ Currency formatting
- ✅ Plan type detection
- ✅ Currency conversion

**Run**:
```bash
pnpm test pricing.spec.ts
```

### Usage Tracker Tests

**File**: `src/core/billing/__tests__/usage-tracker.spec.ts`

**Tests**:
- ✅ Tracker initialization
- ✅ Usage event recording
- ✅ Statistics calculation
- ✅ Period filtering
- ✅ Data management

**Run**:
```bash
pnpm test usage-tracker.spec.ts
```

---

## 🔗 Integration Tests

### EmbedAPI Integration Tests

**File**: `src/api/providers/embedapi/__tests__/embedapi-integration.spec.ts`

**Tests**:
- ✅ End-to-end request flow
- ✅ Plan type integration
- ✅ Usage tracking integration
- ✅ Error handling
- ✅ Cost calculation accuracy

**Run**:
```bash
pnpm test embedapi-integration.spec.ts
```

### Test Scenarios

1. **Solo Plan Flow**:
   - Configure Solo plan
   - Make API call
   - Verify upstream cost returned
   - Verify no usage tracking

2. **Pro Plan Flow**:
   - Configure Pro plan
   - Make API call
   - Verify cost calculated
   - Verify usage tracked

3. **Error Handling**:
   - Test invalid API key
   - Test missing credits
   - Test network errors
   - Test rate limiting

---

## 🧪 Manual Testing

### 1. EmbedAPI Configuration

**Steps**:
1. Open VS Code Settings
2. Navigate to Providers section
3. Create new API configuration
4. Select EmbedAPI as provider
5. Enter API key
6. Set plan type (Solo or Pro)
7. Save configuration

**Expected**:
- Configuration saved successfully
- EmbedAPI appears in provider list
- Settings persist after restart

### 2. Chat Completion

**Steps**:
1. Open chat interface
2. Send a message
3. Wait for response

**Expected**:
- Response received from EmbedAPI
- Usage tracked (Pro plan)
- Cost calculated correctly

### 3. Usage Dashboard

**Steps**:
1. Open ProfileView or Settings → Billing
2. View usage dashboard
3. Change period filter
4. Verify statistics

**Expected**:
- Statistics displayed correctly
- Period filter works
- Cost formatted properly
- Token counts accurate

### 4. Plan Switching

**Steps**:
1. Configure Solo plan
2. Make API call
3. Switch to Pro plan
4. Make another API call
5. Check usage dashboard

**Expected**:
- Solo plan: No usage tracking
- Pro plan: Usage tracked
- Dashboard shows Pro plan usage only

### 5. Credit Exhaustion

**Steps**:
1. Configure Pro plan with low/no credits
2. Make API call
3. Observe error message
4. Click billing link
5. Verify billing page opens

**Expected**:
- Error message displayed
- Billing link functional
- Clear instructions provided

### 6. RTL Support (Arabic)

**Steps**:
1. Change language to Arabic
2. Open billing section
3. Verify RTL layout
4. Check text alignment
5. Verify code blocks stay LTR

**Expected**:
- Interface displays RTL
- Text aligned right
- Code blocks remain LTR
- All components properly styled

### 7. Multi-Language

**Steps**:
1. Switch to French
2. Verify billing translations
3. Switch to Arabic
4. Verify Arabic translations
5. Switch back to English

**Expected**:
- All strings translated
- UI updates immediately
- No missing translations

---

## 📊 Test Coverage

### Current Coverage

- **EmbedAPI Handler**: ✅ Unit tests
- **EmbedAPI Client**: ✅ Unit tests
- **Pricing Module**: ✅ Unit tests
- **Usage Tracker**: ✅ Unit tests
- **Integration**: ✅ Integration tests

### Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Critical paths covered
- **E2E Tests**: Main user flows

### Running Coverage Report

```bash
pnpm test --coverage
```

View coverage report:
- Open `coverage/index.html` in browser
- Review coverage by file
- Identify untested code

---

## 🐛 Debugging Tests

### Enable Verbose Output

```bash
pnpm test --reporter=verbose
```

### Run Single Test

```bash
pnpm test -t "test name"
```

### Debug Mode

```bash
# VS Code: Set breakpoints in test files
# Run: Debug Test (F5)
```

### Common Issues

1. **Mock Not Working**:
   - Check mock setup in `beforeEach`
   - Verify mock path is correct
   - Clear mocks between tests

2. **Async Issues**:
   - Use `await` for async operations
   - Use `vi.waitFor` for async assertions

3. **Import Errors**:
   - Check file paths
   - Verify exports
   - Check TypeScript config

---

## 📝 Writing New Tests

### Test Structure

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest"

describe("ComponentName", () => {
  beforeEach(() => {
    // Setup
  })

  describe("Feature", () => {
    it("should do something", () => {
      // Arrange
      // Act
      // Assert
    })
  })
})
```

### Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly
2. **One Assertion**: One concept per test
3. **Descriptive Names**: Clear test descriptions
4. **Mock External Dependencies**: Isolate units
5. **Test Edge Cases**: Cover boundary conditions

### Example Test

```typescript
describe("calculateCost", () => {
  it("should calculate cost for input and output tokens", () => {
    // Arrange
    const pricing = {
      inputPrice: 3.0,
      outputPrice: 15.0,
      currency: "USD" as const,
    }

    // Act
    const result = calculateCost(1000000, 500000, pricing)

    // Assert
    expect(result.inputCost).toBe(3.0)
    expect(result.outputCost).toBe(7.5)
    expect(result.totalCost).toBe(10.5)
  })
})
```

---

## 🔗 Related Documentation

- [EmbedAPI Integration](./docs/EMBEDAPI_INTEGRATION.md)
- [Billing Guide](./docs/BILLING.md)
- [Development Guide](./PREINSTALL.md)

---

**Last Updated**: 2025-01-XX
**Version**: 1.0.0

