Read AGENTS.md fully.

Build real-time in-app messaging between clients, drivers, and owners using Convex.

## Tasks

1. **Add `conversations` table to Convex schema**:
   - `participants` (array of user IDs, max 2 for 1:1 chat)
   - `bookingId` (optional ref bookings — context for the conversation)
   - `lastMessageAt` (number)
   - `lastMessagePreview` (optional string)
   - `createdAt` (number)
   - Index: by_participant (compound with lastMessageAt for sorted inbox)
2. **Add `messages` table to Convex schema**:
   - `conversationId` (ref conversations, indexed)
   - `senderId` (ref users)
   - `body` (string)
   - `type` (union: "text", "image", "location", "booking_update")
   - `read` (boolean)
   - `createdAt` (number)
3. **Create `convex/chat.ts`**:
   - `getConversations(userId)` — inbox: all conversations sorted by lastMessageAt
   - `getMessages(conversationId, paginationOpts)` — paginated messages for a conversation
   - `send(conversationId, body, type?)` — send a message (verify participant)
   - `startConversation(participantId, bookingId?)` — create or return existing conversation
   - `markRead(conversationId)` — mark all messages as read
   - `getUnreadCount(userId)` — total unread messages
4. **Create chat UI**:
   - `components/message-bubble.tsx` — sent/received message bubble with timestamp
   - `components/conversation-row.tsx` — inbox row: avatar, name, last message, time, unread badge
   - `components/chat-input.tsx` — text input with send button
5. **Create screens**:
   - `(driver)/(tabs)/messages.tsx` — replace placeholder with real inbox
   - `(client)/(tabs)/messages.tsx` — replace placeholder with real inbox
   - `(driver)/chat.tsx` — conversation detail with messages
   - `(client)/chat.tsx` — conversation detail with messages
6. **Create `src/hooks/useChat.ts`** — real-time message subscriptions via Convex

## Rules

- Messages are real-time — use Convex reactive queries
- Only conversation participants can read/send messages
- Show typing indicator (optional stretch)
- Run `bun run typecheck` and `bun run lint` — fix all errors
