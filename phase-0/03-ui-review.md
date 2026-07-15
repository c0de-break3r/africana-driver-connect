# UI Quality Audit — Africana Driver Connect

> Generated: 2026-07-10 · Read-only audit, no code modified.
> References: AGENTS.md, global.css, phase-0/00-project-inspection.md

---

## Overall Grade: **B− (7/10)**

The onboarding flow is polished and well-animated. Auth screens are visually consistent. The driver dashboard and placeholder screens are functional but basic. The biggest gaps are NativeWind non-compliance (84% StyleSheet), missing accessibility props, zero responsiveness handling for tablets, and several rogue colors outside the design system.

---

## Design Tokens Reference (from `global.css`)

| Token              | Value     | Expected usage           |
| ------------------ | --------- | ------------------------ |
| `background`       | `#FFF8F3` | Screen backgrounds       |
| `foreground`       | `#2C3E5B` | Primary text             |
| `primary`          | `#2C3E5B` | Buttons, active states   |
| `secondary`        | `#FF7B54` | Accents, selected states |
| `tertiary`         | `#FFC947` | Decorative               |
| `muted`            | `#F5ECE5` | Soft backgrounds         |
| `muted-foreground` | `#6E7E91` | Secondary text           |
| `accent`           | `#FFB499` | Highlights               |
| `card`             | `#FFFFFF` | Card surfaces            |
| `destructive`      | `#EF4444` | Errors                   |
| `border`           | `#EAE1D9` | Dividers, borders        |
| `input`            | `#EAE1D9` | Input borders            |

---

## Screen-by-Screen Audit

### 1. `welcome.tsx` (427 lines)

| Criterion                | Rating | Notes                                                                                                                                                                              |
| ------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Design system compliance | ⚠️     | All colors hardcoded (`#FFF8F3`, `#2C3E5B`, `#FF7B54`, `#6E7E91`). No CSS variable or NativeWind token usage.                                                                      |
| Spacing consistency      | ✅     | Consistent: px-28 for text area, pb-20 for footer, gap-12 between footer items.                                                                                                    |
| Typography hierarchy     | ✅     | Headline 34/800/42, subtext 16/400/24, terms 10/400/16, sign-in link 14. Clear hierarchy.                                                                                          |
| Component usage          | ✅     | Uses `ScreenContainer`, `PrimaryButton`, `PageDots`. Good.                                                                                                                         |
| NativeWind vs StyleSheet | ❌     | 100% StyleSheet. AGENTS.md requires NativeWind-first.                                                                                                                              |
| Animation quality        | ✅     | Crossfade carousel (400ms), staggered headline+subtext entrance. Smooth.                                                                                                           |
| Empty states             | ✅ N/A | Carousel — no data-dependent empty state needed.                                                                                                                                   |
| Error states             | ✅ N/A | No user input — no error state needed.                                                                                                                                             |
| Touch targets            | ⚠️     | `PrimaryButton` minHeight 56px ✅. Sign-in link is plain `<Text>` inside `<Link>` — no hitSlop, no min 44px. Terms links are plain text — not tappable (no `Link` or `Pressable`). |
| Responsiveness           | ❌     | Uses `Dimensions.get("window").height` for absolute positioning (`SCREEN_HEIGHT * 0.54`). Will break on tablets or landscape. No width-based adaptation.                           |

**Issues:**

- Terms of Use and Privacy Notice links are styled `<Text>` but not wrapped in `Link` or `Pressable` — they're visually links but not tappable.
- Hardcoded `SCREEN_HEIGHT * 0.54` for image container — on a small phone (iPhone SE, 568px) this leaves very little room for text; on a tablet it wastes space.
- `ORANGE` constant defined locally instead of using design token.

---

### 2. `role-question.tsx` (270 lines)

| Criterion                | Rating | Notes                                                                                            |
| ------------------------ | ------ | ------------------------------------------------------------------------------------------------ |
| Design system compliance | ⚠️     | All hardcoded colors.                                                                            |
| Spacing consistency      | ✅     | px-24, pb-32, mt-16 — consistent with onboarding standard.                                       |
| Typography hierarchy     | ✅     | Headline 26/700/34, subtext 14/400/20. Matches other choice screens.                             |
| Component usage          | ✅     | `ScreenContainer`, `OnboardingOptionRow`, `PageDots`, `PrimaryButton`.                           |
| NativeWind vs StyleSheet | ❌     | 100% StyleSheet.                                                                                 |
| Animation quality        | ✅     | Staggered entrance (content 450ms, footer 400ms with 350ms delay). `useFocusEffect` re-triggers. |
| Empty states             | ✅ N/A | Static options.                                                                                  |
| Error states             | ✅     | Haptic error on disabled Continue.                                                               |
| Touch targets            | ✅     | `OnboardingOptionRow` py-18 (36px content + dividers ≈ 54px total). Back button 40×40.           |
| Responsiveness           | ⚠️     | Flex layout works for phones. No tablet optimization.                                            |

