Read AGENTS.md fully — Convex is the primary backend for data persistence.

Implement file storage for documents, profile images, and vehicle photos using Convex storage.

## Tasks

1. **Create `src/lib/storage.ts`** — helper to generate Convex upload URLs and upload files
2. **Create Convex mutations** in `convex/storage.ts`:
   - `generateUploadUrl` — returns a Convex storage upload URL
   - `getDownloadUrl(storageId)` — returns a download URL for a stored file
   - `deleteFile(storageId)` — removes a file from storage
3. **Create document upload flow**:
   - Driver license photo upload (from `license-verify.tsx` camera captures)
   - Vehicle registration documents (from owner onboarding)
   - Profile image upload (from profile/settings screens)
4. **Update schema** — `vehicles.documents[]` already uses `v.id("_storage")`. Ensure `verifications` table stores file references.
5. **Create `useFileUpload` hook** (`src/hooks/useFileUpload.ts`) — handles upload state, progress, error handling, and Convex storage calls
6. **Update `complete-profile.tsx`** — replace placeholder with real document upload using `useFileUpload`

## File Types

- **License/ID photos** — JPEG/PNG, max 10MB
- **Vehicle documents** — PDF/JPEG/PNG, max 10MB
- **Profile images** — JPEG/PNG, max 5MB

## Rules

- Validate file type and size before upload
- Show upload progress indicator
- Handle upload errors gracefully (retry, cancel)
- Store file references (storage IDs) in Convex tables, not URLs
- Run `bun run typecheck` and `bun run lint` — fix all errors
