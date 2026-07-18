# Tech Stack

## Mobile

- React Native
- Expo
- TypeScript (Strict Mode)
- Expo Router

## UI

- NativeWind
- Tailwind CSS
- React Native Reanimated
- React Native Gesture Handler
- React Native SVG
- Expo Blur
- Expo Image
- Expo Vector Icons

## Backend

Primary backend:

- Convex

Use Convex for:

- Database
- Real-time synchronization
- Queries
- Mutations
- Actions
- File metadata
- Business logic

Avoid creating unnecessary REST endpoints when Convex functions are sufficient.

## Authentication

- Clerk

Supported providers:

- Email
- Phone Number (OTP)
- Google
- Apple

Authentication should integrate with Convex.

## State Management

- Zustand
- TanStack Query (if needed for external APIs)

## Storage

- AsyncStorage
- Convex Storage (metadata)
- External object storage for large files when required

## Identity Verification

- Dojah (https://docs.dojah.io/overview/quickstart)

Important:

This application DOES NOT use Dojah's hosted verification UI.

Instead:

- Build the entire KYC flow using our own React Native UI.
- Use Dojah APIs only.
- Use Dojah SDK only where absolutely necessary.
- All onboarding screens, forms, progress indicators, and success states belong to Africana Driver Connect.

Dojah is responsible only for:

- Verification session creation
- Document processing
- Identity verification
- Face verification
- Webhooks
- Verification results

Never redirect users into Dojah's default experience unless explicitly requested.

## Maps

- Google Maps
- Google Places API
- react-native-maps

Features:

- Live GPS
- Geofencing
- Route visualization
- Nearby search
- Driver tracking

## Notifications

- Expo Notifications
- Firebase Cloud Messaging
- APNs

## Payments

Architecture must support:

- Paystack
- Flutterwave
- Stripe
- MTN MoMo
- Vodafone Cash
- AirtelTigo Money

Never tightly couple the codebase to one provider.

Create a payment abstraction layer.

## AI

Primary provider:

- Anthropic Claude

Future support:

- OpenAI
- Gemini

All AI requests MUST go through backend functions.

Never expose API keys.

## Analytics

Support future integration with:

- Firebase Analytics
- PostHog
- Mixpanel

## Error Monitoring

- Sentry

## Testing

- Jest
- React Native Testing Library
- Detox (future)


# Architecture Principles

Every feature should follow this flow.

UI Screen

↓

Reusable Components

↓

Hooks

↓

Stores (Zustand)

↓

Convex Queries / Mutations / Actions

↓

External Services

Business logic should never live inside screens.

Screens should remain as thin as possible.


# Revenue Architecture

The application has two primary revenue streams.

## Subscription Engine

Support:

- Driver Premium
- Owner Premium
- Fleet Premium

The subscription engine must support:

- Feature flags
- Pricing changes
- Regional pricing
- Promotional discounts
- Free trials

Never hardcode pricing.

## Commission Engine

Commission calculations must be centralized.

Support:

- Percentage
- Flat fee
- Promotional rules
- Future configurable policies

Never calculate commissions inside screens.


# Dojah Rules

Africana Driver Connect owns the entire verification experience.

Never use:

- Dojah hosted UI
- Dojah onboarding screens
- Dojah verification screens

Instead:

Our application builds:

- Welcome
- Instructions
- Upload document
- Selfie capture
- Progress
- Processing
- Success
- Failure
- Retry
- Pending review

Only communicate with Dojah through their APIs.

Verification status should be synchronized into Convex.

Possible statuses:

- not_started
- in_progress
- submitted
- pending_review
- verified
- rejected
- expired

Never expose Dojah credentials on the client.


# Convex Rules

Convex is the primary backend.

Use Convex for:

- Database
- Authentication integration
- Queries
- Mutations
- Actions
- Real-time subscriptions

Prefer:

Query

↓

Mutation

↓

Action

Avoid duplicating business logic between the client and Convex.

The client should consume Convex functions rather than implementing business rules locally.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
