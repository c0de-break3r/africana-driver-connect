Read AGENTS.md fully and strictly follow it before starting.

Build (corporate)/complete-profile.tsx, reachable via a "Complete your organization profile" banner on the Corporate dashboard.

Capture:

- Company name, industry, company size
- Departments (add/edit multiple)
- Billing contact / accounts email

Store in store/useCorporateProfileStore.ts. Implement using Zustand with AsyncStorage persistence (same pattern as other profile stores).
