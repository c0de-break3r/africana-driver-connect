Read the "Onboarding & Role Routing Rules" section of AGENTS.md (Act 2, step 14) before starting.

Immediately after the congratulations screen, show a native App Store/Play Store review prompt (use Expo's StoreReview API — ask permission before adding if not already installed, per AGENTS.md).

This must fire here, at peak excitement, not later near social proof. Do not add extra friction (no "are you sure" screen) — trigger it directly.

Check platform support and availability before requesting the review (StoreReview.isAvailableAsync()). Handle rejected or failed requests gracefully without blocking onboarding.

Always route to (onboarding)/loading-summary next in a finally-style path, regardless of whether the prompt was available, shown, or completed.