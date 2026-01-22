# Rating Display Issue - Investigation

## Problem
User submitted multiple ratings on the same day, but dashboard shows "Based on 1 rating"

## Root Cause Analysis

### Database Schema
```prisma
model ChatSession {
  id            String    @id
  rating        Int?      // Single rating field
  ratingComment String?
  ratedAt       DateTime?
}
```

**The issue**: Each `ChatSession` can only store ONE rating. When you submit multiple ratings from the same chat session (without closing the widget), each new rating OVERWRITES the previous one.

### How It Works
1. User opens chat widget → creates `ChatSession`
2. User rates 5★ → updates `ChatSession.rating = 5`
3. User rates 4★ again → updates `ChatSession.rating = 4` (overwrites 5★)
4. User rates 3★ again → updates `ChatSession.rating = 3` (overwrites 4★)

Result: Only the LAST rating (3★) is saved

### Why This Happens
- Widget reuses the same `chatSessionId` within a session
- `saveRating()` method does an UPDATE instead of INSERT
- Database design: 1 session = 1 rating

## Solution Options

### Option 1: Multiple Ratings per Session (RECOMMENDED)
Create a separate `Rating` table:

```prisma
model Rating {
  id            String    @id @default(cuid())
  chatSessionId String
  shop          String
  rating        Int       // 1-5
  comment       String?
  createdAt     DateTime  @default(now())

  session       ChatSession @relation(fields: [chatSessionId], references: [id])

  @@index([shop, createdAt])
}

model ChatSession {
  id      String   @id
  ratings Rating[] // Multiple ratings allowed
}
```

**Benefits**:
- Can track multiple ratings per session
- Rating history preserved
- Can analyze rating changes over time

### Option 2: Prevent Re-rating (SIMPLER)
Modify widget to only allow ONE rating per session:

```javascript
// In widget code
let hasRated = false;

async function submitRatingToBackend(rating, overlay) {
  if (hasRated) {
    alert('You have already rated this conversation');
    return;
  }

  // ... submit rating ...
  hasRated = true; // Prevent re-rating

  // Hide rating button after submission
  document.querySelector('.rating-button').style.display = 'none';
}
```

**Benefits**:
- Quick fix, no database changes
- Prevents confusion
- Matches industry standards (can't re-rate same conversation)

### Option 3: One Rating per New Conversation
Force new chat session when rating modal closes:

```javascript
// After rating submitted
currentChatSessionId = null; // Reset
// Next message creates new session
```

## Testing Instructions

### Verify Current Behavior
1. Open chat widget
2. Have a conversation
3. Rate 5★ → check `/api/check-ratings`
4. Rate 4★ again → check `/api/check-ratings` again
5. **Expected**: Still shows only 1 rating (4★, not 5★)

### Check Database
```sql
SELECT id, rating, ratedAt, updatedAt
FROM ChatSession
WHERE shop = 'your-shop.myshopify.com'
AND rating IS NOT NULL
ORDER BY ratedAt DESC;
```

If you see only 1 row with recent `updatedAt`, that confirms the overwrite issue.

## Recommended Fix: Option 2

Since most apps only allow ONE rating per conversation, implement Option 2:

1. Prevent multiple ratings on same session
2. Hide rating button after submission
3. Show "Thanks for your feedback!" message
4. New conversation = new rating opportunity

This matches user expectations and prevents data overwriting.
