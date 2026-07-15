Read AGENTS.md fully — AI features enhance the marketplace experience.

Build AI-powered features for driver recommendations, pricing suggestions, and support.

## Tasks

1. **Create `convex/ai.ts`** (Convex Actions — server-side, calls AI provider API):
   - `suggestPrice({ occasionType, location, date, duration })` — suggest a fair price range based on historical booking data, time of day, demand
   - `generateJobDescription({ title, category, requirements })` — AI-generated job description draft for owners posting jobs
   - `summarizeReviews({ driverId })` — summarize common themes from driver's reviews (e.g., "Punctual, professional, great with kids")
   - `smartReply({ conversationId, lastMessages })` — suggest quick replies for chat messages
2. **Create AI provider integration**:
   - Store API key as Convex environment variable (`AI_API_KEY`)
   - Create `convex/ai-provider.ts` — abstract provider interface (OpenAI, Anthropic, etc.)
   - Implement basic prompt templates for each feature
3. **Create AI UI components**:
   - `components/ai-price-suggestion.tsx` — "AI suggests $X-$Y for this booking" with accept/edit
   - `components/ai-job-draft.tsx` — generated description with edit capability
   - `components/ai-review-summary.tsx` — badge on driver profile: "Punctual • Professional • 4.8★"
   - `components/ai-quick-reply.tsx` — chip buttons above chat input: "Yes, I'm available", "What time works?"
4. **Integrate into existing screens**:
   - Client booking flow: show AI price suggestion
   - Owner job posting: offer AI description generation
   - Driver profile: show AI review summary
   - Chat: show quick reply chips

## Rules

- AI calls are server-side only (API key never on client)
- AI features are optional — never block the user flow waiting for AI
- Show loading state while AI processes, then show result
- Allow user to edit/override AI suggestions
- Run `bun run typecheck` and `bun run lint` — fix all errors
