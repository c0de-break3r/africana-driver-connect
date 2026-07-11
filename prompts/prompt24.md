Build (owner)/complete-profile.tsx, reachable via a "Complete your profile" banner on the Owner dashboard.

Capture:
- Vehicle number, make, model, year, color, seating capacity
- Vehicle category (Sedan, SUV, Taxi, Bus, Truck, Luxury, School Bus)
- Document upload: registration, insurance, roadworthy certificate

Allow partial completion and saving, same pattern as the Driver profile screen.

Store in store/useOwnerProfileStore.ts. Implement using Zustand with AsyncStorage persistence (same pattern as useDriverProfileStore / useOnboardingAnswersStore).