---

### 3. `role-select.tsx` (276 lines)

| Criterion                | Rating | Notes                                                                                                                                                              |
| ------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Design system compliance | ✅     | Uses NativeWind tokens (`text-foreground`, `text-muted-foreground`, `bg-card`, `border-border`) for text sections. StyleSheet for cards/shadows (valid exception). |
| Spacing consistency      | ✅     | px-6 (24px), gap-4, pt-8 pb-4. Clean.                                                                                                                              |
| Typography hierarchy     | ✅     | `text-2xl font-bold` (header), `text-sm` (subtext), `text-base font-bold` (card title), `text-xs` (card description). Uses NativeWind sizing.                      |
| Component usage          | ✅     | `ScreenContainer`, `PrimaryButton`.                                                                                                                                |
| NativeWind vs StyleSheet | ✅     | **Best hybrid example in the codebase** — NativeWind for text/layout, StyleSheet for cards (shadow/pressed states).                                                |
| Animation quality        | ❌     | **No entrance animations.** Screen appears instantly. All other onboarding screens have staggered fade-in.                                                         |
| Empty states             | ✅ N/A | Static cards.                                                                                                                                                      |
| Error states             | ✅     | Haptic on disabled button.                                                                                                                                         |
| Touch targets            | ✅     | Full-width cards with p-20 padding. PrimaryButton 56px.                                                                                                            |
| Responsiveness           | ⚠️     | Flex layout only.                                                                                                                                                  |

**Issues:**

- **Only screen in the onboarding flow with zero animations.** Looks jarring compared to animated neighbors.
- Progress bar is manually built (hardcoded values) instead of using the `ProgressBar` component.
- This screen seems **orphaned** — no other screen links to it. The `role-question.tsx` screen handles role selection in the actual flow.

---

### 4. `foundational-questions.tsx` (509 lines)

| Criterion                | Rating | Notes                                                                                                                      |
| ------------------------ | ------ | -------------------------------------------------------------------------------------------------------------------------- |
| Design system compliance | ⚠️     | Hardcoded colors. Input border `#E8ECF0` not in design tokens (should be `#EAE1D9` / `--color-border` or `--color-input`). |
| Spacing consistency      | ✅     | px-24, pb-32, mt-16, gap-12. Matches onboarding standard.                                                                  |
| Typography hierarchy     | ✅     | Headline 26/700/34, subtext 14/400/20, textInput 18/500. Clear.                                                            |
| Component usage          | ✅     | `ScreenContainer`, `OnboardingOptionRow`, `PageDots`, `PrimaryButton`.                                                     |
| NativeWind vs StyleSheet | ❌     | 100% StyleSheet.                                                                                                           |
| Animation quality        | ✅     | Same staggered pattern + animated step transitions (350ms).                                                                |
| Empty states             | ✅ N/A |                                                                                                                            |
| Error states             | ✅     | Haptic error on disabled button.                                                                                           |
| Touch targets            | ⚠️     | TextInput pV-16 ≈ 52px ✅. Back button 40×40 ✅. **Text input has no `accessibilityLabel`**.                               |
| Responsiveness           | ⚠️     | Flex layout.                                                                                                               |

**Issues:**

- `placeholderTextColor="#B0BEC5"` — this color is NOT in the design system. Other screens use `#A0AAB4` for placeholder text. Inconsistency.
- Text input shadow uses `rgba(15, 23, 42, 0.04)` — very subtle, but different from `--shadow-theme`.

---

### 5. `bombshell.tsx` (460 lines)

| Criterion                | Rating | Notes                                                                                                                                                          |
| ------------------------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Design system compliance | ⚠️     | Role-specific accent colors (`#2ECC71`, `#3B82F6`, `#8B5CF6`) are NOT in the design system. Only `#FF7B54` (owner) and `#2C3E5B` (default) match tokens.       |
| Spacing consistency      | ✅     | px-24, pb-32. Stat card pV-40.                                                                                                                                 |
| Typography hierarchy     | ✅     | Big number 72/800, headline 22/700/32, subtext 13/400/20. Dramatic hierarchy — good.                                                                           |
| Component usage          | ✅     | `ScreenContainer`, `PageDots`, `PrimaryButton`.                                                                                                                |
| NativeWind vs StyleSheet | ❌     | 100% StyleSheet.                                                                                                                                               |
| Animation quality        | ✅     | **Best animation in the app** — 6-stage staggered sequence (icon bounce → card scale → count-up → headline → subtext → footer). 1200ms total. Spring + timing. |
| Empty states             | ✅ N/A |                                                                                                                                                                |
| Error states             | ✅ N/A |                                                                                                                                                                |
| Touch targets            | ✅     | PrimaryButton 56px. Back button 40×40.                                                                                                                         |
| Responsiveness           | ⚠️     | Stat card width "100%" with px-24 padding. Works on phones. No tablet max-width.                                                                               |

