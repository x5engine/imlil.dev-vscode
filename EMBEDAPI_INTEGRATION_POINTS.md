# 🔌 EmbedAPI Integration Points - Complete Reference

This document identifies **every location** in the codebase where API calls are made that need to be routed through EmbedAPI.

---

## 📍 Core API Handler Locations

### 1. Main API Handler Factory
**File**: `src/api/index.ts`
**Function**: `buildApiHandler(configuration: ProviderSettings): ApiHandler`
**Current Behavior**: Routes to various providers (Anthropic, OpenAI, Gemini, etc.)
**Action Required**: 
- Add `EmbedAPIHandler` as primary handler
- Route all provider requests through EmbedAPI
- Maintain backward compatibility during transition

**Lines**: 118-218
```typescript
// CURRENT:
switch (apiProvider) {
  case "kilocode":
    return new KilocodeOpenrouterHandler(options)
  case "anthropic":
    return new AnthropicHandler(options)
  // ... 30+ other providers
}

// NEW:
if (options.embedApiToken) {
  return new EmbedAPIHandler(options) // Primary route
}
// Fallback to direct providers only if EmbedAPI not configured
```

---

### 2. KiloCode OpenRouter Handler (Primary Target)
**File**: `src/api/providers/kilocode-openrouter.ts`
**Class**: `KiloCodeOpenrouterHandler`
**Current Behavior**: Routes through KiloCode backend's OpenRouter endpoint
**Action Required**: 
- Refactor to use EmbedAPI instead
- Keep same interface for backward compatibility
- Update base URL to EmbedAPI endpoint

**Key Methods**:
- `createMessage()` - Lines 84-296 (chat completions)
- `streamFim()` - Lines 147-186 (fill-in-the-middle)
- `fetchModel()` - Lines 109-132 (model fetching)
- `getTotalCost()` - Lines 74-85 (cost calculation)

**Migration Strategy**:
```typescript
// Replace KiloCode backend URL
const baseApiUrl = getKiloUrlFromToken("https://api.kilocode.ai/api/", ...)
// With EmbedAPI URL
const baseApiUrl = options.embedApiBaseUrl || "https://api.embedapi.com/v1"
```

---

## 📍 Chat Completions (Primary Use Case)

### 3. Base Provider Implementation
**File**: `src/api/providers/base-provider.ts`
**Class**: `BaseProvider`
**Current Behavior**: Base class for all providers
**Action Required**: 
- Ensure EmbedAPI handler extends this correctly
- No changes needed (inheritance works)

### 4. OpenAI-Compatible Provider Base
**File**: `src/api/providers/base-openai-compatible-provider.ts`
**Class**: `BaseOpenAiCompatibleProvider`
**Current Behavior**: Base for OpenAI-compatible APIs
**Action Required**: 
- EmbedAPI should extend this if it's OpenAI-compatible
- Or create custom EmbedAPI base if different protocol

### 5. Anthropic Handler
**File**: `src/api/providers/anthropic.ts`
**Class**: `AnthropicHandler`
**Current Behavior**: Direct calls to Anthropic API
**Action Required**: 
- Route through EmbedAPI when EmbedAPI token present
- Keep as fallback for BYOK users

**Key Methods**:
- `createMessage()` - Main chat completion
- `countTokens()` - Token counting

### 6. OpenAI Handler
**File**: `src/api/providers/openai.ts`
**Class**: `OpenAiHandler`
**Current Behavior**: Direct calls to OpenAI API
**Action Required**: 
- Route through EmbedAPI
- Maintain OpenAI-compatible interface

**Key Methods**:
- `createMessage()` - Lines 84-296
- `completePrompt()` - Single completion

### 7. Gemini Handler
**File**: `src/api/providers/gemini.ts`
**Class**: `GeminiHandler`
**Current Behavior**: Direct calls to Google Gemini API
**Action Required**: 
- Route through EmbedAPI
- Maintain Gemini-specific features (multimodal, etc.)

### 8. Mistral Handler
**File**: `src/api/providers/mistral.ts`
**Class**: `MistralHandler`
**Current Behavior**: Direct calls to Mistral API
**Action Required**: 
- Route through EmbedAPI
- Support Codestral FIM features

### 9. OpenRouter Handler
**File**: `src/api/providers/openrouter.ts`
**Class**: `OpenRouterHandler`
**Current Behavior**: Routes through OpenRouter aggregator
**Action Required**: 
- Replace with EmbedAPI routing
- EmbedAPI should provide similar aggregation

---

## 📍 Embedding Services (Code Indexing)

### 10. OpenAI Embedder
**File**: `src/services/code-index/embedders/openai.ts`
**Class**: `OpenAiEmbedder`
**Current Behavior**: Direct calls to OpenAI embeddings API
**Action Required**: 
- Create `EmbedAPIEmbedder` class
- Route all embedding requests through EmbedAPI

**Key Methods**:
- `createEmbeddings()` - Main embedding generation
- `validateConfiguration()` - API key validation

