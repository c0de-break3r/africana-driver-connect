Read AGENTS.md fully. The job marketplace connects owners posting jobs with drivers applying.

Build the complete job posting and application flow.

## Current State

Convex schema has `jobs` and `jobApplications` tables with indexes. Basic queries/mutations exist in `convex/jobs.ts` (list, getApplications, create, apply). Owner dashboard (prompt 15) provides the UI shell.

## Tasks

1. **Extend `convex/jobs.ts`**:
   - `getById(jobId)` — full job detail with application count
   - `update(jobId, fields)` — owner edits job (title, description, pay, status)
   - `close(jobId)` — owner closes job (set status to "closed")
   - `getByOwner(ownerId, paginationOpts)` — owner's jobs with pagination
   - `getMatching(driverId, paginationOpts)` — jobs matching driver's preferences (location, category)
2. **Extend job applications**:
   - `apply(jobId, coverNote?)` — prevent duplicate applications
   - `updateStatus(applicationId, status)` — owner accepts/rejects (verify ownership)
   - `getByDriver(driverId, paginationOpts)` — driver's application history
3. **Create job components**:
   - `components/job-card.tsx` — reusable job card (title, category icon, location, pay, status badge, posted time)
   - `components/application-card.tsx` — driver info, experience, rating, cover note, status
   - `components/job-filters.tsx` — category, location, pay range, sort options
4. **Create screens**:
   - `(driver)/job-detail.tsx` — full job details, company info, apply button
   - `(driver)/(tabs)/search-jobs.tsx` — browse and filter open jobs
   - `(owner)/edit-job.tsx` — edit existing job
5. **Create `data/jobCategories.ts`** — typed job categories: chauffeur, truck, bus, school, ride-hailing, corporate, delivery, heavy equipment

## Rules

- Only the job owner can edit/close a job and view applications
- Prevent duplicate applications (check existing application before inserting)
- All data from Convex — reactive queries for real-time updates
- Run `bun run typecheck` and `bun run lint` — fix all errors