**Issues:**

- `accentColor` and `accentBg` are dynamically generated per role with colors not in the design system — `#2ECC71` (green), `#3B82F6` (blue), `#8B5CF6` (purple). These should either be added to `global.css` or replaced with existing tokens.

---

### 6. `closing-reflection.tsx` (922 lines)

| Criterion                | Rating | Notes                                                                                                                                                           |
| ------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Design system compliance | ⚠️     | Hardcoded colors throughout. Chart bar colors (`#E8ECF0`, `#D1D9E0`, `#B8C5CE`) not in design system.                                                           |
| Spacing consistency      | ✅     | px-24, pb-32, gap-16, gap-12. Consistent internally.                                                                                                            |
| Typography hierarchy     | ✅     | Headline 26/700/34, subtext 15/400/22, chart title 14/600, bar value 13/500, trust text 12/600. Good hierarchy.                                                 |
| Component usage          | ✅     | `ScreenContainer`, `OnboardingOptionRow`, `PageDots`, `PrimaryButton`, `FadeInText`. Uses the most shared components of any screen.                             |
| NativeWind vs StyleSheet | ⚠️     | 95% StyleSheet. `FadeInText` receives a NativeWind className (`text-sm text-[#2C3E5B] font-medium`) — mixed approach.                                           |
| Animation quality        | ✅     | Three-phase animation system: entrance stagger, phase transitions (350ms), bar chart spring cascade (4 bars, 100ms stagger). Most complex animation in the app. |
| Empty states             | ✅ N/A |                                                                                                                                                                 |
| Error states             | ✅ N/A |                                                                                                                                                                 |
| Touch targets            | ✅     | PrimaryButton 56px. Option rows py-18. Back button 40×40. Trust badges pV-8 pH-12 — **≈32px wide, below 44px minimum.**                                         |
| Responsiveness           | ❌     | Chart bars use `flex: 1` + `maxWidth: 48`. Trust badges use `flexWrap: "wrap"`. But on very wide screens, the chart will stretch unattractively.                |

**Issues:**

- 922 lines — too large. The three phase sub-components (`QuestionsPhase`, `ReflectionPhase`, `ClosingPhase`) should be extracted to separate files.
- Trust badges (`trustBadge`) are only `paddingVertical: 8, paddingHorizontal: 12` — effective touch area is ~32×36px, below the 44px minimum.
- Chart footnote text at 14px with `lineHeight: 21` — lineHeight ratio 1.5, slightly tight for readability.

---

### 7. `sign-in.tsx` (465 lines)

| Criterion                | Rating | Notes                                                                                                                                                                                                 |
| ------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Design system compliance | ⚠️     | Hardcoded colors. Error color `#E74C3C` instead of design token `#EF4444`. Border `#E0E5EA` not in design system (should be `#EAE1D9`).                                                               |
| Spacing consistency      | ✅     | px-28, pt-60, pb-40. Consistent with auth screens.                                                                                                                                                    |
| Typography hierarchy     | ✅     | Title 24/700, label 14/500, input 15/500, footer 14. Clear.                                                                                                                                           |
| Component usage          | ⚠️     | Does NOT use `ScreenContainer` or `PrimaryButton` — builds its own inline. This means auth screens have subtly different button styling (borderRadius 12 vs 16, paddingVertical 16 vs 18, no shadow). |
| NativeWind vs StyleSheet | ❌     | 100% StyleSheet.                                                                                                                                                                                      |
| Animation quality        | ✅     | 4-stage staggered entrance (header → icon scale → form slide → footer). Good.                                                                                                                         |
| Empty states             | ✅ N/A |                                                                                                                                                                                                       |
| Error states             | ✅     | Inline error text below form + haptic feedback. Loading spinner replaces button.                                                                                                                      |
| Touch targets            | ⚠️     | Eye icon toggle `hitSlop={8}` — effective area ≈34px. Below 44px. Google SSO button pV-16 ≈ 52px ✅. Back button 40×40 ✅ with hitSlop 12.                                                            |
| Responsiveness           | ⚠️     | Absolute-positioned back button with Platform-specific top offset. No flex wrapping issues but no tablet handling.                                                                                    |

**Issues:**

- Custom primary button instead of `PrimaryButton` component — borderRadius 12 (vs 16), no shadow, paddingVertical 16 (vs 18). Inconsistent look.
- `Animated.parallel([...]).start()` called at **top level of component body** (not inside useEffect/useMemo) — re-runs on every render. This is a React anti-pattern that causes animations to restart when state changes.
- Error color `#E74C3C` differs from design token `#EF4444` (--color-destructive).

---

### 8. `sign-up.tsx` (664 lines)

