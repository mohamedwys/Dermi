# AI Sales Assistant Widget - Integration Guide

## Overview

The AI Sales Assistant now has **TWO** ways to be embedded in Shopify stores:

1. **Theme Extension** (Recommended) - Uses Shopify theme blocks
2. **Standalone Script** (New!) - Simple script tag embedding

---

## Option 1: Theme Extension (Recommended)

### Installation
1. Install the app from Shopify App Store
2. Go to **Theme Customizer** → **App Embeds**
3. Enable "AI Sales Assistant"
4. Configure settings (position, colors, text)
5. Save and publish

### Features
- Full Shopify theme integration
- Liquid template with 2800+ lines of functionality
- Sentiment analysis
- Product recommendations
- Advanced analytics
- Voice API support
- Multi-language support

### File Location
```
extensions/sales-assistant-widget/blocks/ai_sales_assistant.liquid
```

---

## Option 2: Standalone Script (New!)

### Installation

Add this script tag to your theme's `theme.liquid` file before `</body>`:

```html
<script src="https://your-app.com/api/widget?shop={{ shop.domain }}"></script>
```

### Example Integration

```liquid
<!-- In theme.liquid, before </body> -->
{% if shop.metafields.ai_assistant.enabled %}
  <script src="{{ 'https://your-app-url.com/api/widget?shop=' | append: shop.domain }}"></script>
{% endif %}
```

### Features
- ✅ Self-contained (no dependencies)
- ✅ Fully responsive (mobile + desktop)
- ✅ Customizable (colors, position, text)
- ✅ Product recommendations with images
- ✅ Typing indicators
- ✅ Conversation history
- ✅ Accessibility (ARIA labels, keyboard nav)
- ✅ XSS protection
- ✅ 1-hour browser caching
- ✅ 370+ lines of production code

### Widget Configuration

The widget automatically fetches settings from `/api/widget-settings`:

```json
{
  "enabled": true,
  "position": "bottom-right",
  "buttonText": "Ask AI Assistant",
  "chatTitle": "AI Sales Assistant",
  "welcomeMessage": "Hello! How can I help you today?",
  "inputPlaceholder": "Ask me anything...",
  "primaryColor": "#ee5cee"
}
```

### Customization

Merchants can customize via the app's Settings page:

1. Go to Apps → AI Sales Assistant
2. Click "Settings"
3. Customize:
   - Position (bottom-right, bottom-left, top-right, top-left)
   - Colors (primary color for branding)
   - Text (button, title, welcome message, placeholder)
   - N8N webhook URL (optional)

---

## Widget Architecture

### Standalone Script (`/api/widget`)

```
┌─────────────────────────────────────────┐
│  Browser requests:                       │
│  /api/widget?shop=myshop.myshopify.com  │
└──────────────────┬──────────────────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │  api.widget.tsx     │
         │  (370+ lines)       │
         │                     │
         │  - Generates JS     │
         │  - Injects config   │
         │  - Returns script   │
         └──────────┬──────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │  Widget JavaScript   │
         │                      │
         │  • Fetch settings    │
         │  • Create UI         │
         │  • Handle chat       │
         │  • Show products     │
         └──────────┬───────────┘
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
┌──────────────────┐  ┌───────────────────┐
│ GET /api/        │  │ POST /api/        │
│ widget-settings  │  │ widget-settings   │
│                  │  │                   │
│ → Fetch config   │  │ → Send message    │
│ → Return colors  │  │ → Get AI reply    │
│ → Return text    │  │ → Get products    │
└──────────────────┘  └───────────────────┘
```

### API Endpoints

#### GET `/api/widget`
- **Purpose:** Serve standalone widget JavaScript
- **Parameters:** `?shop=SHOP_DOMAIN`
- **Returns:** Complete chat widget (application/javascript)
- **Caching:** 1 hour

#### GET `/api/widget-settings`
- **Purpose:** Fetch widget configuration
- **Parameters:** `?shop=SHOP_DOMAIN`
- **Returns:** Settings object (colors, text, position)
- **Rate Limit:** 300 requests/minute

#### POST `/api/widget-settings`
- **Purpose:** Send chat messages to AI
- **Parameters:** `?shop=SHOP_DOMAIN`
- **Body:** `{ message, sessionId, context }`
- **Returns:** `{ response, recommendations, confidence }`
- **Rate Limit:** 100 requests/minute

---

## Widget Features

### 1. Chat Interface
- **Message Bubbles:** User (right) vs Assistant (left)
- **Timestamps:** Auto-generated for each message
- **Typing Indicator:** 3-dot animation while AI responds
- **Auto-scroll:** Messages auto-scroll to bottom
- **Message History:** Maintains conversation context

### 2. Product Recommendations
- **Cards:** Image + title + price
- **Clickable:** Links to product pages
- **Responsive:** Adapts to mobile screens
- **Hover Effects:** Smooth animations

### 3. UI/UX
- **Toggle Button:** Floating circular button
- **Animations:** Slide-in, fade, scale effects
- **Icon Transitions:** Chat ↔ Close icon rotation
- **Color Theming:** Customizable primary color
- **Mobile Optimized:** Full-screen on mobile