### 11. Gemini Embedder
**File**: `src/services/code-index/embedders/gemini.ts`
**Class**: `GeminiEmbedder`
**Current Behavior**: Direct calls to Google Gemini embeddings
**Action Required**: 
- Route through EmbedAPI
- Support Gemini embedding models

### 12. OpenRouter Embedder
**File**: `src/services/code-index/embedders/openrouter.ts`
**Class**: `OpenRouterEmbedder`
**Current Behavior**: Routes through OpenRouter for embeddings
**Action Required**: 
- Replace with EmbedAPI routing

### 13. OpenAI-Compatible Embedder
**File**: `src/services/code-index/embedders/openai-compatible.ts`
**Class**: `OpenAICompatibleEmbedder`
**Current Behavior**: Generic OpenAI-compatible embedder
**Action Required**: 
- Use as base for EmbedAPI embedder if compatible
- Or create custom EmbedAPI embedder

### 14. Code Index Service Factory
**File**: `src/services/code-index/service-factory.ts`
**Class**: `CodeIndexServiceFactory`
**Current Behavior**: Creates embedder instances based on config
**Action Required**: 
- Add EmbedAPI as embedder option
- Update factory method to support EmbedAPI

**Key Method**: `createEmbedder()` - Lines 26-254

---

## 📍 LLM Adapter Layer (Continuedev Core)

### 15. LLM API Constructor
**File**: `src/services/continuedev/core/llm/openai-adapters/index.ts`
**Function**: `constructLlmApi(config: LLMConfig): BaseLlmApi | undefined`
**Current Behavior**: Creates LLM API instances for various providers
**Action Required**: 
- Add EmbedAPI as provider option
- Route through EmbedAPI when configured

**Lines**: 60-159
```typescript
// Add case:
case "embedapi":
  return new EmbedAPIApi(config)
```

### 16. OpenAI API Adapter
**File**: `src/services/continuedev/core/llm/openai-adapters/apis/OpenAI.ts`
**Class**: `OpenAIApi`
**Current Behavior**: OpenAI-specific LLM adapter
**Action Required**: 
- Create `EmbedAPIApi` class following same pattern
- Implement `BaseLlmApi` interface

### 17. Anthropic API Adapter
**File**: `src/services/continuedev/core/llm/openai-adapters/apis/Anthropic.ts`
**Class**: `AnthropicApi`
**Current Behavior**: Anthropic-specific LLM adapter
**Action Required**: 
- Route through EmbedAPI if EmbedAPI token present

---

## 📍 FIM (Fill-in-the-Middle) Completions

### 18. FIM Provider Interface
**File**: `src/api/providers/kilocode/IFimProvider.ts`
**Interface**: `IFimProvider`
**Current Behavior**: Defines FIM completion interface
**Action Required**: 
- Ensure EmbedAPI handler implements this
- Route FIM requests through EmbedAPI

### 19. FIM Streaming
**File**: `src/api/providers/kilocode-openrouter.ts`
**Method**: `streamFim()` - Lines 147-186
**Current Behavior**: Streams FIM completions from KiloCode backend
**Action Required**: 
- Update endpoint to EmbedAPI FIM endpoint
- Maintain streaming interface

**Endpoint Change**:
```typescript
// CURRENT:
const endpoint = new URL("fim/completions", this.apiFIMBase)
// NEW:
const endpoint = new URL("fim/completions", "https://api.embedapi.com/v1")
```

---

## 📍 Model & Pricing Management

### 20. Model Cache Fetcher
**File**: `src/api/providers/fetchers/modelCache.ts`
**Function**: `getModels()`
**Current Behavior**: Fetches available models from providers
**Action Required**: 
- Add EmbedAPI model fetching
- Cache EmbedAPI model list and pricing

### 21. Model Endpoint Cache
**File**: `src/api/providers/fetchers/modelEndpointCache.ts`
**Function**: `getModelEndpoints()`
**Current Behavior**: Fetches model endpoint information
**Action Required**: 
- Add EmbedAPI endpoint fetching
- Map EmbedAPI models to endpoints

### 22. Cost Calculation
**File**: `src/shared/cost.ts`
**Function**: `calculateApiCostInternal()`
**Current Behavior**: Calculates API costs based on model pricing
**Action Required**: 
- Integrate EmbedAPI pricing
- Support dynamic pricing from EmbedAPI
- Handle Solo (BYOK) vs Pro (SaaS) pricing differences

### 23. Model Info Types
**File**: `packages/types/src/model.ts`
**Type**: `ModelInfo`
**Current Behavior**: Defines model information structure
**Action Required**: 
- Ensure EmbedAPI models fit this structure
- Add EmbedAPI-specific fields if needed

---

## 📍 Configuration & Settings

### 24. Provider Settings Type
**File**: `cli/src/types/messages.ts`
**Interface**: `ProviderSettings`
**Current Behavior**: Defines all provider configuration options
**Action Required**: 
- Add EmbedAPI fields:
  ```typescript
  embedApiToken?: string
  embedApiOrganizationId?: string
  embedApiBaseUrl?: string
  embedApiModel?: string
  embedApiPlan?: "solo" | "pro"
  ```