| Criterion                | Rating | Notes                                                                                                                                                                  |
| ------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Design system compliance | ⚠️     | Same issues as sign-in. Additionally: title color `#1A1A2E` (OTP phase) — NOT in design system (should be `#2C3E5B`). Social button text `#1A1A2E` — same rogue color. |
| Spacing consistency      | ✅     | Matches sign-in: px-28, pt-60, pb-40.                                                                                                                                  |
| Typography hierarchy     | ✅     | Same as sign-in + OTP phase.                                                                                                                                           |
| Component usage          | ❌     | Does NOT use `ScreenContainer` or `PrimaryButton`. Same inconsistency.                                                                                                 |
| NativeWind vs StyleSheet | ❌     | 100% StyleSheet.                                                                                                                                                       |
| Animation quality        | ✅     | Same staggered pattern as sign-in.                                                                                                                                     |
| Empty states             | ✅ N/A |                                                                                                                                                                        |
| Error states             | ✅     | Inline error + haptic + loading states.                                                                                                                                |
| Touch targets            | ⚠️     | Same eye icon issue. "Resend" and "Change email" text links `paddingVertical: 8` — below 44px.                                                                         |
| Responsiveness           | ⚠️     | Same as sign-in.                                                                                                                                                       |

**Issues:**

- Title color `#1A1A2E` in OTP phase headline — a completely rogue dark navy not in the design system.
- Same top-level animation anti-pattern as sign-in.

---

### 9. `forgot-password.tsx` (481 lines)

| Criterion                | Rating | Notes                                                     |
| ------------------------ | ------ | --------------------------------------------------------- |
| Design system compliance | ⚠️     | Same hardcoded colors. Error `#E74C3C`, border `#E0E5EA`. |
| Spacing consistency      | ✅     | px-28, pt-60, pb-40. Matches auth screens.                |
| Typography hierarchy     | ✅     | Same hierarchy.                                           |
| Component usage          | ❌     | Does NOT use `ScreenContainer` or `PrimaryButton`.        |
| NativeWind vs StyleSheet | ❌     | 100% StyleSheet.                                          |
| Animation quality        | ✅     | Same staggered pattern.                                   |
| Empty states             | ✅ N/A |                                                           |
| Error states             | ✅     | Per-phase error messages.                                 |
| Touch targets            | ⚠️     | Eye icon, "Resend code" link — same sub-44px issues.      |
| Responsiveness           | ⚠️     | Same.                                                     |

---

### 10. `sso-callback.tsx` (113 lines)

| Criterion                | Rating | Notes                                                            |
| ------------------------ | ------ | ---------------------------------------------------------------- |
| Design system compliance | ✅     | Minimal UI — uses `#FFF8F3` bg, `#2C3E5B` text, `#E74C3C` error. |
| Spacing consistency      | ✅     | Centered layout with padding 24.                                 |
| Typography hierarchy     | ✅     | Loading text 16/500, error 14.                                   |
| Component usage          | ❌     | No shared components used (not even ScreenContainer).            |
| NativeWind vs StyleSheet | ❌     | 100% StyleSheet.                                                 |
| Animation quality        | ✅ N/A | Loading screen — no animation needed.                            |
| Empty states             | ✅ N/A |                                                                  |
| Error states             | ✅     | Error text displayed.                                            |
| Touch targets            | ✅ N/A | No interactive elements.                                         |
| Responsiveness           | ✅     | Centered flex layout — works on any size.                        |

---

### 11. `trial.tsx` (75 lines)

| Criterion                | Rating | Notes                                                                                |
| ------------------------ | ------ | ------------------------------------------------------------------------------------ |
| Design system compliance | ⚠️     | Badge colors `#E8F5E9` (green bg) and `#2E7D32` (green text) — not in design system. |
| Spacing consistency      | ✅     | px-32. Centered.                                                                     |
| Typography hierarchy     | ✅     | Title 28/700, subtitle 16/400/24, badge 14/600.                                      |
| Component usage          | ✅     | Uses `ScreenContainer`.                                                              |
| NativeWind vs StyleSheet | ❌     | 100% StyleSheet.                                                                     |
| Animation quality        | ⚠️     | Single fade-in (500ms). Minimal compared to other screens.                           |
| Empty states             | ✅ N/A | Placeholder screen.                                                                  |
| Error states             | ✅ N/A |                                                                                      |
| Touch targets            | ✅ N/A | No interactive elements.                                                             |
| Responsiveness           | ✅     | Centered flex.                                                                       |

---

### 12. Driver Dashboard: `(tabs)/index.tsx` (215 lines)

