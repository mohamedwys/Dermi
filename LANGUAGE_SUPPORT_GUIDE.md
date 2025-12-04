# Language Support Configuration Guide

## Overview
The Shopibot widget now automatically detects the user's browser language and sends it to the N8N workflow. Your AI must use this information to respond in the user's language.

## What's Been Added

### 1. Widget Enhancement (✅ Complete)
- **Browser language detection**: `navigator.language || navigator.userLanguage`
- **Sends to backend**: `context.locale` (e.g., "fr", "fr-FR", "es", "de", etc.)
- **Currency detection**: `context.currency` from Shopify shop settings

### 2. Backend Enhancement (✅ Complete)
- **Language instruction**: Automatically added to N8N request context
- **Field**: `context.languageInstruction` contains explicit instruction for AI
- **Locale**: `context.locale` contains the detected language code

## How to Configure Your N8N Workflow

### Step 1: Access Language Data in N8N

Your N8N workflow receives this data in the webhook payload:

```json
{
  "userMessage": "j'aimerais connaitre vos meilleur ventes",
  "products": [...],
  "context": {
    "locale": "fr-FR",
    "languageInstruction": "IMPORTANT: Respond in the user's language (fr-FR). Detect the language from their message and use the same language in your response.",
    "currency": "EUR",
    ...
  }
}
```

### Step 2: Update Your AI Prompt

In your **"OpenAI Chat Model"** or **"AI Agent"** node, update the system message to include:

```
You are a helpful e-commerce sales assistant.

LANGUAGE INSTRUCTION: {{ $json.context.languageInstruction }}

Always respond in the same language as the user's message. The user's browser language is: {{ $json.context.locale }}

If the user writes in French, respond in French.
If the user writes in Spanish, respond in Spanish.
If the user writes in English, respond in English.
And so on for all languages.

[Rest of your instructions...]
```

### Step 3: Alternative - Direct Locale Check

You can also check the locale directly in your prompt:

```
You are a helpful e-commerce sales assistant.

{{#if ($json.context.locale.startsWith('fr'))}}
Réponds toujours en français.
{{else if ($json.context.locale.startsWith('es'))}}
Responde siempre en español.
{{else if ($json.context.locale.startsWith('de'))}}
Antworte immer auf Deutsch.
{{else}}
Always respond in English.
{{/if}}

[Rest of your instructions...]
```

### Step 4: Test Different Languages

Test your chatbot with messages in different languages:

- **French**: "Quels sont vos meilleurs produits ?"
- **Spanish**: "¿Cuáles son sus mejores productos?"
- **German**: "Was sind Ihre besten Produkte?"
- **English**: "What are your best products?"

## Quick Fix for Your Current Workflow

If you want the simplest solution, add this **SINGLE LINE** to the beginning of your AI system prompt in N8N:

```
{{ $json.context.languageInstruction }}
```

This will automatically inject the language instruction for all non-English requests.

## Example N8N Configuration

### Before (English Only):
```
System: You are a helpful sales assistant. Help customers find products.
```

### After (Multi-Language):
```
System: {{ $json.context.languageInstruction }}

You are a helpful sales assistant. Help customers find products.
```

That's it! The AI will now respond in the user's language.

## Supported Languages

The system detects any language supported by the user's browser, including:
- French (fr, fr-FR, fr-CA)
- Spanish (es, es-ES, es-MX)
- German (de, de-DE)
- Italian (it)
- Portuguese (pt, pt-BR)
- Arabic (ar)
- Chinese (zh, zh-CN)
- Japanese (ja)
- And many more...

## Troubleshooting

**Problem**: Chatbot still responds in English
**Solution**: Make sure you added `{{ $json.context.languageInstruction }}` to your AI system prompt in N8N

**Problem**: Language detection is wrong
**Solution**: The browser language is detected automatically. Users can change their browser language in settings.

**Problem**: Want to force a specific language
**Solution**: You can hardcode a language in the N8N workflow by setting the locale manually, or allow users to choose their language in the widget settings.

---

## Files Modified
- `extensions/sales-assistant-widget/blocks/ai_sales_assistant.liquid` - Added browser language detection
- `app/routes/apps.sales-assistant-api.tsx` - Added language instruction
- `app/services/n8n.service.ts` - Updated interface with languageInstruction field