### 4. Accessibility
- **ARIA Labels:** All interactive elements labeled
- **Keyboard Navigation:** Tab, Enter, Escape keys
- **Focus Management:** Auto-focus on input when opened
- **Screen Reader Support:** Semantic HTML + ARIA

### 5. Security
- **XSS Protection:** HTML entity escaping
- **Color Sanitization:** Only hex colors allowed
- **Input Limits:** 2000 character maximum
- **CORS:** Configured for Shopify domains
- **No eval():** No unsafe code patterns

### 6. Performance
- **Lazy Loading:** Widget loads after DOM ready
- **Caching:** 1-hour browser cache
- **Minified:** Efficient JavaScript
- **Single Request:** All-in-one script
- **No Dependencies:** Vanilla JS only

---

## Testing the Widget

### Local Development

1. **Start the app:**
   ```bash
   npm run dev
   ```

2. **Access widget:**
   ```
   http://localhost:3000/api/widget?shop=test.myshopify.com
   ```

3. **Test in browser:**
   ```html
   <!DOCTYPE html>
   <html>
   <body>
     <h1>Widget Test</h1>
     <script src="http://localhost:3000/api/widget?shop=test.myshopify.com"></script>
   </body>
   </html>
   ```

### Production Testing

1. **Deploy app** to your server
2. **Update SHOPIFY_APP_URL** environment variable
3. **Test widget URL:**
   ```
   https://your-app.com/api/widget?shop=SHOP.myshopify.com
   ```

### Verification Checklist

- [ ] Widget appears in bottom-right corner
- [ ] Toggle button shows/hides chat window
- [ ] Welcome message displays correctly
- [ ] Can type and send messages
- [ ] AI responds with relevant answers
- [ ] Product recommendations show (if applicable)
- [ ] Typing indicator appears during loading
- [ ] Mobile responsive (test on phone)
- [ ] Keyboard navigation works (Tab, Enter, Esc)
- [ ] Colors match settings
- [ ] No console errors

---

## Troubleshooting

### Widget Not Appearing

**Check:**
1. Script tag is before `</body>`
2. Shop domain is correct
3. Widget is enabled in settings
4. No JavaScript errors in console
5. SHOPIFY_APP_URL is configured

**Debug:**
```javascript
// In browser console
window.aiSalesAssistantLoaded // Should be true
```

### Widget Not Responding

**Check:**
1. API endpoints are accessible
2. N8N webhook is configured (or using fallback)
3. Network tab shows successful POST requests
4. CORS headers are correct

**Debug:**
```bash
# Test settings endpoint
curl "https://your-app.com/api/widget-settings?shop=SHOP.myshopify.com"

# Test chat endpoint
curl -X POST "https://your-app.com/api/widget-settings?shop=SHOP.myshopify.com" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","sessionId":"test"}'
```

### Styling Issues

**Check:**
1. No CSS conflicts with theme
2. Z-index is high enough (999999)
3. Primary color is valid hex (#RRGGBB)

**Fix:**
```css
/* Add to theme if needed */
#ai-widget-container {
  z-index: 999999 !important;
}
```

### Mobile Issues

**Check:**
1. Viewport meta tag exists:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1">
   ```
2. No fixed positioning conflicts
3. Chat window fits screen height

---

## Comparison: Theme Extension vs Standalone

| Feature | Theme Extension | Standalone Script |
|---------|----------------|-------------------|
| **Installation** | Theme Customizer | Script tag |
| **Lines of Code** | 2878 lines | 370 lines |
| **Features** | Advanced (sentiment, voice) | Core (chat, products) |
| **Customization** | Theme + App settings | App settings only |
| **Performance** | Fast (theme integrated) | Fast (1hr cache) |
| **Mobile** | ✅ Responsive | ✅ Responsive |
| **Accessibility** | ✅ Full ARIA | ✅ Full ARIA |
| **Use Case** | Shopify stores | Any website |
| **Dependencies** | Shopify theme | None |
| **Best For** | Merchants using themes | Headless/custom sites |

---

## Next Steps

### For Merchants
1. Install the app
2. Choose integration method
3. Customize colors and text
4. Test on your storefront
5. Monitor analytics

### For Developers
1. Review widget code: `app/routes/api.widget.tsx`
2. Test locally
3. Deploy to production
4. Update app documentation
5. Submit for Shopify App Store review

---

## Support

- **Documentation:** See README.md
- **Issues:** https://github.com/your-repo/issues
- **Email:** support@your-app.com

---

## Version History

### v2.0.0 (Current)
- ✅ Complete standalone widget implementation
- ✅ 370+ lines of production JavaScript
- ✅ Full chat functionality
- ✅ Product recommendations
- ✅ Mobile responsive
- ✅ Accessibility features
- ✅ XSS protection

### v1.0.0 (Previous)
- ❌ Incomplete (TTS blocking code only)
- ❌ No chat UI
- ❌ Not functional

---

**Updated:** December 5, 2025
**Status:** ✅ Production Ready