| Criterion                | Rating | Notes                                                                                                                |
| ------------------------ | ------ | -------------------------------------------------------------------------------------------------------------------- |
| Design system compliance | ⚠️     | Hardcoded colors. Banner dismiss button `rgba(255, 255, 255, 0.7)` — acceptable for overlay on navy.                 |
| Spacing consistency      | ✅     | px-24, pt-16, pb-40. Banner p-20, mb-24. Empty state p-32.                                                           |
| Typography hierarchy     | ✅     | Greeting 28/700/36, subGreeting 15/400, section title 18/700, body 14/400/20. Clear.                                 |
| Component usage          | ⚠️     | Uses `SafeAreaView` directly instead of `ScreenContainer`. No `PrimaryButton` needed here.                           |
| NativeWind vs StyleSheet | ❌     | 100% StyleSheet.                                                                                                     |
| Animation quality        | ❌     | **No entrance animations.** Dashboard loads statically. Onboarding screens all animate — this is a jarring contrast. |
| Empty states             | ✅     | Good empty state with icon + title + body text in a card.                                                            |
| Error states             | ❌     | No error handling for banner actions.                                                                                |
| Touch targets            | ⚠️     | Dismiss button 28×28px — **below 44px minimum.** Profile banner is a full-width Pressable ✅.                        |
| Responsiveness           | ⚠️     | Flex layout. No tablet adaptation.                                                                                   |

---

### 13. Driver Tabs: `jobs.tsx` (129 lines), `messages.tsx` (81 lines), `notifications.tsx` (153 lines), `profile.tsx` (208 lines)

| Criterion                | Rating | Notes                                                                                                                                     |
| ------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Design system compliance | ⚠️     | All hardcoded. Profile section border `#E8ECF0` and row divider `#F0F0F0` — neither in design system.                                     |
| Spacing consistency      | ✅     | Consistent px-24, pt-16, pb-40 across all tabs.                                                                                           |
| Typography hierarchy     | ✅     | Title 28/700/36, subtitle 15/400, section titles 14/600 uppercase. Consistent.                                                            |
| Component usage          | ❌     | None use `ScreenContainer` — all use raw `SafeAreaView`. No shared empty-state component despite 4 screens having identical empty states. |
| NativeWind vs StyleSheet | ❌     | 100% StyleSheet.                                                                                                                          |
| Animation quality        | ❌     | **Zero animations on all 4 tabs.**                                                                                                        |
| Empty states             | ✅     | All have icon + title + body empty states. Good.                                                                                          |
| Error states             | ❌     | No error states anywhere.                                                                                                                 |
| Touch targets            | ⚠️     | Profile row items pV-14 ≈ 48px ✅. Filter chips pV-8 ≈ 36px ⚠️. Profile logout pV-16 ≈ 52px ✅.                                           |
| Responsiveness           | ⚠️     | Flex layout.                                                                                                                              |

**Issues:**

- 4 nearly-identical empty state blocks (icon + title + body in a white rounded card) — should be a shared `EmptyState` component.
- Profile tab: `Ionicons name={item.icon as any}` — `as any` cast violates TypeScript strict rules.
- Filter chips in jobs.tsx are not interactive (no `Pressable`, no selected state) — they're purely decorative `View`s.

---

### 14. Driver Placeholder Screens: `help.tsx`, `settings.tsx`, `wallet.tsx`, `ratings.tsx` (66 lines each)

| Criterion                | Rating | Notes                                                  |
| ------------------------ | ------ | ------------------------------------------------------ |
| Design system compliance | ✅     | Colors match tokens (`#FFF8F3`, `#2C3E5B`, `#6E7E91`). |
| Spacing consistency      | ✅     | px-24, pt-16. Consistent.                              |
| Typography hierarchy     | ✅     | Title 24/700, body 15/400/22.                          |
| Component usage          | ❌     | No shared components. Back button rebuilt in each.     |
| NativeWind vs StyleSheet | ❌     | 100% StyleSheet.                                       |
| Animation quality        | ❌     | None.                                                  |
| Empty states             | ✅     | All are essentially empty states themselves.           |
| Error states             | ✅ N/A |                                                        |
| Touch targets            | ✅     | Back button 40×40 with hitSlop 12.                     |
| Responsiveness           | ✅     | Centered flex.                                         |

**Issues:**

- 4 identical files differing only in icon name, title, and body text. Should be a single reusable `PlaceholderScreen` component.
- ~264 lines of near-duplicate code.

---

### 15. `complete-profile.tsx` (101 lines)

| Criterion                | Rating | Notes                                                                       |
| ------------------------ | ------ | --------------------------------------------------------------------------- |
| Design system compliance | ✅     | Colors match tokens.                                                        |
| Spacing consistency      | ✅     | px-24, pt-16, pb-32.                                                        |
| Typography hierarchy     | ✅     | Title 26/700/34, body 14/400/20.                                            |
| Component usage          | ✅     | `PrimaryButton`. Uses `SafeAreaView` directly instead of `ScreenContainer`. |
| NativeWind vs StyleSheet | ❌     | 100% StyleSheet.                                                            |
| Animation quality        | ❌     | None.                                                                       |
| Empty states             | ✅ N/A |                                                                             |
| Error states             | ❌     | No error handling.                                                          |
| Touch targets            | ✅     | Back button 40×40. PrimaryButton 56px.                                      |
| Responsiveness           | ✅     | Simple centered layout.                                                     |

