Read AGENTS.md fully.

Set up deployment pipeline for the app across Android, iOS, and web.

## Tasks

1. **EAS Build configuration** (`eas.json`):
   - Development profile: dev-client enabled, debug mode
   - Preview profile: production build for internal testing
   - Production profile: release build for app stores
   - Configure Android and iOS build settings
2. **EAS Submit configuration**:
   - Android: Google Play Console setup, internal testing track
   - iOS: App Store Connect setup, TestFlight distribution
   - Web: deploy to Vercel or Netlify
3. **Environment variables**:
   - Document all required env vars (Clerk key, Convex URL, MetaMap flow ID)
   - Set up EAS Secrets for build-time env vars
   - Differentiate development vs production Convex deployments
4. **App store assets**:
   - App icon (all sizes: 1024x1024 for iOS, 512x512 for Android)
   - Splash screen
   - Feature graphic (Google Play)
   - Screenshots for app stores (at least 5 per platform)
5. **App store metadata**:
   - App name, subtitle, description
   - Privacy policy URL
   - Terms of service URL
   - Category: Travel & Navigation / Business
   - Content rating questionnaire
6. **CI/CD pipeline** (optional stretch):
   - GitHub Actions workflow for:
     - Lint + typecheck on PR
     - Run tests on PR
     - Build preview on merge to main
     - Submit to stores on release tag
7. **Update management**:
   - Configure `expo-updates` for over-the-air updates
   - Update channels: production, staging
   - Rollback strategy for failed updates

## Deployment Checklist

- [ ] All env vars documented and set in EAS Secrets
- [ ] App icons and splash screens configured
- [ ] EAS Build profiles configured
- [ ] Convex production deployment configured
- [ ] Clerk production instance configured
- [ ] Privacy policy and ToS pages created
- [ ] App store listings created
- [ ] Test builds verified on physical devices
- [ ] OTA updates configured

## Rules

- Never deploy with development keys in production
- Test builds on physical devices before submission
- Use EAS Update for quick fixes, full builds for native changes
- Run `bun run typecheck` and `bun run lint` before building