### 25. Global Settings
**File**: `packages/types/src/global-settings.ts`
**Type**: `RooCodeSettings`
**Current Behavior**: Global extension settings
**Action Required**: 
- Add `embedApiToken` to `SECRET_STATE_KEYS`
- Add EmbedAPI configuration options

### 26. Settings Validation
**File**: `webview-ui/src/utils/validate.ts`
**Function**: `validateApiConfiguration()`
**Current Behavior**: Validates provider configuration
**Action Required**: 
- Add EmbedAPI validation
- Check EmbedAPI token format
- Validate EmbedAPI model selection

### 27. Provider Settings Manager
**File**: `src/core/config/ProviderSettingsManager.ts`
**Class**: `ProviderSettingsManager`
**Current Behavior**: Manages provider settings storage
**Action Required**: 
- Support EmbedAPI settings
- Handle migration from KiloCode to EmbedAPI

---

## 📍 Task & Message Handling

### 28. Task Class
**File**: `src/core/task/Task.ts`
**Class**: `Task`
**Current Behavior**: Main task orchestration
**Action Required**: 
- Ensure tasks work with EmbedAPI handler
- Track EmbedAPI usage per task
- Log EmbedAPI costs

### 29. Cline Provider
**File**: `src/core/webview/ClineProvider.ts`
**Class**: `ClineProvider`
**Current Behavior**: Main webview provider
**Action Required**: 
- Support EmbedAPI in provider selection
- Display EmbedAPI models in UI
- Show EmbedAPI pricing

### 30. Message Creation
**File**: `src/core/assistant-message/`
**Current Behavior**: Creates assistant messages
**Action Required**: 
- Ensure EmbedAPI responses are handled correctly
- Support EmbedAPI-specific message formats

---

## 📍 Usage Tracking & Billing

### 31. Usage Tracking
**File**: `src/api/providers/embedapi/` (NEW)
**Action Required**: 
- Track token usage per request
- Log costs for Pro plan users
- Report usage to EmbedAPI backend

### 32. Billing Integration
**File**: `src/core/billing/` (NEW)
**Action Required**: 
- Integrate with EmbedAPI billing API
- Handle Solo (BYOK) vs Pro (SaaS) plans
- Support Stripe and bank wire payments

---

## 📍 Testing & Validation

### 33. API Handler Tests
**Files**: `src/api/providers/__tests__/`
**Action Required**: 
- Create `embedapi-handler.spec.ts`
- Test all EmbedAPI handler methods
- Test error handling and fallbacks

### 34. Embedder Tests
**Files**: `src/services/code-index/embedders/__tests__/`
**Action Required**: 
- Create `embedapi.spec.ts`
- Test embedding generation
- Test batch processing

### 35. Integration Tests
**Files**: `apps/playwright-e2e/`
**Action Required**: 
- Add EmbedAPI integration test scenarios
- Test end-to-end workflows with EmbedAPI
- Test pricing and billing flows

---

## 📊 Summary Statistics

### Total Integration Points: **35+**

**By Category**:
- **Core API Handlers**: 9 files
- **Embedding Services**: 5 files
- **LLM Adapters**: 3 files
- **FIM Completions**: 2 files
- **Model & Pricing**: 4 files
- **Configuration**: 4 files
- **Task Handling**: 3 files
- **Billing & Usage**: 2 files
- **Testing**: 3+ files

### Priority Levels

**🔴 Critical (Must Migrate First)**:
1. `src/api/index.ts` - Main handler factory
2. `src/api/providers/kilocode-openrouter.ts` - Primary handler
3. `src/api/providers/embedapi/` - NEW: Create EmbedAPI handler
4. `src/services/code-index/embedders/` - Embedding services

**🟡 High Priority (Week 2-3)**:
5. All provider handlers (Anthropic, OpenAI, Gemini, Mistral)
6. LLM adapter layer
7. FIM completions
8. Model fetching and pricing

**🟢 Medium Priority (Week 3-4)**:
9. Configuration management
10. Settings validation
11. Usage tracking
12. Testing infrastructure

**🔵 Low Priority (Week 4-5)**:
13. Billing integration
14. Advanced features
15. Documentation updates

---

## 🔄 Migration Strategy

### Phase 1: Foundation (Week 1)
- Create EmbedAPI handler structure
- Implement basic chat completions
- Set up configuration

### Phase 2: Core Features (Week 2)
- Migrate all chat completions
- Migrate embeddings
- Update model fetching

### Phase 3: Advanced Features (Week 3)
- FIM completions
- LLM adapter layer
- Pricing integration

### Phase 4: Polish (Week 4+)
- Testing
- Documentation
- Performance optimization

---

## 📝 Notes

- **Backward Compatibility**: Keep existing providers as fallback during transition
- **Feature Flags**: Use feature flags to enable/disable EmbedAPI routing
- **Gradual Rollout**: Enable EmbedAPI for beta users first
- **Monitoring**: Track error rates and performance metrics

---

**Last Updated**: [Current Date]
**Status**: Ready for Implementation