---

### 16. Driver Onboarding Steps: `experience.tsx`, `employment.tsx`, `goals.tsx`, `vehicle.tsx`, `job-type.tsx` (~50 lines each)

| Criterion                | Rating | Notes                                                         |
| ------------------------ | ------ | ------------------------------------------------------------- |
| Design system compliance | ✅     | Inherited from `DriverStepShell`.                             |
| Spacing consistency      | ✅     | Inherited from `DriverStepShell`.                             |
| Typography hierarchy     | ✅     | Inherited from `DriverStepShell`.                             |
| Component usage          | ✅     | `DriverStepShell` + `OnboardingOptionRow`. Clean composition. |
| NativeWind vs StyleSheet | ✅     | No custom styles — all inherited.                             |
| Animation quality        | ✅     | Inherited from `DriverStepShell`.                             |
| Empty states             | ✅ N/A | Static options.                                               |
| Error states             | ✅     | Disabled button until selection made.                         |
| Touch targets            | ✅     | Inherited.                                                    |
| Responsiveness           | ✅     | Inherited.                                                    |

**These are the cleanest screens in the codebase** — thin wrappers over shared components.

---

### 17. `license.tsx` (235 lines)

| Criterion                | Rating | Notes                                                                                                                                                                 |
| ------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Design system compliance | ⚠️     | Input border `#E8ECF0` (should be `#EAE1D9`). Warning box uses `#856404` text and `rgba(255, 193, 7, *)` — not in design system but acceptable for warning semantics. |
| Spacing consistency      | ✅     | mb-20 between input groups, gap-12 between cards.                                                                                                                     |
| Typography hierarchy     | ✅     | Label 14/500, input 16/500, card title 15/600, card description 13.                                                                                                   |
| Component usage          | ✅     | `DriverStepShell`. Custom card selection pattern.                                                                                                                     |
| NativeWind vs StyleSheet | ❌     | 100% StyleSheet.                                                                                                                                                      |
| Animation quality        | ✅     | Inherited from `DriverStepShell`.                                                                                                                                     |
| Touch targets            | ✅     | Cards p-16 with gap-12 — adequate. TextInput pV-14 ≈ 48px.                                                                                                            |
| Responsiveness           | ⚠️     | ScrollView handles overflow.                                                                                                                                          |

---

### 18. `location.tsx` (139 lines)

| Criterion                | Rating | Notes                                             |
| ------------------------ | ------ | ------------------------------------------------- |
| Design system compliance | ✅     | Colors match tokens.                              |
| Spacing consistency      | ✅     | mt-24, mb-16.                                     |
| Typography hierarchy     | ✅     | Button text 16/600, or-text 14/400, input 16/500. |
| Component usage          | ✅     | `DriverStepShell`.                                |
| NativeWind vs StyleSheet | ❌     | 100% StyleSheet.                                  |
| Animation quality        | ✅     | Inherited.                                        |
| Touch targets            | ✅     | Location button pV-16 ≈ 52px. Input pV-14 ≈ 48px. |
| Responsiveness           | ✅     | Simple layout.                                    |

---

### 19. `otp.tsx` (180 lines)

| Criterion                | Rating | Notes                                                                |
| ------------------------ | ------ | -------------------------------------------------------------------- |
| Design system compliance | ⚠️     | Error `#E74C3C` (should be `#EF4444`). Otherwise matches tokens.     |
| Spacing consistency      | ✅     | mt-24, mt-12 between elements.                                       |
| Typography hierarchy     | ✅     | Label 14/500, input 18/600 (letter-spacing 8 for OTP), links 14/400. |
| Component usage          | ✅     | `DriverStepShell`.                                                   |
| NativeWind vs StyleSheet | ❌     | 100% StyleSheet.                                                     |
| Animation quality        | ✅     | Inherited.                                                           |
| Touch targets            | ⚠️     | Text links pV-10 ≈ 36px — below 44px.                                |
| Responsiveness           | ✅     | Simple layout.                                                       |

---

### 20. Tab Layout: `(tabs)/_layout.tsx` (110 lines)

| Criterion                | Rating | Notes                                                                                   |
| ------------------------ | ------ | --------------------------------------------------------------------------------------- |
| Design system compliance | ✅     | `#FFF8F3` bg, `#2C3E5B` active, `#6E7E91` inactive, `#EAE1D9` border. All match tokens. |
| Spacing consistency      | ✅     | pt-8, pb-8, height 64.                                                                  |
| Component usage          | ✅ N/A | Layout file.                                                                            |
| NativeWind vs StyleSheet | ✅     | StyleSheet justified — Tab navigator `screenOptions` only accepts style objects.        |
| Touch targets            | ✅     | Tab bar height 64px. Icon size 24.                                                      |
| Responsiveness           | ⚠️     | Fixed height 64px. No adaptation for larger screens.                                    |

---

## Shared Components Audit

### `ScreenContainer` (19 lines)

- **Good:** Correctly uses inline styles for SafeAreaView (AGENTS.md exception).
- **Issue:** `className` prop accepted but never used — dead code.

### `PrimaryButton` (84 lines)

- **Good:** Proper pressed/disabled states, shadow, minHeight 56px, gap-8 for icon slot. StyleSheet justified (Pressable pressed state exception).
- **Issue:** borderRadius 16 — the `global.css` `--radius-xl` is 24px and `--radius-lg` is 16px. Button should use `--radius-md` (12px) per the reference comment "rounded-xl" which in Tailwind is 12px. Currently 16px.

### `SecondaryButton` (80 lines)

- **Issue:** **Unused** — exported but never imported anywhere.
- Good pressed/disabled states. borderRadius 12 matches "rounded-xl".

### `Card` (22 lines)

- **Issue:** **Unused** — exported but never imported anywhere.
- Uses NativeWind className — good pattern.

### `FadeInText` (69 lines)

- **Issue:** Used only in `closing-reflection.tsx` (once).
- Animation uses `useNativeDriver: true` — good.

### `OnboardingOptionRow` (143 lines)

- **Good:** Well-structured with icon box, text column, check badge.
- **Issue:** Border bottom `#E8ECF0` not in design system (should be `#EAE1D9`).
- **Issue:** No `accessibilityRole="button"` or `accessibilityState={{ selected }}` on the Pressable.

### `PageDots` (53 lines)

- **Good:** Simple, clean.
- **Issue:** Inactive dot color `#D1D5DB` — not in design system. Should use `--color-border` (`#EAE1D9`) or `--color-muted` (`#F5ECE5`).
- **Issue:** Dot size 8×8 with gap-8 — on screens with 7+ dots (closing-reflection has 4 dots), the row is 64px wide. Fine but could be narrower.

### `ProgressBar` (77 lines)

- **Good:** Correctly uses StyleSheet for dynamic width. Labels match design.
- **Issue:** `role-select.tsx` builds its own progress bar manually instead of using this component.

### `DriverStepShell` (209 lines)

- **Good:** Excellent composition — wraps ScreenContainer, top bar, animated content, sticky CTA. Used by 8 screens.
- **Issue:** Entrance animation code is duplicated in the `useFocusEffect` — same pattern appears in `role-question`, `foundational-questions`, `bombshell`, `closing-reflection`. Should be extracted to a `useEntranceAnimation()` hook.

---

## Rogue Colors Summary

| Color                 | Where used                                                         | Should be                                       |
| --------------------- | ------------------------------------------------------------------ | ----------------------------------------------- |
| `#E74C3C`             | sign-in, sign-up, forgot-password, otp, profile (logout)           | `#EF4444` (--color-destructive)                 |
| `#E0E5EA`             | sign-in, sign-up, forgot-password (input borders)                  | `#EAE1D9` (--color-border / --color-input)      |
| `#E8ECF0`             | OnboardingOptionRow, driver tabs, license, foundational-questions  | `#EAE1D9` (--color-border)                      |
| `#F0F0F0`             | profile.tsx (row dividers)                                         | `#EAE1D9` (--color-border)                      |
| `#1A1A2E`             | sign-up.tsx (OTP title, social button text)                        | `#2C3E5B` (--color-foreground)                  |
| `#A0AAB4`             | sign-in, sign-up, forgot-password, license, otp (placeholder text) | `#6E7E91` (--color-muted-foreground)            |
| `#B0BEC5`             | foundational-questions (text input placeholder)                    | `#6E7E91` (--color-muted-foreground)            |
| `#D1D5DB`             | PageDots (inactive dot)                                            | `#EAE1D9` (--color-border)                      |
| `#2ECC71`             | bombshell (driver accent)                                          | Add to design system or use `--color-secondary` |
| `#3B82F6`             | bombshell (client accent)                                          | Add to design system or use `--color-secondary` |
| `#8B5CF6`             | bombshell (corporate accent)                                       | Add to design system or use `--color-secondary` |
| `#E8F5E9` / `#2E7D32` | trial.tsx (badge)                                                  | Add to design system                            |

---

## Issues Ranked by Severity

### Critical (blocks production)

| #   | Issue                                                                                               | Affected Files               | Fix                                  |
| --- | --------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------ |
| 1   | **Terms/Privacy links not tappable** on welcome screen                                              | `welcome.tsx`                | Wrap in `<Link>` or `<Pressable>`    |
| 2   | **Animation anti-pattern** — `Animated.start()` at render level causes re-animation on state change | `sign-in.tsx`, `sign-up.tsx` | Move inside `useEffect` or `useMemo` |
| 3   | **Dismiss button 28×28px** — below 44px accessibility minimum                                       | `(tabs)/index.tsx`           | Increase to 44×44 or add hitSlop     |

### High (noticeable UX impact)

| #   | Issue                                                                                                    | Affected Files                                      | Fix                                                              |
| --- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------- |
| 4   | **No entrance animations on driver dashboard** — jarring contrast with animated onboarding               | `(tabs)/index.tsx`, all tab screens                 | Add staggered fade-in                                            |
| 5   | **`role-select.tsx` has zero animations** — orphaned screen                                              | `role-select.tsx`                                   | Add entrance animations or delete if unused                      |
| 6   | **Auth screens don't use `PrimaryButton`** — inconsistent button styling (borderRadius, padding, shadow) | `sign-in.tsx`, `sign-up.tsx`, `forgot-password.tsx` | Replace inline buttons with `PrimaryButton`                      |
| 7   | **Error color inconsistency** — `#E74C3C` vs design token `#EF4444`                                      | 5 auth/onboarding screens                           | Standardize to `--color-destructive`                             |
| 8   | **11 rogue colors** not in design system                                                                 | 15+ files                                           | Replace with design tokens or add missing tokens to `global.css` |

### Medium (quality gap)

| #   | Issue                                                                 | Affected Files                                                      | Fix                                             |
| --- | --------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------- |
| 9   | **84% StyleSheet usage** despite NativeWind-first rule                | 32 files                                                            | Convert static styles to NativeWind className   |
| 10  | **No shared `EmptyState` component** — 4 near-identical blocks        | `jobs.tsx`, `messages.tsx`, `notifications.tsx`, `(tabs)/index.tsx` | Extract `EmptyState` component                  |
| 11  | **Placeholder screens duplicated** — 4 files with identical structure | `help.tsx`, `settings.tsx`, `wallet.tsx`, `ratings.tsx`             | Extract `PlaceholderScreen` component           |
| 12  | **No `accessibilityLabel`** on interactive elements                   | All screens                                                         | Add accessibility props to Pressable, TextInput |
| 13  | **Eye icon touch target** too small (~34px effective)                 | `sign-in.tsx`, `sign-up.tsx`, `forgot-password.tsx`                 | Add `hitSlop={12}` or increase icon size        |
| 14  | **Text link touch targets** below 44px                                | `otp.tsx`, `sign-up.tsx`                                            | Increase paddingVertical to 14+                 |
| 15  | **`as any` type cast** on Ionicons name prop                          | `profile.tsx`, `notifications.tsx`                                  | Use proper typed icon name union                |

### Low (polish)

| #   | Issue                                                                 | Affected Files                               | Fix                                              |
| --- | --------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------ |
| 16  | **No tablet responsiveness** — all screens phone-only                 | All screens                                  | Add max-width constraints, adaptive padding      |
| 17  | **`closing-reflection.tsx` 922 lines** — too large                    | `closing-reflection.tsx`                     | Extract 3 phase sub-components to separate files |
| 18  | **`ScreenContainer` className prop** accepted but unused              | `screen-container.tsx`                       | Remove dead prop or implement it                 |
| 19  | **`PrimaryButton` borderRadius 16** vs reference "rounded-xl" (12px)  | `primary-button.tsx`                         | Verify against HTML reference                    |
| 20  | **Placeholder text color inconsistency** — `#A0AAB4` vs `#B0BEC5`     | Auth screens vs `foundational-questions.tsx` | Standardize to one value                         |
| 21  | **`SecondaryButton` and `Card` unused**                               | `secondary-button.tsx`, `card.tsx`           | Delete or integrate                              |
| 22  | **Duplicate entrance animation code** (~240 lines across 8 files)     | Onboarding screens                           | Extract `useEntranceAnimation()` hook            |
| 23  | **`role-select.tsx` appears orphaned** — no other screen routes to it | `role-select.tsx`                            | Delete or integrate into flow                    |

---

## Top 10 Priority Fixes

1. Fix terms/privacy links not tappable on welcome screen
2. Fix animation anti-pattern in auth screens (move `Animated.start()` into `useEffect`)
3. Standardize error color to `--color-destructive` (`#EF4444`)
4. Replace 11 rogue colors with design tokens
5. Make auth screens use `PrimaryButton` component for consistency
6. Add entrance animations to driver dashboard tabs
7. Extract shared `EmptyState` component (eliminates ~80 lines of duplication)
8. Extract `useEntranceAnimation()` hook (eliminates ~240 lines of duplication)
9. Add `accessibilityLabel` and `accessibilityRole` to all interactive elements
10. Fix touch targets below 44px (dismiss button, eye icon, text links)
